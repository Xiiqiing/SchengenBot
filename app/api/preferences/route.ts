/**
 * GET/POST /api/preferences
 * Kullanıcı tercihlerini yönet
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPreferences,
  upsertUserPreferences,
  getUserProfile,
  createUserProfile,
} from '@/lib/supabase/client';

// GET - Tercihleri getir
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

    const preferences = await getUserPreferences(userId);

    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tercihleri güncelle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...preferencesData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // UUID formatı kontrolü
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid userId format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Kullanıcı profili yoksa oluştur
    let userProfile = await getUserProfile(userId);
    if (!userProfile) {
      // Yeni kullanıcı profili oluştur (email zorunlu, geçici email kullan)
      try {
        userProfile = await createUserProfile({
          id: userId,
          email: `user-${userId}@temp.local`, // Geçici email
        });
      } catch (error: any) {
        // Email zaten varsa veya başka hata varsa devam et
        console.warn('User profile creation warning:', error.message);
      }
    }

    const preferences = await upsertUserPreferences(userId, preferencesData);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
