
import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email address is required' },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'Server Misconfiguration: RESEND_API_KEY missing' },
                { status: 500 }
            );
        }

        const html = `
      <h1>📧 邮件通知测试</h1>
      <p>这就是一封来自 SchengenBot 的测试邮件。</p>
      <p>如果您收到了这封邮件，说明您的配置是正确的！✅</p>
      <hr />
      <p style="color: gray; font-size: 12px;">Schengen Visa Appointment Bot</p>
    `;

        const success = await notificationService.sendEmailNotification(
            email,
            '🧪 SchengenBot 测试邮件',
            html
        );

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: 'Failed to send email. Check server logs.' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
