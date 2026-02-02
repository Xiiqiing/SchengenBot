# 🔧 Database Migration Fix

## Problem
```
PGRST204: Could not find the 'telegram_chat_id' column of 'user_preferences' in the schema cache
```

## Solution

The `telegram_chat_id` column is missing from the `user_preferences` table. Run the migration to add it.

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content of `002_add_telegram_to_preferences.sql`
4. Click **Run**

### Option 2: Supabase CLI

```bash
# Make sure you're in the project root
cd schengen-visa-appointment-bot

# Run the migration
supabase db push

# Or run specific migration
supabase migration up
```

### Option 3: Manual SQL

Run this SQL directly in your Supabase SQL Editor:

```sql
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
```

## Verification

After running the migration, verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND column_name = 'telegram_chat_id';

-- Should return:
-- column_name       | data_type
-- telegram_chat_id  | character varying
```

## Why This Happened

The TypeScript types (`UserPreferences`) included `telegram_chat_id` but the database schema didn't have this column yet. This migration adds it and migrates any existing data from `user_profiles` table.

## After Migration

Restart your Next.js development server:

```bash
npm run dev
```

The error should be gone! ✅
