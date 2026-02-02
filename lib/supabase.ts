import { createClient } from '@supabase/supabase-js';
import type { 
  UserProfile, 
  UserPreferences, 
  Appointment, 
  NotificationHistory,
  CheckHistory 
} from './supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface KontrolKayit {
  id?: string;
  ulke: string;
  durum: string;
  mesaj: string;
  url: string;
  kontrol_tarihi: string;
  created_at?: string;
}

export interface Bildirim {
  id?: string;
  ulke: string;
  durum: string;
  mesaj: string;
  okundu: boolean;
  created_at?: string;
}

// Supabase functions
export async function kayitEkle(kayit: KontrolKayit) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('kontrol_kayitlari')
    .insert([kayit])
    .select();
  
  if (error) throw error;
  return data;
}

export async function kayitlariGetir(limit = 50) {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('kontrol_kayitlari')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function bildirimEkle(bildirim: Bildirim) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('bildirimler')
    .insert([bildirim])
    .select();
  
  if (error) throw error;
  return data;
}

export async function bildirimleriGetir(okunmamis = false) {
  if (!supabase) return [];
  
  let query = supabase
    .from('bildirimler')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (okunmamis) {
    query = query.eq('okundu', false);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function bildirimOkundu(id: string) {
  if (!supabase) return;
  
  const { error } = await supabase
    .from('bildirimler')
    .update({ okundu: true })
    .eq('id', id);
  
  if (error) throw error;
}
