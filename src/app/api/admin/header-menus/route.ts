import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin'; // Projenizdeki doğru yolu kullanın

// GET: Tüm header menülerini listele
export const GET = withAdmin(async (req: Request) => {
  try {
    const headerMenus = await prisma.headerMenu.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            translations: true, // Başlangıçta tüm dillerdeki çevirileri alabiliriz
            children: { // Alt menü öğelerini de alalım
              orderBy: { order: 'asc' },
              include: {
                translations: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Veya isme göre sıralama
    });

    // İstemciye daha temiz bir veri yapısı dönmek için formatlama yapılabilir
    // Şimdilik direkt Prisma sonucunu dönüyoruz.
    // Admin panelinde genellikle tek bir HeaderMenu olacağı varsayımıyla,
    // bu endpoint belki de o tek menüyü ve tüm öğelerini getirmek için kullanılabilir.
    // Ya da birden fazla header menü profili oluşturulmasına izin veriyorsa bu yapı uygundur.

    return NextResponse.json(headerMenus);
  } catch (error) {
    console.error("Error fetching header menus:", error);
    return NextResponse.json({ message: 'Header menüleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni bir header menüsü oluştur
// Genellikle sistemde tek bir ana header menüsü olur.
// Bu endpoint, ilk kurulumda veya nadir durumlarda yeni bir header menü tanımı eklemek için kullanılabilir.
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { name, isActive } = body;

    if (!name) {
      return NextResponse.json({ message: 'Menü adı gereklidir.' }, { status: 400 });
    }

    // İsteğe bağlı: Aynı isimde başka bir header menüsü var mı kontrol edilebilir.
    // Ancak genellikle tek bir HeaderMenu olacağı için bu kontrol çok kritik olmayabilir.
    // const existingMenu = await prisma.headerMenu.findFirst({ where: { name } });
    // if (existingMenu) {
    //   return NextResponse.json({ message: `'${name}' adında bir header menüsü zaten mevcut.` }, { status: 409 });
    // }

    const newHeaderMenu = await prisma.headerMenu.create({
      data: {
        name,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newHeaderMenu, { status: 201 });
  } catch (error) {
    console.error("Error creating header menu:", error);
    return NextResponse.json({ message: 'Header menüsü oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
