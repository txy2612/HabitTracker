import { pool } from "../../config/db/pool.js";
import type { HabitLog } from "../../shared/types.js";

export async function findHabitLogsForStreak(habitId: string): Promise<HabitLog[]> {
  const result = await pool.query<HabitLog>(
    `SELECT *
     FROM habit_logs
     WHERE habit_id = $1
     ORDER BY log_date ASC`,
    [habitId],
  );

  return result.rows;
}
