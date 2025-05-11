import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { FaqTranslation } from '@/generated/prisma/client';

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

    const localizedFaqs = await Promise.all(faqsFromDb.map(async (faq) => {
      let translation = faq.translations.find(t => t.languageCode === lang);

      // İstenen dilde çeviri yoksa ve lang parametresiyle gelinmediyse (yani varsayılan dil denendiyse)
      // ya da istenen dilde çeviri yoksa ve lang parametresiyle gelinmişse,
      // veritabanındaki varsayılan dildeki çeviriyi bulmaya çalış
      if (!translation && langParams) { // Sadece lang parametresi varsa ve çeviri yoksa varsayılana bak
        const defaultLanguage = await prisma.language.findFirst({ where: { isDefault: true } });
        if (defaultLanguage && defaultLanguage.code !== lang) { // Eğer zaten varsayılan dil değilse
          const defaultTranslation = await prisma.faqTranslation.findFirst({
            where: {
              faqId: faq.id,
              languageCode: defaultLanguage.code,
            },
          });
          if (defaultTranslation) {
            translation = defaultTranslation;
          }
        }
      }
      
      // Eğer hala çeviri yoksa, boş bir çeviri nesnesi kullan
      const finalTranslation: Pick<FaqTranslation, 'question' | 'answer'> = translation
        ? { question: translation.question, answer: translation.answer }
        : { question: '', answer: '' };

      return {
        id: faq.id,
        order: faq.order,
        isPublished: faq.isPublished,
        question: finalTranslation.question,
        answer: finalTranslation.answer,
      };
    }));

    // Sorusu veya cevabı olmayanları filtrele (isteğe bağlı, duruma göre karar verilir)
    const filteredFaqs = localizedFaqs.filter(faq => faq.question && faq.answer);

    return NextResponse.json(filteredFaqs);
  } catch (error) {
    console.error('[HOME_FAQS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
