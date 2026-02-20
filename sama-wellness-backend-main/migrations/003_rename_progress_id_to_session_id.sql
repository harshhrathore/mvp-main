-- Migration Script: Rename progress_id to session_id
-- Date: 2026-02-04
-- Description: Rename session identifier columns and update FK

BEGIN;

-- 1) Rename column in checkin_sessions
ALTER TABLE checkin_sessions RENAME COLUMN progress_id TO session_id;

-- 2) Rename column in chat_messages
ALTER TABLE chat_messages RENAME COLUMN progress_id TO session_id;

-- 3) Update FK constraint to reference new column
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_progress_id_fkey;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_session_id_fkey;
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_session_id_fkey
FOREIGN KEY (session_id) REFERENCES checkin_sessions(session_id) ON DELETE CASCADE;

COMMIT;
