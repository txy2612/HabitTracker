export type Habit = {
  id: string;
  name: string;
  created_at: string;
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

export type StreakSummary = {
  currentStreak: number;
  currentStartDate: string | null;
  currentEndDate: string | null;
  highestStreak: number;
  highestStartDate: string | null;
  highestEndDate: string | null;
};
