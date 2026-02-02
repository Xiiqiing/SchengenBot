/**
 * Randevu Servisi
 * API kontrolü, filtreleme, bildirim gönderme
 */

import { schengenAPI } from '../api/schengen-api';
import { ukScraper, type UKAppointmentData } from '../api/uk-scraper';
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
import { UK_CITIES } from '../constants/countries';

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
    // 1. Şehirleri ayır (UK vs Diğerleri)
    const ukCityCodes = UK_CITIES.map(c => c.code);
    const ukCitiesToCheck = cities.filter(c => ukCityCodes.includes(c));
    const otherCitiesToCheck = cities.filter(c => !ukCityCodes.includes(c));

    const results: CheckResult[] = [];
    let totalFound = 0;

    // 2. Diğer şehirleri kontrol et (Mevcut API)
    if (otherCitiesToCheck.length > 0) {
      try {
        const resultsMap = await schengenAPI.checkMultiple(countries, otherCitiesToCheck);

        for (const [key, appointments] of resultsMap.entries()) {
          const [country, city] = key.split('-');

          if (appointments.length > 0) {
            results.push({
              country,
              city,
              appointments,
              checked_at: new Date(),
            });

            // Veritabanına kaydet
            if (userId) {
              await this.saveAppointments(userId, appointments);
            }
          }
        }
      } catch (error) {
        console.error('SchengenAPI check error:', error);
      }
    }

    // 3. UK şehirlerini kontrol et (Scraper)
    if (ukCitiesToCheck.length > 0) {
      try {
        // Her şehir-ülke kombinasyonu için kontrol oluştur
        const ukChecks = [];
        for (const city of ukCitiesToCheck) {
          for (const country of countries) {
            ukChecks.push({ city, country });
          }
        }

        const ukResults = await ukScraper.checkMultiple(ukChecks);

        for (const res of ukResults) {
          if (res.isAvailable && res.slots.length > 0) {
            // UKAppointmentData -> AppointmentData dönüşümü
            const appointments: AppointmentData[] = res.slots.map((slot, index) => {
              // Tarihi parse et (örn: "03 Feb (Tue)")
              const dateParts = slot.date.split(' '); // ["03", "Feb", "(Tue)"]
              const day = parseInt(dateParts[0]);
              const monthStr = dateParts[1];
              const monthMap: Record<string, number> = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
              };

              const now = new Date();
              const month = monthMap[monthStr] || 0;
              let year = now.getFullYear();

              // Eğer ay geçmişse, sonraki yıl demektir
              if (month < now.getMonth()) {
                year++;
              }

              const date = new Date(year, month, day);
              const dateStr = date.toISOString().split('T')[0];

              return {
                id: Date.now() + index, // Geçici ID
                source_country: 'UK',
                mission_country: res.country,
                center_name: res.city,
                appointment_date: dateStr,
                visa_category: 'Tourism',
                visa_subcategory: null,
                book_now_link: res.bookingLink || '',
              };
            });

            results.push({
              country: res.country,
              city: res.city,
              appointments,
              checked_at: new Date(),
            });

            // Veritabanına kaydet
            if (userId) {
              await this.saveAppointments(userId, appointments);
            }
          }
        }
      } catch (error) {
        console.error('UK Scraper check error:', error);
      }
    }

    totalFound = results.reduce((sum, r) => sum + r.appointments.length, 0);

    // Kontrol geçmişini kaydet
    if (userId) {
      await createCheckHistory({
        user_id: userId,
        countries,
        cities,
        found_count: totalFound,
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

  /**
   * UK-based appointment check using schengenappointments.com scraper
   * For checking appointments from UK cities (Manchester, London, etc.)
   */
  async checkUK(
    city: string,
    country: string,
    visaType: string = 'tourism'
  ): Promise<UKAppointmentData> {
    return await ukScraper.checkAvailability(city, country, visaType);
  }

  /**
   * Check multiple UK city/country combinations
   */
  async checkMultipleUK(
    checks: Array<{ city: string; country: string; visaType?: string }>
  ): Promise<UKAppointmentData[]> {
    return await ukScraper.checkMultiple(checks);
  }
}

// Singleton instance
export const appointmentService = new AppointmentService();
