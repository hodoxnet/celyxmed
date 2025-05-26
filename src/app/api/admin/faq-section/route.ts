import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const faqSection = await prisma.faqSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: true,
      },
    });

    if (!faqSection) {
      // Eğer kayıt yoksa, boş bir yapı döndür
      return NextResponse.json({
        id: 'main',
        translations: [],
      });
    }

    return NextResponse.json(faqSection);
  } catch (error) {
    console.error('[FAQ_SECTION_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { languageCode, title, description } = await req.json();

    if (!languageCode || !title) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Önce FaqSection kaydının var olduğundan emin ol
    let faqSection = await prisma.faqSection.findUnique({
      where: { id: 'main' },
    });

    if (!faqSection) {
      // Eğer yoksa oluştur
      faqSection = await prisma.faqSection.create({
        data: { id: 'main' },
      });
    }

    // Şimdi çeviriyi güncelle veya oluştur
    const existingTranslation = await prisma.faqSectionTranslation.findUnique({
      where: {
        faqSectionId_languageCode: {
          faqSectionId: 'main',
          languageCode: languageCode,
        },
      },
    });

    let translation;
    if (existingTranslation) {
      // Güncelle
      translation = await prisma.faqSectionTranslation.update({
        where: { id: existingTranslation.id },
        data: {
          title,
          description: description || null,
        },
      });
    } else {
      // Oluştur
      translation = await prisma.faqSectionTranslation.create({
        data: {
          faqSectionId: 'main',
          languageCode,
          title,
          description: description || null,
        },
      });
    }

    // Güncel veriyi döndür
    const updatedSection = await prisma.faqSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('[FAQ_SECTION_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}