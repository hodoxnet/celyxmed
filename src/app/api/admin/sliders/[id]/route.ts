import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Named import olarak değiştirildi
import { withAdmin } from '@/middleware/withAdmin';

interface Params {
  params: { id: string };
}

// GET: Belirli bir slider'ı getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang'); // Belirli bir dil istenirse

    const slider = await prisma.slider.findUnique({
      where: { id },
      include: {
        translations: languageCode
          ? { where: { languageCode } }
          : true, // Tüm dilleri getir
      },
    });

    if (!slider) {
      return NextResponse.json({ message: 'Slider bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json(slider);
  } catch (error) {
    console.error(`Error fetching slider with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Slider getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Slider'ı güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    const body = await req.json();

    const existingSlider = await prisma.slider.findUnique({
      where: { id },
    });

    if (!existingSlider) {
      return NextResponse.json({ message: 'Slider bulunamadı.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.slider.update({
        where: { id },
        data: {
          backgroundImageUrl: body.backgroundImageUrl,
          order: body.order,
          isActive: body.isActive,
        },
      });

      if (body.translations && Array.isArray(body.translations)) {
        for (const translation of body.translations) {
          if (translation.languageCode && translation.title) { // Minimum gerekli alanlar
            const existingTranslation = await tx.sliderTranslation.findUnique({
              where: {
                sliderId_languageCode: {
                  sliderId: id,
                  languageCode: translation.languageCode,
                },
              },
            });

            if (existingTranslation) {
              await tx.sliderTranslation.update({
                where: { id: existingTranslation.id },
                data: {
                  title: translation.title,
                  description: translation.description,
                  button1Text: translation.button1Text,
                  button1Link: translation.button1Link,
                  button2Text: translation.button2Text,
                  button2Link: translation.button2Link,
                },
              });
            } else {
              await tx.sliderTranslation.create({
                data: {
                  sliderId: id,
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
      }
      
      return await tx.slider.findUnique({
        where: { id },
        include: {
          translations: true,
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating slider with ID ${params.id}:`, error);
     if (error instanceof Error) {
        return NextResponse.json({ message: error.message || 'Slider güncellenirken bir hata oluştu.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Slider güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Slider'ı sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;

    const existingSlider = await prisma.slider.findUnique({
      where: { id },
    });

    if (!existingSlider) {
      return NextResponse.json({ message: 'Slider bulunamadı.' }, { status: 404 });
    }

    await prisma.slider.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Slider başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting slider with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Slider silinirken bir hata oluştu.' }, { status: 500 });
  }
});
