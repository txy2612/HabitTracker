// define frontend <-> backend contracts
// frontend promise to send data in this shape
// backend promises to send data in this shape

//both backend & frontend must include the field, otherwise, frontend fails type-checking / rely on undocumented response (no type check?)
export type Habit = {
  id: string;
  name: string;
  reminderEnabled: boolean;
  reminderTime: string | null;
  reminderScheduleType: ReminderScheduleType;
  reminderWeekdays: ReminderWeekday[];
  reminderSpecificDate: string | null;
  archivedAt: string | null;// tells backend: ev habit returned by repo/controller/service may now include archivedAt
  createdAt: string;
};

//describe what the frontend sends 
export type GoogleLoginInput = {
  credential: string;
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
  lastCompletedDate: string | null;// diff from current & longest streak
};

// describe what a loggedin user looks in frontend
export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

// result after login or register
export type AuthResult = {
  token: string;
  user: AuthUser;
};

// Keep provider explicit so "Sign in with Google" can plug into the same session shape later.
export type AuthProvider = "password" | "google";

export type StoredAuthSession = AuthResult & {
  provider: AuthProvider;
};

export type UpdateTimezoneInput = {
  timezone: string;
};
