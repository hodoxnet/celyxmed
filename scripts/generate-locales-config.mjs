import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../src/generated/prisma/index.js'; // Güncellenmiş import yolu (index.js eklendi)

const prisma = new PrismaClient();

async function generateLocalesConfig() {
  try {
    console.log('[generate-locales-config] Fetching languages from database...');
    const activeLanguages = await prisma.language.findMany({
      where: {
        isActive: true,
      },
      select: {
        code: true,
        isDefault: true,
      },
      orderBy: {
        code: 'asc',
      },
    });

    if (!activeLanguages || activeLanguages.length === 0) {
      console.error('[generate-locales-config] No active languages found in the database. Using fallback defaults.');
      // Fallback değerler, eğer veritabanında hiç aktif dil bulunamazsa
      const locales = ['tr'];
      const defaultLocale = 'tr';
      writeConfigFile(locales, defaultLocale);
      return;
    }

    const locales = activeLanguages.map(lang => lang.code);
    let defaultLocale = activeLanguages.find(lang => lang.isDefault)?.code;

    if (!defaultLocale) {
      console.warn('[generate-locales-config] No default language found among active languages. Falling back to the first active language or "tr".');
      defaultLocale = locales[0] || 'tr'; // İlk aktif dili veya 'tr'yi varsayılan yap
    }

    console.log(`[generate-locales-config] Active locales: ${locales.join(', ')}`);
    console.log(`[generate-locales-config] Default locale: ${defaultLocale}`);

    writeConfigFile(locales, defaultLocale);

  } catch (error) {
    console.error('[generate-locales-config] Error generating locales configuration:', error);
    // Hata durumunda fallback değerlerle dosyayı oluşturmaya çalışabilir veya işlemi sonlandırabiliriz.
    // Şimdilik fallback ile devam edelim ki build süreci tamamen durmasın.
    console.log('[generate-locales-config] Using fallback defaults due to error.');
    const locales = ['tr'];
    const defaultLocale = 'tr';
    writeConfigFile(locales, defaultLocale);
    process.exit(1); // Hata koduyla çıkış yap
  } finally {
    await prisma.$disconnect();
  }
}

function writeConfigFile(locales, defaultLocale) {
  const configContent = `// This file is auto-generated during the build process. Do not edit manually.
export const locales = ${JSON.stringify(locales)};
export const defaultLocale = '${defaultLocale}';
`;

  const generatedDir = path.resolve(process.cwd(), 'src', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  const filePath = path.resolve(generatedDir, 'locales-config.ts');
  fs.writeFileSync(filePath, configContent, 'utf8');
  console.log(`[generate-locales-config] Configuration written to ${filePath}`);
}

generateLocalesConfig();
