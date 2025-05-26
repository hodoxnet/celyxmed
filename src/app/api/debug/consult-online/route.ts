import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";

    console.log(`[DEBUG-API] Fetching ConsultOnlineSection for locale: ${locale}`);

    // Ana kaydı bul
    const consultOnlineSection = await prisma.consultOnlineSection.findUnique({
      where: { id: "main" },
      include: {
        translations: true,
        doctorAvatars: { orderBy: { order: "asc" } }
      }
    });

    if (!consultOnlineSection) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Görsel URL detayları
    const imageDetails = {
      raw: consultOnlineSection.imageUrl,
      isAbsolute: consultOnlineSection.imageUrl?.startsWith('http'),
      includesHost: consultOnlineSection.imageUrl?.includes('localhost') || 
                   consultOnlineSection.imageUrl?.includes('.com') ||
                   consultOnlineSection.imageUrl?.includes('.org'),
      fullUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}${consultOnlineSection.imageUrl || ''}`
    };

    // Avatar URL detayları
    const avatarDetails = consultOnlineSection.doctorAvatars.map(avatar => ({
      id: avatar.id,
      raw: avatar.imageUrl,
      isAbsolute: avatar.imageUrl?.startsWith('http'),
      includesHost: avatar.imageUrl?.includes('localhost') || 
                   avatar.imageUrl?.includes('.com') ||
                   avatar.imageUrl?.includes('.org'),
      fullUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}${avatar.imageUrl || ''}`
    }));

    // Detaylı hata ayıklama bilgisi dön
    return NextResponse.json({
      section: {
        id: consultOnlineSection.id,
        imageUrl: consultOnlineSection.imageUrl,
      },
      imageDetails,
      translations: consultOnlineSection.translations.map(t => ({
        languageCode: t.languageCode,
        title: t.title
      })),
      avatarCount: consultOnlineSection.doctorAvatars.length,
      avatarDetails,
      env: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not defined'
      }
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}