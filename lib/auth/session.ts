import type { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'session_token';
const INVITE_COOKIE_NAME = 'invite_verified_token';

type TokenKind = 'session' | 'invite';

interface SignedTokenPayload {
  type: TokenKind;
  sub: string;
  exp: number;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

function getSessionSecret() {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.CRON_SECRET ||
    process.env.INVITATION_CODE;

  if (!secret) {
    throw new Error('Missing SESSION_SECRET (or compatible fallback secret)');
  }

  return secret;
}

function base64UrlEncode(input: string | Uint8Array) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }

  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input: string) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(input, 'base64url'));
  }

  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function importSigningKey() {
  return await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signPayload(payload: string) {
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function createSignedToken(payload: SignedTokenPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

async function verifySignedToken(token: string | undefined, expectedType: TokenKind) {
  if (!token) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = await signPayload(encodedPayload);
  if (expectedSignature !== providedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as SignedTokenPayload;

    if (payload.type !== expectedType || payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createSessionToken(userId: string) {
  return await createSignedToken({
    type: 'session',
    sub: userId,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
}

export async function createInviteVerificationToken() {
  return await createSignedToken({
    type: 'invite',
    sub: 'verified',
    exp: Date.now() + 15 * 60 * 1000,
  });
}

export async function getAuthenticatedUserId(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = await verifySignedToken(token, 'session');
  return payload?.sub ?? null;
}

export async function requireAuthenticatedUserId(
  request: NextRequest,
  requestedUserId?: string | null
) {
  const authenticatedUserId = await getAuthenticatedUserId(request);

  if (!authenticatedUserId) {
    throw new AuthError('Unauthorized', 401);
  }

  if (requestedUserId && requestedUserId !== authenticatedUserId) {
    throw new AuthError('Forbidden', 403);
  }

  return authenticatedUserId;
}

export async function isInviteVerificationValid(request: NextRequest) {
  const token = request.cookies.get(INVITE_COOKIE_NAME)?.value;
  return !!(await verifySignedToken(token, 'invite'));
}

export function setInviteVerificationCookie(response: NextResponse, token: string) {
  response.cookies.set(INVITE_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60,
  });
}

export function clearInviteVerificationCookie(response: NextResponse) {
  response.cookies.set(INVITE_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
  });
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
  });
}

export async function isSessionCookieValid(token: string | undefined) {
  return !!(await verifySignedToken(token, 'session'));
}
