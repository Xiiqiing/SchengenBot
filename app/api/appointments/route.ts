/**
 * GET /api/appointments
 * Kullanıcının randevularını getir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserAppointments } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const appointments = await getUserAppointments(userId, limit);

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length,
    });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
