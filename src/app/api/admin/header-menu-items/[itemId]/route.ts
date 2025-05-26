import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin'; // Projenizdeki doğru yolu kullanın

// MenuItemType enum'ını manuel olarak tanımla (Prisma şemasıyla aynı olmalı)
// Bu enum, @prisma/client'tan import edilemiyorsa geçici bir çözümdür.
// İdeal olanı, Prisma Client'ın bu enum'ı doğru şekilde export etmesidir.
enum MenuItemType {
  LINK = "LINK",
  BLOG_POST = "BLOG_POST",
  SERVICE_PAGE = "SERVICE_PAGE",
}

interface Params {
  params: { itemId: string };
}

// GET: Belirli bir header menü öğesini ID ile getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;

    // URL'den dil parametresini al (opsiyonel)
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    const menuItem = await prisma.headerMenuItem.findUnique({
      where: { id: itemId },
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
        // headerMenu: true, // Üst menü bilgisi de istenirse eklenebilir
        // blogPost: true,   // İlişkili blog yazısı
        // hizmet: true,     // İlişkili hizmet
      },
    });

    if (!menuItem) {
      return NextResponse.json({ message: 'Header menü öğesi bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error(`Error fetching header menu item with ID ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Header menü öğesi getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Belirli bir header menü öğesini güncelle
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
      parentId, // Üst öğe değiştirilebilir mi? Genellikle bu tür değişiklikler daha karmaşıktır.
      translations, // [{ languageCode: 'tr', title: 'Yeni Başlık' }, ...]
    } = body;

    const existingItem = await prisma.headerMenuItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Güncellenecek header menü öğesi bulunamadı.' }, { status: 404 });
    }

    // itemType'a göre gerekli alanların kontrolü (eğer itemType değiştiriliyorsa)
    if (itemType) {
      if (itemType === MenuItemType.LINK && linkUrl === undefined && !existingItem.linkUrl) {
        // Eğer tip LINK'e değiştiriliyorsa ve linkUrl yoksa (ve önceden de yoksa) hata ver.
        // Eğer tip zaten LINK ise ve linkUrl değiştirilmiyorsa sorun yok.
        if (existingItem.itemType !== MenuItemType.LINK || linkUrl === undefined) {
           return NextResponse.json({ message: 'LINK tipi için linkUrl gereklidir.' }, { status: 400 });
        }
      }
      // Diğer tip kontrolleri benzer şekilde eklenebilir.
    }
    
    // Eğer parentId değiştiriliyorsa, yeni parent'ın varlığını ve aynı menüye ait olduğunu kontrol et
    if (parentId && parentId !== existingItem.parentId) {
        if (parentId === itemId) { // Kendine parent olamaz
            return NextResponse.json({ message: 'Bir menü öğesi kendisine üst öğe olarak atanamaz.' }, { status: 400 });
        }
        const parentItemExists = await prisma.headerMenuItem.findFirst({
            where: { id: parentId, headerMenuId: existingItem.headerMenuId } // Aynı menüde olmalı
        });
        if (!parentItemExists) {
            return NextResponse.json({ message: 'Belirtilen yeni üst menü öğesi bu menüye ait değil veya bulunamadı.' }, { status: 400 });
        }
    }


    const updatedMenuItem = await prisma.$transaction(async (tx) => {
      await tx.headerMenuItem.update({
        where: { id: itemId },
        data: {
          order: order !== undefined ? order : existingItem.order,
          itemType: itemType ? (itemType as MenuItemType) : existingItem.itemType,
          linkUrl: itemType === MenuItemType.LINK ? (linkUrl !== undefined ? linkUrl : existingItem.linkUrl) : null,
          blogPostId: itemType === MenuItemType.BLOG_POST ? (blogPostId !== undefined ? blogPostId : existingItem.blogPostId) : null,
          hizmetId: itemType === MenuItemType.SERVICE_PAGE ? (hizmetId !== undefined ? hizmetId : existingItem.hizmetId) : null,
          openInNewTab: openInNewTab !== undefined ? openInNewTab : existingItem.openInNewTab,
          isActive: isActive !== undefined ? isActive : existingItem.isActive,
          parentId: parentId !== undefined ? parentId : existingItem.parentId,
        },
      });

      if (translations && Array.isArray(translations)) {
        for (const trans of translations) {
          if (!trans.languageCode || !trans.title) {
            throw new Error('Her çeviri için languageCode ve title gereklidir.');
          }
          const existingTranslation = await tx.headerMenuItemTranslation.findUnique({
            where: { headerMenuItemId_languageCode: { headerMenuItemId: itemId, languageCode: trans.languageCode } },
          });

          if (existingTranslation) {
            await tx.headerMenuItemTranslation.update({
              where: { id: existingTranslation.id },
              data: { title: trans.title },
            });
          } else {
            await tx.headerMenuItemTranslation.create({
              data: {
                headerMenuItemId: itemId,
                languageCode: trans.languageCode,
                title: trans.title,
              },
            });
          }
        }
      }

      return tx.headerMenuItem.findUnique({
        where: { id: itemId },
        include: { translations: true, children: true },
      });
    });

    return NextResponse.json(updatedMenuItem);
  } catch (error: any) {
    console.error(`Error updating header menu item with ID ${params.itemId}:`, error);
     if (error.code === 'P2002') { 
        return NextResponse.json({ message: `Bir çeviri için benzersizlik kısıtlaması ihlal edildi. Detay: ${error.meta?.target}` }, { status: 409 });
    }
    return NextResponse.json({ message: error.message || 'Header menü öğesi güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Belirli bir header menü öğesini sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;

    const existingItem = await prisma.headerMenuItem.findUnique({
      where: { id: itemId },
      include: { children: true } // Alt öğeleri var mı kontrol etmek için
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Silinecek header menü öğesi bulunamadı.' }, { status: 404 });
    }

    // Eğer alt öğeleri varsa ve bu alt öğelerin parentId'leri bu öğeye işaret ediyorsa,
    // Prisma şemasındaki onDelete: Cascade sayesinde alt öğeler de silinecektir.
    // Eğer alt öğelerin parentId'lerinin null yapılması isteniyorsa, bu işlem manuel yapılmalı.
    // Şimdiki şemada Cascade olduğu için direkt silme işlemi yapılabilir.

    await prisma.headerMenuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: `Header menü öğesi (ID: ${itemId}) başarıyla silindi.` });
  } catch (error) {
    console.error(`Error deleting header menu item with ID ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Header menü öğesi silinirken bir hata oluştu.' }, { status: 500 });
  }
});
