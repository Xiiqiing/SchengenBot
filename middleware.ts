import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'zh'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Always require a locale prefix in the URL
    localePrefix: 'always'
});

export default function middleware(req: NextRequest) {
    // 1. Check Auth for protected routes (Dashboard)
    // Check if the path is a dashboard route (e.g. /zh/dashboard, /en/dashboard, /dashboard)
    const isDashboard = req.nextUrl.pathname.includes('/dashboard');

    if (isDashboard) {
        const token = req.cookies.get('session_user_id')?.value;
        if (!token) {
            // Determine locale to redirect to (defaulting to zh if not found)
            const locale = req.nextUrl.pathname.split('/')[1] || 'zh';
            const targetLocale = ['en', 'zh'].includes(locale) ? locale : 'zh';

            // Redirect to the landing page of the corresponding locale
            return NextResponse.redirect(new URL(`/${targetLocale}`, req.url));
        }
    }

    // 2. Run next-intl middleware
    return intlMiddleware(req);
}

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',
        // Set a cookie to remember the previous locale for
        // all requests that have a locale prefix
        '/(zh|en)/:path*',
        // Enable redirects that add a locale prefix to requests without one
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};
