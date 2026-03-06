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

module.exports = withNextIntl(nextConfig);
