import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { getLocaleFromRequest } from '@/lib/utils'; // Bu helper varsayımsaldı, kaldırıldı. Locale query'den alınacak.

import { z } from 'zod';

// Helper function to build the menu hierarchy and resolve links
async function buildHeaderMenus(locale: string) {
  const headerMenus = await prisma.headerMenu.findMany({
    where: { isActive: true }, // Tüm aktif header menülerini getir
    include: {
      translations: { // Ana menü çevirileri
        where: { languageCode: locale },
      },
      items: {
        where: { isActive: true }, // Sadece aktif öğeler
        orderBy: { order: 'asc' },
        include: {
          translations: {
            where: { languageCode: locale }, // Sadece istenen dil
          },
          children: { // Aktif alt öğeler
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              translations: {
                where: { languageCode: locale },
              },
              blogPost: { // İlişkili blog post slug'ını al
                select: { translations: { where: { languageCode: locale }, select: { slug: true } } }
              },
              hizmet: { // İlişkili hizmet slug'ını al
                 select: { translations: { where: { languageCode: locale }, select: { slug: true } } }
              },
              // Alt öğelerin de alt öğeleri olabilir (recursive include gerekebilir veya ayrı sorgu)
              // Şimdilik bir seviye alt öğe varsayılıyor
            },
          },
          blogPost: { // İlişkili blog post slug'ını al (ana seviye)
             select: { translations: { where: { languageCode: locale }, select: { slug: true } } }
          },
          hizmet: { // İlişkili hizmet slug'ını al (ana seviye)
             select: { translations: { where: { languageCode: locale }, select: { slug: true } } }
          },
        },
      },
    },
  });

  if (!headerMenus || headerMenus.length === 0) {
    return [];
  }

  // Veriyi frontend için formatla ve linkleri oluştur
  const formatItems = (items: any[]): any[] => {
    return items
      .map(item => {
        const translation = item.translations[0];
        if (!translation) return null; // İstenen dilde çeviri yoksa öğeyi atla

        let href = '#'; // Varsayılan link
        if (item.itemType === 'LINK' && item.linkUrl) {
          href = item.linkUrl;
        } else if (item.itemType === 'BLOG_POST' && item.blogPost?.translations[0]?.slug) {
          href = `/${locale}/blog/${item.blogPost.translations[0].slug}`;
        } else if (item.itemType === 'SERVICE_PAGE' && item.hizmet?.translations[0]?.slug) {
          href = `/${locale}/hizmetler/${item.hizmet.translations[0].slug}`;
        }
        // Diğer tipler (CATEGORY_PAGE, CUSTOM_PAGE) için de benzer link oluşturma mantığı eklenebilir

        return {
          id: item.id,
          title: translation.title,
          href: href,
          openInNewTab: item.openInNewTab,
          children: item.children ? formatItems(item.children) : [], // Alt öğeleri de formatla
        };
      })
      .filter(item => item !== null); // Geçersiz öğeleri filtrele
  };

  // Tüm menüleri formatla ve dön
  return headerMenus.map(menu => {
    const menuNameTranslation = menu.translations[0];
    if (!menuNameTranslation) {
      // İstenen dilde çeviri yoksa bu menüyü atla
      return null;
    }

    return {
      id: menu.id,
      name: menuNameTranslation.name, // Çevrilmiş menü adını kullan
      items: formatItems(menu.items.filter(item => !item.parentId)), // Sadece ana seviye öğelerle başla
    };
  }).filter(menu => menu !== null); // Geçersiz menüleri filtrele
}


export async function GET(req: Request) {
  try {
    // Locale'i query parametresinden al
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'tr'; // Varsayılan 'tr'

    console.log(`[API/menus/header] Requested locale: ${locale}`);

    const menuData = await buildHeaderMenus(locale);

    if (!menuData || menuData.length === 0) {
      return NextResponse.json({ message: 'Aktif header menüsü bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(menuData);

  } catch (error) {
    console.error('[API/menus/header] Error fetching header menu:', error);
    return NextResponse.json({ message: 'Header menüsü getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// Zod şeması: Gelen veriyi doğrulamak için
const createHeaderMenuSchema = z.object({
  translations: z.record(z.string().min(1), z.string().min(1, "Menü adı boş olamaz.")), // { "en": "Menu Name", "tr": "Menü Adı" }
  isActive: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createHeaderMenuSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: validation.error.errors }, { status: 400 });
    }

    const { translations, isActive } = validation.data;

    // Aktif dilleri veritabanından çek (opsiyonel, gelen translation key'lerine güvenebiliriz)
    // const activeLanguages = await prisma.language.findMany({ where: { isActive: true }, select: { code: true } });
    // const activeLangCodes = activeLanguages.map(lang => lang.code);

    // Gelen çevirilerin dil kodlarının geçerli olup olmadığını kontrol et (opsiyonel ama iyi bir pratik)
    const providedLangCodes = Object.keys(translations);
    // for (const code of providedLangCodes) {
    //   if (!activeLangCodes.includes(code)) {
    //     return NextResponse.json({ message: `Geçersiz dil kodu: ${code}` }, { status: 400 });
    //   }
    // }
    if (providedLangCodes.length === 0) {
        return NextResponse.json({ message: 'En az bir çeviri sağlanmalıdır.' }, { status: 400 });
    }


    const newHeaderMenu = await prisma.headerMenu.create({
      data: {
        isActive: isActive,
        translations: {
          createMany: {
            data: providedLangCodes.map(langCode => ({
              languageCode: langCode,
              name: translations[langCode],
            })),
          },
        },
      },
      include: {
        translations: true, // Oluşturulan çevirileri de yanıtla dön
      },
    });

    return NextResponse.json(newHeaderMenu, { status: 201 });

  } catch (error) {
    console.error('[API/menus/header] Error creating header menu:', error);
    if (error instanceof z.ZodError) { // Zod kendi hata formatını kullanır
      return NextResponse.json({ message: 'Veri doğrulama hatası.', errors: error.errors }, { status: 400 });
    }
    // Prisma veya diğer beklenmedik hatalar
    if (error instanceof Error && 'code' in error && error.code === 'P2002') { // Unique constraint hatası (örneğin aynı dil için tekrar çeviri)
        return NextResponse.json({ message: 'Benzersizlik kısıtlaması ihlal edildi. Dil başına bir çeviri olmalıdır.' }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Header menüsü oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}
