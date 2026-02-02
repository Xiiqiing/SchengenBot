-- Migration: 001_initial_schema
-- Description: Initial database schema for Schengen Visa Appointment Bot
-- Created: 2025-11-13
-- Author: İhsan Baki Doğan

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  telegram_chat_id VARCHAR(100),
  telegram_username VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'Kullanıcı profil bilgileri';
COMMENT ON COLUMN user_profiles.email IS 'Kullanıcı email adresi';
COMMENT ON COLUMN user_profiles.telegram_chat_id IS 'Telegram chat ID (bildirimler için)';

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  countries TEXT[] DEFAULT '{}',
  cities TEXT[] DEFAULT '{}',
  check_frequency INTEGER DEFAULT 5,
  telegram_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT false,
  web_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  auto_check_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

COMMENT ON TABLE user_preferences IS 'Kullanıcı tercihleri ve ayarları';
COMMENT ON COLUMN user_preferences.countries IS 'Takip edilen ülkeler (array)';
COMMENT ON COLUMN user_preferences.cities IS 'Takip edilen şehirler (array)';
COMMENT ON COLUMN user_preferences.check_frequency IS 'Kontrol sıklığı (dakika)';

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  country VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  center_name VARCHAR(255),
  visa_category VARCHAR(100),
  visa_subcategory VARCHAR(100),
  book_now_link TEXT,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE appointments IS 'Bulunan randevular';
COMMENT ON COLUMN appointments.notified IS 'Bildirim gönderildi mi?';

-- ============================================
-- NOTIFICATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('telegram', 'email', 'web', 'sound')),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

COMMENT ON TABLE notification_history IS 'Bildirim geçmişi';
COMMENT ON COLUMN notification_history.type IS 'Bildirim tipi: telegram, email, web, sound';

-- ============================================
-- CHECK HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS check_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  countries TEXT[],
  cities TEXT[],
  found_count INTEGER DEFAULT 0,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE check_history IS 'Kontrol geçmişi (monitoring için)';
COMMENT ON COLUMN check_history.found_count IS 'Bulunan randevu sayısı';

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram ON user_profiles(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_country_city ON appointments(country, city);
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_check_history_user_id ON check_history(user_id);
CREATE INDEX IF NOT EXISTS idx_check_history_checked_at ON check_history(checked_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Herkes kendi verilerine erişebilir
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (true);

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (true);

CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own notifications" ON notification_history
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own notifications" ON notification_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own check history" ON check_history
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own check history" ON check_history
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Eski kayıtları temizle (30 günden eski)
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void AS $$
BEGIN
  DELETE FROM appointments WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM notification_history WHERE sent_at < NOW() - INTERVAL '30 days';
  DELETE FROM check_history WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- View: Kullanıcı istatistikleri
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  up.id,
  up.email,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT CASE WHEN a.notified = true THEN a.id END) as notified_appointments,
  COUNT(DISTINCT nh.id) as total_notifications,
  MAX(ch.checked_at) as last_check_time
FROM user_profiles up
LEFT JOIN appointments a ON up.id = a.user_id
LEFT JOIN notification_history nh ON up.id = nh.user_id
LEFT JOIN check_history ch ON up.id = ch.user_id
GROUP BY up.id, up.email;

COMMENT ON VIEW user_stats IS 'Kullanıcı istatistikleri özet görünümü';

-- ============================================
-- INITIAL DATA (Optional - for testing)
-- ============================================

-- Test kullanıcısı (production'da kaldırın)
-- INSERT INTO user_profiles (email, telegram_chat_id) 
-- VALUES ('test@example.com', '123456789');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE 'Migration 001_initial_schema completed successfully!';
  RAISE NOTICE 'Tables created: user_profiles, user_preferences, appointments, notification_history, check_history';
  RAISE NOTICE 'Indexes created: 10 indexes';
  RAISE NOTICE 'RLS enabled on all tables';
  RAISE NOTICE 'Functions created: update_updated_at_column, cleanup_old_records';
  RAISE NOTICE 'Views created: user_stats';
END $$;
