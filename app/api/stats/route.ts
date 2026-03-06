/**
 * GET /api/stats
 * User statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

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
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
