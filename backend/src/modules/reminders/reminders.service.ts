import type { ReminderChannel, ReminderLog, ReminderWeekday } from "../../shared/types.js";
import {
  claimReadyReminderDeliveries,
  deactivateSpecificDateReminder,
  enqueueReminderDelivery,
  findEmailReminderCandidates,
  findReminderLog,
  findUserSettings,
  insertReminderLog,
  markReminderDeliverySent,
  rescheduleReminderDelivery,
  failReminderDelivery,
  type EmailReminderCandidate,
} from "./reminders.repository.js";
import { isEmailConfigured, sendHabitReminderEmail } from "./email.service.js";

export type ReminderClock = {
  date: string;
  time: string;
  weekday: ReminderWeekday;
};

export type EmailReminder = EmailReminderCandidate & {
  reminder_time: string;
};

export type ReminderProcessingFailure = {
  habitId: string;
  habitName: string;
  message: string;
};

export type ReminderProcessingSummary = {
  checked: number;
  queued: number;
  claimed: number;
  sent: number;
  retried: number;
  permanentlyFailed: number;
  skippedAlreadySent: number;
  skippedEmailNotConfigured: boolean;
  avgSendLatencyMs: number;
  failures: ReminderProcessingFailure[];
};

const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000];
const DELIVERY_CLAIM_LIMIT = 50;

export async function getReminderSettings(userId: string) {
  void userId;
  const settings = await findUserSettings();

  return {
    reminderEmail: settings.reminder_email,
    timezone: settings.timezone,
  };
}

function toReminderWeekday(weekday: string): ReminderWeekday {
  const weekdayMap: Record<string, ReminderWeekday> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return weekdayMap[weekday] ?? 0;
}

export function getReminderClock(timezone: string, now = new Date()): ReminderClock {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    weekday: "short",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(now);

  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  return {
    date: `${partMap.get("year")}-${partMap.get("month")}-${partMap.get("day")}`,
    time: `${partMap.get("hour")}:${partMap.get("minute")}`,
    weekday: toReminderWeekday(partMap.get("weekday") ?? "Sun"),
  };
}

export function isReminderDue(candidate: EmailReminderCandidate, clock: ReminderClock): boolean {
  if (candidate.reminder_time.slice(0, 5) !== clock.time) {
    return false;
  }

  if (candidate.schedule_type === "daily") {
    return true;
  }

  if (candidate.schedule_type === "weekly") {
    return candidate.weekdays.includes(clock.weekday);
  }

  if (candidate.schedule_type === "specific_date") {
    return candidate.specific_date === clock.date;
  }

  return false;
}

export async function getDueEmailReminders(now = new Date()): Promise<EmailReminder[]> {
  const candidates = await findEmailReminderCandidates();

  return candidates.filter((candidate) => {
    const clock = getReminderClock(candidate.timezone, now);
    return isReminderDue(candidate, clock);
  });
}

export async function wasReminderSent(input: {
  habitId: string;
  sentForDate: string;
  channel: ReminderChannel;
}): Promise<boolean> {
  const reminderLog = await findReminderLog(input);
  return reminderLog !== null;
}

export async function recordReminderSent(input: {
  habitId: string;
  sentForDate: string;
  channel: ReminderChannel;
}): Promise<ReminderLog | null> {
  return insertReminderLog(input);
}

export function getRetryDelayMs(attemptCount: number) {
  // Backoff grows with each failed attempt, then stays at the final delay.
  return RETRY_DELAYS_MS[Math.min(attemptCount, RETRY_DELAYS_MS.length - 1)];
}

function getNextRetryAt(now: Date, attemptCount: number) {
  return new Date(now.getTime() + getRetryDelayMs(attemptCount)).toISOString();
}

function getFailureMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to send reminder email.";
}

export function shouldDeactivateReminderAfterSend(reminder: EmailReminderCandidate): boolean {
  return reminder.schedule_type === "specific_date";
}

