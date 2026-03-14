/**
 * GET/POST /api/preferences
 * Manage user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUserId } from '@/lib/auth/session';
import {
  getUserPreferences,
  upsertUserPreferences,
  getUserProfile,
  createUserProfile,
} from '@/lib/supabase/client';

// GET - Get preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = await requireAuthenticatedUserId(request, searchParams.get('userId'));

    const preferences = await getUserPreferences(userId);

    if (!preferences) {
      // Return default preferences for new users instead of 404
      return NextResponse.json({
        success: true,
        preferences: {
          countries: [],
          cities: [],
          check_frequency: 15,
          same_slot_cooldown_hours: 24,
          telegram_enabled: false,
          telegram_chat_id: '',
          email_enabled: false,
          email_address: '',
          web_enabled: true,
          auto_check_enabled: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...preferencesData } = body;
    const authenticatedUserId = await requireAuthenticatedUserId(request, userId);

    // UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(authenticatedUserId)) {
      return NextResponse.json(
        { error: 'Invalid userId format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Create user profile if not exists
    let userProfile = await getUserProfile(authenticatedUserId);
    if (!userProfile) {
      // Create new user profile (email required, use temporary email)
      try {
        userProfile = await createUserProfile({
          id: authenticatedUserId,
          email: `user-${authenticatedUserId}@temp.local`, // Temporary email
        });
      } catch (error: any) {
        // Continue if email already exists or other error occurs
        console.warn('User profile creation warning:', error.message);
      }
    }

    const preferences = await upsertUserPreferences(authenticatedUserId, preferencesData);

    // The telegram_chat_id is now fully managed within `user_preferences`.


    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
