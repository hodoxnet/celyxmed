import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    // Root path artık middleware tarafından yönetiliyor
    return [];
  },
  async rewrites() {
    return __DYNAMIC_REWRITES__;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'banaozel.sahibinden.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

const withIntl = withNextIntl('./src/i18n.ts');

export default withIntl(nextConfig);