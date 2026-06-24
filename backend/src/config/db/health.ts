import { pool } from "./pool.js";

const requiredTables = [
  "habits",
  "habit_logs",
  "user_settings",
  "reminder_logs",
  "habit_reminder_schedules",
] as const;

export type DatabaseHealthResult = {
  ok: boolean;
  missingTables: string[];
  message: string;
};

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  try {
    await pool.query("SELECT 1");

    const result = await pool.query<{ tablename: string }>(
      `SELECT tablename
       FROM pg_tables
       WHERE schemaname = 'public'
         AND tablename = ANY($1::text[])`,
      [requiredTables],
    );

    const existingTables = new Set(result.rows.map((row) => row.tablename));
    const missingTables = requiredTables.filter((tableName) => !existingTables.has(tableName));

    if (missingTables.length > 0) {
      return {
        ok: false,
        missingTables,
        message: `Database schema is missing required tables: ${missingTables.join(", ")}.`,
      };
    }

    return {
      ok: true,
      missingTables: [],
      message: "Database connection and schema look healthy.",
    };
  } catch (error) {
    return {
      ok: false,
      missingTables: [],
      message: error instanceof Error ? error.message : "Database connection failed.",
    };
  }
}
