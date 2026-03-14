/**
 * Appointment Service
 * API check, filtering, sending notifications
 */

import { ukScraper, type UKAppointmentData } from '../api/uk-scraper';
import { notificationService, type AppointmentData } from './notification-service';
import { supabase } from '../supabase';
import {
  bulkCreateAppointments,
  getUserPreferences,
  getUserProfile,
  createCheckHistory,
  markAppointmentNotified,
  filterAppointmentsByNotificationCooldown,
} from '../supabase/client';
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
   * Check for a single country and city
   */
  async checkSingle(
    country: string,
    city: string,
    userId?: string
  ): Promise<CheckResult> {
    // Note: Previously used schengenAPI, now only supporting UK Scraper cities.
    // Logic for other cities can be re-added when a new API source is available.
    return {
      country,
      city,
      appointments: [],
      checked_at: new Date(),
    };
  }


  /**
   * Check multiple countries and cities
   */
  async checkMultiple(
    countries: string[],
    cities: string[],
    userId?: string
  ): Promise<CheckResult[]> {
    // Filter to UK-supported cities only
    const ukCityCodes = UK_CITIES.map(c => c.code);
    const ukCitiesToCheck = cities.filter(c => ukCityCodes.includes(c));

    const results: CheckResult[] = [];
    let totalFound = 0;

    // 2. Check UK cities (Scraper) - Primary data source
    if (ukCitiesToCheck.length > 0) {
      try {
        // Create check for each city-country combination
        const ukChecks = [];
        for (const city of ukCitiesToCheck) {
          for (const country of countries) {
            ukChecks.push({ city, country });
          }
        }

        const ukResults = await ukScraper.checkMultiple(ukChecks);

        for (const res of ukResults) {
          if (res.isAvailable && res.slots.length > 0) {
            const appointments: AppointmentData[] = res.slots.map((slot, index) => {
              // Parse date (e.g., "03 Feb (Tue)")
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

              // If month is past, it means next year
              if (month < now.getMonth()) {
                year++;
              }

              const date = new Date(year, month, day);
              const dateStr = date.toISOString().split('T')[0];

              return {
                id: Date.now() + index, // Temporary ID
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

            // Save to DB
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

    // Save check history
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
   * Automatic check based on user preferences
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

    // Send notifications
    if (preferences.telegram_enabled || preferences.web_enabled || preferences.email_enabled) {
      await this.sendNotificationsForResults(userId, results, preferences);
    }

    return results;
  }

  /**
   * Save appointments to database
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
      last_seen_at: new Date().toISOString(),
    }));

    try {
      await bulkCreateAppointments(data);
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  }

  /**
   * Send notifications for results
   */
  private async sendNotificationsForResults(
    userId: string,
    results: CheckResult[],
    preferences: UserPreferences
  ): Promise<void> {
    const userProfile = await getUserProfile(userId);
    const emailAddress = preferences.email_address || userProfile?.email;
    const sameSlotCooldownHours = preferences.same_slot_cooldown_hours ?? 24;

    console.log(`[Notification] Sending to user ${userId}, Email: ${emailAddress}, Channels: Telegram=${preferences.telegram_enabled}, Email=${preferences.email_enabled}`);

    for (const result of results) {
      if (result.appointments.length === 0) {
        continue;
      }

      if (!supabase) {
        console.warn("Supabase client is null, skipping notifications.");
        return;
      }

      const appointmentsToNotify = await filterAppointmentsByNotificationCooldown(
        userId,
        result.appointments.map((apt) => ({
          country: apt.mission_country,
          city: apt.center_name,
          appointment_date: apt.appointment_date,
        })),
        sameSlotCooldownHours
      );

      const allowedAppointmentKeys = new Set(
        appointmentsToNotify.map((apt) => `${apt.country}::${apt.city}::${apt.appointment_date}`)
      );

      const filteredAppointments = result.appointments.filter((apt) =>
        allowedAppointmentKeys.has(`${apt.mission_country}::${apt.center_name}::${apt.appointment_date}`)
      );

      if (filteredAppointments.length === 0) {
        console.log(
          `[Notification] Same-slot cooldown active for User ${userId}, ${result.city} -> ${result.country}. Cooldown: ${sameSlotCooldownHours}h.`
        );
        continue;
      }

      try {
        const dispatchResult = await notificationService.sendAppointmentNotifications(
          filteredAppointments,
          {
            userId,
            telegram: {
              enabled: preferences.telegram_enabled,
              chatId: preferences.telegram_chat_id,
              botToken: process.env.TELEGRAM_BOT_TOKEN,
            },
            email: {
              enabled: preferences.email_enabled,
              address: emailAddress,
            },
            web: {
              enabled: preferences.web_enabled,
            },
          }
        );

        if (!dispatchResult.delivered) {
          console.warn(`[Notification] No notification channel succeeded for user ${userId}; appointments remain pending.`);
          continue;
        }

        // Mark appointments as notified in DB
        if (supabase) {
          for (const apt of filteredAppointments) {
            try {
              // Find the stored slot row and refresh its notification timestamp
              const { data: matchedApts } = await supabase
                .from('appointments')
                .select('id')
                .eq('user_id', userId)
                .eq('country', apt.mission_country)
                .eq('city', apt.center_name)
                .eq('appointment_date', apt.appointment_date)
                .limit(1);

              if (matchedApts && matchedApts.length > 0) {
                await markAppointmentNotified(matchedApts[0].id);
              }
            } catch (err) {
              console.error('Error marking appointment notified:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    }
  }

  /**
   * Statistics
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
