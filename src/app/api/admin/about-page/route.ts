import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    // Ana Hakkımızda sayfası kaydını ara, yoksa oluştur
    let aboutPage = await prisma.aboutPage.findUnique({
      where: { id: "main" },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        galleryImages: {
          orderBy: {
            order: "asc",
          },
        },
        careItems: {
          orderBy: {
            order: "asc",
          },
          include: {
            translations: {
              include: {
                language: true,
              },
            },
          },
        },
        doctors: {
          orderBy: {
            order: "asc",
          },
          include: {
            translations: {
              include: {
                language: true,
              },
            },
          },
        },
      },
    });

    // Eğer kayıt yoksa boş bir kayıt oluştur
    if (!aboutPage) {
      aboutPage = await prisma.aboutPage.create({
        data: {
          id: "main",
        },
        include: {
          translations: {
            include: {
              language: true,
            },
          },
          galleryImages: true,
          careItems: {
            include: {
              translations: true,
            },
          },
          doctors: {
            include: {
              translations: true,
            },
          },
        },
      });
    }

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error("Hakkımızda sayfası verileri alınırken hata:", error);
    return NextResponse.json(
      { error: "Hakkımızda sayfası verileri alınamadı." },
      { status: 500 }
    );
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { translations, galleryImages, careItems, doctors, ...rest } = data;

    // Ana sayfa verilerini güncelle
    const aboutPage = await prisma.aboutPage.upsert({
      where: { id: "main" },
      update: { ...rest },
      create: { id: "main", ...rest },
    });

    // Çevirileri güncelle
    if (translations && Array.isArray(translations)) {
      // Önce mevcut çevirileri getir
      const existingTranslations = await prisma.aboutPageTranslation.findMany({
        where: { aboutPageId: "main" },
        select: { id: true, languageCode: true },
      });

      console.log("Mevcut çeviriler:", existingTranslations);
      console.log("Gelen çeviriler:", translations);

      // Yeni çevirileri upsert işlemi ile oluştur/güncelle
      for (const translation of translations) {
        const { languageCode, ...translationData } = translation;

        if (!languageCode) {
          console.log("Dil kodu olmayan çeviri atlandı:", translation);
          continue;
        }

        // Gerekli alanların varlığını kontrol et
        const requiredFields = [
          "heroTitle", "heroDescription",
          "heroPrimaryButtonText", "heroPrimaryButtonLink",
          "heroSecondaryButtonText", "heroSecondaryButtonLink",
          "jciTitle", "jciPrimaryButtonText", "jciPrimaryButtonLink",
          "jciSecondaryButtonText", "jciSecondaryButtonLink",
          "doctorsTitle", "doctorsDescription"
        ];

        // Temiz veri oluştur, sadece gerekli alanları al
        const cleanTranslationData: Record<string, any> = {};
        for (const field of requiredFields) {
          // Eksik alanları varsayılan değerlerle doldur
          cleanTranslationData[field] = translationData[field] || "";
        }

        // Veritabanı tarafından otomatik oluşturulan alanları ve ilişkileri temizle
        const fieldsToRemove = ['id', 'language', 'createdAt', 'updatedAt', 'aboutPageId'];
        fieldsToRemove.forEach(field => {
          if (field in cleanTranslationData) {
            delete cleanTranslationData[field];
          }
        });

        try {
          await prisma.aboutPageTranslation.upsert({
            where: {
              aboutPageId_languageCode: {
                aboutPageId: "main",
                languageCode,
              },
            },
            update: cleanTranslationData,
            create: {
              aboutPageId: "main",
              languageCode,
              ...cleanTranslationData,
            },
          });
        } catch (err) {
          console.error(`Çeviri güncellenirken hata (${languageCode}):`, err);
          throw new Error(`${languageCode} dili için çeviri güncellenirken hata: ${err.message}`);
        }
      }
    }

    return NextResponse.json({ success: true, aboutPage });
  } catch (error) {
    console.error("Hakkımızda sayfası verilerini kaydederken hata:", error);
    return NextResponse.json(
      {
        error: "Hakkımızda sayfası verileri kaydedilemedi.",
        message: error instanceof Error ? error.message : "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
});