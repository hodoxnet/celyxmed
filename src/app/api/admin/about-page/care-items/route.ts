import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const careItems = await prisma.aboutPageCareItem.findMany({
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

    return NextResponse.json(careItems);
  } catch (error) {
    console.error("Kapsamlı bakım öğeleri alınırken hata:", error);
    return NextResponse.json(
      { error: "Kapsamlı bakım öğeleri alınamadı." },
      { status: 500 }
    );
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { translations, order = 0 } = data;

    // Ana sayfa oluşturulduğundan emin ol
    await prisma.aboutPage.upsert({
      where: { id: "main" },
      create: { id: "main" },
      update: {},
    });

    // Yeni kapsamlı bakım öğesi ekle
    const careItem = await prisma.aboutPageCareItem.create({
      data: {
        aboutPage: { connect: { id: "main" } },
        order,
      },
    });

    // Çevirileri ekle
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        if (!translation.languageCode) continue;

        await prisma.aboutPageCareItemTranslation.create({
          data: {
            careItem: { connect: { id: careItem.id } },
            language: { connect: { code: translation.languageCode } },
            title: translation.title || "",
            description: translation.description || "",
          },
        });
      }
    }

    // Tüm çevirilerle birlikte kapsamlı bakım öğesini getir
    const result = await prisma.aboutPageCareItem.findUnique({
      where: { id: careItem.id },
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
    console.error("Kapsamlı bakım öğesi eklenirken hata:", error);
    return NextResponse.json(
      { error: "Kapsamlı bakım öğesi eklenemedi." },
      { status: 500 }
    );
  }
});