    -- Quick Fix: Add telegram_chat_id to user_preferences
-- Run this in Supabase SQL Editor

-- 1. Add the column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(100);

-- 2. Create index
CREATE INDEX IF NOT EXISTS idx_user_preferences_telegram 
ON user_preferences(telegram_chat_id);

-- 3. Migrate existing data
UPDATE user_preferences up
SET telegram_chat_id = (
  SELECT telegram_chat_id 
  FROM user_profiles 
  WHERE id = up.user_id
)
WHERE telegram_chat_id IS NULL;

-- 4. Verify
SELECT 
  'telegram_chat_id column added successfully!' as status,
  COUNT(*) as total_preferences,
  COUNT(telegram_chat_id) as with_telegram_id
FROM user_preferences;
