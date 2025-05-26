import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Klinik Showcase Ana İçeriğini Getir
export const GET = withAdmin(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    // Ana içeriği getir (tek kayıt, ID = "main")
    let content = await prisma.clinicShowcase.findUnique({
      where: { id: "main" },
      include: {
        translations: languageCode
          ? { where: { languageCode } }
          : true, // Eğer dil belirtilmişse filtreleyerek getir
        images: {
          orderBy: { order: 'asc' },
          where: { isPublished: true }
        }
      },
    });

    // Eğer içerik yoksa, otomatik olarak oluştur
    if (!content) {
      content = await prisma.clinicShowcase.create({
        data: {
          id: "main"
        },
        include: {
          translations: true,
          images: true
        }
      });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching clinic showcase content:", error);
    return NextResponse.json({ message: 'Klinik tanıtım içeriği getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST/PUT: Klinik Showcase İçeriğini Güncelle veya Oluştur
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { translations } = body;

    if (!translations || !Array.isArray(translations)) {
      return NextResponse.json({ message: 'Çeviriler gereklidir ve bir dizi olmalıdır.' }, { status: 400 });
    }

    // Ana içeriği bul veya oluştur
    let clinicShowcase = await prisma.clinicShowcase.findUnique({
      where: { id: "main" },
    });

    if (!clinicShowcase) {
      clinicShowcase = await prisma.clinicShowcase.create({
        data: { id: "main" }
      });
    }

    // Her dil için çevirileri güncelle
    const translationPromises = translations.map(async (translation: any) => {
      const { languageCode, title, description, buttonText, buttonLink } = translation;

      if (!languageCode) {
        console.warn("Skipping translation due to missing language code");
        return null;
      }

      // Bu dil için mevcut çeviriyi kontrol et
      const existingTranslation = await prisma.clinicShowcaseTranslation.findUnique({
        where: {
          clinicShowcaseId_languageCode: {
            clinicShowcaseId: "main",
            languageCode,
          }
        }
      });

      // Varsayılan değerleri tanımla
      const defaultTitle = 'State-of-the-Art Clinic';
      const defaultDescription = 'Our modern clinic is designed to provide the highest standards of safety, hygiene, and comfort.';
      const defaultButtonText = 'Explore Our Clinic';
      const defaultButtonLink = '/klinigimiz';

      // Varsa güncelle, yoksa oluştur
      if (existingTranslation) {
        return await prisma.clinicShowcaseTranslation.update({
          where: { id: existingTranslation.id },
          data: {
            title: title || existingTranslation.title || defaultTitle,
            description: description || existingTranslation.description || defaultDescription,
            buttonText: buttonText || existingTranslation.buttonText || defaultButtonText,
            buttonLink: buttonLink || existingTranslation.buttonLink || defaultButtonLink,
          }
        });
      } else {
        return await prisma.clinicShowcaseTranslation.create({
          data: {
            clinicShowcaseId: "main",
            languageCode,
            title: title || defaultTitle,
            description: description || defaultDescription,
            buttonText: buttonText || defaultButtonText,
            buttonLink: buttonLink || defaultButtonLink,
          }
        });
      }
    });

    await Promise.all(translationPromises);

    const updatedContent = await prisma.clinicShowcase.findUnique({
      where: { id: "main" },
      include: {
        translations: true,
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Error updating clinic showcase content:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Klinik tanıtım içeriği güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});