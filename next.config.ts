import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
  {
    "source": "/en/deneme/:path*",
    "destination": "/en/hakkimizda/:path*"
  }
];
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