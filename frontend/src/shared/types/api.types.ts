//define shapes of data

export type ApiError = {
  message: string;
  statusCode?: number;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type Habit = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateHabitInput = {
  name: string;
};

export type UpdateHabitInput = Partial<CreateHabitInput>;

export type HabitStatus = "done" | "missed" | "skipped";

export type HabitLog = {
  id: string;
  habitId: string;
  logDate: string;
  status: HabitStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateHabitLogInput = Pick<HabitLog, "logDate" | "status"> & {
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
