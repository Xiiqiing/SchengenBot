import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUserId } from '@/lib/auth/session';
import { getUserPushSubscriptions, touchPushSubscription } from '@/lib/supabase/client';
import { sendWebPushNotification } from '@/lib/push/web-push';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, endpoint } = body;
    const authenticatedUserId = await requireAuthenticatedUserId(request, userId);

    const subscriptions = await getUserPushSubscriptions(authenticatedUserId);
    const targetSubscriptions = endpoint
      ? subscriptions.filter((subscription) => subscription.endpoint === endpoint)
      : subscriptions;

    if (targetSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active push subscription found for this device' },
        { status: 404 }
      );
    }

    const results = await Promise.all(
      targetSubscriptions.map(async (subscription) => {
        const result = await sendWebPushNotification(
          {
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
          {
            title: 'SchengenBot Test Push',
            body: 'Web Push is working on this device.',
            url: '/dashboard/settings',
            tag: 'schengenbot-test-push',
          }
        );

        if (result.success) {
          await touchPushSubscription(subscription.endpoint).catch((error) =>
            console.error('Error updating push subscription usage:', error)
          );
        }

        return {
          endpoint: subscription.endpoint,
          ...result,
        };
      })
    );

    const successCount = results.filter((result) => result.success).length;

    return NextResponse.json({
      success: successCount > 0,
      sent: successCount,
      attempted: results.length,
      results,
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
