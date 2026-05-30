export type Habit = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateHabitInput = {
  name: string;
};

export type UpdateHabitInput = Partial<CreateHabitInput>;

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
