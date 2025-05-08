import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import fs from 'fs/promises'; // Dosya sistemi işlemleri için
import path from 'path'; // Dosya yolları için

const HERO_CONTENT_ID = "main"; // Sabit ID

// GET: Hero içeriğini ve resimlerini getir
export const GET = withAdmin(async (req: Request) => {
  try {
    let heroContent = await prisma.heroContent.findUnique({
      where: { id: HERO_CONTENT_ID },
      include: {
        translations: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Eğer içerik yoksa, ilk defa oluştur
    if (!heroContent) {
      heroContent = await prisma.heroContent.create({
        data: {
          id: HERO_CONTENT_ID,
        },
        include: {
          translations: true,
          images: true,
        },
      });
    }

    return NextResponse.json(heroContent);
  } catch (error) {
    console.error("Error fetching hero content:", error);
    return NextResponse.json({ message: 'Hero içeriği getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Hero içeriğini ve resimlerini güncelle
export const PUT = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { translations, images: newImagesData } = body; // Gelen resim listesi

    // --- Fiziksel Dosya Silme Mantığı ---
    // 1. Mevcut resim kayıtlarını veritabanından al
    const existingImages = await prisma.heroBackgroundImage.findMany({
      where: { heroContentId: HERO_CONTENT_ID },
      select: { imageUrl: true }, // Sadece URL'leri al
    });
    const existingImageUrls = existingImages.map(img => img.imageUrl);

    // 2. Yeni listede olmayan ve silinecek resim URL'lerini bul
    const newImageUrls = newImagesData?.map((img: { imageUrl: string }) => img.imageUrl).filter(Boolean) || [];
    const urlsToDelete = existingImageUrls.filter(url => !newImageUrls.includes(url));

    // 3. Fiziksel dosyaları sil
    for (const imageUrlToDelete of urlsToDelete) {
      try {
        // imageUrl'in /uploads/ ile başladığını varsayıyoruz
        if (imageUrlToDelete && imageUrlToDelete.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', imageUrlToDelete);
          await fs.unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      } catch (error: any) {
        // Dosya bulunamazsa veya başka bir hata olursa logla ama devam et
        if (error.code !== 'ENOENT') { 
          console.error(`Error deleting file ${imageUrlToDelete}:`, error);
        }
      }
    }
    // --- Fiziksel Dosya Silme Mantığı Sonu ---


    const result = await prisma.$transaction(async (tx) => {
      // 1. HeroContent kaydının var olduğundan emin ol
       await tx.heroContent.upsert({
         where: { id: HERO_CONTENT_ID },
         update: {}, // Güncelleme yok, sadece varlığını kontrol et
         create: { id: HERO_CONTENT_ID },
       });

      // 2. Çevirileri güncelle/oluştur (upsert)
      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          if (translation.languageCode) {
            await tx.heroContentTranslation.upsert({
              where: {
                heroContentId_languageCode: {
                  heroContentId: HERO_CONTENT_ID,
                  languageCode: translation.languageCode,
                },
              },
              update: {
                title: translation.title,
                description: translation.description,
                button1Text: translation.button1Text,
                button1Link: translation.button1Link,
                button2Text: translation.button2Text,
                button2Link: translation.button2Link,
              },
              create: {
                heroContentId: HERO_CONTENT_ID,
                languageCode: translation.languageCode,
                title: translation.title,
                description: translation.description,
                button1Text: translation.button1Text,
                button1Link: translation.button1Link,
                button2Text: translation.button2Text,
                button2Link: translation.button2Link,
              },
            });
          }
        }
      }

      // 3. Veritabanındaki Resimleri Güncelle (Mevcutları silip yenileri ekle)
      if (newImagesData && Array.isArray(newImagesData)) {
        // Önce mevcut tüm resim kayıtlarını sil (veritabanından)
        await tx.heroBackgroundImage.deleteMany({
          where: { heroContentId: HERO_CONTENT_ID },
        });

        // Sonra yeni resim kayıtlarını ekle (veritabanına)
        for (let i = 0; i < newImagesData.length; i++) {
          const image = newImagesData[i];
          if (image.imageUrl) {
            await tx.heroBackgroundImage.create({
              data: {
                heroContentId: HERO_CONTENT_ID,
                imageUrl: image.imageUrl,
                order: image.order ?? i, 
                isActive: image.isActive === undefined ? true : image.isActive, // Formdan gelmiyorsa default true
              },
            });
          }
        }
      }
      
      // Güncellenmiş veriyi döndür
      return await tx.heroContent.findUnique({
        where: { id: HERO_CONTENT_ID },
        include: {
          translations: true,
          images: {
             orderBy: { order: 'asc' },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating hero content:", error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message || 'Hero içeriği güncellenirken bir hata oluştu.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Hero içeriği güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});
