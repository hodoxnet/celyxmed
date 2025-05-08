import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Named import olarak değiştirildi
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm slider'ları listele
export const GET = withAdmin(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang') || 'tr'; // Varsayılan olarak Türkçe

    const sliders = await prisma.slider.findMany({
      include: {
        translations: {
          where: { languageCode },
          take: 1,
        },
      },
      orderBy: { order: 'asc' }, // Sıralamaya göre getir
    });

    const formattedSliders = sliders.map(slider => {
      const translation = slider.translations[0];
      return {
        id: slider.id,
        backgroundImageUrl: slider.backgroundImageUrl,
        order: slider.order,
        isActive: slider.isActive,
        createdAt: slider.createdAt,
        updatedAt: slider.updatedAt,
        // Çeviri varsa onun alanlarını döndür
        title: translation?.title || null,
        description: translation?.description || null,
        button1Text: translation?.button1Text || null,
        button1Link: translation?.button1Link || null,
        button2Text: translation?.button2Text || null,
        button2Link: translation?.button2Link || null,
        hasTranslation: !!translation,
        languageCode: translation?.languageCode || languageCode,
      };
    });

    return NextResponse.json(formattedSliders);
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json({ message: 'Slider\'lar getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni slider ekle
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const newSlider = await tx.slider.create({
        data: {
          backgroundImageUrl: body.backgroundImageUrl,
          order: body.order || 0,
          isActive: body.isActive === undefined ? true : body.isActive,
        },
      });

      if (body.translations && Array.isArray(body.translations)) {
        for (const translation of body.translations) {
          if (translation.languageCode && translation.title) { // Minimum gerekli alanlar
            await tx.sliderTranslation.create({
              data: {
                sliderId: newSlider.id,
                languageCode: translation.languageCode,
                title: translation.title,
                description: translation.description,
                button1Text: translation.button1Text,
                button1Link: translation.button1Link,
                button2Text: translation.button2Text,
                button2Link: translation.button2Link,
              },
            });
          }
        }
      }
      
      return await tx.slider.findUnique({
        where: { id: newSlider.id },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating slider:", error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message || 'Slider oluşturulurken bir hata oluştu.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Slider oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
