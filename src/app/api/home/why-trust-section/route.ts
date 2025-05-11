import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: WhyTrustSection için verileri getir (public API)
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
        
        return getWhyTrustSectionByLanguage(activeLanguage.code);
      }
      
      return getWhyTrustSectionByLanguage(defaultLanguage.code);
    }
    
    return getWhyTrustSectionByLanguage(languageCode);
  } catch (error) {
    console.error("Error fetching why trust section:", error);
    return NextResponse.json({ message: 'WhyTrustSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// Belirli bir dil için WhyTrustSection verilerini getir
async function getWhyTrustSectionByLanguage(languageCode: string) {
  try {
    // WhyTrustSection, ana çevirisi ve trust pointleri getir
    const whyTrustSection = await prisma.whyTrustSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: {
          where: { languageCode },
        },
        trustPoints: {
          include: {
            translations: {
              where: { languageCode },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!whyTrustSection) {
      // Eğer section yoksa boş bir yapı döndür
      return NextResponse.json({
        id: 'main',
        backgroundImage: null,
        title: '',
        subtitle: '',
        trustPoints: [],
        languageCode,
      });
    }
    
    // Ana section çevirisi
    const sectionTranslation = whyTrustSection.translations[0] || null;
    
    // Trust points'leri formatlayalım
    const formattedTrustPoints = whyTrustSection.trustPoints.map(point => {
      const pointTranslation = point.translations[0] || null;
      
      return {
        id: point.id,
        number: point.number,
        title: pointTranslation?.title || '',
        description: pointTranslation?.description || '',
      };
    });
    
    // İstemciye daha temiz bir veri yapısı dönelim
    const formattedData = {
      id: whyTrustSection.id,
      backgroundImage: whyTrustSection.backgroundImage,
      title: sectionTranslation?.title || '',
      subtitle: sectionTranslation?.subtitle || '',
      trustPoints: formattedTrustPoints,
      languageCode,
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(`Error fetching why trust section for language ${languageCode}:`, error);
    return NextResponse.json({ message: 'WhyTrustSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}