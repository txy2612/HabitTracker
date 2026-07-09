//database query
import { pool } from "../../db/pool.js";
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

// habitsSelectQuery now left joins habit_reminder_schedules
// so ev habit can return complete habit data shape
// Why imp? -> the object is reused in many places (Dashbaord, Reminder page)
const habitSelectQuery = `
  SELECT
    habits.id,
    habits.name,
    habits.reminder_enabled,
    habits.reminder_time,
    schedules.schedule_type AS reminder_schedule_type,
    COALESCE(schedules.weekdays, '{}'::smallint[]) AS reminder_weekdays,
    schedules.specific_date::text AS reminder_specific_date,
    habits.created_at
  FROM habits
  LEFT JOIN habit_reminder_schedules AS schedules
    ON schedules.habit_id = habits.id
`;

// Promise = "I promise I'll give you the result/cook burger LATER"
// with Promise, JS won't freeze while waiting 

// insertHabit(name) -> INSERT INTO habits -> Create a new habit
export async function insertHabit(name: string): Promise<Habit> {
  const insertResult = await pool.query<{ id: string }>(
    `INSERT INTO habits (name)
     VALUES ($1)
     RETURNING id`,
    [name],// prevent SQL injection
  );

  const result = await pool.query<Habit>(
    `${habitSelectQuery}
     WHERE habits.id = $1`,
    [insertResult.rows[0].id],
  );

  return result.rows[0];
}

// findHabits() -> SELECT * -> Fetch all habits
export async function findHabits(): Promise<Habit[]> {
  const result = await pool.query<Habit>(
    `${habitSelectQuery}
     ORDER BY created_at DESC`,
  );

  return result.rows;
}

export async function updateHabitName(id: string, name: string): Promise<Habit | null> {
  const updateResult = await pool.query<{ id: string }>(
    `UPDATE habits
     SET name = $1
     WHERE id = $2
     RETURNING id`,
    [name, id],
  );

  if (updateResult.rowCount === 0) {
    return null;
  }

  const result = await pool.query<Habit>(
    `${habitSelectQuery}
     WHERE habits.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
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
    /* Transaction: (update 3 tables, if one fail -> rollbcak entire Trans)
    BEGIN

    update user_settings
    update habits
    update schedules

    COMMIT

    if any steps throws: ROLLBACK
    */
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
      const savedScheduleType = reminder.scheduleType; 
      const savedWeekdays = reminder.weekdays;
      const savedSpecificDate = reminder.specificDate; 
      const savedReminderTime = reminder.reminderTime;

      const result = await client.query<Habit>(
        `UPDATE habits
         SET reminder_enabled = $1,
             reminder_time = $2::time
         WHERE id = $3
         RETURNING *`,
        [
          reminder.reminderEnabled,
          savedReminderTime,
          reminder.id,
        ],
      );

      // if frontend sends an invalid habit ID, it records it
      // later: ROLLBACK
      if (result.rowCount === 0) {
        missingHabitIds.push(reminder.id);
        continue;
      }

      // ON CONFLICT = upsert
      // if log not present -> CREATE
      // OR update existing one
      // no duplicated logs and no unecessary errors
      await client.query(
        `INSERT INTO habit_reminder_schedules (
           habit_id,
           is_active,
           schedule_type,
           reminder_time,
           weekdays,
           specific_date
         )
         VALUES ($1, $2, $3, $4::time, $5::smallint[], $6::date)
         ON CONFLICT (habit_id) 
         DO UPDATE SET
           is_active = EXCLUDED.is_active,
           schedule_type = EXCLUDED.schedule_type,
           reminder_time = EXCLUDED.reminder_time,
           weekdays = EXCLUDED.weekdays,
           specific_date = EXCLUDED.specific_date`,
        [
          reminder.id,
          reminder.reminderEnabled,
          savedScheduleType,
          savedReminderTime,
          savedWeekdays,
          savedSpecificDate,
        ]
      );
    }

    if (missingHabitIds.length > 0) {
      await client.query("ROLLBACK");

      return { habits: [], missingHabitIds };
    }

    const habits = await client.query<Habit>(
      `${habitSelectQuery}
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
