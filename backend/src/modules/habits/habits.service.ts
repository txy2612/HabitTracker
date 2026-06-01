import type { Habit } from "../../types.js";
import type { HabitBody } from "./habits.schema.js";
import { findHabits, insertHabit, updateHabitName } from "./habits.repository.js";

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
): Promise<Habit | null> {
  return updateHabitName(id, input.name);
}
// Repo later: 
// UPDATE habits 
// SET name = "" 
// WHERE id = ""
