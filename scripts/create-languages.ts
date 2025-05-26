import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to create initial languages...');

    // Dilleri oluştur
    const languages = [
      { code: 'tr', name: 'Türkçe', isActive: true, isDefault: true },
      { code: 'en', name: 'English', isActive: true, isDefault: false },
      { code: 'de', name: 'Deutsch', isActive: true, isDefault: false },
      { code: 'es', name: 'Español', isActive: true, isDefault: false },
      { code: 'fr', name: 'Français', isActive: true, isDefault: false },
      { code: 'ru', name: 'Русский', isActive: true, isDefault: false },
      { code: 'it', name: 'Italiano', isActive: true, isDefault: false },
    ];

    for (const language of languages) {
      const createdLanguage = await prisma.language.upsert({
        where: { code: language.code },
        update: language,
        create: language,
      });

      console.log(`Created language: ${createdLanguage.code} - ${createdLanguage.name}`);
    }

    console.log('Successfully created initial languages');
  } catch (error) {
    console.error('Error creating languages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();