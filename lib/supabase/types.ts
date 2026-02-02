/**
 * Supabase Database Types
 */

export interface UserProfile {
  id: string;
  email: string;
  telegram_chat_id?: string;
  telegram_username?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  countries: string[];
  cities: string[];
  check_frequency: number;
  telegram_enabled: boolean;
  telegram_chat_id?: string;
  email_enabled: boolean;
  web_enabled: boolean;
  sound_enabled: boolean;
  auto_check_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  country: string;
  city: string;
  appointment_date: string;
  center_name?: string;
  visa_category?: string;
  visa_subcategory?: string;
  book_now_link?: string;
  notified: boolean;
  created_at: string;
}

export interface NotificationHistory {
  id: string;
  user_id: string;
  appointment_id?: string;
  type: 'telegram' | 'email' | 'web' | 'sound';
  message?: string;
  sent_at: string;
  success: boolean;
  error_message?: string;
}

export interface CheckHistory {
  id: string;
  user_id: string;
  countries: string[];
  cities: string[];
  found_count: number;
  checked_at: string;
}

export interface UserStats {
  id: string;
  email: string;
  total_appointments: number;
  notified_appointments: number;
  total_notifications: number;
  last_check_time?: string;
}
