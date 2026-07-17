import type { ReminderScheduleType, ReminderWeekday } from "../../../shared/types/api.types";

const DEFAULT_REMINDER_TIME = "09:00";

const weekdayLabels: Record<ReminderWeekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export type ReminderSummaryInput = {
  reminderEnabled: boolean;
  reminderTime: string | null;
  scheduleType: ReminderScheduleType;
  weekdays: ReminderWeekday[];
  specificDate: string | null;
};

function getReminderTimeValue(reminderTime: string | null) {
  return reminderTime ?? DEFAULT_REMINDER_TIME;
}

export function hasSavedReminderSettings({
  reminderTime,
  scheduleType,
  weekdays,
  specificDate,
}: Omit<ReminderSummaryInput, "reminderEnabled">) {
  return Boolean(reminderTime) || scheduleType !== "daily" || weekdays.length > 0 || specificDate !== null;
}

export function formatReminderTime(reminderTime: string | null) {
  const [hoursText, minutesText] = getReminderTimeValue(reminderTime).split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return getReminderTimeValue(reminderTime);
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSpecificReminderDate(specificDate: string | null) {
  if (!specificDate) {
    return "Pick a date";
  }

  return new Date(`${specificDate}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatReminderSchedule({
  reminderTime,
  scheduleType,
  weekdays,
  specificDate,
}: Omit<ReminderSummaryInput, "reminderEnabled">) {
  const formattedTime = formatReminderTime(reminderTime);

  if (scheduleType === "weekly") {
    if (weekdays.length === 0) {
      return `Pick weekdays at ${formattedTime}`;
    }

    const labels = [...weekdays]
      .sort((left, right) => left - right)
      .map((weekday) => weekdayLabels[weekday])
      .join(", ");

    return `${labels} at ${formattedTime}`;
  }

  if (scheduleType === "specific_date") {
    return `${formatSpecificReminderDate(specificDate)} at ${formattedTime}`;
  }

  return `Daily at ${formattedTime}`;
}

export function formatReminderCardSummary(reminder: ReminderSummaryInput) {
  const summary = formatReminderSchedule(reminder);

  if (reminder.reminderEnabled) {
    return summary;
  }

  if (
    !hasSavedReminderSettings({
      reminderTime: reminder.reminderTime,
      scheduleType: reminder.scheduleType,
      weekdays: reminder.weekdays,
      specificDate: reminder.specificDate,
    })
  ) {
    return "Off";
  }

  return `${summary} (paused)`;
}
