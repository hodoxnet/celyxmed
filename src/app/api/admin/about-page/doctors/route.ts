import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const doctors = await prisma.aboutPageDoctor.findMany({
      where: { aboutPageId: "main" },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Doktorlar alınırken hata:", error);
    return NextResponse.json(
      { error: "Doktorlar alınamadı." },
      { status: 500 }
    );
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { imageUrl, translations, order = 0 } = data;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Doktor fotoğrafı zorunludur." },
        { status: 400 }
      );
    }

    // Ana sayfa oluşturulduğundan emin ol
    await prisma.aboutPage.upsert({
      where: { id: "main" },
      create: { id: "main" },
      update: {},
    });

    // Yeni doktor ekle
    const doctor = await prisma.aboutPageDoctor.create({
      data: {
        aboutPage: { connect: { id: "main" } },
        imageUrl,
        order,
      },
    });

    // Çevirileri ekle
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        if (!translation.languageCode) continue;

        await prisma.aboutPageDoctorTranslation.create({
          data: {
            doctor: { connect: { id: doctor.id } },
            language: { connect: { code: translation.languageCode } },
            name: translation.name || "",
            title: translation.title || "",
            description: translation.description || "",
            profileUrl: translation.profileUrl || null,
          },
        });
      }
    }

    // Tüm çevirilerle birlikte doktoru getir
    const result = await prisma.aboutPageDoctor.findUnique({
      where: { id: doctor.id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Doktor eklenirken hata:", error);
    return NextResponse.json(
      { error: "Doktor eklenemedi." },
      { status: 500 }
    );
  }
});