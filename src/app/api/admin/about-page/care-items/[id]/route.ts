import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";

export const GET = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    const careItem = await prisma.aboutPageCareItem.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    if (!careItem) {
      return NextResponse.json(
        { error: "Kapsamlı bakım öğesi bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(careItem);
  } catch (error) {
    console.error("Kapsamlı bakım öğesi alınırken hata:", error);
    return NextResponse.json(
      { error: "Kapsamlı bakım öğesi alınamadı." },
      { status: 500 }
    );
  }
});

export const PUT = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const data = await req.json();
    const { translations, order } = data;
    
    // Kapsamlı bakım öğesinin varlığını kontrol et
    const existingCareItem = await prisma.aboutPageCareItem.findUnique({
      where: { id },
    });

    if (!existingCareItem) {
      return NextResponse.json(
        { error: "Kapsamlı bakım öğesi bulunamadı." },
        { status: 404 }
      );
    }

    // Kapsamlı bakım öğesini güncelle
    await prisma.aboutPageCareItem.update({
      where: { id },
      data: {
        order: order !== undefined ? order : existingCareItem.order,
      },
    });

    // Çevirileri güncelle
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        if (!translation.languageCode) continue;

        await prisma.aboutPageCareItemTranslation.upsert({
          where: {
            careItemId_languageCode: {
              careItemId: id,
              languageCode: translation.languageCode,
            },
          },
          update: {
            title: translation.title || "",
            description: translation.description || "",
          },
          create: {
            careItem: { connect: { id } },
            language: { connect: { code: translation.languageCode } },
            title: translation.title || "",
            description: translation.description || "",
          },
        });
      }
    }

    // Güncellenmiş kapsamlı bakım öğesini getir
    const updatedCareItem = await prisma.aboutPageCareItem.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCareItem);
  } catch (error) {
    console.error("Kapsamlı bakım öğesi güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Kapsamlı bakım öğesi güncellenemedi." },
      { status: 500 }
    );
  }
});

export const DELETE = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    // Kapsamlı bakım öğesini ve ilişkili çevirileri sil
    await prisma.aboutPageCareItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kapsamlı bakım öğesi silinirken hata:", error);
    return NextResponse.json(
      { error: "Kapsamlı bakım öğesi silinemedi." },
      { status: 500 }
    );
  }
});