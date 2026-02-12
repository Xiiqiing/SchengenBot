# 📁 Database Migrations

This folder contains Supabase database migration files.

## 📋 Migration List

### 001_initial_schema.sql
**Date:** 2025-11-13  
**Description:** Initial database schema

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
3. Copy and paste the migration file content
4. Click Run button

### Method 2: Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 🔄 Rollback

If you want to rollback the migration:

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
- telegram_chat_id (VARCHAR)
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

- Migration files must be run in order (001, 002, 003...)
- Each migration should be run once
- Do not create test users in production
- Regularly run `cleanup_old_records()` function

## 🆘 Help

If you encounter issues:
1. Read [Supabase Setup Guide](../docs/SUPABASE-SETUP.md)
2. Open [GitHub Issues](https://github.com/ibidi/schengen-visa-appointment-bot/issues)
3. Email: info@ihsanbakidogan.com
