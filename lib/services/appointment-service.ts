/**
 * Randevu Servisi
 * API kontrolü, filtreleme, bildirim gönderme
 */

import { schengenAPI } from '../api/schengen-api';
import { notificationService } from './notification-service';
import {
  createAppointment,
  bulkCreateAppointments,
  getUserPreferences,
  createCheckHistory,
  markAppointmentNotified,
} from '../supabase/client';
import type { AppointmentData } from '../api/schengen-api';
import type { UserPreferences } from '../supabase/types';

export interface CheckResult {
  country: string;
  city: string;
  appointments: AppointmentData[];
  checked_at: Date;
}

export class AppointmentService {
  /**
   * Tek bir ülke ve şehir için kontrol
   */
  async checkSingle(
    country: string,
    city: string,
    userId?: string
  ): Promise<CheckResult> {
    const appointments = await schengenAPI.checkAvailability(country, city);

    const result: CheckResult = {
      country,
      city,
      appointments,
      checked_at: new Date(),
    };

    // Kullanıcı varsa veritabanına kaydet
    if (userId && appointments.length > 0) {
      await this.saveAppointments(userId, appointments);
    }

    return result;
  }

  /**
   * Çoklu ülke ve şehir için kontrol
   */
  async checkMultiple(
    countries: string[],
    cities: string[],
    userId?: string
  ): Promise<CheckResult[]> {
    const resultsMap = await schengenAPI.checkMultiple(countries, cities);
    const results: CheckResult[] = [];

    for (const [key, appointments] of resultsMap.entries()) {
      const [country, city] = key.split('-');
      
      results.push({
        country,
        city,
        appointments,
        checked_at: new Date(),
      });

      // Kullanıcı varsa veritabanına kaydet
      if (userId && appointments.length > 0) {
        await this.saveAppointments(userId, appointments);
      }
    }

    // Kontrol geçmişini kaydet
    if (userId) {
      await createCheckHistory({
        user_id: userId,
        countries,
        cities,
        found_count: results.reduce((sum, r) => sum + r.appointments.length, 0),
      });
    }

    return results;
  }

  /**
   * Kullanıcı tercihlerine göre otomatik kontrol
   */
  async checkForUser(userId: string): Promise<CheckResult[]> {
    const preferences = await getUserPreferences(userId);

    if (!preferences || !preferences.countries.length || !preferences.cities.length) {
      return [];
    }

    const results = await this.checkMultiple(
      preferences.countries,
      preferences.cities,
      userId
    );

    // Bildirim gönder
    if (preferences.telegram_enabled || preferences.web_enabled) {
      await this.sendNotificationsForResults(userId, results, preferences);
    }

    return results;
  }

  /**
   * Randevuları veritabanına kaydet
   */
  private async saveAppointments(
    userId: string,
    appointments: AppointmentData[]
  ): Promise<void> {
    const data = appointments.map(apt => ({
      user_id: userId,
      country: apt.mission_country,
      city: apt.center_name,
      appointment_date: apt.appointment_date,
      center_name: apt.center_name,
      visa_category: apt.visa_category,
      visa_subcategory: apt.visa_subcategory || undefined,
      book_now_link: apt.book_now_link,
      notified: false,
    }));

    try {
      await bulkCreateAppointments(data);
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  }

  /**
   * Sonuçlar için bildirim gönder
   */
  private async sendNotificationsForResults(
    userId: string,
    results: CheckResult[],
    preferences: UserPreferences
  ): Promise<void> {
    for (const result of results) {
      if (result.appointments.length === 0) continue;

      try {
        await notificationService.sendAppointmentNotifications(
          result.appointments,
          {
            userId,
            telegram: {
              enabled: preferences.telegram_enabled,
              chatId: preferences.telegram_chat_id,
              botToken: process.env.TELEGRAM_BOT_TOKEN,
            },
            web: {
              enabled: preferences.web_enabled,
            },
          }
        );

        // Randevuları bildirildi olarak işaretle
        for (const apt of result.appointments) {
          // Appointment ID'yi bul ve işaretle
          // TODO: Implement
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    }
  }

  /**
   * İstatistikler
   */
  async getStats(userId: string) {
    // TODO: Implement detailed stats
    return {
      total_checks: 0,
      total_appointments_found: 0,
      last_check: null,
    };
  }
}

// Singleton instance
export const appointmentService = new AppointmentService();
