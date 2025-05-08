import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm footer menülerini (gruplarını) listele
export const GET = withAdmin(async (req: Request) => {
  try {
    const footerMenus = await prisma.footerMenu.findMany({
      include: {
        items: { // Her bir menü grubunun öğelerini de getir
          orderBy: { order: 'asc' },
          include: {
            translations: true, // Tüm dillerdeki çeviriler
            // Footer'da genellikle derin alt menüler olmaz, bu yüzden children'ı burada çekmeyebiliriz.
            // İstenirse eklenebilir.
          },
        },
      },
      orderBy: { order: 'asc' }, // Footer menü gruplarını sırala (örn: treatments, about, resources)
    });

    return NextResponse.json(footerMenus);
  } catch (error) {
    console.error("Error fetching footer menus:", error);
    return NextResponse.json({ message: 'Footer menüleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni bir footer menü grubu oluştur
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { name, order, isActive } = body;

    if (!name) {
      return NextResponse.json({ message: 'Footer menü grubu adı gereklidir.' }, { status: 400 });
    }

    // Aynı isimde başka bir footer menü grubu var mı kontrol edilebilir
    const existingMenu = await prisma.footerMenu.findFirst({ where: { name } });
    if (existingMenu) {
      return NextResponse.json({ message: `'${name}' adında bir footer menü grubu zaten mevcut.` }, { status: 409 });
    }

    const newFooterMenu = await prisma.footerMenu.create({
      data: {
        name,
        order: order !== undefined ? order : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newFooterMenu, { status: 201 });
  } catch (error) {
    console.error("Error creating footer menu:", error);
    return NextResponse.json({ message: 'Footer menüsü oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
