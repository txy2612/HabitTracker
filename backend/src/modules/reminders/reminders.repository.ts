import { pool } from "../../config/db/pool.js";
import type { ReminderChannel, ReminderLog, UserSettings } from "../../shared/types.js";

export type EmailReminderCandidate = {
  habit_id: string;
  habit_name: string;
  reminder_time: string;
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

  return result.rows[0];
}

// Find all habits that could need reminders
// reminder enabled + reminder time exists + email exists
export async function findEmailReminderCandidates(): Promise<EmailReminderCandidate[]> {
  const result = await pool.query<EmailReminderCandidate>(
    `SELECT
       habits.id AS habit_id,
       habits.name AS habit_name,
       habits.reminder_time::text AS reminder_time,
       user_settings.reminder_email AS reminder_email,
       user_settings.timezone AS timezone
     FROM habits
     CROSS JOIN user_settings
     WHERE habits.reminder_enabled = true
       AND habits.reminder_time IS NOT NULL
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
