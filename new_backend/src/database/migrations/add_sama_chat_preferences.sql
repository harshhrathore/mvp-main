-- Migration Script: Add SAMA Chat Integration Preferences
-- Date: 2026-02-14
-- Description: Add emotional_attachment column to user_preferences table for SAMA chat integration
-- Requirements: 4.1

-- ============================================
-- 1. ADD emotional_attachment COLUMN
-- ============================================

-- Add emotional_attachment column (if not exists)
-- This field controls how warm and personal SAMA's language is (1-10 scale)
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS emotional_attachment INTEGER DEFAULT 7;

-- Add CHECK constraint to ensure valid range
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_emotional_attachment'
    ) THEN
        ALTER TABLE user_preferences
        ADD CONSTRAINT chk_emotional_attachment 
        CHECK (emotional_attachment >= 1 AND emotional_attachment <= 10);
    END IF;
END $$;

-- ============================================
-- 2. VERIFY voice_gender COLUMN EXISTS
-- ============================================

-- voice_gender should already exist in the schema (VARCHAR(10) DEFAULT 'female')
-- This verification ensures it's present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'voice_gender'
    ) THEN
        ALTER TABLE user_preferences 
        ADD COLUMN voice_gender VARCHAR(10) DEFAULT 'female';
    END IF;
END $$;

-- ============================================
-- 3. VERIFY MIGRATION
-- ============================================

-- Check emotional_attachment column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name IN ('emotional_attachment', 'voice_gender')
ORDER BY column_name;

-- Check constraint exists
SELECT conname, contype 
FROM pg_constraint 
WHERE conname = 'chk_emotional_attachment';

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
/*
-- Remove constraint
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS chk_emotional_attachment;

-- Remove column
ALTER TABLE user_preferences DROP COLUMN IF EXISTS emotional_attachment;
*/
