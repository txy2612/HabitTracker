// frontend gateway to backend
// frontend use apiClient(helper) to talk to backend
import type {
  CreateHabitInput,
  CreateHabitLogInput,
  Habit,
  HabitLog,
  HabitLogStatus,
  HabitReminderSettings,
  ReminderScheduleType,
  ReminderWeekday,
  SaveHabitRemindersInput,
  StreakSummary,
  UpdateHabitInput,
  UpdateHabitLogInput,
} from "../shared/types/api.types";// import types used, ONLY type info is imported, no JS code

// If .env has VITE_API_BASE_URL , use it
// otherwise use "/api"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Backend can stay database-friendly.
// Frontend can stay React-friendly.
// apiClient translates between them.

// 1. define backend data shapes (diff from frontend)
type HabitRow = {
  id: string;
  name: string;
  reminder_enabled: boolean;
  reminder_time: string | null;
  reminder_schedule_type: ReminderScheduleType | null;
  reminder_weekdays: ReminderWeekday[] | null;
  reminder_specific_date: string | null;
  created_at: string;
};

type HabitLogRow = {
  id: string;
  habit_id: string;
  log_date: string;
  status: HabitLogStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type HabitReminderSettingsRow = {
  reminderEmail: string | null;
  timezone: string;
};

// 2. mapper = chopper of the food into baby food
// converts backend data (adult food) -> frontend format (baby food) to be eaten by baby (React)
// changes names like created_at -> createdAt
function mapReminderTime(reminderTime: string | null): string | null {
  return reminderTime ? reminderTime.slice(0, 5) : null;
}

function mapDateOnly(date: string): string {
  if (!date.includes("T")) {
    return date;
  }

  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    reminderEnabled: row.reminder_enabled,
    reminderTime: mapReminderTime(row.reminder_time),
    reminderScheduleType: row.reminder_schedule_type ?? "daily",
    reminderWeekdays: row.reminder_weekdays ?? [],
    reminderSpecificDate: row.reminder_specific_date,
    createdAt: row.created_at,
  };
}

function mapHabitLog(row: HabitLogRow): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    logDate: mapDateOnly(row.log_date),
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 3. Send HTTP request
// so dh to repeat fetch(...), error, parse json
// knows how to deliver food
async function request<T>(path: string, options: RequestInit = {}) {

    //sends HTTP request to backend
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      // merge whatever options : POST, DELETE, PUT etc
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(error.message ?? "Request failed.");
  }

  // handle delete responses w no body
  // response.json() can crash bcz delete returns ntg
  // guard = instead of calling response.json() -> undefined
  if (response.status === 204) {
    return undefined as T;
  }

  // Converts backend JSON into JavaScript objects
  return response.json() as Promise<T>;
}

// 4. Expose all API functions
// Menu of foods customer can order
export const apiClient = {
  getHabits: async (): Promise<Habit[]> => {
    const habits = await request<HabitRow[]>("/habits");
    return habits.map(mapHabit);
  },

  createHabit: async (input: CreateHabitInput): Promise<Habit> => {
    const habit = await request<HabitRow>("/habits", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return mapHabit(habit);
  },

  updateHabit: async (habitId: string, input: UpdateHabitInput): Promise<Habit> => {
    const habit = await request<HabitRow>(`/habits/${habitId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });

    return mapHabit(habit);
  },

  saveHabitReminders: async (input: SaveHabitRemindersInput): Promise<Habit[]> => {
    const habits = await request<HabitRow[]>("/habits/reminders", {
      method: "PATCH",
      body: JSON.stringify(input),
    });

    return habits.map(mapHabit);
  },

  getHabitReminderSettings: async (): Promise<HabitReminderSettings> => {
    return request<HabitReminderSettingsRow>("/habits/reminders");
  },

  // function deleteHabit
  // receives habitId, async means return Promise
  deleteHabit: async (habitId: string): Promise<void> => {

    // URL construction
    return request<void>(`/habits/${habitId}`, {
      method: "DELETE",
    });
  },

  getLogs: async (habitId: string, month: string): Promise<HabitLog[]> => {
    const logs = await request<HabitLogRow[]>(`/habits/${habitId}/logs?month=${month}`);
    return logs.map(mapHabitLog);
  },

  saveLog: async (habitId: string, input: CreateHabitLogInput | UpdateHabitLogInput): Promise<HabitLog> => {
    const log = await request<HabitLogRow>(`/habits/${habitId}/logs`, {
      method: "POST",
      body: JSON.stringify(input),
    });

    return mapHabitLog(log);
  },

  deleteLog: async (habitId: string, date: string): Promise<void> => {
    return request<void>(`/habits/${habitId}/logs?date=${date}`, {
      method: "DELETE",
    });
  },

  getStreak: async (habitId: string): Promise<StreakSummary> => {
    return request<StreakSummary>(`/habits/${habitId}/streak`);
  },
};
