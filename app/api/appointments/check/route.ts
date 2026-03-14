/**
 * POST /api/appointments/check
 * Manual appointment check
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session';
import { appointmentService } from '@/lib/services/appointment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countries, cities, userId } = body;
    const authenticatedUserId = await getAuthenticatedUserId(request);

    if (userId && userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validation
    if (!countries || !Array.isArray(countries) || countries.length === 0) {
      return NextResponse.json(
        { error: 'Countries array is required' },
        { status: 400 }
      );
    }

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return NextResponse.json(
        { error: 'Cities array is required' },
        { status: 400 }
      );
    }

    // Perform check
    const results = await appointmentService.checkMultiple(
      countries,
      cities,
      userId || authenticatedUserId || undefined
    );

    return NextResponse.json({
      success: true,
      results,
      total_found: results.reduce((sum, r) => sum + r.appointments.length, 0),
      checked_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Check appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/appointments/check?source=UK&city=manchester&country=portugal
 * Check UK-based appointments using schengenappointments.com scraper
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const visaType = searchParams.get('visaType') || 'tourism';

    // Only handle UK source
    if (source?.toUpperCase() !== 'UK') {
      return NextResponse.json(
        { error: 'This endpoint only supports source=UK parameter' },
        { status: 400 }
      );
    }

    if (!city || !country) {
      return NextResponse.json(
        { error: 'city and country parameters are required' },
        { status: 400 }
      );
    }

    // Check UK appointment
    const result = await appointmentService.checkUK(city, country, visaType);

    // Send notification if userId is provided (Manual Check "Verbose Mode")
    const requestedUserId = searchParams.get('userId');
    const authenticatedUserId = await getAuthenticatedUserId(request);

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const userId = requestedUserId || authenticatedUserId;
    if (userId) {
      try {
        const { getUserPreferences, getUserProfile } = await import('@/lib/supabase/client');
        const { notificationService } = await import('@/lib/services/notification-service');
        const preferences = await getUserPreferences(userId);

        console.log(`[ManualCheck] User: ${userId}, City: ${city}, Country: ${country}, Available: ${result.isAvailable}`);
        console.log(`[ManualCheck] Prefs: Enabled=${preferences?.telegram_enabled}, ChatID=${preferences?.telegram_chat_id}, HasToken=${!!process.env.TELEGRAM_BOT_TOKEN}`);

        if (result.isAvailable) {
          console.log('[ManualCheck] Sending success notification...');

          let statusMsg = `🎉 <b>手动检查: ${city} -> ${country}</b>\n\n`;
          statusMsg += `✅ <b>发现 ${result.totalSlots} 个可用名额!</b>\n\n`;

          // Add slot details (first 5 to avoid message length limits)
          result.slots?.slice(0, 5).forEach((slot: any) => {
            statusMsg += `📅 <b>Slot时间:</b> ${slot.date}\n`;
          });

          if (result.slots && result.slots.length > 5) {
            statusMsg += `... 以及更多\n`;
          }

          statusMsg += `\n🏢 <b>地点:</b> ${city}\n`;
          statusMsg += `📋 <b>签证类型:</b> ${visaType}\n`;

          if (result.bookingLink) {
            statusMsg += `\n🔗 <a href="${result.bookingLink}">直接预约链接</a>\n`;
          }

          if (preferences?.telegram_enabled && preferences?.telegram_chat_id) {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (botToken) {
              await notificationService.sendCheckStatus(preferences.telegram_chat_id, botToken, statusMsg);
            } else {
              console.error('[ManualCheck] Missing TELEGRAM_BOT_TOKEN');
            }
          }

          if (preferences?.email_enabled) {
            const userProfile = await getUserProfile(userId);
            const emailAddress = preferences.email_address || userProfile?.email;

            if (emailAddress) {
              const subject = `申根签证SLOT通知 - 手动检查结果 (${city} -> ${country})`;
              const emailHtml = statusMsg.replace(/\n/g, '<br>');
              await notificationService.sendEmailNotification(emailAddress, subject, emailHtml).catch(e => console.error('[ManualCheck] Email error:', e));
            }
          }
        } else {
          console.log('[ManualCheck] No notification sent (No slots available)');
        }
      } catch (err) {
        console.warn('Failed to send manual check notification:', err);
      }
    }

    return NextResponse.json({
      success: true,
      result,
      checked_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Check UK appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
