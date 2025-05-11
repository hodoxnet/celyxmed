import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: SuccessStoriesSection için verileri getir (public API)
export async function GET(request: Request) {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('lang');

    // Eğer dil kodu belirtilmezse varsayılan dili bul
    if (!languageCode) {
      const defaultLanguage = await prisma.language.findFirst({
        where: { isDefault: true, isActive: true },
      });
      
      // Eğer varsayılan dil yoksa aktif ilk dili al
      if (!defaultLanguage) {
        const activeLanguage = await prisma.language.findFirst({
          where: { isActive: true },
        });
        
        if (!activeLanguage) {
          return NextResponse.json({ message: 'Aktif dil bulunamadı' }, { status: 404 });
        }
        
        return getSuccessStoriesSectionByLanguage(activeLanguage.code);
      }
      
      return getSuccessStoriesSectionByLanguage(defaultLanguage.code);
    }
    
    return getSuccessStoriesSectionByLanguage(languageCode);
  } catch (error) {
    console.error("Error fetching success stories section:", error);
    return NextResponse.json({ message: 'SuccessStoriesSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// Belirli bir dil için SuccessStoriesSection verilerini getir
async function getSuccessStoriesSectionByLanguage(languageCode: string) {
  try {
    // SuccessStoriesSection, çevirileri, galeri resimleri ve yorumları getir
    const successStoriesSection = await prisma.successStoriesSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: {
          where: { languageCode },
        },
        galleryImages: {
          orderBy: { order: 'asc' },
        },
        testimonials: {
          include: {
            translations: {
              where: { languageCode },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!successStoriesSection) {
      // Eğer section yoksa boş bir yapı döndür
      return NextResponse.json({
        id: 'main',
        title: '',
        description: '',
        consultButtonText: 'Book Your Free Consultation',
        consultButtonLink: '/contact',
        discoverButtonText: 'Discover Success Stories',
        discoverButtonLink: '/success-stories',
        galleryImages: [],
        testimonials: [],
        languageCode,
      });
    }
    
    // Ana section çevirisi
    const sectionTranslation = successStoriesSection.translations[0] || null;
    
    // Testimonial verilerini düzenle
    const formattedTestimonials = successStoriesSection.testimonials.map(testimonial => {
      const testimonialTranslation = testimonial.translations[0] || null;
      
      return {
        id: testimonial.id,
        stars: testimonial.stars,
        imageUrl: testimonial.imageUrl,
        text: testimonialTranslation?.text || '',
        author: testimonialTranslation?.author || '',
        treatment: testimonialTranslation?.treatment || '',
      };
    });
    
    // İstemciye daha temiz bir veri yapısı dönelim
    const formattedData = {
      id: successStoriesSection.id,
      title: sectionTranslation?.title || '',
      description: sectionTranslation?.description || '',
      consultButtonText: sectionTranslation?.consultButtonText || 'Book Your Free Consultation',
      consultButtonLink: sectionTranslation?.consultButtonLink || '/contact',
      discoverButtonText: sectionTranslation?.discoverButtonText || 'Discover Success Stories',
      discoverButtonLink: sectionTranslation?.discoverButtonLink || '/success-stories',
      galleryImages: successStoriesSection.galleryImages,
      testimonials: formattedTestimonials,
      languageCode,
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(`Error fetching success stories section for language ${languageCode}:`, error);
    return NextResponse.json({ message: 'SuccessStoriesSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}