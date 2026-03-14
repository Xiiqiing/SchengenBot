import { NextResponse } from 'next/server';
import { clearInviteVerificationCookie, clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  clearInviteVerificationCookie(response);
  return response;
}
