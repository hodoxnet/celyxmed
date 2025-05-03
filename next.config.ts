import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin'; // next-intl plugin'ini import et

const nextConfig: NextConfig = {
  /* config options here */
};

// Yapılandırmayı next-intl eklentisi ile sarmala ve i18n yapılandırma dosyasını belirt
const withIntl = withNextIntl('./src/i18n.ts');

export default withIntl(nextConfig);
