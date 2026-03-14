/**
 * POST /api/appointments/check
 * Manual appointment check
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth/session';
import { appointmentService } from '@/lib/services/appointment-service';
import { supabase } from '@/lib/supabase';

function parseUkSlotDate(slotDate: string) {
  const dateParts = slotDate.split(' ');
  const day = Number.parseInt(dateParts[0], 10);
  const monthStr = dateParts[1];
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const now = new Date();
  const month = monthMap[monthStr] ?? 0;
  let year = now.getFullYear();

  if (month < now.getMonth()) {
    year += 1;
  }

  return new Date(year, month, day).toISOString().split('T')[0];
}

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
        const {
          bulkCreateAppointments,
          filterAppointmentsByNotificationCooldown,
          getUserPreferences,
          getUserProfile,
          markAppointmentNotified,
        } = await import('@/lib/supabase/client');
        const { notificationService } = await import('@/lib/services/notification-service');
        const preferences = await getUserPreferences(userId);
        const sameSlotCooldownHours = preferences?.same_slot_cooldown_hours ?? 24;

        console.log(`[ManualCheck] User: ${userId}, City: ${city}, Country: ${country}, Available: ${result.isAvailable}`);
        console.log(`[ManualCheck] Prefs: Enabled=${preferences?.telegram_enabled}, ChatID=${preferences?.telegram_chat_id}, HasToken=${!!process.env.TELEGRAM_BOT_TOKEN}`);

        if (result.isAvailable) {
          const slotAppointments = (result.slots || []).map((slot) => ({
            user_id: userId,
            country,
            city,
            appointment_date: parseUkSlotDate(slot.date),
            center_name: city,
            visa_category: visaType,
            book_now_link: result.bookingLink || '',
            last_seen_at: new Date().toISOString(),
          }));

          if (slotAppointments.length > 0) {
            await bulkCreateAppointments(slotAppointments);
          }

          const appointmentsToNotify = await filterAppointmentsByNotificationCooldown(
            userId,
            slotAppointments.map((appointment) => ({
              country: appointment.country,
              city: appointment.city,
              appointment_date: appointment.appointment_date,
            })),
            sameSlotCooldownHours
          );

          const allowedAppointmentKeys = new Set(
            appointmentsToNotify.map((appointment) => `${appointment.country}::${appointment.city}::${appointment.appointment_date}`)
          );

          const filteredSlots = (result.slots || []).filter((slot) =>
            allowedAppointmentKeys.has(`${country}::${city}::${parseUkSlotDate(slot.date)}`)
          );

          if (filteredSlots.length === 0) {
            console.log(
              `[ManualCheck] Same-slot cooldown active for User ${userId}, ${city} -> ${country}. Cooldown: ${sameSlotCooldownHours}h.`
            );
            return NextResponse.json({
              success: true,
              result,
              checked_at: new Date().toISOString(),
            });
          }

          console.log('[ManualCheck] Sending success notification...');

          let statusMsg = `🎉 <b>手动检查: ${city} -> ${country}</b>\n\n`;
          statusMsg += `✅ <b>发现 ${filteredSlots.length} 个可提醒名额!</b>\n\n`;

          // Add slot details (first 5 to avoid message length limits)
          filteredSlots.slice(0, 5).forEach((slot: any) => {
            statusMsg += `📅 <b>Slot时间:</b> ${slot.date}\n`;
          });

          if (filteredSlots.length > 5) {
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

          for (const appointment of appointmentsToNotify) {
            const { data: matchedAppointments } = await supabase!
              .from('appointments')
              .select('id')
              .eq('user_id', userId)
              .eq('country', appointment.country)
              .eq('city', appointment.city)
              .eq('appointment_date', appointment.appointment_date)
              .limit(1);

            if (matchedAppointments && matchedAppointments.length > 0) {
              await markAppointmentNotified(matchedAppointments[0].id);
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
