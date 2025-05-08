import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin'; // next-intl plugin'ini import et

const nextConfig: NextConfig = {
  reactStrictMode: false, // Strict Mode'u geçici olarak devre dışı bırak
  
  // Root redirects'i ayarla - eğer middleware çalışmazsa bu backupdır
  async redirects() {
    return [
      {
        source: '/',
        destination: '/tr',
        permanent: true,
      },
    ];
  },
  
  // Yerelleştirilmiş yolları doğru dosya yollarına yönlendir
  async rewrites() {
    return [
      // Her dil için hizmetler sayfasını doğru şekilde yönlendir
      // İngilizce
      {
        source: '/en/services/:path*',
        destination: '/en/hizmetler/:path*',
      },
      // İspanyolca
      {
        source: '/es/servicios/:path*',
        destination: '/es/hizmetler/:path*',
      },
      // Fransızca
      {
        source: '/fr/services/:path*',
        destination: '/fr/hizmetler/:path*',
      },
      // Almanca
      {
        source: '/de/dienstleistungen/:path*',
        destination: '/de/hizmetler/:path*',
      },
      // İtalyanca
      {
        source: '/it/servizi/:path*',
        destination: '/it/hizmetler/:path*',
      },
      // Rusça
      {
        source: '/ru/услуги/:path*',
        destination: '/ru/hizmetler/:path*',
      },
      
      // Diğer çevirilen sayfalar için benzer kurallar ekleyebilirsiniz
      // Örnek:
      // Blog sayfaları
      {
        source: '/:locale/blog/:path*',
        destination: '/:locale/blog/:path*',
      },
      // İletişim sayfaları
      {
        source: '/en/contact/:path*',
        destination: '/en/iletisim/:path*',
      },
      {
        source: '/es/contacto/:path*',
        destination: '/es/iletisim/:path*',
      },
      {
        source: '/fr/contact/:path*',
        destination: '/fr/iletisim/:path*',
      },
      {
        source: '/de/kontakt/:path*',
        destination: '/de/iletisim/:path*',
      },
      {
        source: '/it/contatto/:path*',
        destination: '/it/iletisim/:path*',
      },
      {
        source: '/ru/контакты/:path*',
        destination: '/ru/iletisim/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        port: '',
        pathname: '/**', // Bu domain altındaki tüm yollara izin ver
      },
      // via.placeholder.com için yeni pattern eklendi
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // banaozel.sahibinden.com için yeni pattern eklendi
      {
        protocol: 'https',
        hostname: 'banaozel.sahibinden.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// Yapılandırmayı next-intl eklentisi ile sarmala ve i18n yapılandırma dosyasını belirt
const withIntl = withNextIntl('./src/i18n.ts');

export default withIntl(nextConfig);
