/**
 * GET /api/stats
 * Kullanıcı istatistikleri
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
      return NextResponse.json(
        { error: 'Stats not found' },
        { status: 404 }
      );
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
