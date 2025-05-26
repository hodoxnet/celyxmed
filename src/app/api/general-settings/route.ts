import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { getLocale } from 'next-intl/server'; // getLocale artık kullanılmayacak

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang');

    // next-intl'den gelen locale'i fallback olarak kullanabiliriz veya hata verebiliriz
    // const serverLocale = await getLocale(); 
    // console.log(`[API/general-settings] Server locale (getLocale): ${serverLocale}`);

    const locale = lang || 'tr'; // Eğer lang parametresi yoksa varsayılan olarak 'tr' kullan
                                 // veya serverLocale kullanılabilir: lang || serverLocale || 'tr';
    
    console.log(`[API/general-settings] Using locale from query param: ${locale}`);

    const generalSettings = await prisma.generalSetting.findFirst({
      include: {
        translations: {
          where: {
            languageCode: locale,
          },
        },
      },
    });

    if (!generalSettings) {
      console.log('[API/general-settings] No general settings found.');
      return NextResponse.json({ message: 'General settings not found' }, { status: 404 });
    }

    // İstenen dilde çeviri yoksa, ilk çeviriyi veya boş bir obje döndür
    const translation = generalSettings.translations.length > 0 
      ? generalSettings.translations[0] 
      : {
          headerButtonText: '',
          headerButtonLink: '',
          socialYoutubeUrl: '',
          socialInstagramUrl: '',
          socialTiktokUrl: '',
          socialFacebookUrl: '',
          socialLinkedinUrl: '',
          copyrightText: '',
          stickyButtonText: '',
          stickyButtonLink: '',
        };
    
    const result = {
      ...generalSettings,
      translation, // Sadece istenen dilin çevirisini veya varsayılan boş objeyi ekle
      translations: undefined, // Ana objedeki tüm çeviriler listesini kaldır
    };
    
    // translations alanını siliyoruz çünkü artık 'translation' altında tek bir çeviri var
    // @ts-ignore
    delete result.translations;


    console.log('[API/general-settings] Fetched general settings:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API/general-settings] Error fetching general settings:', error);
    return NextResponse.json({ message: 'Error fetching general settings', error: (error as Error).message }, { status: 500 });
  }
}
