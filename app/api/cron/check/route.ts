/**
 * GET /api/cron/check
 * Otomatik randevu kontrolü (Vercel Cron Job)
 * 
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 * vercel.json dosyasına cron job ekleyin
 */

import { NextRequest, NextResponse } from 'next/server';
import { appointmentService } from '@/lib/services/appointment-service';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Cron secret kontrolü (güvenlik için)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Otomatik kontrol aktif olan kullanıcıları getir
    const { data: activeUsers, error } = await supabase
      .from('user_preferences')
      .select('user_id, countries, cities, telegram_enabled, web_enabled')
      .eq('auto_check_enabled', true);

    if (error) throw error;

    if (!activeUsers || activeUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active users to check',
        checked: 0,
      });
    }

    const results = [];

    // Her kullanıcı için kontrol yap
    for (const user of activeUsers) {
      try {
        const checkResults = await appointmentService.checkForUser(user.user_id);
        results.push({
          userId: user.user_id,
          found: checkResults.reduce((sum, r) => sum + r.appointments.length, 0),
        });
      } catch (error) {
        console.error(`Error checking for user ${user.user_id}:`, error);
        results.push({
          userId: user.user_id,
          error: 'Check failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      checked: activeUsers.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron check error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
