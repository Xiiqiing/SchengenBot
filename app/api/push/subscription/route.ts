import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUserId } from '@/lib/auth/session';
import {
  deactivatePushSubscription,
  getUserPushSubscriptions,
  upsertPushSubscription,
} from '@/lib/supabase/client';
import {
  getVapidPublicKey,
  getWebPushConfigurationError,
  isWebPushConfigured,
} from '@/lib/push/web-push';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = await requireAuthenticatedUserId(request, searchParams.get('userId'));
    const subscriptions = await getUserPushSubscriptions(userId);

    return NextResponse.json({
      success: true,
      vapidPublicKey: getVapidPublicKey(),
      configured: isWebPushConfigured(),
      configurationError: getWebPushConfigurationError(),
      subscriptions,
      hasSubscription: subscriptions.length > 0,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, endpoint, p256dh, auth, userAgent } = body;
    const authenticatedUserId = await requireAuthenticatedUserId(request, userId);

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: 'endpoint, p256dh and auth are required' },
        { status: 400 }
      );
    }

    if (!isWebPushConfigured()) {
      return NextResponse.json(
        { error: getWebPushConfigurationError() || 'Web Push is not configured on the server' },
        { status: 500 }
      );
    }

    const subscription = await upsertPushSubscription(authenticatedUserId, {
      endpoint,
      p256dh,
      auth,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, endpoint } = body;
    const authenticatedUserId = await requireAuthenticatedUserId(request, userId);

    if (!endpoint) {
      return NextResponse.json(
        { error: 'endpoint is required' },
        { status: 400 }
      );
    }

    await deactivatePushSubscription(authenticatedUserId, endpoint);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
