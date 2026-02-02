/**
 * Bildirim Servisi
 * Telegram, Email, Web bildirimleri
 */

import { createNotification } from '../supabase/client';
import { formatDateTR, getCountryByCode } from '../constants/countries';
import type { AppointmentData } from '../api/schengen-api';

interface NotificationOptions {
  userId: string;
  appointmentId?: string;
  telegram?: {
    enabled: boolean;
    chatId?: string;
    botToken?: string;
  };
  email?: {
    enabled: boolean;
    address?: string;
  };
  web?: {
    enabled: boolean;
  };
}

export class NotificationService {
  /**
   * Telegram bildirimi gönder
   */
  async sendTelegramNotification(
    chatId: string,
    botToken: string,
    message: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: false,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Telegram API error');
      }

      return true;
    } catch (error) {
      console.error('Telegram notification error:', error);
      return false;
    }
  }

  /**
   * Randevu mesajı formatla
   */
  formatAppointmentMessage(appointments: AppointmentData[]): string {
    if (appointments.length === 0) return '';

    const first = appointments[0];
    const country = getCountryByCode(first.mission_country);
    
    let message = `🎉 <b>${country?.nameTr || first.mission_country} için randevu bulundu!</b>\n\n`;

    appointments.forEach((apt, index) => {
      if (index > 0) message += '\n━━━━━━━━━━━━━━━━━━━━\n\n';
      
      message += `📅 <b>Tarih:</b> ${formatDateTR(apt.appointment_date)}\n`;
      message += `🏢 <b>Merkez:</b> ${apt.center_name}\n`;
      message += `📋 <b>Kategori:</b> ${apt.visa_category}\n`;
      
      if (apt.visa_subcategory) {
        message += `📝 <b>Alt Kategori:</b> ${apt.visa_subcategory}\n`;
      }
      
      message += `\n🔗 <a href="${apt.book_now_link}">Randevu Al</a>`;
    });

    message += '\n\n⚠️ <i>Hemen rezervasyon yapmanızı öneririz!</i>';

    return message;
  }

  /**
   * Toplu bildirim gönder
   */
  async sendAppointmentNotifications(
    appointments: AppointmentData[],
    options: NotificationOptions
  ): Promise<void> {
    const message = this.formatAppointmentMessage(appointments);
    const results: Array<{ type: string; success: boolean; error?: string }> = [];

    // Telegram bildirimi
    if (options.telegram?.enabled && options.telegram.chatId && options.telegram.botToken) {
      try {
        const success = await this.sendTelegramNotification(
          options.telegram.chatId,
          options.telegram.botToken,
          message
        );
        
        results.push({ type: 'telegram', success });

        // Veritabanına kaydet
        await createNotification({
          user_id: options.userId,
          appointment_id: options.appointmentId,
          type: 'telegram',
          message,
          success,
        });
      } catch (error: any) {
        results.push({ 
          type: 'telegram', 
          success: false, 
          error: error.message 
        });

        await createNotification({
          user_id: options.userId,
          appointment_id: options.appointmentId,
          type: 'telegram',
          message,
          success: false,
          error_message: error.message,
        });
      }
    }

    // Email bildirimi (TODO: Implement)
    if (options.email?.enabled && options.email.address) {
      // Email servisi entegrasyonu
      results.push({ type: 'email', success: false, error: 'Not implemented' });
    }

    // Web bildirimi
    if (options.web?.enabled) {
      results.push({ type: 'web', success: true });
      
      await createNotification({
        user_id: options.userId,
        appointment_id: options.appointmentId,
        type: 'web',
        message,
        success: true,
      });
    }
  }

  /**
   * Test bildirimi gönder
   */
  async sendTestNotification(
    chatId: string,
    botToken: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `
🤖 <b>Test Bildirimi</b>

✅ Telegram bot başarıyla bağlandı!

Artık randevu bulunduğunda bildirim alacaksınız.

<i>Schengen Visa Appointment Bot</i>
    `.trim();

    try {
      const success = await this.sendTelegramNotification(chatId, botToken, message);
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
