import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to create initial ConsultOnlineSection...');

    // Ana kaydı oluştur
    const consultOnlineSection = await prisma.consultOnlineSection.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e2167ec2780fa3209e8f_book-your-free-consultation.avif',
      }
    });

    console.log('Created main ConsultOnlineSection:', consultOnlineSection);

    // Mevcut dilleri al
    const languages = await prisma.language.findMany({
      where: {
        isActive: true
      }
    });

    // Her dil için çeviri oluştur
    for (const language of languages) {
      const translation = await prisma.consultOnlineSectionTranslation.upsert({
        where: {
          consultOnlineSectionId_languageCode: {
            consultOnlineSectionId: 'main',
            languageCode: language.code
          }
        },
        update: {},
        create: {
          consultOnlineSectionId: 'main',
          languageCode: language.code,
          tagText: 'Be Your Best',
          title: 'Consult with Our Doctors Online',
          description: 'Get expert advice directly from our specialists. Book your free online consultation and discover the best treatment options tailored for you.',
          avatarText: 'Choose Your Doctor,\nAsk Your Questions',
          buttonText: 'Book Your Free Consultation Today',
          buttonLink: '/contact'
        }
      });

      console.log(`Created translation for language ${language.code}:`, translation);
    }

    // Doktor Avatarlar ekle
    const doctorAvatars = [
      {
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e70a4297a93e1dcb6012_op-dr-kemal-aytuglu-plastic-surgeons-in-turkey.avif',
        altText: 'Doctor 1',
        order: 0
      },
      {
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e7117f1946daa107eae0_prof-dr-oge-tascilar-bariatric-surgeons-in-turkey.avif',
        altText: 'Doctor 2',
        order: 1
      },
      {
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/6780e7187a4c35c9ccfe172d_dr-fikri-can-ayik-dental-doctor-in-turkey.avif',
        altText: 'Doctor 3',
        order: 2
      }
    ];

    // Önce mevcut avatarları temizle
    await prisma.consultOnlineDoctorAvatar.deleteMany({
      where: {
        consultOnlineSectionId: 'main'
      }
    });

    // Yeni avatarları oluştur
    for (const avatar of doctorAvatars) {
      const createdAvatar = await prisma.consultOnlineDoctorAvatar.create({
        data: {
          consultOnlineSectionId: 'main',
          imageUrl: avatar.imageUrl,
          altText: avatar.altText,
          order: avatar.order
        }
      });

      console.log('Created doctor avatar:', createdAvatar);
    }

    console.log('Successfully created initial ConsultOnlineSection data');
  } catch (error) {
    console.error('Error creating ConsultOnlineSection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();