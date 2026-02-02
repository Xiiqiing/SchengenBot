# 📁 Database Migrations

Bu klasör Supabase veritabanı migration dosyalarını içerir.

## 📋 Migration Listesi

### 001_initial_schema.sql
**Tarih:** 2025-11-13  
**Açıklama:** İlk veritabanı şeması

**Oluşturulanlar:**
- ✅ 5 Tablo (user_profiles, user_preferences, appointments, notification_history, check_history)
- ✅ 10 Index
- ✅ RLS Policies
- ✅ 2 Function (update_updated_at_column, cleanup_old_records)
- ✅ 1 View (user_stats)

## 🚀 Nasıl Kullanılır?

### Yöntem 1: SQL Editor (Kolay)

1. Supabase Dashboard'a git
2. SQL Editor'ü aç
3. Migration dosyasını kopyala-yapıştır
4. Run butonuna tıkla

### Yöntem 2: Supabase CLI

```bash
# CLI kur
npm install -g supabase

# Login
supabase login

# Projeye bağlan
supabase link --project-ref your-project-ref

# Migration'ları çalıştır
supabase db push
```

## 🔄 Rollback

Eğer migration'ı geri almak isterseniz:

```sql
-- Tabloları sil
DROP VIEW IF EXISTS user_stats;
DROP TABLE IF EXISTS check_history CASCADE;
DROP TABLE IF EXISTS notification_history CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Fonksiyonları sil
DROP FUNCTION IF EXISTS cleanup_old_records();
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## 📊 Tablo Yapısı

### user_profiles
Kullanıcı profil bilgileri
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- telegram_chat_id (VARCHAR)
- telegram_username (VARCHAR)
- created_at, updated_at (TIMESTAMP)

### user_preferences
Kullanıcı tercihleri
- id (UUID, PK)
- user_id (UUID, FK)
- countries (TEXT[])
- cities (TEXT[])
- check_frequency (INTEGER)
- telegram_enabled, email_enabled, web_enabled, sound_enabled, auto_check_enabled (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

### appointments
Bulunan randevular
- id (UUID, PK)
- user_id (UUID, FK)
- country, city (VARCHAR)
- appointment_date (DATE)
- center_name, visa_category, visa_subcategory (VARCHAR)
- book_now_link (TEXT)
- notified (BOOLEAN)
- created_at (TIMESTAMP)

### notification_history
Bildirim geçmişi
- id (UUID, PK)
- user_id (UUID, FK)
- appointment_id (UUID, FK)
- type (VARCHAR) - telegram, email, web, sound
- message (TEXT)
- sent_at (TIMESTAMP)
- success (BOOLEAN)
- error_message (TEXT)

### check_history
Kontrol geçmişi
- id (UUID, PK)
- user_id (UUID, FK)
- countries, cities (TEXT[])
- found_count (INTEGER)
- checked_at (TIMESTAMP)

## 🔒 Güvenlik

- ✅ Row Level Security (RLS) aktif
- ✅ Her kullanıcı sadece kendi verilerine erişebilir
- ✅ Foreign key constraints
- ✅ Check constraints

## 📝 Notlar

- Migration dosyaları sıralı çalıştırılmalıdır (001, 002, 003...)
- Her migration bir kez çalıştırılmalıdır
- Production'da test kullanıcısı oluşturmayın
- Düzenli olarak `cleanup_old_records()` fonksiyonunu çalıştırın

## 🆘 Yardım

Sorun yaşıyorsanız:
1. [Supabase Setup Guide](../docs/SUPABASE-SETUP.md) okuyun
2. [GitHub Issues](https://github.com/ibidi/schengen-visa-appointment-bot/issues) açın
3. Email: info@ihsanbakidogan.com
