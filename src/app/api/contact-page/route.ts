import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lang = searchParams.get("lang") || "tr";

    // Ana İletişim sayfası verisini ve ilgili dildeki çevirisini getir
    const contactPage = await prisma.contactPage.findUnique({
      where: { id: "main" },
      include: {
        translations: {
          where: { languageCode: lang },
        },
      },
    });

    if (!contactPage) {
      return NextResponse.json({ error: "İletişim sayfası verisi bulunamadı" }, { status: 404 });
    }

    // API yanıt formatını düzenle
    const translation = contactPage.translations[0] || {};

    return NextResponse.json({
      id: contactPage.id,
      heroImageUrl: contactPage.heroImageUrl,
      ...translation
    });
  } catch (error) {
    console.error("İletişim sayfası verisi alınırken hata:", error);
    return NextResponse.json(
      { error: "İletişim sayfası verilerini alma sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { translations, heroImageUrl } = body;

    // İletişim sayfasını oluştur veya güncelle
    const contactPage = await prisma.contactPage.upsert({
      where: { id: "main" },
      update: {
        heroImageUrl,
        updatedAt: new Date(),
      },
      create: {
        id: "main",
        heroImageUrl,
      },
    });

    // Her dil için çevirileri güncelle
    if (translations && typeof translations === 'object') {
      for (const [languageCode, translationData] of Object.entries(translations)) {
        if (typeof translationData === 'object' && translationData !== null) {
          // Ana modele ait alanları çıkar
          const { 
            id, 
            heroImageUrl: _, 
            contactPageId: __, 
            languageCode: ___, 
            createdAt: ____, 
            updatedAt: _____,
            ...cleanTranslationData 
          } = translationData as any;

          await prisma.contactPageTranslation.upsert({
            where: {
              contactPageId_languageCode: {
                contactPageId: contactPage.id,
                languageCode: languageCode,
              },
            },
            update: {
              ...cleanTranslationData,
              updatedAt: new Date(),
            },
            create: {
              contactPageId: contactPage.id,
              languageCode: languageCode,
              ...cleanTranslationData,
            },
          });
        }
      }
    }

    // Güncellenmiş veriyi döndür
    const updatedContactPage = await prisma.contactPage.findUnique({
      where: { id: "main" },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(updatedContactPage);
  } catch (error) {
    console.error("İletişim sayfası güncellenirken hata:", error);
    return NextResponse.json(
      { error: "İletişim sayfası güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}