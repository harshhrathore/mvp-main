-- Migration Script: Rename user_progress_daily to checkin_sessions and enforce 1:1 preferences
-- Date: 2026-02-04
-- Description: Rename daily progress table to checkin_sessions, update FK, enforce unique preferences

BEGIN;

-- 1) Rename table
ALTER TABLE IF EXISTS user_progress_daily RENAME TO checkin_sessions;

-- 2) Update chat_messages FK to new table
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_progress_id_fkey;
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_progress_id_fkey
FOREIGN KEY (progress_id) REFERENCES checkin_sessions(progress_id) ON DELETE CASCADE;

-- 3) Rename index (optional but clearer)
ALTER INDEX IF EXISTS idx_sessions_user_date RENAME TO idx_checkin_sessions_user_date;

-- 4) Enforce 1:1 between users and user_preferences
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM user_preferences
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot enforce 1:1: duplicate user_preferences.user_id values exist';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_preferences_user_id
ON user_preferences(user_id);

COMMIT;
