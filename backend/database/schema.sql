-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- auto records creation time
);

-- keep schema compatible with existing databases
ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_time TIME,
  DROP COLUMN IF EXISTS archived_at;


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
  /* only one user settings (one user)
    small int -> smaler range , big int -> wasteful
    CHECK (id = 1) -> id = 2 is not acceptable
  */
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1), 

  -- where reminder shud be sent
  reminder_email TEXT, 

  -- local time zone
  timezone TEXT NOT NULL DEFAULT 'UTC', 
  
  --timestamp -> NOW()
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 
);

/* seed for ini settings
    first run: insert row id =1
    second run: do ntg
    w/o seed, query checks if (settings == null) eeverywhere
    else row[0] would crash if it's called but undefined
*/
INSERT INTO user_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING; 

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


-- Example:
-- Habit - Jogging (id=1)
-- Logs - Date1 done
--      - Date2 missed
