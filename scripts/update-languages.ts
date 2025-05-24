import prisma from '../src/lib/prisma';

const languageData = [
  { code: 'tr', menuLabel: 'Dil', flagCode: 'tr' },
  { code: 'en', menuLabel: 'Language', flagCode: 'gb' },
  { code: 'de', menuLabel: 'Sprache', flagCode: 'de' },
  { code: 'fr', menuLabel: 'Langue', flagCode: 'fr' },
  { code: 'es', menuLabel: 'Idioma', flagCode: 'es' },
  { code: 'it', menuLabel: 'Lingua', flagCode: 'it' },
  { code: 'ru', menuLabel: 'Язык', flagCode: 'ru' },
];

async function updateLanguages() {
  console.log('🔄 Dilleri güncelliyorum...');
  
  for (const lang of languageData) {
    try {
      const updated = await prisma.language.update({
        where: { code: lang.code },
        data: {
          menuLabel: lang.menuLabel,
          flagCode: lang.flagCode,
        },
      });
      console.log(`✅ ${lang.code} dili güncellendi:`, updated.name);
    } catch (error) {
      console.error(`❌ ${lang.code} dili güncellenirken hata:`, error);
    }
  }
  
  console.log('✨ Tüm diller güncellendi!');
}

updateLanguages()
  .catch((e) => {
    console.error('Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });