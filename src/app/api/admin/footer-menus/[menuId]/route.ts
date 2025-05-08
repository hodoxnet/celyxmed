import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

interface Params {
  params: { menuId: string };
}

// GET: Belirli bir footer menü grubunu ID ile getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;

    const footerMenu = await prisma.footerMenu.findUnique({
      where: { id: menuId },
      include: {
        items: { // Menü grubunun öğelerini de getir
          orderBy: { order: 'asc' },
          include: {
            translations: true, // Tüm dillerdeki çeviriler
          },
        },
      },
    });

    if (!footerMenu) {
      return NextResponse.json({ message: 'Footer menü grubu bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(footerMenu);
  } catch (error) {
    console.error(`Error fetching footer menu with ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Footer menü grubu getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Belirli bir footer menü grubunu güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;
    const body = await req.json();
    const { name, order, isActive } = body;

    const existingMenu = await prisma.footerMenu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return NextResponse.json({ message: 'Güncellenecek footer menü grubu bulunamadı.' }, { status: 404 });
    }

    if (name === undefined && isActive === undefined && order === undefined) {
      return NextResponse.json({ message: 'Güncellenecek alan (name, order veya isActive) gönderilmedi.' }, { status: 400 });
    }
    
    if (name && name !== existingMenu.name) {
      const anotherMenuWithSameName = await prisma.footerMenu.findFirst({
        where: { name, id: { not: menuId } },
      });
      if (anotherMenuWithSameName) {
        return NextResponse.json({ message: `'${name}' adında başka bir footer menü grubu zaten mevcut.` }, { status: 409 });
      }
    }

    const updatedFooterMenu = await prisma.footerMenu.update({
      where: { id: menuId },
      data: {
        name: name !== undefined ? name : existingMenu.name,
        order: order !== undefined ? order : existingMenu.order,
        isActive: isActive !== undefined ? isActive : existingMenu.isActive,
      },
    });

    return NextResponse.json(updatedFooterMenu);
  } catch (error) {
    console.error(`Error updating footer menu with ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Footer menü grubu güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Belirli bir footer menü grubunu sil
// Bu işlem, menü grubuna bağlı tüm menü öğelerini ve çevirilerini de silecektir.
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { menuId } = params;

    const existingMenu = await prisma.footerMenu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return NextResponse.json({ message: 'Silinecek footer menü grubu bulunamadı.' }, { status: 404 });
    }

    await prisma.footerMenu.delete({
      where: { id: menuId },
    });

    return NextResponse.json({ message: `Footer menü grubu (ID: ${menuId}) başarıyla silindi.` });
  } catch (error) {
    console.error(`Error deleting footer menu with ID ${params.menuId}:`, error);
    return NextResponse.json({ message: 'Footer menü grubu silinirken bir hata oluştu.' }, { status: 500 });
  }
});
