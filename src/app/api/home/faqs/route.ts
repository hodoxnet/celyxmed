import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const langParams = searchParams.get('lang');
    
    let lang = langParams;

    if (!lang) {
      const defaultLanguage = await prisma.language.findFirst({
        where: { isDefault: true },
      });
      lang = defaultLanguage?.code || 'tr'; // Varsayılan dil 'tr' veya veritabanındaki varsayılan
    }

    const faqsFromDb = await prisma.faq.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        translations: {
          where: {
            languageCode: lang,
          },
        },
      },
    });

    // prisma.faq.findMany zaten istenen dildeki çeviriyi (varsa) getiriyor.
    // Eğer çeviri yoksa, faq.translations dizisi boş olacaktır.
    const localizedFaqs = faqsFromDb.map(faq => {
      const translation = faq.translations[0]; // En fazla bir çeviri olmalı

      if (translation && translation.question && translation.answer) {
        return {
          id: faq.id,
          order: faq.order,
          isPublished: faq.isPublished,
          question: translation.question,
          answer: translation.answer,
        };
      }
      return null; // Eğer çeviri yoksa veya soru/cevap boşsa null döndür
    }).filter(faq => faq !== null); // Null olanları filtrele

    return NextResponse.json(localizedFaqs);
  } catch (error) {
    console.error('[HOME_FAQS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
