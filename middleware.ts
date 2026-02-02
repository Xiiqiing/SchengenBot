import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware to protect routes
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect /dashboard routes
    if (pathname.startsWith('/dashboard')) {
        const sessionUserId = request.cookies.get('session_user_id')?.value;

        if (!sessionUserId) {
            // Redirect to landing page if not authenticated
            const url = new URL('/', request.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

/**
 * Configure matching routes
 */
export const config = {
    matcher: ['/dashboard/:path*'],
};
