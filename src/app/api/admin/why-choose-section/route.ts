import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: WhyChooseSection için verileri getir
export const GET = withAdmin(async (req: Request) => {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    // WhyChooseSection ve çevirilerini getir
    const whyChooseSection = await prisma.whyChooseSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
      },
    });

    // Eğer kayıt yoksa, yeni bir kayıt oluştur
    if (!whyChooseSection) {
      const newWhyChooseSection = await prisma.whyChooseSection.create({
        data: {
          id: 'main',
        },
      });

      return NextResponse.json({
        ...newWhyChooseSection,
        translations: [],
      });
    }

    return NextResponse.json(whyChooseSection);
  } catch (error) {
    console.error("Error fetching why choose section:", error);
    return NextResponse.json({ message: 'WhyChooseSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: WhyChooseSection için çevirileri güncelle
export const PUT = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { translations } = body;

    // Ana kaydı al veya yeni oluştur
    let whyChooseSection = await prisma.whyChooseSection.findUnique({
      where: { id: 'main' },
    });

    if (!whyChooseSection) {
      whyChooseSection = await prisma.whyChooseSection.create({
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
          const { languageCode, youtubeVideoId, title, description, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink } = translation;

          if (!languageCode) {
            throw new Error('Dil kodu belirtilmedi');
          }

          // Mevcut çeviriyi bul
          const existingTranslation = await tx.whyChooseSectionTranslation.findUnique({
            where: {
              whyChooseSectionId_languageCode: {
                whyChooseSectionId: 'main',
                languageCode,
              },
            },
          });

          // Ya güncelle ya da yeni oluştur
          if (existingTranslation) {
            await tx.whyChooseSectionTranslation.update({
              where: { id: existingTranslation.id },
              data: {
                youtubeVideoId,
                title,
                description,
                primaryButtonText,
                primaryButtonLink,
                secondaryButtonText,
                secondaryButtonLink,
              },
            });
          } else {
            await tx.whyChooseSectionTranslation.create({
              data: {
                whyChooseSectionId: 'main',
                languageCode,
                youtubeVideoId,
                title,
                description,
                primaryButtonText,
                primaryButtonLink,
                secondaryButtonText,
                secondaryButtonLink,
              },
            });
          }
        }
      });
    }

    // Güncel veriyi getir
    const updatedWhyChooseSection = await prisma.whyChooseSection.findUnique({
      where: { id: 'main' },
      include: { translations: true },
    });

    return NextResponse.json(updatedWhyChooseSection);
  } catch (error) {
    console.error("Error updating why choose section:", error);
    return NextResponse.json({ message: 'WhyChooseSection güncelleme sırasında bir hata oluştu.' }, { status: 500 });
  }
});