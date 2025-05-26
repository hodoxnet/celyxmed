import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: SuccessStoriesSection için verileri getir
export const GET = withAdmin(async (req: Request) => {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    // SuccessStoriesSection ve çevirilerini getir
    const successStoriesSection = await prisma.successStoriesSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
        galleryImages: {
          orderBy: { order: 'asc' }
        },
        testimonials: {
          include: {
            translations: languageCode 
              ? { where: { languageCode } } 
              : true,
          },
          orderBy: { order: 'asc' }
        }
      },
    });

    // Eğer kayıt yoksa, yeni bir kayıt oluştur
    if (!successStoriesSection) {
      const newSuccessStoriesSection = await prisma.successStoriesSection.create({
        data: {
          id: 'main',
        },
      });

      return NextResponse.json({
        ...newSuccessStoriesSection,
        translations: [],
        galleryImages: [],
        testimonials: [],
      });
    }

    return NextResponse.json(successStoriesSection);
  } catch (error) {
    console.error("Error fetching success stories section:", error);
    return NextResponse.json({ message: 'SuccessStoriesSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: SuccessStoriesSection ana bilgilerini güncelle 
export const PUT = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { translations } = body;

    // Ana kaydı al veya yeni oluştur
    let successStoriesSection = await prisma.successStoriesSection.findUnique({
      where: { id: 'main' },
    });

    if (!successStoriesSection) {
      successStoriesSection = await prisma.successStoriesSection.create({
        data: {
          id: 'main',
        },
      });
    }

    // Çevirileri güncelle veya ekle
    if (translations && Array.isArray(translations)) {
      // Tüm çevirileri transaction içinde güncelle
      await prisma.$transaction(async (tx) => {
        for (const translation of translations) {
          const { 
            languageCode, 
            title, 
            description,
            consultButtonText,
            consultButtonLink,
            discoverButtonText,
            discoverButtonLink
          } = translation;

          if (!languageCode) {
            throw new Error('Dil kodu belirtilmedi');
          }

          // Mevcut çeviriyi bul
          const existingTranslation = await tx.successStoriesSectionTranslation.findUnique({
            where: {
              successStoriesSectionId_languageCode: {
                successStoriesSectionId: 'main',
                languageCode,
              },
            },
          });

          // Ya güncelle ya da yeni oluştur
          if (existingTranslation) {
            await tx.successStoriesSectionTranslation.update({
              where: { id: existingTranslation.id },
              data: {
                title,
                description,
                consultButtonText,
                consultButtonLink,
                discoverButtonText,
                discoverButtonLink,
              },
            });
          } else {
            await tx.successStoriesSectionTranslation.create({
              data: {
                successStoriesSectionId: 'main',
                languageCode,
                title,
                description,
                consultButtonText,
                consultButtonLink,
                discoverButtonText,
                discoverButtonLink,
              },
            });
          }
        }
      });
    }

    // Güncel veriyi getir
    const updatedSuccessStoriesSection = await prisma.successStoriesSection.findUnique({
      where: { id: 'main' },
      include: { 
        translations: true,
        galleryImages: {
          orderBy: { order: 'asc' }
        },
        testimonials: {
          include: {
            translations: true,
          },
          orderBy: { order: 'asc' }
        }
      },
    });

    return NextResponse.json(updatedSuccessStoriesSection);
  } catch (error) {
    console.error("Error updating success stories section:", error);
    return NextResponse.json({ message: 'SuccessStoriesSection güncelleme sırasında bir hata oluştu.' }, { status: 500 });
  }
});