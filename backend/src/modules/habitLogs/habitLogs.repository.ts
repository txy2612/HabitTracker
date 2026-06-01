import { pool } from "../../config/db/pool.js";
import type { HabitLog, HabitLogStatus } from "../../shared/types.js";

export async function upsertHabitLog(input: {
  habitId: string;
  logDate: string;
  status: HabitLogStatus;
  note: string | null;
}): Promise<HabitLog> {
  const result = await pool.query<HabitLog>(
    `INSERT INTO habit_logs (habit_id, log_date, status, note)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (habit_id, log_date)
     DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note
     RETURNING *`,
    [input.habitId, input.logDate, input.status, input.note],
  );

  return result.rows[0];
}

export async function findHabitLogsForRange(input: {
  habitId: string;
  start: string;
  end: string;
}): Promise<HabitLog[]> {
  const result = await pool.query<HabitLog>(
    `SELECT *
     FROM habit_logs
     WHERE habit_id = $1
       AND log_date >= $2
       AND log_date < $3
     ORDER BY log_date ASC`,
    [input.habitId, input.start, input.end],
  );

  return result.rows;
}

export async function deleteHabitLogByDate(input: { habitId: string; date: string }): Promise<void> {
  await pool.query(
    `DELETE FROM habit_logs
     WHERE habit_id = $1 AND log_date = $2`,
    [input.habitId, input.date],
  );
}
