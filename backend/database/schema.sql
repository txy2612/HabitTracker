
BEGIN;

-- Users must exist before user-owned tables can reference them.
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_sub TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS google_sub TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub
  ON users (google_sub)
  WHERE google_sub IS NOT NULL;

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ NULL
);

-- keep schema compatible with existing databases (DB doesnt auto change when we make add smtg to it)
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_time TIME,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;


CREATE TABLE IF NOT EXISTS habit_logs (
  id BIGSERIAL PRIMARY KEY,

  -- Example: habit_id = 1 (Exercise), habit_id = 2 (Read 3 pages)
  -- if (delete habit id = 1), all logs of Exercises will be deleted
  habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'done' CHECK (status IN ('done', 'missed', 'skipped')), -- only these values are allowed
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, log_date) -- one log per day
);

-- Table = book
-- Index = Table of contebts
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date
  ON habit_logs (habit_id, log_date DESC); -- desc = latest first

CREATE TABLE IF NOT EXISTS user_settings (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Where this user's reminders should be sent.
  reminder_email TEXT,

  -- The user's local timezone.
  timezone TEXT NOT NULL DEFAULT 'Asia/Kuala_Lumpur',

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CREATE TABLE IF NOT EXISTS does not alter an existing table, so keep the
-- default aligned when this schema is applied to an older database.
ALTER TABLE user_settings
  ALTER COLUMN timezone SET DEFAULT 'Asia/Kuala_Lumpur';

-- Upgrade databases that still have the old singleton settings row.
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

DO $$
DECLARE
  has_legacy_id BOOLEAN;
  user_count BIGINT;
  only_user_id BIGINT;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_settings'
      AND column_name = 'id'
  ) INTO has_legacy_id;

  IF has_legacy_id THEN
    SELECT COUNT(*), MIN(id)
    INTO user_count, only_user_id
    FROM users;

    UPDATE user_settings AS settings
    SET user_id = COALESCE(
      (
        SELECT users.id
        FROM users
        WHERE LOWER(users.email) = LOWER(settings.reminder_email)
        LIMIT 1
      ),
      CASE WHEN user_count = 1 THEN only_user_id END
    )
    WHERE settings.user_id IS NULL;

    DELETE FROM user_settings
    WHERE user_id IS NULL;

    ALTER TABLE user_settings DROP COLUMN id CASCADE;
  END IF;
END
$$;

ALTER TABLE user_settings
  ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'user_settings'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE user_settings
      ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS habit_reminder_schedules (
  id BIGSERIAL PRIMARY KEY,
  habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'specific_date')),
  reminder_time TIME,
  weekdays SMALLINT[] NOT NULL DEFAULT '{}',
  specific_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id),
  CHECK (reminder_time IS NOT NULL OR is_active = false),
  CHECK (
    (schedule_type = 'daily' AND cardinality(weekdays) = 0 AND specific_date IS NULL)
    OR (schedule_type = 'weekly' AND cardinality(weekdays) > 0 AND specific_date IS NULL)
    OR (schedule_type = 'specific_date' AND cardinality(weekdays) = 0 AND specific_date IS NOT NULL)
  ),
  CHECK (
    weekdays <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::SMALLINT[]
  )
);

CREATE INDEX IF NOT EXISTS idx_habit_reminder_schedules_active_time
  ON habit_reminder_schedules (reminder_time)
  WHERE is_active = true;

/* Purpose: "Have we already sent today's reminder?"
  BIGSERIAL = auto-increment 1, 2, 3
  Email sent -> INSERT INTO reminder_logs
*/
CREATE TABLE IF NOT EXISTS reminder_logs (
  id BIGSERIAL PRIMARY KEY,

  /* Links reminder to habit
     If habit deleted, all reminder logs automatically removed (DELETE FROM Habits were id = 5)
  */
  habit_id BIGINT NOT NULL REFERENCES habits(id)
  ON DELETE CASCADE,

  -- etc: Reminder was sent for June 2
  sent_for_date DATE NOT NULL,

  /* How reminder was sent: email/push/sms
   Leaves room for other channels while implementing email */
  channel TEXT NOT NULL,

  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only one email reminder, per habit, per day
  UNIQUE (habit_id, sent_for_date, channel)
);

-- Indexes = table of contents
-- With index: Postgres know habits with reminders enabled
-- without scanning habit one by one
CREATE INDEX IF NOT EXISTS idx_habits_enabled_reminders
  ON habits (reminder_time)
  WHERE reminder_enabled = true;

CREATE INDEX IF NOT EXISTS idx_reminder_logs_habit_date_channel
  ON reminder_logs (habit_id, sent_for_date, channel);

-- Retryable email work queue.
-- reminder_logs is still the success history; this table tracks pending,
-- in-progress, retrying, and permanently failed delivery attempts.
CREATE TABLE IF NOT EXISTS reminder_delivery_jobs (
  id BIGSERIAL PRIMARY KEY,
  habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  scheduled_for_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ NULL,
  claimed_by TEXT NULL,
  last_error TEXT NULL,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, scheduled_for_date, channel)
);

-- Cron looks for jobs whose retry time has arrived.
-- Keep processing rows in this index because expired claims can be reclaimed.
CREATE INDEX IF NOT EXISTS idx_reminder_delivery_jobs_ready
  ON reminder_delivery_jobs (next_retry_at)
  WHERE status IN ('pending', 'processing');

--  creates reusable logic: NEW.updated_at = NOW()
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();-- whenever a row changes, update the timestamp

  -- NEW only exists in trigger
  -- represents the NEW row(data) in comparison to OLD row(data)

  RETURN NEW; -- overwrite with NEW row of data
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS habit_logs_set_updated_at ON habit_logs;
CREATE TRIGGER habit_logs_set_updated_at
/* when updates a log, trigger is fired
  -> updated_at = NOW();
  w/o TRIGGER, updated_at would stay old forever
*/
BEFORE UPDATE ON habit_logs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS user_settings_set_updated_at ON user_settings;
CREATE TRIGGER user_settings_set_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS habit_reminder_schedules_set_updated_at ON habit_reminder_schedules;
CREATE TRIGGER habit_reminder_schedules_set_updated_at
BEFORE UPDATE ON habit_reminder_schedules
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS reminder_delivery_jobs_set_updated_at ON reminder_delivery_jobs;
CREATE TRIGGER reminder_delivery_jobs_set_updated_at
BEFORE UPDATE ON reminder_delivery_jobs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- add user_id column to habits, and connect it to the id column in users
-- ON DELETE CASCADE: If a user is deleted, all their habits are automatically deleted too
ALTER TABLE habits
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;


-- Example:
-- Habit - Jogging (id=1)
-- Logs - Date1 done
--      - Date2 missed

COMMIT;
