import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { TreatmentSectionItemTranslation } from '@/generated/prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'tr'; // Varsayılan dil tr

    const items = await prisma.treatmentSectionItem.findMany({
      where: {
        isPublished: true, // Sadece yayınlanmış olanları getir
      },
      include: {
        translations: {
          where: { languageCode: lang },
        },
      },
      orderBy: {
        order: 'asc', // Sıralamaya göre getir
      },
    });

    // Her bir item için, istenen dilde çeviri yoksa varsayılan dildeki çeviriyi bul veya boş çeviri oluştur
    const processedItems = await Promise.all(
      items.map(async (item) => {
        let foundTranslation = item.translations[0];

        if (!foundTranslation) {
          const defaultLanguage = await prisma.language.findFirst({ where: { isDefault: true } });
          if (defaultLanguage) {
            const defaultDbTranslation = await prisma.treatmentSectionItemTranslation.findFirst({
              where: {
                treatmentSectionItemId: item.id,
                languageCode: defaultLanguage.code,
              },
            });
            if (defaultDbTranslation) {
              foundTranslation = defaultDbTranslation;
            }
          }
        }

        const responseTranslation: TreatmentSectionItemTranslation = foundTranslation
          ? foundTranslation
          : {
              id: `fallback-item-${item.id}-${lang}-${Date.now()}`,
              languageCode: lang,
              treatmentSectionItemId: item.id,
              title: '',
              description: '',
              linkUrl: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
        
        return {
          id: item.id,
          imageUrl: item.imageUrl,
          order: item.order,
          isPublished: item.isPublished, // Frontend'de gerekmeyebilir ama tutarlılık için eklendi
          createdAt: item.createdAt, // Frontend'de gerekmeyebilir
          updatedAt: item.updatedAt, // Frontend'de gerekmeyebilir
          translation: responseTranslation,
        };
      })
    );

    return NextResponse.json(processedItems);
  } catch (error) {
    console.error("Error fetching treatment cards for home:", error);
    return NextResponse.json({ message: 'Tedavi kartları getirilirken bir hata oluştu.' }, { status: 500 });
  }
}
