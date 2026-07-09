import { pool } from "../../db/pool.js";
import type {
  ReminderChannel,
  ReminderLog,
  ReminderWeekday,
  UserSettings,
} from "../../shared/types.js";

export type EmailReminderCandidate = {
  habit_id: string;
  habit_name: string;
  schedule_type: "daily" | "weekly" | "specific_date";
  reminder_time: string;
  weekdays: ReminderWeekday[];
  specific_date: string | null;
  reminder_email: string;
  timezone: string;
};

// Get app settings (returns reminder_email, timezone, updated_at)
// Repo: "What's the user's email and timezone?"
// Databse: "Here"
export async function findUserSettings(): Promise<UserSettings> {
  const result = await pool.query<UserSettings>(
    `SELECT *
     FROM user_settings
     WHERE id = 1`,
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  const insertResult = await pool.query<UserSettings>(
    `INSERT INTO user_settings (id)
     VALUES (1)
     RETURNING *`,
  );

  return insertResult.rows[0];
}

// Find all habits that MIGHT need reminders
// reminder enabled + reminder time exists + email exists
export async function findEmailReminderCandidates(): Promise<EmailReminderCandidate[]> {
  const result = await pool.query<EmailReminderCandidate>(
    `SELECT
       habits.id AS habit_id,
       habits.name AS habit_name,
       schedules.schedule_type AS schedule_type,
       schedules.reminder_time::text AS reminder_time,
       schedules.weekdays AS weekdays,
       schedules.specific_date::text AS specific_date,
       user_settings.reminder_email AS reminder_email,
       user_settings.timezone AS timezone
     FROM habit_reminder_schedules AS schedules
     INNER JOIN habits
       ON habits.id = schedules.habit_id
     CROSS JOIN user_settings
     WHERE schedules.is_active = true
       AND schedules.reminder_time IS NOT NULL
       AND user_settings.id = 1
       AND user_settings.reminder_email IS NOT NULL
       AND BTRIM(user_settings.reminder_email) <> ''
     ORDER BY habits.created_at DESC`,
  );

  return result.rows;
}

// Purpose: check "Did we already send this reminder today?"
// If found -> Yes sent. Not found -> No, safe to send
// without this -> keep sending email
export async function findReminderLog(input: {
  habitId: string;
  sentForDate: string;
  channel: ReminderChannel;
}): Promise<ReminderLog | null> {
  const result = await pool.query<ReminderLog>(
    `SELECT *
     FROM reminder_logs
     WHERE habit_id = $1
       AND sent_for_date = $2
       AND channel = $3`,
    [input.habitId, input.sentForDate, input.channel],
  );

  return result.rows[0] ?? null;
}

// Purpose: Record email sent
// without this -> keep sending the email
export async function insertReminderLog(input: {
  habitId: string;
  sentForDate: string;
  channel: ReminderChannel;
}): Promise<ReminderLog | null> {
  const result = await pool.query<ReminderLog>(
    `INSERT INTO reminder_logs (habit_id, sent_for_date, channel)
     VALUES ($1, $2, $3)
     ON CONFLICT (habit_id, sent_for_date, channel)
     DO NOTHING
     RETURNING *`,
    [input.habitId, input.sentForDate, input.channel],
  );

  return result.rows[0] ?? null;
}

// One-time reminders are completed by turning them inactive.
// Keep the saved schedule fields so the UI can still show and reuse them.
// do not clean up too many data (by nulling them) upon setting is_active = FALSE
// keeping record of past specific dates reminders -> easier to debug if it had problem
export async function deactivateSpecificDateReminder(habitId: string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE habit_reminder_schedules
       SET is_active = false
       WHERE habit_id = $1
         AND schedule_type = 'specific_date'`,
      [habitId],
    );

    // Keep the mirrored reminder time in habits so the previous settings
    // are still available when the user re-enables the reminder later.
    await client.query(
      `UPDATE habits
       SET reminder_enabled = false
       WHERE id = $1`,
      [habitId],
    );

    // either BOTH tables are updated OR NEITHER
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
