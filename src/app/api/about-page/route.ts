import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lang = searchParams.get("lang") || "tr";

    // Ana Hakkımızda sayfası verisini ve ilgili dildeki çevirisini getir
    const aboutPage = await prisma.aboutPage.findUnique({
      where: { id: "main" },
      include: {
        translations: {
          where: { languageCode: lang },
        },
        galleryImages: {
          orderBy: { order: "asc" },
        },
        careItems: {
          orderBy: { order: "asc" },
          include: {
            translations: {
              where: { languageCode: lang },
            },
          },
        },
        doctors: {
          orderBy: { order: "asc" },
          include: {
            translations: {
              where: { languageCode: lang },
            },
          },
        },
      },
    });

    if (!aboutPage) {
      return NextResponse.json({ error: "Hakkımızda sayfası verisi bulunamadı" }, { status: 404 });
    }

    // API yanıt formatını düzenle
    const translation = aboutPage.translations[0] || {};

    // Kapsamlı bakım öğelerini düzenle
    const careItems = aboutPage.careItems.map(item => ({
      id: item.id,
      order: item.order,
      ...item.translations[0]
    })).filter(item => item.title); // Sadece çevirisi olanları göster

    // Doktorları düzenle
    const doctors = aboutPage.doctors.map(doctor => {
      const translation = doctor.translations.find(t => t.languageCode === lang) ||
                          doctor.translations[0];

      if (!translation) return null;

      return {
        id: doctor.id,
        imageUrl: doctor.imageUrl,
        order: doctor.order,
        name: translation.name,
        title: translation.title,
        description: translation.description,
        profileUrl: translation.profileUrl
      };
    }).filter(doctor => doctor && doctor.name); // Sadece çevirisi olanları göster

    return NextResponse.json({
      id: aboutPage.id,
      heroImageUrl: aboutPage.heroImageUrl,
      galleryImages: aboutPage.galleryImages,
      careItems,
      doctors,
      doctorsTitle: translation?.doctorsTitle || "Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz",
      doctorsDescription: translation?.doctorsDescription || "",
      ...translation
    });
  } catch (error) {
    console.error("Hakkımızda sayfası verisi alınırken hata:", error);
    return NextResponse.json(
      { error: "Hakkımızda sayfası verilerini alma sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}