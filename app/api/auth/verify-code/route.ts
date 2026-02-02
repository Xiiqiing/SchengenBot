import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/verify-code
 * Verify invitation code against environment variable
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code } = body;

        const expectedCode = process.env.INVITATION_CODE;

        if (!expectedCode) {
            console.warn('INVITATION_CODE not set in environment variables');
            return NextResponse.json(
                { error: 'Server misconfiguration: Invitation system unavailable' },
                { status: 500 }
            );
        }

        if (!code) {
            return NextResponse.json(
                { error: 'Invitation code is required' },
                { status: 400 }
            );
        }

        if (code === expectedCode) {
            return NextResponse.json({
                success: true,
                message: 'Code verified'
            });
        } else {
            return NextResponse.json(
                { success: false, error: '无效的邀请码' },
                { status: 401 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
