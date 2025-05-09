import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { z } from 'zod'; // Zod'u import et

// GET: Tüm footer menülerini (gruplarını) listele
export const GET = withAdmin(async (req: Request) => {
  try {
    const footerMenus = await prisma.footerMenu.findMany({
      include: {
        translations: true, // Ana FooterMenu çevirilerini dahil et
        items: { // Sadece öğe sayısını almak için
          select: { id: true } 
        },
      },
      orderBy: { order: 'asc' }, 
    });

    return NextResponse.json(footerMenus);
  } catch (error: any) { // error tipini 'any' olarak değiştirelim
    console.error("Error fetching footer menus:", error);
    return NextResponse.json({ message: 'Footer menüleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni bir footer menü grubu oluştur
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    
    const createFooterMenuSchema = z.object({
      translations: z.record(z.string().min(1), z.string().min(1, "Grup adı boş olamaz.")),
      order: z.number().int().min(0).optional().default(0),
      isActive: z.boolean().optional().default(true),
    });

    const validation = createFooterMenuSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: validation.error.errors }, { status: 400 });
    }
    
    const { translations, order, isActive } = validation.data;
    const providedLangCodes = Object.keys(translations);

    if (providedLangCodes.length === 0) {
        return NextResponse.json({ message: 'En az bir çeviri sağlanmalıdır.' }, { status: 400 });
    }

    // Aynı isimde (herhangi bir dilde) başka bir footer menü grubu var mı kontrolü daha karmaşık hale gelir.
    // Şimdilik bu kontrolü atlıyoruz, Prisma'nın unique constraint'leri (eğer varsa) bunu yönetebilir.
    // Veya daha detaylı bir kontrol eklenebilir.

    const newFooterMenu = await prisma.footerMenu.create({
      data: {
        order,
        isActive,
        translations: {
          createMany: {
            data: providedLangCodes.map(langCode => ({
              languageCode: langCode,
              name: translations[langCode],
            })),
          },
        },
      },
      include: { // Oluşturulan menüyü çevirileriyle birlikte dön
        translations: true,
      },
    });

    return NextResponse.json(newFooterMenu, { status: 201 });
  } catch (error: any) { // error tipini 'any' olarak değiştirelim
    console.error("Error creating footer menu:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Veri doğrulama hatası.', errors: error.errors }, { status: 400 });
    }
    // Prisma'nın P2002 unique constraint hatası, eğer (footerMenuId, languageCode) unique ise,
    // createMany içinde aynı dil kodu birden fazla gelirse veya veritabanında zaten varsa oluşabilir.
    // Ancak bizim yapımızda bu durumun oluşmaması gerekir.
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: 'Benzersizlik kısıtlaması ihlal edildi.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Footer menüsü oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
