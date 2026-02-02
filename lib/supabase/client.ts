/**
 * Supabase Client ve CRUD İşlemleri
 */

import { supabase } from '../supabase';
import type {
  UserProfile,
  UserPreferences,
  Appointment,
  NotificationHistory,
  CheckHistory,
  UserStats
} from './types';

// ============================================
// USER PROFILE İŞLEMLERİ
// ============================================

export async function createUserProfile(data: Partial<UserProfile>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return profile as UserProfile;
}

export async function getUserProfile(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function getUserProfileByEmail(email: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return profile as UserProfile;
}

// ============================================
// USER PREFERENCES İŞLEMLERİ
// ============================================

export async function createUserPreferences(data: Partial<UserPreferences>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: prefs, error } = await supabase
    .from('user_preferences')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return prefs as UserPreferences;
}

export async function getUserPreferences(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as UserPreferences;
}

export async function updateUserPreferences(userId: string, data: Partial<UserPreferences>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: prefs, error } = await supabase
    .from('user_preferences')
    .update(data)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return prefs as UserPreferences;
}

export async function upsertUserPreferences(userId: string, data: Partial<UserPreferences>) {
  if (!supabase) throw new Error('Supabase not initialized');

  // Önce mevcut kaydı kontrol et
  const existing = await getUserPreferences(userId);

  if (existing) {
    // Varsa güncelle
    const { data: prefs, error } = await supabase
      .from('user_preferences')
      .update({ ...data, user_id: userId })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return prefs as UserPreferences;
  } else {
    // Yoksa oluştur
    const { data: prefs, error } = await supabase
      .from('user_preferences')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return prefs as UserPreferences;
  }
}

// ============================================
// APPOINTMENT İŞLEMLERİ
// ============================================

export async function createAppointment(data: Partial<Appointment>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return appointment as Appointment;
}

export async function getUserAppointments(userId: string, limit = 50) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: true })
    .limit(limit);

  if (error) return [];
  return data as Appointment[];
}

export async function getRecentAppointments(userId: string, days = 30) {
  if (!supabase) return [];

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Appointment[];
}

export async function markAppointmentNotified(appointmentId: string) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('appointments')
    .update({ notified: true })
    .eq('id', appointmentId);

  if (error) throw error;
}

// ============================================
// NOTIFICATION HISTORY İŞLEMLERİ
// ============================================

export async function createNotification(data: Partial<NotificationHistory>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: notification, error } = await supabase
    .from('notification_history')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return notification as NotificationHistory;
}

export async function getUserNotifications(userId: string, limit = 100) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('notification_history')
    .select('*')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as NotificationHistory[];
}

// ============================================
// CHECK HISTORY İŞLEMLERİ
// ============================================

export async function createCheckHistory(data: Partial<CheckHistory>) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: check, error } = await supabase
    .from('check_history')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return check as CheckHistory;
}

export async function getUserCheckHistory(userId: string, limit = 50) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('check_history')
    .select('*')
    .eq('user_id', userId)
    .order('checked_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as CheckHistory[];
}

// ============================================
// STATS İŞLEMLERİ
// ============================================

export async function getUserStats(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as UserStats;
}

// ============================================
// BULK İŞLEMLER
// ============================================

export async function bulkCreateAppointments(appointments: Partial<Appointment>[]) {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointments)
    .select();

  if (error) throw error;
  return data as Appointment[];
}

export async function deleteOldAppointments(userId: string, days = 30) {
  if (!supabase) throw new Error('Supabase not initialized');

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('user_id', userId)
    .lt('created_at', fromDate.toISOString());

  if (error) throw error;
}
