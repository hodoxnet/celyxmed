import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin'; // Projenizdeki doğru yolu kullanın

interface Params {
  params: { menuId: string };
}

// GET: Belirli bir header menüsünü ID ile getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;

    const headerMenu = await prisma.headerMenu.findUnique({
      where: { id: menuId },
      include: {
        items: { // Menü öğelerini de getir
          orderBy: { order: 'asc' },
          include: {
            translations: true, // Tüm dillerdeki çeviriler
            children: { // Alt menü öğeleri ve onların çevirileri
              orderBy: { order: 'asc' },
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    if (!headerMenu) {
      return NextResponse.json({ message: 'Header menüsü bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(headerMenu);
  } catch (error) {
    console.error(`Error fetching header menu with ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Header menüsü getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Belirli bir header menüsünü güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;
    const body = await req.json();
    const { name, isActive } = body;

    const existingMenu = await prisma.headerMenu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return NextResponse.json({ message: 'Güncellenecek header menüsü bulunamadı.' }, { status: 404 });
    }

    if (name === undefined && isActive === undefined) {
      return NextResponse.json({ message: 'Güncellenecek alan (name veya isActive) gönderilmedi.' }, { status: 400 });
    }
    
    // İsteğe bağlı: Eğer isim değiştiriliyorsa, yeni ismin başka bir menüde kullanılmadığını kontrol et.
    // if (name && name !== existingMenu.name) {
    //   const anotherMenuWithSameName = await prisma.headerMenu.findFirst({
    //     where: { name, id: { not: menuId } },
    //   });
    //   if (anotherMenuWithSameName) {
    //     return NextResponse.json({ message: `'${name}' adında başka bir header menüsü zaten mevcut.` }, { status: 409 });
    //   }
    // }

    const updatedHeaderMenu = await prisma.headerMenu.update({
      where: { id: menuId },
      data: {
        name: name !== undefined ? name : existingMenu.name,
        isActive: isActive !== undefined ? isActive : existingMenu.isActive,
      },
    });

    return NextResponse.json(updatedHeaderMenu);
  } catch (error) {
    console.error(`Error updating header menu with ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Header menüsü güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Belirli bir header menüsünü sil
// Bu işlem, menüye bağlı tüm menü öğelerini ve çevirilerini de silecektir (Prisma şemasındaki onDelete: Cascade sayesinde).
// Genellikle ana header menüsü silinmez, ancak ihtiyaç duyulursa bu endpoint kullanılabilir.
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;

    const existingMenu = await prisma.headerMenu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return NextResponse.json({ message: 'Silinecek header menüsü bulunamadı.' }, { status: 404 });
    }

    // HeaderMenu silindiğinde, ilişkili HeaderMenuItem ve HeaderMenuItemTranslation kayıtları
    // Prisma şemasındaki onDelete: Cascade tanımlamaları sayesinde otomatik olarak silinecektir.
    await prisma.headerMenu.delete({
      where: { id: menuId },
    });

    return NextResponse.json({ message: `Header menüsü (ID: ${menuId}) başarıyla silindi.` });
  } catch (error) {
    console.error(`Error deleting header menu with ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Header menüsü silinirken bir hata oluştu.' }, { status: 500 });
  }
});
