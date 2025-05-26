import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

// Tüm SSS'leri ve çevirilerini getir (GET)
export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: {
        order: 'asc',
      },
      include: {
        translations: {
          orderBy: {
            languageCode: 'asc',
          },
        },
      },
    });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('[ADMIN_FAQS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// Yeni bir SSS oluştur (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order, isPublished, translations } = body;

    // Gerekli alanların kontrolü
    if (translations === undefined || !Array.isArray(translations) || translations.length === 0) {
      return new NextResponse('Missing required fields: translations array must be provided and be non-empty.', { status: 400 });
    }

    for (const trans of translations) {
      if (!trans.languageCode || !trans.question || !trans.answer) {
        return new NextResponse(
          `Missing required fields in translation for languageCode: ${trans.languageCode || 'unknown'}. Question and answer are required.`,
          { status: 400 }
        );
      }
    }
    
    const newFaq = await prisma.faq.create({
      data: {
        order: order || 0,
        isPublished: isPublished === undefined ? true : isPublished,
        translations: {
          create: translations.map((t: { languageCode: string; question: string; answer: string }) => ({
            languageCode: t.languageCode,
            question: t.question,
            answer: t.answer,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_FAQS_POST]', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Benzersizlik kısıtlaması ihlali gibi bilinen hatalar
      if (error.code === 'P2002') {
        return new NextResponse('A FAQ with the same language and content might already exist or other unique constraint violated.', { status: 409 });
      }
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}
