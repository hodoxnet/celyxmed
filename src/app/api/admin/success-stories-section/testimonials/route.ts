import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm yorumları getir
export const GET = withAdmin(async (req: Request) => {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    // Yorumları ve çevirilerini getir
    const testimonials = await prisma.successStoriesTestimonial.findMany({
      where: { successStoriesSectionId: 'main' },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ message: 'Yorumlar getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni yorum ekle
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { stars, imageUrl, translations } = body;

    // Mevcut en yüksek sıralamayı bul
    const highestOrder = await prisma.successStoriesTestimonial.findFirst({
      where: { successStoriesSectionId: 'main' },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Ana SuccessStoriesSection'ın varlığını kontrol et, yoksa oluştur
    let successStoriesSection = await prisma.successStoriesSection.findUnique({
      where: { id: 'main' },
    });

    if (!successStoriesSection) {
      successStoriesSection = await prisma.successStoriesSection.create({
        data: {
          id: 'main',
        },
      });
    }

    // Yeni yorum ve çevirilerini transaction içinde ekle
    const result = await prisma.$transaction(async (tx) => {
      // Yorumu oluştur
      const newTestimonial = await tx.successStoriesTestimonial.create({
        data: {
          successStoriesSectionId: 'main',
          stars: stars || 5,
          imageUrl: imageUrl || null,
          order: newOrder,
        },
      });

      // Çevirileri ekle
      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          const { languageCode, text, author, treatment } = translation;

          if (!languageCode) {
            throw new Error('Dil kodu belirtilmedi');
          }

          await tx.successStoriesTestimonialTranslation.create({
            data: {
              testimonialId: newTestimonial.id,
              languageCode,
              text: text || '',
              author: author || '',
              treatment: treatment || '',
            },
          });
        }
      }

      // Oluşturulan yorumu çevirileriyle birlikte getir
      return await tx.successStoriesTestimonial.findUnique({
        where: { id: newTestimonial.id },
        include: {
          translations: true,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ message: 'Yorum oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});