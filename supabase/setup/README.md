# 📁 Database Setup

This folder contains the Supabase database setup schema.

## 📋 Schema Details

### schema.sql
**Date:** 2025-11-13 (Updated: 2026-02-23)  
**Description:** Consolidated database schema

**Created:**
- ✅ 5 Tables (user_profiles, user_preferences, appointments, notification_history, check_history)
- ✅ 10 Indexes
- ✅ RLS Policies
- ✅ 2 Functions (update_updated_at_column, cleanup_old_records)
- ✅ 1 View (user_stats)

## 🚀 How to Use?

### Method 1: SQL Editor (Easy)

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy and paste the schema file content
4. Click Run button

### Method 2: Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run setup
supabase db push
```

## 🔄 Rollback

If you want to rollback the setup:

```sql
-- Drop tables
DROP VIEW IF EXISTS user_stats;
DROP TABLE IF EXISTS check_history CASCADE;
DROP TABLE IF EXISTS notification_history CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_old_records();
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## 📊 Table Structure

### user_profiles
User profile information
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- telegram_username (VARCHAR)
- created_at, updated_at (TIMESTAMP)

### user_preferences
User preferences
- id (UUID, PK)
- user_id (UUID, FK)
- countries (TEXT[])
- cities (TEXT[])
- check_frequency (INTEGER)
- telegram_enabled, email_enabled, web_enabled, sound_enabled, auto_check_enabled (BOOLEAN)
- telegram_chat_id (VARCHAR)
- created_at, updated_at (TIMESTAMP)

### appointments
Found appointments
- id (UUID, PK)
- user_id (UUID, FK)
- country, city (VARCHAR)
- appointment_date (DATE)
- center_name, visa_category, visa_subcategory (VARCHAR)
- book_now_link (TEXT)
- notified (BOOLEAN)
- created_at (TIMESTAMP)

### notification_history
Notification history
- id (UUID, PK)
- user_id (UUID, FK)
- appointment_id (UUID, FK)
- type (VARCHAR) - telegram, email, web, sound
- message (TEXT)
- sent_at (TIMESTAMP)
- success (BOOLEAN)
- error_message (TEXT)

### check_history
Check history
- id (UUID, PK)
- user_id (UUID, FK)
- countries, cities (TEXT[])
- found_count (INTEGER)
- checked_at (TIMESTAMP)

## 🔒 Security

- ✅ Row Level Security (RLS) active
- ✅ Each user can only access their own data
- ✅ Foreign key constraints
- ✅ Check constraints

## 📝 Notes

- Everything is consolidated into a single configuration file (`schema.sql`).
- This script is safe to apply as a differential update if you only run the newly added components (e.g., adding `telegram_chat_id` manually).
- Do not create test users in production.
- Regularly run `cleanup_old_records()` function (currently automated via Cron).
- Original Author: info@ihsanbakidogan.com
- Modified by: Xiqing
