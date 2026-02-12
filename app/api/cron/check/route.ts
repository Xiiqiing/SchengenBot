/**
 * GET /api/cron/check
 * Automated appointment check (Vercel Cron Job)
 * 
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 * Add cron job to vercel.json file
 */

import { NextRequest, NextResponse } from 'next/server';
import { appointmentService } from '@/lib/services/appointment-service';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Cron secret check (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET?.trim();

    // Debug logging (Masked)
    console.log('Cron Check Auth:', {
      hasSecret: !!cronSecret,
      hasHeader: !!authHeader,
      headerStart: authHeader?.substring(0, 10)
    });

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Server Misconfiguration: CRON_SECRET missing in Vercel Env' },
        { status: 500 }
      );
    }

    if (cronSecret) {
      // Extract token from "Bearer <token>"
      const receivedToken = authHeader?.split('Bearer ')[1]?.trim();

      if (receivedToken !== cronSecret) {
        console.warn('Cron Auth Failed. Received != Expected');
        return NextResponse.json(
          {
            error: 'Unauthorized: Invalid Token',
            debug: {
              hasSecret: !!cronSecret,
              receivedTokenLen: receivedToken?.length || 0,
              expectedSecretLen: cronSecret?.length || 0,
              receivedStart: receivedToken?.substring(0, 3) + '...'
            }
          },
          { status: 401 }
        );
      }
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Get users with auto-check enabled
    const { data: activeUsers, error } = await supabase
      .from('user_preferences')
      .select('user_id, countries, cities, telegram_enabled, web_enabled, check_frequency')
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

    // Check for each user
    for (const user of activeUsers) {
      try {
        // Does it match check frequency?
        const frequency = user.check_frequency || 60; // Default 60 min

        // Get last check time
        const { data: lastCheck } = await supabase
          .from('check_history')
          .select('checked_at')
          .eq('user_id', user.user_id)
          .order('checked_at', { ascending: false })
          .limit(1)
          .single();

        if (lastCheck) {
          const lastCheckTime = new Date(lastCheck.checked_at).getTime();
          const now = new Date().getTime();
          const diffMinutes = (now - lastCheckTime) / (1000 * 60);

          // If time elapsed since last check is less than frequency, skip
          if (diffMinutes < frequency) {
            results.push({
              userId: user.user_id,
              status: 'skipped',
              reason: `Wait ${Math.ceil(frequency - diffMinutes)} mins`
            });
            continue;
          }
        }

        const checkResults = await appointmentService.checkForUser(user.user_id);
        results.push({
          userId: user.user_id,
          status: 'checked',
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
