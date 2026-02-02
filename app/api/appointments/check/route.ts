/**
 * POST /api/appointments/check
 * Manuel randevu kontrolü
 */

import { NextRequest, NextResponse } from 'next/server';
import { appointmentService } from '@/lib/services/appointment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countries, cities, userId } = body;

    // Validasyon
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

    // Kontrol yap
    const results = await appointmentService.checkMultiple(
      countries,
      cities,
      userId
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
    const userId = searchParams.get('userId');
    if (userId) {
      try {
        const { getUserPreferences } = await import('@/lib/supabase/client');
        const { notificationService } = await import('@/lib/services/notification-service');
        const preferences = await getUserPreferences(userId);

        if (preferences?.telegram_enabled && preferences?.telegram_chat_id) {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            const statusMsg = result.isAvailable
              ? `🎉 <b>手动检查: ${city} -> ${country}</b>\n✅ 发现 ${result.totalSlots} 个可用名额!`
              : `🔍 <b>手动检查: ${city} -> ${country}</b>\n❌ 暂无可用名额。`;

            // Fire and forget (don't await to block response)
            notificationService.sendCheckStatus(preferences.telegram_chat_id, botToken, statusMsg);
          }
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
