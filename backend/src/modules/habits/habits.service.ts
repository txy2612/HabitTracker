import type { Habit } from "../../shared/types.js";
import type { HabitBody } from "./habits.schema.js";
import { HttpError } from "../../shared/httpError.js";
import { deleteHabitById, findHabits, insertHabit, updateHabitName } from "./habits.repository.js";

// Why service return Promise?
// Repo: returns Promise<Habit[]>
// bcz db query is async -> service must alsor return Promise<Habit[]>
// cuople = both must promise (async)

// controller sends: name: "Jogging" -> service
// Service calls repo -> INSERT INTO habits
export async function createHabit(input: HabitBody): Promise<Habit> {
  return insertHabit(input.name);
}

export async function listHabits(): Promise<Habit[]> {
  return findHabits();// Repo later: SELECT * FROM habits
}

export async function renameHabit(
  id: string, input: HabitBody
): Promise<Habit> {
  const habit = await updateHabitName(id, input.name);

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

export async function deleteHabit(id: string): Promise<void> {
  const wasDeleted = await deleteHabitById(id);

  if (!wasDeleted) {
    throw new HttpError(404, "Habit not found.", {
      title: "Habit not found",
      type: "https://habit-tracker.local/problems/habit-not-found",
    });
  }
}
