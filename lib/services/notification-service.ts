/**
 * Notification Service
 * Telegram, Email, Web notifications
 */

import { Resend } from 'resend';
import { createNotification } from '../supabase/client';
import { formatDate, getCountryByCode } from '../constants/countries';

// Appointment data shape (previously from schengen-api, now defined locally)
export interface AppointmentData {
  id: number;
  source_country: string;
  mission_country: string;
  center_name: string;
  appointment_date: string;
  visa_category: string;
  visa_subcategory: string | null;
  book_now_link: string;
}

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
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  /**
   * Send Telegram notification
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
   * Send Email notification
   */
  async sendEmailNotification(
    to: string,
    subject: string,
    html: string
  ): Promise<{ success: boolean; error?: any }> {
    if (!this.resend) {
      console.warn('Resend API key not found');
      return { success: false, error: 'Resend API key missing' };
    }

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const fromName = '喵喵的SchengenBot';

      const { error } = await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('Email send error:', error);
        return { success: false, error: error };
      }

      return { success: true };
    } catch (error) {
      console.error('Email notification error:', error);
      return { success: false, error: error };
    }
  }

  /**
   * Format appointment message
   */
  formatAppointmentMessage(appointments: AppointmentData[]): string {
    if (appointments.length === 0) return '';

    const first = appointments[0];
    const country = getCountryByCode(first.mission_country);

    let message = `🎉 <b>发现 ${country?.name || first.mission_country} 可预约名额!</b>\n\n`;

    appointments.forEach((apt, index) => {
      if (index > 0) message += '\n━━━━━━━━━━━━━━━━━━━━\n\n';

      message += `📅 <b>日期:</b> ${formatDate(apt.appointment_date)}\n`;
      message += `🏢 <b>中心:</b> ${apt.center_name}\n`;
      message += `📋 <b>类别:</b> ${apt.visa_category}\n`;

      if (apt.visa_subcategory) {
        message += `📝 <b>子类别:</b> ${apt.visa_subcategory}\n`;
      }

      message += `\n🔗 <a href="${apt.book_now_link}">立即预约</a>`;
    });

    message += '\n\n⚠️ <i>建议立即预订!</i>';

    return message;
  }

  /**
   * Send bulk notifications
   */
  async sendAppointmentNotifications(
    appointments: AppointmentData[],
    options: NotificationOptions
  ): Promise<{ delivered: boolean; results: Array<{ type: string; success: boolean; error?: string }> }> {
    const message = this.formatAppointmentMessage(appointments);
    const results: Array<{ type: string; success: boolean; error?: string }> = [];
    const hasDirectChannel =
      !!(options.telegram?.enabled && options.telegram.chatId && options.telegram.botToken) ||
      !!(options.email?.enabled && options.email.address);

    // Telegram notification
    if (options.telegram?.enabled && options.telegram.chatId && options.telegram.botToken) {
      try {
        const success = await this.sendTelegramNotification(
          options.telegram.chatId,
          options.telegram.botToken,
          message
        );

        results.push({ type: 'telegram', success });

        // Save to DB
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

    // Email notification
    if (options.email?.enabled && options.email.address && this.resend) {
      const subject = `申根签证SLOT通知 - 发现 ${appointments.length} 个名额`;
      const emailHtml = message.replace(/\n/g, '<br>');

      try {
        const { success, error } = await this.sendEmailNotification(
          options.email.address,
          subject,
          emailHtml
        );

        results.push({ type: 'email', success, error: error ? JSON.stringify(error) : undefined });

        await createNotification({
          user_id: options.userId,
          appointment_id: options.appointmentId,
          type: 'email',
          message,
          success,
          error_message: error ? JSON.stringify(error) : undefined
        });
      } catch (error: any) {
        results.push({ type: 'email', success: false, error: error.message });

        await createNotification({
          user_id: options.userId,
          appointment_id: options.appointmentId,
          type: 'email',
          message,
          success: false,
          error_message: error.message
        });
      }
    }

    // Web notification
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

    return {
      delivered:
        results.some(
          (result) =>
            result.success &&
            (result.type === 'telegram' || result.type === 'email')
        ) ||
        (!hasDirectChannel &&
          results.some((result) => result.success && result.type === 'web')),
      results,
    };
  }

  /**
   * Send test notification
   */
  async sendTestNotification(
    chatId: string,
    botToken: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `
🤖 <b>测试通知</b>

✅ Telegram Bot 连接成功!

现在起，一旦发现可预约名额，您将收到通知。

<i>申根签证预约机器人 (SchengenBot)</i>
    `.trim();

    try {
      const success = await this.sendTelegramNotification(chatId, botToken, message);
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a general status message (e.g. "Checked Manchester: No slots")
   */
  async sendCheckStatus(
    chatId: string,
    botToken: string,
    message: string
  ): Promise<boolean> {
    return await this.sendTelegramNotification(chatId, botToken, message);
  }
}

// Singleton instance
export const notificationService = new NotificationService();