export async function finalizeReminderAfterSend(reminder: EmailReminderCandidate): Promise<void> {
  if (!shouldDeactivateReminderAfterSend(reminder)) {
    return;
  }

  await deactivateSpecificDateReminder(reminder.habit_id);
}

export async function processDueEmailReminders(now = new Date()): Promise<ReminderProcessingSummary> {
  const summary: ReminderProcessingSummary = {
    checked: 0,
    queued: 0,
    claimed: 0,
    sent: 0,
    retried: 0,
    permanentlyFailed: 0,
    skippedAlreadySent: 0,
    skippedEmailNotConfigured: false,
    avgSendLatencyMs: 0,
    failures: [],
  };

  if (!isEmailConfigured()) {
    summary.skippedEmailNotConfigured = true;
    return summary;
  }

  const dueReminders = await getDueEmailReminders(now);
  summary.checked = dueReminders.length;

  // First pass: convert due reminders into delivery jobs.
  // This makes cron safe to run every minute because duplicates collapse
  // into the unique queue row instead of sending immediately.
  for (const reminder of dueReminders) {
    const clock = getReminderClock(reminder.timezone, now);
    const alreadySent = await wasReminderSent({
      habitId: reminder.habit_id,
      sentForDate: clock.date,
      channel: "email",
    });

    if (alreadySent) {
      summary.skippedAlreadySent += 1;
      continue;
    }

    const wasQueued = await enqueueReminderDelivery({
      habitId: reminder.habit_id,
      sentForDate: clock.date,
      channel: "email",
    });

    if (wasQueued) {
      summary.queued += 1;
    }
  }

  const claimedReminders = await claimReadyReminderDeliveries({
    workerId: "pid-" + process.pid,
    limit: DELIVERY_CLAIM_LIMIT,
  });

  summary.claimed = claimedReminders.length;

  let totalLatencyMs = 0;

  // Second pass: only claimed jobs are allowed to send emails.
  // This is the boundary that protects against duplicate sends across workers.
  for (const reminder of claimedReminders) {
    const alreadySent = await wasReminderSent({
      habitId: reminder.habit_id,
      sentForDate: reminder.scheduled_for_date,
      channel: "email",
    });

    if (alreadySent) {
      await markReminderDeliverySent({
        deliveryJobId: reminder.delivery_job_id,
      });

      summary.skippedAlreadySent += 1;
      continue;
    }

    const startedAt = Date.now();

    try {
      await sendHabitReminderEmail({
        to: reminder.reminder_email,
        habitName: reminder.habit_name,
        reminderTime: reminder.reminder_time.slice(0, 5),
        timezone: reminder.timezone,
      });

      await recordReminderSent({
        habitId: reminder.habit_id,
        sentForDate: reminder.scheduled_for_date,
        channel: "email",
      });

      await markReminderDeliverySent({
        deliveryJobId: reminder.delivery_job_id,
      });

      await finalizeReminderAfterSend(reminder);

      summary.sent += 1;
      totalLatencyMs += Date.now() - startedAt;
    } catch (error) {
      const message = getFailureMessage(error);

      summary.failures.push({
        habitId: reminder.habit_id,
        habitName: reminder.habit_name,
        message,
      });

      if (reminder.attempt_count + 1 >= reminder.max_attempts) {
        // After the last allowed attempt, preserve the error and stop retrying.
        await failReminderDelivery({
          deliveryJobId: reminder.delivery_job_id,
          lastError: message,
        });

        summary.permanentlyFailed += 1;
        continue;
      }

      await rescheduleReminderDelivery({
        deliveryJobId: reminder.delivery_job_id,
        nextRetryAt: getNextRetryAt(now, reminder.attempt_count),
        lastError: message,
      });

      summary.retried += 1;
    }
  }

  if (summary.sent > 0) {
    summary.avgSendLatencyMs = Math.round(totalLatencyMs / summary.sent);
  }

  return summary;
}
