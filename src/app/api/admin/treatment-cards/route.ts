import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm tedavi kartlarını listele
export const GET = withAdmin(async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    const items = await prisma.treatmentSectionItem.findMany({
      include: {
        translations: languageCode
          ? { where: { languageCode } }
          : true, // Eğer belirli bir dil belirtilmemişse tüm çevirileri getir
      },
      orderBy: { order: 'asc' },
    });

    // Eğer belirli bir dil belirtilmişse eski formatı koru
    if (languageCode) {
      const formattedItems = items.map(item => {
        const translation = item.translations[0];
        return {
          id: item.id,
          imageUrl: item.imageUrl,
          order: item.order,
          isPublished: item.isPublished,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          title: translation?.title || null,
          description: translation?.description || null,
          linkUrl: translation?.linkUrl || null,
          hasTranslation: !!translation,
          languageCode: translation?.languageCode || languageCode,
        };
      });
      return NextResponse.json(formattedItems);
    }

    // Eğer dil belirtilmemişse, tüm çeviriler içeren tam kayıtları döndür
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching treatment cards:", error);
    return NextResponse.json({ message: 'Tedavi kartları getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni tedavi kartı ekle
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { imageUrl, order, isPublished, translations } = body;

    if (!imageUrl) {
      return NextResponse.json({ message: 'Resim URLsi gereklidir.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newItem = await tx.treatmentSectionItem.create({
        data: {
          imageUrl,
          order: order ?? 0,
          isPublished: isPublished === undefined ? true : isPublished,
        },
      });

      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          if (translation.languageCode) {
            await tx.treatmentSectionItemTranslation.create({
              data: {
                treatmentSectionItemId: newItem.id,
                languageCode: translation.languageCode,
                title: translation.title || "",
                description: translation.description || "",
                linkUrl: translation.linkUrl || "",
              },
            });
          } else {
            console.warn(`Skipping translation for item ${newItem.id} due to missing language code`);
          }
        }
      }
      
      return await tx.treatmentSectionItem.findUnique({
        where: { id: newItem.id },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating treatment card:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Tedavi kartı oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
