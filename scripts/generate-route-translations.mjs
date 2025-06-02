import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function generateRouteTranslations() {
  try {
    console.log('[generate-route-translations] Fetching route translations from database...');
    
    // 1. Aktif dilleri al
    const activeLanguages = await prisma.language.findMany({
      where: { isActive: true },
      select: { code: true },
      orderBy: { code: 'asc' },
    });
    
    if (!activeLanguages || activeLanguages.length === 0) {
      console.error('[generate-route-translations] No active languages found in the database.');
      return;
    }
    
    const languageCodes = activeLanguages.map(lang => lang.code);
    console.log(`[generate-route-translations] Active languages: ${languageCodes.join(', ')}`);
    
    // 2. Veritabanından rota çevirilerini al
    const routeTranslations = await prisma.routeTranslation.findMany({
      where: {
        languageCode: { in: languageCodes }
      },
      orderBy: {
        routeKey: 'asc'
      }
    });
    
    console.log(`[generate-route-translations] Found ${routeTranslations.length} route translations`);
    
    // Çevirileri kullanılabilir bir formatta yapılandır
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
    
    // Hiç rota çevirisi yoksa, fallback olarak hardcoded değerleri kullan
    if (Object.keys(routeTranslationsMap).length === 0) {
      console.warn('[generate-route-translations] No route translations found, using fallback values');
      
      // Temel rotalar için fallback çeviriler
      const staticRoutes = ['hizmetler', 'blog', 'iletisim'];
      
      for (const route of staticRoutes) {
        routeTranslationsMap[route] = {};
        
        for (const langCode of languageCodes) {
          if (route === 'hizmetler') {
            routeTranslationsMap[route][langCode] = getHizmetlerTranslation(langCode);
          } else if (route === 'blog') {
            routeTranslationsMap[route][langCode] = getBlogTranslation(langCode);
          } else if (route === 'iletisim') {
            routeTranslationsMap[route][langCode] = getIletisimTranslation(langCode);
          }
        }
      }
    }
    
    // 3. Dinamik içerik slug çevirilerini al (isteğe bağlı, şimdilik boş)
    const dynamicSlugTranslations = {};
    
    // Hizmet slug çevirilerini ekle
    const hizmetTranslations = await prisma.hizmetTranslation.findMany({
      select: {
        slug: true,
        languageCode: true,
        hizmet: {
          select: {
            id: true,
            translations: {
              select: {
                slug: true,
                languageCode: true
              }
            }
          }
        }
      }
    });
    
    // Hizmet ID'sine göre tüm çevirileri grupla
    const hizmetTranslationsByHizmetId = {};
    
    for (const translation of hizmetTranslations) {
      const hizmetId = translation.hizmet.id;
      
      if (!hizmetTranslationsByHizmetId[hizmetId]) {
        hizmetTranslationsByHizmetId[hizmetId] = {}; 
      }
      
      hizmetTranslationsByHizmetId[hizmetId][translation.languageCode] = translation.slug;
    }
    
    // Şimdi her dilde her slug için çevirileri oluştur
    for (const hizmetId in hizmetTranslationsByHizmetId) {
      const translations = hizmetTranslationsByHizmetId[hizmetId];
      
      // Her dildeki slug'ı al
      for (const sourceLanguage in translations) {
        const sourceSlug = translations[sourceLanguage];
        
        // Aynı içeriğin diğer dillerdeki slug'larını bul
        for (const targetLanguage in translations) {
          if (sourceLanguage !== targetLanguage) {
            const targetSlug = translations[targetLanguage];
            
            // Kaynak slug -> hedef slug eşleştirmesini ekle
            if (!dynamicSlugTranslations[sourceSlug]) {
              dynamicSlugTranslations[sourceSlug] = {};
            }
            
            dynamicSlugTranslations[sourceSlug][targetLanguage] = targetSlug;
          }
        }
      }
    }
    
    // 4. Root Path Route'ları oluştur (useRootPath: true olanlar)
    const rootPathRoutes = {};
    
    for (const translation of routeTranslations) {
      if (translation.useRootPath) {
        const routePath = translation.customPath || translation.translatedValue;
        rootPathRoutes[routePath] = {
          locale: translation.languageCode,
          targetPath: `/${translation.languageCode}/${translation.routeKey}`
        };
      }
    }
    
    console.log(`[generate-route-translations] Found ${Object.keys(rootPathRoutes).length} root path routes`);
    
    // 5. Legacy URL'leri al (HizmetLegacyUrl tablosundan)
    const legacyUrls = {};
    
    try {
      const legacyUrlRecords = await prisma.hizmetLegacyUrl.findMany({
        where: { isActive: true },
        include: {
          hizmet: {
            include: {
              translations: {
                select: {
                  slug: true,
                  languageCode: true
                }
              }
            }
          }
        }
      });
      
      for (const legacyRecord of legacyUrlRecords) {
        const targetTranslation = legacyRecord.hizmet.translations.find(
          t => t.languageCode === legacyRecord.languageCode
        );
        
        if (targetTranslation) {
          const routeKey = routeTranslationsMap['hizmetler'] 
            ? routeTranslationsMap['hizmetler'][legacyRecord.languageCode] || 'hizmetler'
            : 'hizmetler';
            
          legacyUrls[legacyRecord.legacySlug] = `/${legacyRecord.languageCode}/${routeKey}/${targetTranslation.slug}`;
        }
      }
      
      console.log(`[generate-route-translations] Found ${Object.keys(legacyUrls).length} legacy URLs`);
    } catch (error) {
      console.warn('[generate-route-translations] Could not fetch legacy URLs:', error.message);
    }
    
    // 6. Tüm çevirileri birleştir
    const allTranslations = {
      staticRoutes: routeTranslationsMap,
      dynamicSlugs: dynamicSlugTranslations,
      rootPathRoutes: rootPathRoutes,
      legacyUrls: legacyUrls
    };
    
    // 7. Config dosyasını oluştur
    writeTranslationsConfigFile(allTranslations);
    
  } catch (error) {
    console.error('[generate-route-translations] Error generating route translations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Hardcoded çeviriler (ideal olarak bunlar veritabanından alınmalı)
function getHizmetlerTranslation(langCode) {
  const translations = {
    'en': 'services',
    'es': 'servicios',
    'fr': 'services',
    'de': 'dienstleistungen',
    'it': 'servizi',
    'ru': 'услуги',
    'tr': 'hizmetler'
  };
  
  return translations[langCode] || langCode;
}

function getBlogTranslation(langCode) {
  const translations = {
    'en': 'blog',
    'es': 'blog',
    'fr': 'blog',
    'de': 'blog',
    'it': 'blog',
    'ru': 'блог',
    'tr': 'blog'
  };
  
  return translations[langCode] || langCode;
}

function getIletisimTranslation(langCode) {
  const translations = {
    'en': 'contact',
    'es': 'contacto',
    'fr': 'contact',
    'de': 'kontakt',
    'it': 'contatto',
    'ru': 'контакты',
    'tr': 'iletisim'
  };
  
  return translations[langCode] || langCode;
}

function writeTranslationsConfigFile(translations) {
  const configContent = `// This file is auto-generated during the build process. Do not edit manually.
export const routeTranslations = ${JSON.stringify(translations.staticRoutes, null, 2)};
export const slugTranslations = ${JSON.stringify(translations.dynamicSlugs, null, 2)};
export const rootPathRoutes = ${JSON.stringify(translations.rootPathRoutes, null, 2)};
export const legacyUrls = ${JSON.stringify(translations.legacyUrls, null, 2)};
`;

  const generatedDir = path.resolve(process.cwd(), 'src', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const filePath = path.resolve(generatedDir, 'route-translations.ts');
  fs.writeFileSync(filePath, configContent, 'utf8');
  console.log(`[generate-route-translations] Configuration written to ${filePath}`);
}

generateRouteTranslations();