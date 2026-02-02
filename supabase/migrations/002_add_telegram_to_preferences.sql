-- Migration: Add telegram_chat_id to user_preferences table
-- This allows storing telegram chat ID directly in preferences for easier access

-- Add telegram_chat_id column to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(100);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_telegram 
ON user_preferences(telegram_chat_id);

-- Migrate existing telegram_chat_id from user_profiles to user_preferences
UPDATE user_preferences up
SET telegram_chat_id = (
  SELECT telegram_chat_id 
  FROM user_profiles 
  WHERE id = up.user_id
)
WHERE telegram_chat_id IS NULL;

-- Add comment
COMMENT ON COLUMN user_preferences.telegram_chat_id IS 'Telegram chat ID for notifications';
