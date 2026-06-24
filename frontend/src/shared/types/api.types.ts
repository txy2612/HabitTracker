// define frontend <-> backend contracts
// frontend promise to send data in this shape
// backend promises to send data in this shape
export type Habit = {
  id: string;
  name: string;
  reminderEnabled: boolean;
  reminderTime: string | null;
  reminderScheduleType: ReminderScheduleType;
  reminderWeekdays: ReminderWeekday[];
  reminderSpecificDate: string | null;
  createdAt: string;
};

export type ReminderScheduleType = "daily" | "weekly" | "specific_date";

export type ReminderWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type CreateHabitInput = {
  name: string;
};

export type UpdateHabitInput = Partial<CreateHabitInput>;

export type HabitReminderInput = {
  id: string;
  reminderEnabled: boolean;
  reminderTime: string | null;
  scheduleType: ReminderScheduleType;
  weekdays: ReminderWeekday[];
  specificDate: string | null;
};

export type SaveHabitRemindersInput = {
  reminderEmail?: string | null;
  timezone: string;
  reminders: HabitReminderInput[];
};

export type HabitReminderSettings = {
  reminderEmail: string | null;
  timezone: string;
};

export type HabitLogStatus = "done" | "missed" | "skipped";

export type HabitLog = {
  id: string;
  habitId: string;
  logDate: string;
  status: HabitLogStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateHabitLogInput = {
  logDate: string;
  status: HabitLogStatus;
  note?: string | null;
};

export type UpdateHabitLogInput = Partial<CreateHabitLogInput>;

export type StreakSummary = {
  currentStreak: number;
  currentStartDate: string | null;
  currentEndDate: string | null;
  highestStreak: number;
  highestStartDate: string | null;
  highestEndDate: string | null;
};
