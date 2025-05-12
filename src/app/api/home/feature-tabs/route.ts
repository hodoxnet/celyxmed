import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en'; // Varsayılan dil 'en'

    const items = await prisma.homePageFeatureTabItem.findMany({
      where: {
        isPublished: true,
        translations: {
          some: {
            languageCode: locale,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        translations: {
          where: {
            languageCode: locale,
          },
        },
      },
    });

    // İstenen dilde çevirisi olmayan öğeleri filtrele (bu normalde olmamalı ama bir güvence)
    // ve çevirileri direkt olarak ana objeye map'le
    const localizedItems = items
      .filter(item => item.translations.length > 0)
      .map(item => {
        const translation = item.translations[0];
        return {
          id: item.id,
          value: item.value,
          imageUrl: item.imageUrl,
          order: item.order,
          isPublished: item.isPublished,
          // Çeviri alanları
          triggerText: translation.triggerText,
          tagText: translation.tagText,
          heading: translation.heading,
          description: translation.description,
          buttonText: translation.buttonText,
          buttonLink: translation.buttonLink,
          languageCode: translation.languageCode,
        };
      });

    return NextResponse.json(localizedItems);
  } catch (error) {
    console.error('[HOME_FEATURE_TABS_GET]', error);
    return NextResponse.json({ error: 'Veriler alınırken bir hata oluştu.' }, { status: 500 });
  }
}
