import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to build the footer menu structure
async function buildFooterMenus(locale: string) {
  const footerMenus = await prisma.footerMenu.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
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
  const formattedMenus = footerMenus.map(menu => {
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
      name: menu.name, // Grup adı (örn: "Tedaviler", "Hakkımızda")
      items: formattedItems,
    };
  });

  return formattedMenus;
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
