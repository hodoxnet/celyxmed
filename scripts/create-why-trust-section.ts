import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to create initial WhyTrustSection...');

    // Ana kaydı oluştur
    const whyTrustSection = await prisma.whyTrustSection.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        backgroundImage: '/uploads/why-trust/background.jpg', // Placeholder - güncellenmesi gerekebilir
      }
    });

    console.log('Created main WhyTrustSection:', whyTrustSection);

    // Mevcut dilleri al
    const languages = await prisma.language.findMany({
      where: {
        isActive: true
      }
    });

    // Her dil için çeviri oluştur
    for (const language of languages) {
      const translation = await prisma.whyTrustSectionTranslation.upsert({
        where: {
          whyTrustSectionId_languageCode: {
            whyTrustSectionId: 'main',
            languageCode: language.code
          }
        },
        update: {},
        create: {
          whyTrustSectionId: 'main',
          languageCode: language.code,
          title: 'Why Trust Celyxmed?',
          subtitle: 'Your Health, Our Priority'
        }
      });

      console.log(`Created translation for language ${language.code}:`, translation);
    }

    // Trust Points ekle
    const trustPoints = [
      {
        number: '01',
        order: 0,
        translations: [
          { title: 'Experienced Specialists', description: 'Our team consists of highly experienced specialists with years of expertise in their fields.' }
        ]
      },
      {
        number: '02',
        order: 1,
        translations: [
          { title: 'Advanced Technology', description: 'We use the latest medical technology and techniques to ensure the best outcomes for our patients.' }
        ]
      },
      {
        number: '03',
        order: 2,
        translations: [
          { title: 'Personalized Care', description: 'We provide personalized care plans tailored to each patient\'s unique needs and concerns.' }
        ]
      },
      {
        number: '04',
        order: 3,
        translations: [
          { title: 'International Standards', description: 'Our facilities and procedures follow strict international medical standards and protocols.' }
        ]
      }
    ];

    // Trust Points ekle
    for (const point of trustPoints) {
      // Ana nokta kaydını oluştur
      const createdPoint = await prisma.whyTrustPoint.create({
        data: {
          whyTrustSectionId: 'main',
          number: point.number,
          order: point.order
        }
      });

      // Her dil için çeviriler
      for (const language of languages) {
        const defaultTranslation = point.translations[0]; // İlk çeviriyi varsayılan olarak kullan
        
        await prisma.whyTrustPointTranslation.create({
          data: {
            whyTrustPointId: createdPoint.id,
            languageCode: language.code,
            title: defaultTranslation.title,
            description: defaultTranslation.description
          }
        });
      }

      console.log(`Created trust point: ${point.number} - ${point.translations[0].title}`);
    }

    console.log('Successfully created initial WhyTrustSection data');
  } catch (error) {
    console.error('Error creating WhyTrustSection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();