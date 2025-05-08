import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin'; // Projenizdeki doğru yolu kullanın
// import { MenuItemType } from '@prisma/client'; // Prisma Client export sorunu nedeniyle manuel tanımlama

// MenuItemType enum'ını manuel olarak tanımla (Prisma şemasıyla aynı olmalı)
enum MenuItemType {
  LINK = "LINK",
  BLOG_POST = "BLOG_POST",
  SERVICE_PAGE = "SERVICE_PAGE",
}

interface Params {
  params: { menuId: string };
}

// GET: Belirli bir header menüsüne ait tüm menü öğelerini listele
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;

    // URL'den dil parametresini al (opsiyonel)
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    const items = await prisma.headerMenuItem.findMany({
      where: { headerMenuId: menuId },
      orderBy: { order: 'asc' },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
        children: { // Alt menü öğelerini de alalım
          orderBy: { order: 'asc' },
          include: {
            translations: languageCode 
              ? { where: { languageCode } } 
              : true,
          },
        },
        // İlişkili blog veya hizmet bilgilerini de getirebiliriz (opsiyonel)
        // blogPost: { select: { id: true, translations: { where: { languageCode: languageCode || 'tr' }, select: { title: true, slug: true } } } },
        // hizmet: { select: { id: true, translations: { where: { languageCode: languageCode || 'tr' }, select: { title: true, slug: true } } } },
      },
    });

    if (!items) {
      // Bu durumda boş bir array dönebilir, 404 vermek yerine
      return NextResponse.json([]);
    }

    // İstemciye daha temiz veri dönmek için formatlama yapılabilir
    // Örneğin, çevirilerden sadece istenen dilin başlığını ve slug'ını almak gibi.

    return NextResponse.json(items);
  } catch (error) {
    console.error(`Error fetching items for header menu ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Header menü öğeleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Belirli bir header menüsüne yeni bir menü öğesi ekle
export const POST = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;
    const body = await req.json();

    const {
      order,
      itemType,
      linkUrl,
      blogPostId,
      hizmetId,
      openInNewTab,
      isActive,
      parentId, // Alt menü için
      translations, // [{ languageCode: 'tr', title: 'Anasayfa' }, ...]
    } = body;

    if (!itemType || !translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json({ message: 'Öğe tipi ve en az bir çeviri gereklidir.' }, { status: 400 });
    }

    // itemType'a göre gerekli alanların kontrolü
    if (itemType === MenuItemType.LINK && !linkUrl) {
      return NextResponse.json({ message: 'LINK tipi için linkUrl gereklidir.' }, { status: 400 });
    }
    if (itemType === MenuItemType.BLOG_POST && !blogPostId) {
      return NextResponse.json({ message: 'BLOG_POST tipi için blogPostId gereklidir.' }, { status: 400 });
    }
    if (itemType === MenuItemType.SERVICE_PAGE && !hizmetId) {
      return NextResponse.json({ message: 'SERVICE_PAGE tipi için hizmetId gereklidir.' }, { status: 400 });
    }

    // Ana menü var mı kontrol et
    const headerMenuExists = await prisma.headerMenu.findUnique({ where: { id: menuId } });
    if (!headerMenuExists) {
      return NextResponse.json({ message: 'Ana header menüsü bulunamadı.' }, { status: 404 });
    }
    
    // Eğer parentId varsa, o parent öğenin aynı menüye ait olduğunu kontrol et
    if (parentId) {
        const parentItemExists = await prisma.headerMenuItem.findFirst({
            where: { id: parentId, headerMenuId: menuId }
        });
        if (!parentItemExists) {
            return NextResponse.json({ message: 'Belirtilen üst menü öğesi bu menüye ait değil veya bulunamadı.' }, { status: 400 });
        }
    }


    const newMenuItem = await prisma.$transaction(async (tx) => {
      const createdItem = await tx.headerMenuItem.create({
        data: {
          headerMenuId: menuId,
          order: order || 0,
          itemType: itemType as MenuItemType, // Cast to enum
          linkUrl,
          blogPostId,
          hizmetId,
          openInNewTab: openInNewTab || false,
          isActive: isActive !== undefined ? isActive : true,
          parentId,
        },
      });

      for (const trans of translations) {
        if (!trans.languageCode || !trans.title) {
          throw new Error('Her çeviri için languageCode ve title gereklidir.');
        }
        await tx.headerMenuItemTranslation.create({
          data: {
            headerMenuItemId: createdItem.id,
            languageCode: trans.languageCode,
            title: trans.title,
          },
        });
      }

      return tx.headerMenuItem.findUnique({
        where: { id: createdItem.id },
        include: { translations: true, children: true },
      });
    });

    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error: any) {
    console.error(`Error creating item for header menu ID ${params.menuId}:`, error);
    // Prisma unique constraint hatası veya özel hata mesajları
    if (error.code === 'P2002') { // Unique constraint failed
        return NextResponse.json({ message: `Bir çeviri için benzersizlik kısıtlaması ihlal edildi (örn: aynı dil için aynı başlık). Detay: ${error.meta?.target}` }, { status: 409 });
    }
    return NextResponse.json({ message: error.message || 'Header menü öğesi oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
