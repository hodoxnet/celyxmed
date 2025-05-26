import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang') || 'tr'; // Varsayılan olarak Türkçe

    // Ana içeriği getir
    const content = await prisma.clinicShowcase.findUnique({
      where: { id: "main" },
      include: {
        translations: {
          where: { languageCode },
        },
        images: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    // İçerik bulunamadıysa boş yanıt döndür
    if (!content) {
      return NextResponse.json({ content: null, images: [] });
    }

    // Çevirileri ve resimleri daha kullanışlı bir formatta hazırla
    const translation = content.translations[0] || null;
    const formattedContent = {
      content: translation ? {
        title: translation.title,
        description: translation.description,
        buttonText: translation.buttonText,
        buttonLink: translation.buttonLink,
      } : null,
      images: content.images.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText || '',
      }))
    };

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error('Error fetching clinic showcase data:', error);
    return NextResponse.json(
      { error: 'Klinik tanıtım verileri yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}