//database query
import { pool } from "../../config/db/pool.js";
import type { Habit } from "../../shared/types.js";
import type { HabitReminderInput } from "./habits.schema.js";
// so Repo knows what fields should reminder & habits contain = clinic computer gets X-ray image, to check DB SHAPE
// NONID to import SCHEMA bcz NONID to VALIDATE anything (clinic computer nonid dental tools)

export type UpdateHabitRemindersInput = {
  reminderEmail?: string | null;
  timezone: string;
  reminders: HabitReminderInput[];
};

export type UpdateHabitRemindersResult = {
  habits: Habit[];
  missingHabitIds: string[];
};

// Promise = "I promise I'll give you the result/cook burger LATER"
// with Promise, JS won't freeze while waiting 

// insertHabit(name) -> INSERT INTO habits -> Create a new habit
export async function insertHabit(name: string): Promise<Habit> {
  const result = await pool.query<Habit>(
    `INSERT INTO habits (name)
     VALUES ($1)
     RETURNING *`,
    [name],
  );

  return result.rows[0];
}

// findHabits() -> SELECT * -> Fetch all habits
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

export async function updateHabitReminders(
  input: UpdateHabitRemindersInput,
): Promise<UpdateHabitRemindersResult> {

  const client = await pool.connect();
  const missingHabitIds: string[] = [];

  try {

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO user_settings (id, reminder_email, timezone)
       VALUES (1, $1, $2)
       ON CONFLICT (id)
       DO UPDATE SET
         reminder_email = EXCLUDED.reminder_email,
         timezone = EXCLUDED.timezone`,
      [input.reminderEmail ?? null, input.timezone],
    );

    for (const reminder of input.reminders) {
      const result = await client.query<Habit>(
        `UPDATE habits
         SET reminder_enabled = $1,
             reminder_time = $2::time
         WHERE id = $3
         RETURNING *`,
        [
          reminder.reminderEnabled,
          reminder.reminderEnabled ? reminder.reminderTime : null,
          reminder.id,
        ],
      );

      if (result.rowCount === 0) {
        missingHabitIds.push(reminder.id);
      }
    }

    if (missingHabitIds.length > 0) {
      await client.query("ROLLBACK");

      return { habits: [], missingHabitIds };
    }

    const habits = await client.query<Habit>(
      `SELECT *
       FROM habits
       ORDER BY created_at DESC`,
    );

    await client.query("COMMIT");

    return { habits: habits.rows, missingHabitIds };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
