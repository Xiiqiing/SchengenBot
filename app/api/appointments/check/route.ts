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
