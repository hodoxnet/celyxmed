import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to create initial SuccessStoriesSection...');

    // Ana kaydı oluştur
    const successStoriesSection = await prisma.successStoriesSection.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main'
      }
    });

    console.log('Created main SuccessStoriesSection:', successStoriesSection);

    // Mevcut dilleri al
    const languages = await prisma.language.findMany({
      where: {
        isActive: true
      }
    });

    // Her dil için çeviri oluştur
    for (const language of languages) {
      const translation = await prisma.successStoriesSectionTranslation.upsert({
        where: {
          successStoriesSectionId_languageCode: {
            successStoriesSectionId: 'main',
            languageCode: language.code
          }
        },
        update: {},
        create: {
          successStoriesSectionId: 'main',
          languageCode: language.code,
          title: '10,000+ Successful Treatments, Your Health in Trusted Hands',
          description: 'Join thousands of satisfied patients who have transformed their lives with our expert care. Our commitment to excellence ensures outstanding results.',
          consultButtonText: 'Book Your Free Consultation',
          consultButtonLink: '/contact',
          discoverButtonText: 'Discover Success Stories',
          discoverButtonLink: '/success-stories'
        }
      });

      console.log(`Created translation for language ${language.code}:`, translation);
    }

    // Galeri resimleri ekle
    const galleryImages = [
      {
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/678114c5ff9a10a6a4b1ae85_breast-augmentation-clinic-istanbul-turkey.avif',
        altText: 'Breast Augmentation Clinic',
        order: 0
      },
      {
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/678114c8c3f2dd5396d73e85_hair-transplant-clinic-istanbul-turkey.avif',
        altText: 'Hair Transplant Clinic',
        order: 1
      },
      {
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/678114c9cd8bf9a8222f3c1a_dental-implants-turkey-clinic.avif',
        altText: 'Dental Implants Clinic',
        order: 2
      }
    ];

    // Galeri resimlerini temizle ve yeniden oluştur
    await prisma.successStoriesImage.deleteMany({
      where: {
        successStoriesSectionId: 'main'
      }
    });

    for (const image of galleryImages) {
      const createdImage = await prisma.successStoriesImage.create({
        data: {
          successStoriesSectionId: 'main',
          imageUrl: image.imageUrl,
          altText: image.altText,
          order: image.order
        }
      });

      console.log('Created gallery image:', createdImage);
    }

    // Testimonials ekle
    const testimonials = [
      {
        stars: 5,
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/678114cfcd8bf9a8222f7a30_hair-transplant-before-after-turkey.avif',
        order: 0,
        translations: [
          {
            text: "I couldn't be happier with my hair transplant results! The team at Celyxmed was professional from start to finish. My new hairline looks completely natural.",
            author: "John D. (United Kingdom 🇬🇧)",
            treatment: "Hair Transplant"
          }
        ]
      },
      {
        stars: 5,
        imageUrl: 'https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/678114d2c3f2dd5396d75dd4_dental-veneers-clinic-turkey-istanbul.avif',
        order: 1,
        translations: [
          {
            text: "My dental veneers look amazing! The quality of care at Celyxmed exceeded all my expectations. I can finally smile with confidence.",
            author: "Sarah M. (Germany 🇩🇪)",
            treatment: "Dental Veneers"
          }
        ]
      }
    ];

    // Testimonials temizle ve yeniden oluştur
    await prisma.successStoriesTestimonial.deleteMany({
      where: {
        successStoriesSectionId: 'main'
      }
    });

    for (const testimonial of testimonials) {
      // Ana testimonial kaydını oluştur
      const createdTestimonial = await prisma.successStoriesTestimonial.create({
        data: {
          successStoriesSectionId: 'main',
          stars: testimonial.stars,
          imageUrl: testimonial.imageUrl,
          order: testimonial.order
        }
      });

      // Her dil için çeviriler
      for (const language of languages) {
        const defaultTranslation = testimonial.translations[0]; // İlk çeviriyi varsayılan olarak kullan
        
        await prisma.successStoriesTestimonialTranslation.create({
          data: {
            testimonialId: createdTestimonial.id,
            languageCode: language.code,
            text: defaultTranslation.text,
            author: defaultTranslation.author,
            treatment: defaultTranslation.treatment
          }
        });
      }

      console.log(`Created testimonial for ${testimonial.translations[0].author}`);
    }

    console.log('Successfully created initial SuccessStoriesSection data');
  } catch (error) {
    console.error('Error creating SuccessStoriesSection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();