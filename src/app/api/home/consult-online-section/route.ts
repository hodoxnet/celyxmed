import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en"; // Varsayılan olarak İngilizce

    // Ana kaydı bul (tek kayıt, ID'si "main")
    const consultOnlineSection = await prisma.consultOnlineSection.findUnique({
      where: {
        id: "main",
      },
      include: {
        // İlgili dile ait çeviriyi al
        translations: {
          where: {
            languageCode: locale,
          },
        },
        // Doktor avatarlarını al (sıralı olarak)
        doctorAvatars: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!consultOnlineSection) {
      return NextResponse.json(
        { error: "Consult online section not found" },
        { status: 404 }
      );
    }

    // Tek bir çeviriyi döndür, yoksa ilk çeviriyi kullan
    const translation = consultOnlineSection.translations[0];

    if (!translation) {
      return NextResponse.json(
        { error: `Translation not found for locale: ${locale}` },
        { status: 404 }
      );
    }

    // İstemciye gönderilecek veriyi hazırla
    const responseData = {
      ...consultOnlineSection,
      translation,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching consult online section:", error);
    return NextResponse.json(
      { error: "Failed to fetch consult online section" },
      { status: 500 }
    );
  }
}