import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// MenuItemType enum'ını manuel olarak tanımla
enum MenuItemType {
  LINK = "LINK",
  BLOG_POST = "BLOG_POST",
  SERVICE_PAGE = "SERVICE_PAGE",
}

interface Params {
  params: { menuId: string }; // Bu, FooterMenu'nun ID'si
}

// GET: Belirli bir footer menü grubuna ait tüm menü öğelerini listele
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;

    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    const items = await prisma.footerMenuItem.findMany({
      where: { footerMenuId: menuId },
      orderBy: { order: 'asc' },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
        // Footer'da alt menü öğeleri (children) genellikle olmaz,
        // ama şemada tanımlıysa ve gerekirse eklenebilir.
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error(`Error fetching items for footer menu ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Footer menü öğeleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Belirli bir footer menü grubuna yeni bir menü öğesi ekle
export const POST = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params; // Bu, FooterMenu'nun ID'si
    const body = await req.json();

    const {
      order,
      itemType,
      linkUrl,
      blogPostId,
      hizmetId,
      openInNewTab,
      isActive,
      // Footer'da parentId genellikle kullanılmaz.
      translations, // [{ languageCode: 'tr', title: 'Anasayfa' }, ...]
    } = body;

    if (!itemType || !translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json({ message: 'Öğe tipi ve en az bir çeviri gereklidir.' }, { status: 400 });
    }

    if (itemType === MenuItemType.LINK && !linkUrl) {
      return NextResponse.json({ message: 'LINK tipi için linkUrl gereklidir.' }, { status: 400 });
    }
    if (itemType === MenuItemType.BLOG_POST && !blogPostId) {
      return NextResponse.json({ message: 'BLOG_POST tipi için blogPostId gereklidir.' }, { status: 400 });
    }
    if (itemType === MenuItemType.SERVICE_PAGE && !hizmetId) {
      return NextResponse.json({ message: 'SERVICE_PAGE tipi için hizmetId gereklidir.' }, { status: 400 });
    }

    const footerMenuExists = await prisma.footerMenu.findUnique({ where: { id: menuId } });
    if (!footerMenuExists) {
      return NextResponse.json({ message: 'Ana footer menü grubu bulunamadı.' }, { status: 404 });
    }

    const newMenuItem = await prisma.$transaction(async (tx) => {
      const createdItem = await tx.footerMenuItem.create({
        data: {
          footerMenuId: menuId,
          order: order || 0,
          itemType: itemType as MenuItemType,
          linkUrl,
          blogPostId,
          hizmetId,
          openInNewTab: openInNewTab || false,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      for (const trans of translations) {
        if (!trans.languageCode || !trans.title) {
          console.warn(`Skipping translation for item ${createdItem.id} due to missing languageCode or title.`);
          continue;
        }

        // Dil kodunun geçerliliğini kontrol et
        const languageExists = await tx.language.findUnique({
          where: { code: trans.languageCode },
          select: { code: true } 
        });

        if (!languageExists) {
          throw new Error(`Geçersiz dil kodu: ${trans.languageCode}. Bu dil sistemde tanımlı değil.`);
        }

        // Dil kodu geçerliyse çeviriyi oluştur
        await tx.footerMenuItemTranslation.create({
          data: {
            footerMenuItemId: createdItem.id,
            languageCode: trans.languageCode,
            title: trans.title,
          },
        });
      }

      return tx.footerMenuItem.findUnique({
        where: { id: createdItem.id },
        include: { translations: true },
      });
    });

    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error: any) {
    console.error(`Error creating item for footer menu ID ${params.menuId}:`, error);
    if (error.code === 'P2002') {
        return NextResponse.json({ message: `Bir çeviri için benzersizlik kısıtlaması ihlal edildi. Detay: ${error.meta?.target}` }, { status: 409 });
    }
    return NextResponse.json({ message: error.message || 'Footer menü öğesi oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
