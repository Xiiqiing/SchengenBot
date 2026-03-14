/**
 * GET /api/notifications
 * Get user notification history
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUserId } from '@/lib/auth/session';
import { getUserNotifications } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = await requireAuthenticatedUserId(request, searchParams.get('userId'));
        const limit = parseInt(searchParams.get('limit') || '100');

        const notifications = await getUserNotifications(userId, limit);

        return NextResponse.json({
            success: true,
            notifications,
            count: notifications.length,
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
