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
