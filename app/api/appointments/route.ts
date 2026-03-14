/**
 * GET /api/appointments
 * Get user appointments
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUserId } from '@/lib/auth/session';
import { getUserAppointments } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = await requireAuthenticatedUserId(request, searchParams.get('userId'));
    const limit = parseInt(searchParams.get('limit') || '50');

    const appointments = await getUserAppointments(userId, limit);

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
