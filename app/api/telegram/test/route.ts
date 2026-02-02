/**
 * POST /api/telegram/test
 * Telegram bot test bildirimi
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, botToken } = body;

    if (!chatId || !botToken) {
      return NextResponse.json(
        { error: 'chatId and botToken are required' },
        { status: 400 }
      );
    }

    const result = await notificationService.sendTestNotification(
      chatId,
      botToken
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send notification',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Telegram test error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
