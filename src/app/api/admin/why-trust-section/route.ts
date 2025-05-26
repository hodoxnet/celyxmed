import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: WhyTrustSection için verileri getir
export const GET = withAdmin(async (req: Request) => {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    // WhyTrustSection ve çevirilerini getir
    const whyTrustSection = await prisma.whyTrustSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
        trustPoints: {
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
    if (!whyTrustSection) {
      const newWhyTrustSection = await prisma.whyTrustSection.create({
        data: {
          id: 'main',
        },
      });

      return NextResponse.json({
        ...newWhyTrustSection,
        translations: [],
        trustPoints: [],
      });
    }

    return NextResponse.json(whyTrustSection);
  } catch (error) {
    console.error("Error fetching why trust section:", error);
    return NextResponse.json({ message: 'WhyTrustSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: WhyTrustSection ana bilgilerini güncelle
export const PUT = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { backgroundImage, translations } = body;

    // Ana kaydı al veya yeni oluştur
    let whyTrustSection = await prisma.whyTrustSection.findUnique({
      where: { id: 'main' },
    });

    if (!whyTrustSection) {
      whyTrustSection = await prisma.whyTrustSection.create({
        data: {
          id: 'main',
          backgroundImage: backgroundImage || null,
        },
      });
    } else {
      // Ana kaydı güncelle
      whyTrustSection = await prisma.whyTrustSection.update({
        where: { id: 'main' },
        data: {
          backgroundImage: backgroundImage,
        },
      });
    }

    // Çevirileri güncelle veya ekle
    if (translations && Array.isArray(translations)) {
      // Tüm çevirileri transaction içinde güncelle
      await prisma.$transaction(async (tx) => {
        for (const translation of translations) {
          const { languageCode, title, subtitle } = translation;

          if (!languageCode) {
            throw new Error('Dil kodu belirtilmedi');
          }

          // Mevcut çeviriyi bul
          const existingTranslation = await tx.whyTrustSectionTranslation.findUnique({
            where: {
              whyTrustSectionId_languageCode: {
                whyTrustSectionId: 'main',
                languageCode,
              },
            },
          });

          // Ya güncelle ya da yeni oluştur
          if (existingTranslation) {
            await tx.whyTrustSectionTranslation.update({
              where: { id: existingTranslation.id },
              data: {
                title,
                subtitle,
              },
            });
          } else {
            await tx.whyTrustSectionTranslation.create({
              data: {
                whyTrustSectionId: 'main',
                languageCode,
                title,
                subtitle,
              },
            });
          }
        }
      });
    }

    // Güncel veriyi getir
    const updatedWhyTrustSection = await prisma.whyTrustSection.findUnique({
      where: { id: 'main' },
      include: { 
        translations: true,
        trustPoints: {
          include: {
            translations: true,
          },
          orderBy: { order: 'asc' }
        } 
      },
    });

    return NextResponse.json(updatedWhyTrustSection);
  } catch (error) {
    console.error("Error updating why trust section:", error);
    return NextResponse.json({ message: 'WhyTrustSection güncelleme sırasında bir hata oluştu.' }, { status: 500 });
  }
});