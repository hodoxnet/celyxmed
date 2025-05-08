import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function generateNextConfig() {
  try {
    console.log('[generate-next-config] Fetching data from database...');
    
    // 1. Aktif dilleri al
    const activeLanguages = await prisma.language.findMany({
      where: { isActive: true },
      select: { code: true },
      orderBy: { code: 'asc' },
    });
    
    const languageCodes = activeLanguages.map(lang => lang.code);
    console.log(`[generate-next-config] Active languages: ${languageCodes.join(', ')}`);
    
    // 2. Rota çevirilerini al
    const routeTranslations = await prisma.routeTranslation.findMany({
      where: {
        languageCode: { in: languageCodes }
      },
      orderBy: {
        routeKey: 'asc'
      }
    });
    
    console.log(`[generate-next-config] Found ${routeTranslations.length} route translations`);
    
    // 3. Çevirileri yapılandır
    const routeTranslationsMap = {};
    
    // Her rota çevirisi için
    for (const translation of routeTranslations) {
      const { routeKey, languageCode, translatedValue } = translation;
      
      // Eğer bu rota için bir sözlük yoksa oluştur
      if (!routeTranslationsMap[routeKey]) {
        routeTranslationsMap[routeKey] = {};
      }
      
      // Dil koduna göre çevirilen değeri ekle
      routeTranslationsMap[routeKey][languageCode] = translatedValue;
    }
    
    // 4. Next.config.ts için rewrite kurallarını oluştur
    const dynamicRewrites = [];
    
    // Her rota türü için
    for (const routeKey in routeTranslationsMap) {
      const translations = routeTranslationsMap[routeKey];
      
      // Her dil için
      for (const langCode of languageCodes) {
        const translatedValue = translations[langCode];
        
        // Eğer çevirisi routeKey'den farklıysa ve tanımlanmışsa
        if (translatedValue && translatedValue !== routeKey) {
          dynamicRewrites.push({
            source: `/${langCode}/${translatedValue}/:path*`,
            destination: `/${langCode}/${routeKey}/:path*`,
          });
        }
      }
    }
    
    // 5. next.config.ts şablonunu yükle
    const templatePath = path.resolve(process.cwd(), 'scripts', 'next-config-template.js');
    let configTemplate = '';
    
    try {
      configTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error(`[generate-next-config] Error loading template: ${error.message}`);
      // Temel şablon
      configTemplate = `import type { NextConfig } from "next";
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
`;
    }
    
    // 6. Şablonu dinamik verilerle güncelle
    const dynamicRewritesCode = JSON.stringify(dynamicRewrites, null, 2);
    const updatedTemplate = configTemplate.replace('__DYNAMIC_REWRITES__', dynamicRewritesCode);
    
    // 7. Yeni next.config.ts dosyasını kaydet
    const configPath = path.resolve(process.cwd(), 'next.config.ts');
    fs.writeFileSync(configPath, updatedTemplate, 'utf8');
    
    console.log(`[generate-next-config] Next.config.ts updated with ${dynamicRewrites.length} dynamic rewrites`);
    
  } catch (error) {
    console.error('[generate-next-config] Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

generateNextConfig();