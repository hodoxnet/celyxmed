import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const HERO_CONTENT_ID = "main"; // Sabit ID

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    if (!languageCode) {
      return NextResponse.json({ message: 'Dil kodu (lang) gereklidir.' }, { status: 400 });
    }

    // İçeriği ve aktif resimleri getir
    const heroContent = await prisma.heroContent.findUnique({
      where: { id: HERO_CONTENT_ID },
      include: {
        translations: {
          where: { languageCode },
          take: 1,
        },
        images: {
          where: { isActive: true }, // Sadece aktif resimleri getir
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!heroContent) {
      // Eğer ana içerik hiç yoksa (ilk kurulumda olabilir), boş bir yanıt veya hata dönebiliriz.
      // Şimdilik boş bir nesne döndürelim.
      return NextResponse.json({ translations: [], images: [] });
    }

    // Sadece gerekli alanları döndür
    const responseData = {
      translation: heroContent.translations[0] || null, // İstenen dildeki çeviri (veya null)
      images: heroContent.images.map(img => ({ // Sadece resim URL'lerini döndür
        id: img.id,
        imageUrl: img.imageUrl,
      })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching public hero content:", error);
    return NextResponse.json({ message: 'Hero verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}
