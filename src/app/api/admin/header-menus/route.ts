import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin'; // Projenizdeki doğru yolu kullanın
import { z } from 'zod'; // Zod'u en üste taşıyalım

// GET: Tüm header menülerini listele
export const GET = withAdmin(async (req: Request) => {
  try {
    const headerMenus = await prisma.headerMenu.findMany({
      include: {
        translations: true, // Ana HeaderMenu çevirilerini dahil et
        items: { // Sadece öğe sayısını almak için veya temel bilgileri
          select: { id: true } // Frontend'de sadece sayı gösteriliyorsa bu yeterli
          // Eğer öğelerin detayları da listeleme sayfasında gerekliyse, mevcut include kalabilir:
          // orderBy: { order: 'asc' },
          // include: {
          //   translations: true, 
          //   children: { 
          //     orderBy: { order: 'asc' },
          //     include: {
          //       translations: true,
          //     },
          //   },
          // },
        },
      },
      orderBy: { createdAt: 'desc' },
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
    const { translations, isActive } = body; // 'name' yerine 'translations' al

    // Zod ile doğrulama (opsiyonel ama önerilir, /api/menus/header/route.ts'deki gibi)
    const createHeaderMenuSchema = z.object({
      translations: z.record(z.string().min(1), z.string().min(1, "Menü adı boş olamaz.")),
      isActive: z.boolean().optional().default(true),
    });

    const validation = createHeaderMenuSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: validation.error.errors }, { status: 400 });
    }
    
    const { translations: validatedTranslations, isActive: validatedIsActive } = validation.data;
    const providedLangCodes = Object.keys(validatedTranslations);

    if (providedLangCodes.length === 0) {
        return NextResponse.json({ message: 'En az bir çeviri sağlanmalıdır.' }, { status: 400 });
    }

    const newHeaderMenu = await prisma.headerMenu.create({
      data: {
        isActive: validatedIsActive,
        translations: {
          createMany: {
            data: providedLangCodes.map(langCode => ({
              languageCode: langCode,
              name: validatedTranslations[langCode],
            })),
          },
        },
      },
      include: { // Oluşturulan menüyü çevirileriyle birlikte dön
        translations: true,
      },
    });

    return NextResponse.json(newHeaderMenu, { status: 201 });
  } catch (error: any) { // error tipini 'any' olarak değiştirelim
    console.error("Error creating header menu:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Veri doğrulama hatası.', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: 'Benzersizlik kısıtlaması ihlal edildi.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Header menüsü oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
// POST fonksiyonu için eksik olan kapanış parantezi yok gibi görünüyor, önceki diff'te bir hata olmuş olabilir.
// Eğer hala '}' expected hatası alıyorsanız, tüm dosyanın sonunu kontrol edin.
// Şimdilik sadece error tipini ve import sırasını düzelttim.
// GET metodunun başındaki duplicate import ve export satırları da kaldırıldı.
