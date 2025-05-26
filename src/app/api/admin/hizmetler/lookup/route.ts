import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Yayınlanmış hizmetleri lookup için listele (ID ve Başlık)
export const GET = withAdmin(async (req: Request) => {
  try {
    // const defaultLanguageCode = 'tr'; // Varsayılan dil

    const hizmetler = await prisma.hizmet.findMany({
      where: { published: true }, // Sadece yayınlanmış olanlar
      select: {
        id: true,
        translations: {
          // Varsayılan dildeki veya mevcut herhangi bir dildeki başlığı almak için
          // orderBy: { language: { isDefault: 'desc' } },
          // take: 1,
          select: {
            title: true,
            languageCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // İstemciye daha basit bir formatta döndür
    const formattedHizmetler = hizmetler.map(hizmet => {
      const title = hizmet.translations[0]?.title || `Hizmet ID: ${hizmet.id}`;
      return {
        id: hizmet.id,
        title: title,
      };
    }).filter(hizmet => hizmet.title);

    return NextResponse.json(formattedHizmetler);
  } catch (error) {
    console.error("Error fetching hizmetler for lookup:", error);
    return NextResponse.json({ message: 'Hizmet lookup verisi getirilirken bir hata oluştu.' }, { status: 500 });
  }
});
