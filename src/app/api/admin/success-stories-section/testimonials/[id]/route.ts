import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

interface Params {
  params: { id: string };
}

// GET: Belirli bir yorumu getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');
    
    // Yorumu ve çevirilerini getir
    const testimonial = await prisma.successStoriesTestimonial.findUnique({
      where: { id },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
      },
    });
    
    if (!testimonial) {
      return NextResponse.json({ message: 'Yorum bulunamadı.' }, { status: 404 });
    }
    
    return NextResponse.json(testimonial);
  } catch (error) {
    console.error(`Error fetching testimonial with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Yorum getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Yorumu güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { stars, imageUrl, order, translations } = body;
    
    // Yorum kontrol
    const existingTestimonial = await prisma.successStoriesTestimonial.findUnique({
      where: { id },
    });
    
    if (!existingTestimonial) {
      return NextResponse.json({ message: 'Yorum bulunamadı.' }, { status: 404 });
    }
    
    // Yorum ve çevirilerini transaction içinde güncelle
    const result = await prisma.$transaction(async (tx) => {
      // Yorumu güncelle
      const updatedTestimonial = await tx.successStoriesTestimonial.update({
        where: { id },
        data: {
          stars: stars !== undefined ? stars : existingTestimonial.stars,
          imageUrl: imageUrl !== undefined ? imageUrl : existingTestimonial.imageUrl,
          ...(order !== undefined ? { order } : {}),
        },
      });
      
      // Çevirileri güncelle veya ekle
      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          const { languageCode, text, author, treatment } = translation;
          
          if (!languageCode) {
            throw new Error('Dil kodu belirtilmedi');
          }

          // Mevcut çeviriyi bul
          const existingTranslation = await tx.successStoriesTestimonialTranslation.findUnique({
            where: {
              testimonialId_languageCode: {
                testimonialId: id,
                languageCode,
              },
            },
          });
          
          if (existingTranslation) {
            // Mevcut çeviriyi güncelle
            await tx.successStoriesTestimonialTranslation.update({
              where: { id: existingTranslation.id },
              data: {
                text: text !== undefined ? text : existingTranslation.text,
                author: author !== undefined ? author : existingTranslation.author,
                treatment: treatment !== undefined ? treatment : existingTranslation.treatment,
              },
            });
          } else {
            // Yeni çeviri ekle
            await tx.successStoriesTestimonialTranslation.create({
              data: {
                testimonialId: id,
                languageCode,
                text: text || '',
                author: author || '',
                treatment: treatment || '',
              },
            });
          }
        }
      }
      
      // Güncel yorumu getir
      return await tx.successStoriesTestimonial.findUnique({
        where: { id },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating testimonial with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Yorum güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Yorumu sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    
    // Yorum kontrol
    const existingTestimonial = await prisma.successStoriesTestimonial.findUnique({
      where: { id },
    });
    
    if (!existingTestimonial) {
      return NextResponse.json({ message: 'Yorum bulunamadı.' }, { status: 404 });
    }
    
    // Yorumu ve ilişkili tüm çevirilerini sil (Cascading delete sayesinde)
    await prisma.successStoriesTestimonial.delete({
      where: { id },
    });
    
    // Kalan yorumların order değerlerini yeniden düzenle
    const remainingTestimonials = await prisma.successStoriesTestimonial.findMany({
      where: { successStoriesSectionId: 'main' },
      orderBy: { order: 'asc' },
    });
    
    if (remainingTestimonials.length > 0) {
      await prisma.$transaction(
        remainingTestimonials.map((testimonial, index) => 
          prisma.successStoriesTestimonial.update({
            where: { id: testimonial.id },
            data: { order: index },
          })
        )
      );
    }
    
    return NextResponse.json({ message: 'Yorum başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting testimonial with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Yorum silinirken bir hata oluştu.' }, { status: 500 });
  }
});