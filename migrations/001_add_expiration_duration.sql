-- Migration: Add expiration_duration column
-- Description: Adds expiration_duration column to support expiration starting from first login
-- Date: 2026-03-02

-- Add the expiration_duration column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS expiration_duration VARCHAR(50);

-- For existing users with expired_time set, we need to set a default duration
-- This is optional - you can customize based on your needs
-- Example: Set '1week' as default for users with existing expiration
-- UPDATE users 
-- SET expiration_duration = '1week' 
-- WHERE expired_time IS NOT NULL AND expiration_duration IS NULL;

-- Comment on the new column
COMMENT ON COLUMN users.expiration_duration IS 'Duration string (e.g., 1hour, 1day, 1week, infinite) - expiration starts from first login';
