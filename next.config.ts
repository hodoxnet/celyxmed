import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/tr',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
  {
    "source": "/ru/блог/:path*",
    "destination": "/ru/blog/:path*"
  },
  {
    "source": "/de/dienstleistungen/:path*",
    "destination": "/de/hizmetler/:path*"
  },
  {
    "source": "/en/services/:path*",
    "destination": "/en/hizmetler/:path*"
  },
  {
    "source": "/es/servicios/:path*",
    "destination": "/es/hizmetler/:path*"
  },
  {
    "source": "/fr/services/:path*",
    "destination": "/fr/hizmetler/:path*"
  },
  {
    "source": "/it/servizi/:path*",
    "destination": "/it/hizmetler/:path*"
  },
  {
    "source": "/po/portekizhizmet/:path*",
    "destination": "/po/hizmetler/:path*"
  },
  {
    "source": "/ru/услуги/:path*",
    "destination": "/ru/hizmetler/:path*"
  },
  {
    "source": "/de/kontakt/:path*",
    "destination": "/de/iletisim/:path*"
  },
  {
    "source": "/en/contact/:path*",
    "destination": "/en/iletisim/:path*"
  },
  {
    "source": "/es/contacto/:path*",
    "destination": "/es/iletisim/:path*"
  },
  {
    "source": "/fr/contact/:path*",
    "destination": "/fr/iletisim/:path*"
  },
  {
    "source": "/it/contatto/:path*",
    "destination": "/it/iletisim/:path*"
  },
  {
    "source": "/ru/контакты/:path*",
    "destination": "/ru/iletisim/:path*"
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