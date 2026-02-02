-- Schengen Visa Appointment Bot - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kullanıcı profilleri
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  telegram_chat_id VARCHAR(100),
  telegram_username VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı tercihleri
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

-- Randevu kayıtları
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

-- Bildirim geçmişi
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'telegram', 'email', 'web', 'sound'
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Kontrol geçmişi (monitoring için)
CREATE TABLE IF NOT EXISTS check_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  countries TEXT[],
  cities TEXT[],
  found_count INTEGER DEFAULT 0,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
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

-- Row Level Security (RLS)
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

-- Function: Eski kayıtları temizle (30 günden eski)
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void AS $$
BEGIN
  -- Eski randevuları sil
  DELETE FROM appointments 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Eski bildirimleri sil
  DELETE FROM notification_history 
  WHERE sent_at < NOW() - INTERVAL '30 days';
  
  -- Eski kontrol geçmişini sil
  DELETE FROM check_history 
  WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Örnek veri (test için - production'da kaldırın)
-- INSERT INTO user_profiles (email, telegram_chat_id) 
-- VALUES ('test@example.com', '123456789');
