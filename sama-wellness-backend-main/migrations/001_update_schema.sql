-- Migration Script: Update Database Schema
-- Date: 2026-02-03
-- Description: Add dosha_types table, update constraints, add indexes, update user_preferences

-- ============================================
-- 1. CREATE dosha_types TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dosha_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed dosha types
INSERT INTO dosha_types (name, description) VALUES
    ('Vata', 'Air and space elements - governs movement, communication, and creativity. When imbalanced: anxiety, restlessness, insomnia.'),
    ('Pitta', 'Fire and water elements - governs digestion, metabolism, and transformation. When imbalanced: anger, inflammation, irritability.'),
    ('Kapha', 'Earth and water elements - governs structure, stability, and lubrication. When imbalanced: lethargy, weight gain, depression.')
ON CONFLICT (name) DO NOTHING;


-- ============================================
-- 2. UPDATE user_preferences TABLE
-- ============================================

-- Add emotional_attachment column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS emotional_attachment INTEGER DEFAULT 8;

-- Add dosha_type_id column
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS dosha_type_id INTEGER;

-- Add nickname column
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50) DEFAULT 'friend';

-- Add CHECK constraint
ALTER TABLE user_preferences
ADD CONSTRAINT chk_emotional_attachment 
CHECK (emotional_attachment >= 1 AND emotional_attachment <= 10);

-- Map existing users to Vata by default if null
UPDATE user_preferences
SET dosha_type_id = (SELECT id FROM dosha_types WHERE name = 'Vata')
WHERE dosha_type_id IS NULL;

-- Make it NOT NULL after backfill
ALTER TABLE user_preferences
ALTER COLUMN dosha_type_id SET NOT NULL;

-- Add FK constraint to dosha_types
ALTER TABLE user_preferences
ADD CONSTRAINT fk_user_preferences_dosha_type
FOREIGN KEY (dosha_type_id) REFERENCES dosha_types(id) ON DELETE RESTRICT;

-- Remove old columns (optional - comment out if you want to keep them)
-- ALTER TABLE user_preferences DROP COLUMN IF EXISTS speaking_speed;
-- ALTER TABLE user_preferences DROP COLUMN IF EXISTS notification_enabled;


-- ============================================
-- 3. UPDATE dosha_tracking TABLE
-- ============================================

-- Add new column for FK to dosha_types
ALTER TABLE dosha_tracking 
ADD COLUMN IF NOT EXISTS dosha_type_id INTEGER;

-- Migrate existing data: map string values to dosha_type_id
-- This assumes dominant_imbalance column exists with string values
UPDATE dosha_tracking dt
SET dosha_type_id = (
    SELECT id FROM dosha_types 
    WHERE LOWER(name) = LOWER(dt.dominant_imbalance)
)
WHERE dosha_type_id IS NULL;

-- Set default to Vata for any NULL values
UPDATE dosha_tracking
SET dosha_type_id = (SELECT id FROM dosha_types WHERE name = 'Vata')
WHERE dosha_type_id IS NULL;

-- Make it NOT NULL after data migration
ALTER TABLE dosha_tracking 
ALTER COLUMN dosha_type_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE dosha_tracking
ADD CONSTRAINT fk_dosha_tracking_dosha_type
FOREIGN KEY (dosha_type_id) REFERENCES dosha_types(id) ON DELETE RESTRICT;

-- Add CHECK constraint for intensity
ALTER TABLE dosha_tracking
ADD CONSTRAINT chk_intensity 
CHECK (imbalance_intensity >= 1 AND imbalance_intensity <= 10);

-- Drop old column after migration (optional - keep for now to preserve data)
-- ALTER TABLE dosha_tracking DROP COLUMN IF EXISTS dominant_imbalance;


-- ============================================
-- 4. ADD PERFORMANCE INDEXES
-- ============================================

-- Index for dosha_tracking updated_at (for getting latest dosha)
CREATE INDEX IF NOT EXISTS idx_dosha_tracking_updated_at 
ON dosha_tracking(updated_at);

-- Composite index for chat_messages (user_id, created_at) for today's messages query
CREATE INDEX IF NOT EXISTS idx_messages_user_date 
ON chat_messages(user_id, created_at);

-- Composite index for user_progress_daily (user_id, date) for session lookup
CREATE INDEX IF NOT EXISTS idx_sessions_user_date 
ON user_progress_daily(user_id, date);

-- Composite index for user_preferences (user_id, dosha_type_id)
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_dosha
ON user_preferences(user_id, dosha_type_id);


-- ============================================
-- 5. VERIFY MIGRATION
-- ============================================

-- Check dosha_types has data
SELECT COUNT(*) as dosha_types_count FROM dosha_types;

-- Check user_preferences has emotional_attachment
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND column_name = 'emotional_attachment';

-- Check dosha_tracking has dosha_type_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dosha_tracking' AND column_name = 'dosha_type_id';

-- Check indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('chat_messages', 'user_progress_daily', 'dosha_tracking')
ORDER BY tablename, indexname;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
/*
-- Remove indexes
DROP INDEX IF EXISTS idx_messages_user_date;
DROP INDEX IF EXISTS idx_sessions_user_date;
DROP INDEX IF EXISTS idx_dosha_tracking_updated_at;

-- Remove constraints
ALTER TABLE dosha_tracking DROP CONSTRAINT IF EXISTS fk_dosha_tracking_dosha_type;
ALTER TABLE dosha_tracking DROP CONSTRAINT IF EXISTS chk_intensity;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS chk_emotional_attachment;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS fk_user_preferences_dosha_type;

-- Remove columns
ALTER TABLE dosha_tracking DROP COLUMN IF EXISTS dosha_type_id;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS emotional_attachment;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS dosha_type_id;

-- Drop table
DROP TABLE IF EXISTS dosha_types;
*/
