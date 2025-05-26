import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Helper function to build the footer menu structure
async function buildFooterMenus(locale: string) {
  const footerMenus = await prisma.footerMenu.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      translations: { // Ana menü çevirileri
        where: { languageCode: locale },
      },
      items: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          translations: {
            where: { languageCode: locale },
          },
          blogPost: {
            select: { translations: { where: { languageCode: locale }, select: { slug: true } } }
          },
          hizmet: {
             select: { translations: { where: { languageCode: locale }, select: { slug: true } } }
          },
        },
      },
    },
  });

  if (!footerMenus || footerMenus.length === 0) {
    return [];
  }

  // Veriyi frontend için formatla
  const formattedMenus = footerMenus
    .map(menu => {
      const menuNameTranslation = menu.translations[0];
      if (!menuNameTranslation) {
        // İstenen dilde menü grubu adı çevirisi yoksa, bu grubu atla
        // console.warn(`FooterMenu ID ${menu.id} için '${locale}' dilinde isim çevirisi bulunamadı.`);
        return null;
      }

      const formattedItems = menu.items
        .map(item => {
          const translation = item.translations[0];
          if (!translation) return null;

          let href = '#';
          if (item.itemType === 'LINK' && item.linkUrl) {
            href = item.linkUrl;
          } else if (item.itemType === 'BLOG_POST' && item.blogPost?.translations[0]?.slug) {
            href = `/${locale}/blog/${item.blogPost.translations[0].slug}`;
          } else if (item.itemType === 'SERVICE_PAGE' && item.hizmet?.translations[0]?.slug) {
            href = `/${locale}/hizmetler/${item.hizmet.translations[0].slug}`;
          }

          return {
            id: item.id,
            title: translation.title,
            href: href,
            openInNewTab: item.openInNewTab,
          };
        })
        .filter(item => item !== null);

      return {
        id: menu.id,
        name: menuNameTranslation.name, // Çevrilmiş grup adını kullan
        items: formattedItems,
      };
    })
    .filter(menu => menu !== null); // Geçersiz menü gruplarını filtrele

  return formattedMenus as Array<{ id: string; name: string; items: any[] }>; // Type assertion
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'tr'; // Query parametresinden al

    console.log(`[API/menus/footer] Requested locale: ${locale}`);

    const menuData = await buildFooterMenus(locale);

    // Footer'da menü olmaması bir hata değil, boş array dönebiliriz.
    return NextResponse.json(menuData);

  } catch (error) {
    console.error('[API/menus/footer] Error fetching footer menus:', error);
    return NextResponse.json({ message: 'Footer menüleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// Zod şeması: Gelen veriyi doğrulamak için
const createFooterMenuSchema = z.object({
  translations: z.record(z.string().min(1), z.string().min(1, "Menü adı boş olamaz.")), // { "en": "Menu Name", "tr": "Menü Adı" }
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = createFooterMenuSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: validation.error.errors }, { status: 400 });
    }

    const { translations, order, isActive } = validation.data;
    const providedLangCodes = Object.keys(translations);

    if (providedLangCodes.length === 0) {
        return NextResponse.json({ message: 'En az bir çeviri sağlanmalıdır.' }, { status: 400 });
    }

    const newFooterMenu = await prisma.footerMenu.create({
      data: {
        order: order,
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

    return NextResponse.json(newFooterMenu, { status: 201 });

  } catch (error) {
    console.error('[API/menus/footer] Error creating footer menu:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Veri doğrulama hatası.', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: 'Benzersizlik kısıtlaması ihlal edildi. Dil başına bir çeviri olmalıdır.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Footer menüsü oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}
