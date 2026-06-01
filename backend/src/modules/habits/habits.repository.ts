//database
import { pool } from "../../db/pool.js";
import type { Habit } from "../../types.js";

// Promise = "I promise I'll give you the result/cook burger LATER"
// with Promise, JS won't freeze while waiting 
export async function insertHabit(name: string): Promise<Habit> {
  const result = await pool.query<Habit>(
    `INSERT INTO habits (name)
     VALUES ($1)
     RETURNING *`,
    [name],
  );

  return result.rows[0];
}

export async function findHabits(): Promise<Habit[]> {
  const result = await pool.query<Habit>(
    `SELECT *
     FROM habits
     ORDER BY created_at DESC`,
  );

  return result.rows;
}

export async function updateHabitName(id: string, name: string): Promise<Habit | null> {
  const result = await pool.query<Habit>(
    `UPDATE habits
     SET name = $1
     WHERE id = $2
     RETURNING *`,
    [name, id],
  );

  return result.rowCount === 0 ? null : result.rows[0];
}

export async function deleteHabitById(id: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM habits
     WHERE id = $1`,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}
