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
    "source": "/de/unsere-arztede/:path*",
    "destination": "/de/doktorlar/:path*"
  },
  {
    "source": "/en/our-doctors/:path*",
    "destination": "/en/doktorlar/:path*"
  },
  {
    "source": "/es/nuestros-medicos/:path*",
    "destination": "/es/doktorlar/:path*"
  },
  {
    "source": "/fr/nos-medecins/:path*",
    "destination": "/fr/doktorlar/:path*"
  },
  {
    "source": "/it/i-nostri-medici/:path*",
    "destination": "/it/doktorlar/:path*"
  },
  {
    "source": "/ru/nashi-vrachi/:path*",
    "destination": "/ru/doktorlar/:path*"
  },
  {
    "source": "/tr/doktorlarimiz/:path*",
    "destination": "/tr/doktorlar/:path*"
  },
  {
    "source": "/de/uber-uns/:path*",
    "destination": "/de/hakkimizda/:path*"
  },
  {
    "source": "/en/about-us/:path*",
    "destination": "/en/hakkimizda/:path*"
  },
  {
    "source": "/es/quienes-somos/:path*",
    "destination": "/es/hakkimizda/:path*"
  },
  {
    "source": "/fr/a-propos/:path*",
    "destination": "/fr/hakkimizda/:path*"
  },
  {
    "source": "/it/chi-siamo/:path*",
    "destination": "/it/hakkimizda/:path*"
  },
  {
    "source": "/ru/o-nas/:path*",
    "destination": "/ru/hakkimizda/:path*"
  },
  {
    "source": "/de/unsere-dienstleistungen/:path*",
    "destination": "/de/hizmetler/:path*"
  },
  {
    "source": "/en/our-services/:path*",
    "destination": "/en/hizmetler/:path*"
  },
  {
    "source": "/es/nuestros-servicios/:path*",
    "destination": "/es/hizmetler/:path*"
  },
  {
    "source": "/fr/nos-services/:path*",
    "destination": "/fr/hizmetler/:path*"
  },
  {
    "source": "/it/i-nostri-servizi/:path*",
    "destination": "/it/hizmetler/:path*"
  },
  {
    "source": "/ru/services/:path*",
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
    "source": "/it/contatti/:path*",
    "destination": "/it/iletisim/:path*"
  },
  {
    "source": "/ru/kontakt/:path*",
    "destination": "/ru/iletisim/:path*"
  },
  {
    "source": "/de/unsere-klinik/:path*",
    "destination": "/de/klinik/:path*"
  },
  {
    "source": "/en/our-clinic/:path*",
    "destination": "/en/klinik/:path*"
  },
  {
    "source": "/es/nuestra-clinica/:path*",
    "destination": "/es/klinik/:path*"
  },
  {
    "source": "/fr/notre-clinique/:path*",
    "destination": "/fr/klinik/:path*"
  },
  {
    "source": "/it/la-nostra-clinica/:path*",
    "destination": "/it/klinik/:path*"
  },
  {
    "source": "/ru/nasha-klinika/:path*",
    "destination": "/ru/klinik/:path*"
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