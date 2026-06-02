import type { ReminderChannel, ReminderLog } from "../../shared/types.js";
import {
  findEmailReminderCandidates,
  findReminderLog,
  insertReminderLog,
  type EmailReminderCandidate,
} from "./reminders.repository.js";


export type ReminderClock = {
  date: string;
  time: string;
};

export type EmailReminder = EmailReminderCandidate & {
  reminder_time: string;
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
