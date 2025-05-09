import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: WhyChooseSection için verileri getir (public API)
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
        
        return getWhyChooseSectionByLanguage(activeLanguage.code);
      }
      
      return getWhyChooseSectionByLanguage(defaultLanguage.code);
    }
    
    return getWhyChooseSectionByLanguage(languageCode);
  } catch (error) {
    console.error("Error fetching why choose section:", error);
    return NextResponse.json({ message: 'WhyChooseSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// Belirli bir dil için WhyChooseSection verilerini getir
async function getWhyChooseSectionByLanguage(languageCode: string) {
  try {
    // WhyChooseSection ve çevirisini getir
    const whyChooseSection = await prisma.whyChooseSection.findUnique({
      where: { id: 'main' },
      include: {
        translations: {
          where: { languageCode },
        },
      },
    });
    
    if (!whyChooseSection || whyChooseSection.translations.length === 0) {
      // Eğer çeviri yoksa boş bir yapı döndür
      return NextResponse.json({
        id: 'main',
        youtubeVideoId: '',
        title: '',
        description: '',
        primaryButtonText: '',
        primaryButtonLink: '',
        secondaryButtonText: '',
        secondaryButtonLink: '',
        languageCode,
      });
    }
    
    // İstemciye daha temiz bir veri yapısı dönelim
    const translation = whyChooseSection.translations[0];
    const formattedData = {
      id: whyChooseSection.id,
      youtubeVideoId: translation.youtubeVideoId,
      title: translation.title,
      description: translation.description,
      primaryButtonText: translation.primaryButtonText,
      primaryButtonLink: translation.primaryButtonLink,
      secondaryButtonText: translation.secondaryButtonText,
      secondaryButtonLink: translation.secondaryButtonLink,
      languageCode: translation.languageCode,
    };
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(`Error fetching why choose section for language ${languageCode}:`, error);
    return NextResponse.json({ message: 'WhyChooseSection verileri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}