import type { Habit, UserSettings } from "../../shared/types.js";
import type { HabitBody, UpdateHabitRemindersRequest } from "./habits.schema.js";
import { HttpError } from "../../shared/httpErrors.js";
import {
  archiveHabitById,
  deleteHabitById,
  findActiveHabits,
  findArchivedHabits,
  insertHabit,
  restoreHabitById,
  updateHabitName,
  updateHabitReminders as updateHabitRemindersRepository,
  updateUserTimezone,
} from "./habits.repository.js";

// Why service return Promise?
// Repo: returns Promise<Habit[]>
// bcz db query is async -> service must alsor return Promise<Habit[]>
// cuople = both must promise (async)

// controller sends: name: "Jogging" -> service
// Service calls repo -> INSERT INTO habits
export async function createHabit(userId: string, input: HabitBody): Promise<Habit> {
  return insertHabit(userId, input.name);
}

export async function listHabits(userId: string): Promise<Habit[]> {
  return findActiveHabits(userId);// Repo later: SELECT * FROM habits
}

export async function listArchivedHabits(userId: string): Promise<Habit[]> {
  return findArchivedHabits(userId);
}

export async function renameHabit(
  userId: string,
  id: string,
  input: HabitBody,
): Promise<Habit> {
  const habit = await updateHabitName(userId, id, input.name);

  // Why service still need HttpError when we alr have error handlers?
  // errorHandlers dk business rules
  if (!habit) {
    throw new HttpError(404, "Habit not found.", {
      title: "Habit not found",
      type: "https://habit-tracker.local/problems/habit-not-found",
    });
  }

  return habit;
}
// Repo later: 
// UPDATE habits 
// SET name = "" 
// WHERE id = ""

export async function deleteHabit(userId: string, id: string): Promise<void> {
  const wasDeleted = await deleteHabitById(userId, id);

  // Why service still need HttpError when we alr have error handlers?
  // ErrorHandlers dk business rules
  // business rules are only in services
  if (!wasDeleted) {
    throw new HttpError(404, "Habit not found.", {
      title: "Habit not found",
      type: "https://habit-tracker.local/problems/habit-not-found",
    });
  }
}

export async function archiveHabit(userId: string, id: string): Promise<Habit> {
  const habit = await archiveHabitById(userId, id);

  if (!habit) {
    throw new HttpError(404, "Habit not found.", {
      title: "Habit not found",
      type: "https://habit-tracker.local/problems/habit-not-found",
    });
  }

  return habit;
}

export async function restoreHabit(userId: string, id: string): Promise<Habit> {
  const habit = await restoreHabitById(userId, id);

  if (!habit) {
    throw new HttpError(404, "Habit not found.", {
      title: "Habit not found",
      type: "https://habit-tracker.local/problems/habit-not-found",
    });
  }

  return habit;
}

// export to controller
// async = wait for db
// take body section (data) of request 
export async function saveHabitReminders(
  userId: string,
  input: UpdateHabitRemindersRequest["body"],
): Promise<Habit[]> {// Promise to return an array of habits
  // Dentist -> Clinic computer : updateReminderSettings``
  console.log("[saveHabitReminders] before updateHabitRemindersRepository")
  const result = await updateHabitRemindersRepository(userId, input);
  console.log("[saveHabitReminders] after updateHabitRemindersRepository")

  if (result.missingHabitIds.length > 0) {
    console.log("result.missingHabitIds.length > 0")
    throw new HttpError(404, "One or more habits were not found.", {
      title: "Habit not found",
      type: "https://habit-tracker.local/problems/habit-not-found",
    });
  }

  return result.habits;
}

export async function saveUserTimezone(
  userId: string,
  timezone: string,
): Promise<UserSettings> {
  return updateUserTimezone(userId, timezone);
}
