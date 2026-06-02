import type { ReminderChannel, ReminderLog } from "../../shared/types.js";
import {
  findEmailReminderCandidates,
  findReminderLog,
  insertReminderLog,
  type EmailReminderCandidate,
} from "./reminders.repository.js";
import { isEmailConfigured, sendHabitReminderEmail } from "./email.service.js";

// types that define data shapes (not expect nor receive props)
export type ReminderClock = {
  date: string;
  time: string;
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
  sent: number;
  skippedAlreadySent: number;
  skippedEmailNotConfigured: boolean;
  failures: ReminderProcessingFailure[];
};


// Purpose: convert NOW into user's local timezone
export function getReminderClock(timezone: string, now = new Date()): ReminderClock {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(now);

  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  return {
    date: `${partMap.get("year")}-${partMap.get("month")}-${partMap.get("day")}`,
    time: `${partMap.get("hour")}:${partMap.get("minute")}`,
  };
}

export async function getDueEmailReminders(now = new Date()): Promise<EmailReminder[]> {
  //  gets all reminder-enabled habits
  const candidates = await findEmailReminderCandidates();

  return candidates.filter((candidate) => {
    const clock = getReminderClock(candidate.timezone, now);

    // Checks (example):
    // Reminder 18:00 === Current Local Time 18:00 
    // ONLY keep MATCHING habits
    return candidate.reminder_time.slice(0, 5) === clock.time;
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

// save successful reminders to prevent resending
export async function recordReminderSent(input: {
  habitId: string;
  sentForDate: string;
  channel: ReminderChannel;
}): Promise<ReminderLog | null> {
  return insertReminderLog(input);
}

// Main reminder workflow
export async function processDueEmailReminders(now = new Date()): Promise<ReminderProcessingSummary> {
  // 1. Create summary
  const summary: ReminderProcessingSummary = {
    checked: 0,
    sent: 0,//sent
    skippedAlreadySent: 0,//skipped
    skippedEmailNotConfigured: false,
    failures: [],//failed
  };

  //2. check set up
  if (!isEmailConfigured()) {
    // if not set up, stop immediately & return summary
    summary.skippedEmailNotConfigured = true;
    return summary;
  }

  //3. find reminders due now
  // Result [Jogging]
  const dueReminders = await getDueEmailReminders(now);
  summary.checked = dueReminders.length;

  //4. for each reminder
  for (const reminder of dueReminders) {
    const clock = getReminderClock(reminder.timezone, now);

    //5. check duplicate
    // if alr sent tdy, skip
    const alreadySent = await wasReminderSent({
      habitId: reminder.habit_id,
      sentForDate: clock.date,
      channel: "email",
    });

    if (alreadySent) {
      // and +1
      summary.skippedAlreadySent += 1;
      continue;
    }

    try {
       //6. send email
      await sendHabitReminderEmail({
        to: reminder.reminder_email,
        habitName: reminder.habit_name,
        reminderTime: reminder.reminder_time.slice(0, 5),
        timezone: reminder.timezone,
      });

      //7. save reminder log, so future checks know
      await recordReminderSent({
        habitId: reminder.habit_id,
        sentForDate: clock.date,
        channel: "email",
      });

      //8. count success
      summary.sent += 1;
    } catch (error) {
      //9. handle failure
      summary.failures.push({
        habitId: reminder.habit_id,
        habitName: reminder.habit_name,
        message: error instanceof Error ? error.message : "Failed to send reminder email.",
      });
    }
  }

  // return summary (to reminderCron.ts -> which called processDueEmailReminders())
  // Why return summary? -> not just "Some emails failed" OR "Sent 3 emails"
  return summary;
}
