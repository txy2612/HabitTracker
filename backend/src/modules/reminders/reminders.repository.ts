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

export type ReminderDeliveryCandidate = EmailReminderCandidate & {
  scheduled_for_date: string;
  delivery_job_id: string;
  attempt_count: number;
  max_attempts: number;
};

export async function findUserSettings(userId: string): Promise<UserSettings> {
  const result = await pool.query<UserSettings>(
    `INSERT INTO user_settings (user_id, reminder_email, timezone)
     SELECT users.id, users.email, 'Asia/Kuala_Lumpur'
     FROM users
     WHERE users.id = $1::bigint
     ON CONFLICT (user_id)
     DO UPDATE SET reminder_email = EXCLUDED.reminder_email
     RETURNING user_settings.*`,
    [userId],
  );

  return result.rows[0];
}

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
     INNER JOIN user_settings
       ON user_settings.user_id = habits.user_id
     WHERE schedules.is_active = true
       AND habits.archived_at IS NULL
       AND schedules.reminder_time IS NOT NULL
       AND user_settings.reminder_email IS NOT NULL
       AND BTRIM(user_settings.reminder_email) <> ''
     ORDER BY habits.created_at DESC`,
  );

  return result.rows;
}

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

export async function enqueueReminderDelivery(input: {
  habitId: string;
  sentForDate: string;
  channel: ReminderChannel;
}): Promise<boolean> {
  // One queue row per habit/date/channel keeps repeated cron ticks idempotent.
  const result = await pool.query(
    `INSERT INTO reminder_delivery_jobs (habit_id, scheduled_for_date, channel)
     VALUES ($1, $2, $3)
     ON CONFLICT (habit_id, scheduled_for_date, channel) DO NOTHING`,
    [input.habitId, input.sentForDate, input.channel],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function claimReadyReminderDeliveries(input: {
  workerId: string;
  limit: number;
}): Promise<ReminderDeliveryCandidate[]> {
  const result = await pool.query<ReminderDeliveryCandidate>(
    // SKIP LOCKED lets multiple workers claim different jobs without waiting.
    // Processing jobs are only claimable again after the timeout, which handles
    // crashed workers without duplicating normal in-flight sends.
    `WITH claimable AS (
       SELECT jobs.id
       FROM reminder_delivery_jobs AS jobs
       INNER JOIN habit_reminder_schedules AS schedules
         ON schedules.habit_id = jobs.habit_id
       INNER JOIN habits
         ON habits.id = jobs.habit_id
       INNER JOIN user_settings
         ON user_settings.user_id = habits.user_id
       WHERE jobs.channel = 'email'
         AND (
           jobs.status = 'pending'
           OR (
             jobs.status = 'processing'
             AND jobs.claimed_at < NOW() - INTERVAL '10 minutes'
           )
         )
         AND jobs.next_retry_at <= NOW()
         AND jobs.attempt_count < jobs.max_attempts
         AND schedules.is_active = true
         AND habits.archived_at IS NULL
         AND user_settings.reminder_email IS NOT NULL
         AND BTRIM(user_settings.reminder_email) <> ''
       ORDER BY jobs.next_retry_at ASC
       LIMIT $2
       FOR UPDATE SKIP LOCKED
     )
     UPDATE reminder_delivery_jobs AS jobs
     SET status = 'processing',
         claimed_at = NOW(),
         claimed_by = $1
     FROM claimable,
          habit_reminder_schedules AS schedules,
          habits,
          user_settings
     WHERE jobs.id = claimable.id
       AND schedules.habit_id = jobs.habit_id
       AND habits.id = jobs.habit_id
       AND user_settings.user_id = habits.user_id
     RETURNING
       jobs.id::text AS delivery_job_id,
       habits.id::text AS habit_id,
       habits.name AS habit_name,
       schedules.schedule_type AS schedule_type,
       schedules.reminder_time::text AS reminder_time,
       schedules.weekdays AS weekdays,
       schedules.specific_date::text AS specific_date,
       user_settings.reminder_email AS reminder_email,
       user_settings.timezone AS timezone,
       jobs.scheduled_for_date::text AS scheduled_for_date,
       jobs.attempt_count,
       jobs.max_attempts`,
    [input.workerId, input.limit],
  );

  return result.rows;
}

export async function markReminderDeliverySent(input: {
  deliveryJobId: string;
}): Promise<void> {
  await pool.query(
    `UPDATE reminder_delivery_jobs
     SET status = 'sent',
         sent_at = NOW(),
         last_error = NULL
     WHERE id = $1`,
    [input.deliveryJobId],
  );
}

export async function rescheduleReminderDelivery(input: {
  deliveryJobId: string;
  nextRetryAt: string;
  lastError: string;
}): Promise<void> {
  // Put the job back in the queue, but only after the calculated retry time.
  await pool.query(
    `UPDATE reminder_delivery_jobs
     SET status = 'pending',
         attempt_count = attempt_count + 1,
         next_retry_at = $2,
         last_error = $3,
         claimed_at = NULL,
         claimed_by = NULL
     WHERE id = $1`,
    [input.deliveryJobId, input.nextRetryAt, input.lastError],
  );
}

export async function failReminderDelivery(input: {
  deliveryJobId: string;
  lastError: string;
}): Promise<void> {
  // Dead-letter state: keep the final error for debugging instead of retrying forever.
  await pool.query(
    `UPDATE reminder_delivery_jobs
     SET status = 'failed',
         attempt_count = attempt_count + 1,
         last_error = $2,
         claimed_at = NULL,
         claimed_by = NULL
     WHERE id = $1`,
    [input.deliveryJobId, input.lastError],
  );
}

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

    await client.query(
      `UPDATE habits
       SET reminder_enabled = false
       WHERE id = $1`,
      [habitId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
