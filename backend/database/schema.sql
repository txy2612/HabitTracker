-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- auto records creation time
);

-- remove old columns
ALTER TABLE habits
  DROP COLUMN IF EXISTS reminder_time,
  DROP COLUMN IF EXISTS archived_at;


CREATE TABLE IF NOT EXISTS habit_logs (
  id BIGSERIAL PRIMARY KEY,
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

--  creates reusable logic: NEW.updated_at = NOW()
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();-- whenever a row changes, update the timestamp
  RETURN NEW;
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


-- Example:
-- Habit - Jogging (id=1)
-- Logs - Date1 done
--      - Date2 missed