/**
 * Migration: Add Email Verification to user_authentication table
 * 
 * Run this SQL in your Supabase SQL editor or via migration tool
 */

-- Add email verification columns to user_authentication table
ALTER TABLE user_authentication 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;

-- Add index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_email_verification_token 
ON user_authentication(email_verification_token) 
WHERE email_verification_token IS NOT NULL;

-- Optional: Mark existing users as verified (if you want to grandfather them in)
-- UPDATE user_authentication SET email_verified = true WHERE email_verified IS NULL;
