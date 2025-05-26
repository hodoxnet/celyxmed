import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en"; // Varsayılan olarak İngilizce

    console.log(`[DEBUG] Fetching ConsultOnlineSection for locale: ${locale}`);

    // Ana kaydı bul (tek kayıt, ID'si "main")
    const consultOnlineSection = await prisma.consultOnlineSection.findUnique({
      where: {
        id: "main",
      },
      include: {
        // Tüm çevirileri al
        translations: true,
        // Doktor avatarlarını al (sıralı olarak)
        doctorAvatars: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    console.log(`[DEBUG] ConsultOnlineSection found:`, !!consultOnlineSection);
    if (consultOnlineSection) {
      console.log(`[DEBUG] Number of translations:`, consultOnlineSection.translations.length);
      console.log(`[DEBUG] Available languages:`, consultOnlineSection.translations.map(t => t.languageCode));
      console.log(`[DEBUG] Number of doctor avatars:`, consultOnlineSection.doctorAvatars.length);
      console.log(`[DEBUG] Original imageUrl:`, consultOnlineSection.imageUrl);
    }
    
    if (!consultOnlineSection) {
      console.log(`[DEBUG] Section not found, returning 404`);
      return NextResponse.json(
        { error: "Consult online section not found" },
        { status: 404 }
      );
    }

    // İlgili dile ait çeviriyi bul
    const translation = consultOnlineSection.translations.find(
      (t) => t.languageCode === locale
    ) || consultOnlineSection.translations[0];

    if (!translation) {
      console.log(`[DEBUG] Translation not found for locale: ${locale}`);
      return NextResponse.json(
        { error: `Translation not found for locale: ${locale}` },
        { status: 404 }
      );
    }

    // Ana resim URL'sini güvenli bir şekilde işle
    let finalImageUrl = consultOnlineSection.imageUrl;
    // Eğer URL yoksa veya boşsa, null olarak bırak (varsayılan resim kullanılacak)
    if (!finalImageUrl) {
      finalImageUrl = null;
    } 
    // URL göreli bir yolsa (yani /uploads ile başlıyorsa) frontend tarafında doğru şekilde işlenecek

    // Doktor avatarlarını işle - URL'leri olduğu gibi bırak
    const finalDoctorAvatars = consultOnlineSection.doctorAvatars.map(avatar => ({
      ...avatar,
      // URL'yi olduğu gibi bırak
    }));

    // İstemciye gönderilecek veriyi hazırla
    const responseData = {
      id: consultOnlineSection.id,
      imageUrl: finalImageUrl,
      doctorAvatars: finalDoctorAvatars,
      translation,
    };

    console.log(`[DEBUG] Returning data with title:`, translation.title);
    console.log(`[DEBUG] Final imageUrl:`, finalImageUrl);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching consult online section:", error);
    return NextResponse.json(
      { error: "Failed to fetch consult online section" },
      { status: 500 }
    );
  }
}