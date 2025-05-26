import { prisma } from '../src/lib/prisma';

async function seedFaqSection() {
  console.log('SSS bölüm başlıkları oluşturuluyor...');

  try {
    // Önce FaqSection kaydını oluştur
    const faqSection = await prisma.faqSection.upsert({
      where: { id: 'main' },
      update: {},
      create: { id: 'main' },
    });

    console.log('FaqSection kaydı oluşturuldu');

    // Dilleri al
    const languages = await prisma.language.findMany({
      where: { isActive: true },
    });

    // Her dil için çeviri oluştur
    const translations = [
      {
        languageCode: 'tr',
        title: 'Sıkça Sorulan Sorular',
        description: 'En çok merak edilenleri sizin için yanıtladık',
      },
      {
        languageCode: 'en',
        title: 'Frequently Asked Questions',
        description: 'We answered the most curious questions for you',
      },
      {
        languageCode: 'de',
        title: 'Häufig gestellte Fragen',
        description: 'Wir haben die am häufigsten gestellten Fragen für Sie beantwortet',
      },
      {
        languageCode: 'fr',
        title: 'Questions Fréquemment Posées',
        description: 'Nous avons répondu aux questions les plus fréquentes pour vous',
      },
      {
        languageCode: 'es',
        title: 'Preguntas Frecuentes',
        description: 'Hemos respondido las preguntas más frecuentes para usted',
      },
      {
        languageCode: 'ru',
        title: 'Часто задаваемые вопросы',
        description: 'Мы ответили на самые частые вопросы для вас',
      },
      {
        languageCode: 'it',
        title: 'Domande Frequenti',
        description: 'Abbiamo risposto alle domande più frequenti per voi',
      },
    ];

    for (const translation of translations) {
      const language = languages.find(l => l.code === translation.languageCode);
      
      if (language) {
        await prisma.faqSectionTranslation.upsert({
          where: {
            faqSectionId_languageCode: {
              faqSectionId: 'main',
              languageCode: translation.languageCode,
            },
          },
          update: {
            title: translation.title,
            description: translation.description,
          },
          create: {
            faqSectionId: 'main',
            languageCode: translation.languageCode,
            title: translation.title,
            description: translation.description,
          },
        });

        console.log(`${translation.languageCode} çevirisi oluşturuldu`);
      }
    }

    console.log('SSS bölüm başlıkları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('SSS bölüm başlıkları oluşturulurken hata:', error);
    throw error;
  }
}

// Script'i çalıştır
seedFaqSection()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });