import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { getLocaleFromRequest } from '@/lib/utils'; // Bu helper varsayımsaldı, kaldırıldı. Locale query'den alınacak.

// Helper function to build the menu hierarchy and resolve links
async function buildHeaderMenu(locale: string) {
  const headerMenu = await prisma.headerMenu.findFirst({
    where: { isActive: true }, // Genellikle tek bir aktif header menüsü olur
    include: {
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

  if (!headerMenu) {
    return null;
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

  return {
    id: headerMenu.id,
    name: headerMenu.name,
    items: formatItems(headerMenu.items.filter(item => !item.parentId)), // Sadece ana seviye öğelerle başla
  };
}


export async function GET(req: Request) {
  try {
    // Locale'i query parametresinden al
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'tr'; // Varsayılan 'tr'

    console.log(`[API/menus/header] Requested locale: ${locale}`);

    const menuData = await buildHeaderMenu(locale);

    if (!menuData) {
      return NextResponse.json({ message: 'Aktif header menüsü bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(menuData);

  } catch (error) {
    console.error('[API/menus/header] Error fetching header menu:', error);
    return NextResponse.json({ message: 'Header menüsü getirilirken bir hata oluştu.' }, { status: 500 });
  }
}
