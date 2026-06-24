export type Habit = {
  id: string;
  name: string;
  reminder_enabled: boolean;
  reminder_time: string | null;
  reminder_schedule_type: ReminderScheduleType | null;
  reminder_weekdays: ReminderWeekday[];
  reminder_specific_date: string | null;
  created_at: string;
};

export type ReminderScheduleType = "daily" | "weekly" | "specific_date";

export type ReminderWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitReminderSchedule = {
  id: string;
  habit_id: string;
  is_active: boolean;
  schedule_type: ReminderScheduleType;
  reminder_time: string | null;
  weekdays: ReminderWeekday[];
  specific_date: string | null;
  created_at: string;
  updated_at: string;
};

export type HabitLogStatus = "done" | "missed" | "skipped";

export type HabitLog = {
  id: string;
  habit_id: string;
  log_date: string;
  status: HabitLogStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: number;
  reminder_email: string | null;
  timezone: string;
  updated_at: string;
};

export type ReminderChannel = "email" | "browser" | "push";

export type ReminderLog = {
  id: string;
  habit_id: string;
  sent_for_date: string;
  channel: ReminderChannel;
  sent_at: string;
};

// calculated result
// calculateStreak() returns this
export type StreakSummary = {
  currentStreak: number;
  currentStartDate: string | null;
  currentEndDate: string | null;
  highestStreak: number;
  highestStartDate: string | null;
  highestEndDate: string | null;
};
