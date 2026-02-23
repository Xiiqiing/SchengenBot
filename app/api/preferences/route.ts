/**
 * GET/POST /api/preferences
 * Manage user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
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

// POST - Update preferences
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

    // UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid userId format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Create user profile if not exists
    let userProfile = await getUserProfile(userId);
    if (!userProfile) {
      // Create new user profile (email required, use temporary email)
      try {
        userProfile = await createUserProfile({
          id: userId,
          email: `user-${userId}@temp.local`, // Temporary email
        });
      } catch (error: any) {
        // Continue if email already exists or other error occurs
        console.warn('User profile creation warning:', error.message);
      }
    }

    const preferences = await upsertUserPreferences(userId, preferencesData);

    // The telegram_chat_id is now fully managed within `user_preferences`.


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
