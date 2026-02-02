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
