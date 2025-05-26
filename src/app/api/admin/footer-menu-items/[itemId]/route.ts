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
  params: { itemId: string }; // Bu, FooterMenuItem'ın ID'si
}

// GET: Belirli bir footer menü öğesini ID ile getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;

    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    const menuItem = await prisma.footerMenuItem.findUnique({
      where: { id: itemId },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
        // footerMenu: true, // Üst menü grubu bilgisi de istenirse eklenebilir
      },
    });

    if (!menuItem) {
      return NextResponse.json({ message: 'Footer menü öğesi bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error(`Error fetching footer menu item with ID ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Footer menü öğesi getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Belirli bir footer menü öğesini güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;
    const body = await req.json();

    const {
      order,
      itemType,
      linkUrl,
      blogPostId,
      hizmetId,
      openInNewTab,
      isActive,
      translations,
    } = body;

    const existingItem = await prisma.footerMenuItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Güncellenecek footer menü öğesi bulunamadı.' }, { status: 404 });
    }

    if (itemType) {
        if (itemType === MenuItemType.LINK && linkUrl === undefined && !existingItem.linkUrl) {
            if (existingItem.itemType !== MenuItemType.LINK || linkUrl === undefined) {
               return NextResponse.json({ message: 'LINK tipi için linkUrl gereklidir.' }, { status: 400 });
            }
        }
    }
    
    const updatedMenuItem = await prisma.$transaction(async (tx) => {
      await tx.footerMenuItem.update({
        where: { id: itemId },
        data: {
          order: order !== undefined ? order : existingItem.order,
          itemType: itemType ? (itemType as MenuItemType) : existingItem.itemType,
          linkUrl: itemType === MenuItemType.LINK ? (linkUrl !== undefined ? linkUrl : existingItem.linkUrl) : null,
          blogPostId: itemType === MenuItemType.BLOG_POST ? (blogPostId !== undefined ? blogPostId : existingItem.blogPostId) : null,
          hizmetId: itemType === MenuItemType.SERVICE_PAGE ? (hizmetId !== undefined ? hizmetId : existingItem.hizmetId) : null,
          openInNewTab: openInNewTab !== undefined ? openInNewTab : existingItem.openInNewTab,
          isActive: isActive !== undefined ? isActive : existingItem.isActive,
        },
      });

      if (translations && Array.isArray(translations)) {
        for (const trans of translations) {
          if (!trans.languageCode || !trans.title) {
            throw new Error('Her çeviri için languageCode ve title gereklidir.');
          }
          const existingTranslation = await tx.footerMenuItemTranslation.findUnique({
            where: { footerMenuItemId_languageCode: { footerMenuItemId: itemId, languageCode: trans.languageCode } },
          });

          if (existingTranslation) {
            await tx.footerMenuItemTranslation.update({
              where: { id: existingTranslation.id },
              data: { title: trans.title },
            });
          } else {
            await tx.footerMenuItemTranslation.create({
              data: {
                footerMenuItemId: itemId,
                languageCode: trans.languageCode,
                title: trans.title,
              },
            });
          }
        }
      }

      return tx.footerMenuItem.findUnique({
        where: { id: itemId },
        include: { translations: true },
      });
    });

    return NextResponse.json(updatedMenuItem);
  } catch (error: any) {
    console.error(`Error updating footer menu item with ID ${params.itemId}:`, error);
    if (error.code === 'P2002') { 
        return NextResponse.json({ message: `Bir çeviri için benzersizlik kısıtlaması ihlal edildi. Detay: ${error.meta?.target}` }, { status: 409 });
    }
    return NextResponse.json({ message: error.message || 'Footer menü öğesi güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Belirli bir footer menü öğesini sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;

    const existingItem = await prisma.footerMenuItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Silinecek footer menü öğesi bulunamadı.' }, { status: 404 });
    }

    await prisma.footerMenuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: `Footer menü öğesi (ID: ${itemId}) başarıyla silindi.` });
  } catch (error) {
    console.error(`Error deleting footer menu item with ID ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Footer menü öğesi silinirken bir hata oluştu.' }, { status: 500 });
  }
});
