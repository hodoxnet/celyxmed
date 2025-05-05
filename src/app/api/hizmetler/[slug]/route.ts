import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Context {
  params: {
    slug: string;
  };
}

// GET: Belirli bir hizmet detayını slug ve locale'e göre getir (Public)
export async function GET(req: Request, context: Context) {
  try {
    const { slug } = context.params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale');

    if (!locale) {
      return new NextResponse(JSON.stringify({ message: 'Dil parametresi (locale) eksik.' }), { status: 400 });
    }

    // Veritabanından ilgili hizmeti bul
    // Sadece yayınlanmış (published: true) hizmetleri getir
    // Şimdilik sadece hero alanı için gerekli verileri seçelim
    const hizmetDetay = await prisma.hizmetDetay.findUnique({
      where: {
        slug_languageCode: { // Prisma schema'daki unique constraint adı
          slug: slug,
          languageCode: locale,
        },
        published: true, // Sadece yayınlanmış olanları getir
      },
      // Tüm gerekli alanları ve ilişkili verileri seç
      include: {
        tocItems: { orderBy: { order: 'asc' } },
        marqueeImages: { orderBy: { order: 'asc' } },
        introLinks: { orderBy: { order: 'asc' } },
        overviewTabs: { orderBy: { order: 'asc' } },
        whyItems: { orderBy: { order: 'asc' } },
        galleryImages: { orderBy: { order: 'asc' } },
        testimonials: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        recoveryItems: { orderBy: { order: 'asc' } },
        ctaAvatars: { orderBy: { order: 'asc' } },
        pricingPackages: { orderBy: { order: 'asc' } },
        expertItems: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
      },
    });

    if (!hizmetDetay) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Başarılı yanıt
    return NextResponse.json(hizmetDetay);

  } catch (error) {
    console.error(`[GET /api/hizmetler/${context.params.slug}] Error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
