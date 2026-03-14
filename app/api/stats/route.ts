/**
 * GET /api/stats
 * User statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUserId } from '@/lib/auth/session';
import { getUserStats } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = await requireAuthenticatedUserId(request, searchParams.get('userId'));

    const stats = await getUserStats(userId);

    if (!stats) {
      // Return default stats for new users
      return NextResponse.json({
        success: true,
        stats: {
          total_appointments: 0,
          total_notifications: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
