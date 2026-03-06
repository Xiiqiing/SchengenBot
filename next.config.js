const { withSentryConfig } = require('@sentry/nextjs');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/zh',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/zh/dashboard',
        permanent: false,
      },
    ];
  },
}

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  withNextIntl(nextConfig),
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    // Fix: Disable Edge Middleware auto-instrumentation to stay under Vercel's 1MB limit
    autoInstrumentMiddleware: false,
  }
);
