import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";

export const GET = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    const doctor = await prisma.aboutPageDoctor.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doktor bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error("Doktor alınırken hata:", error);
    return NextResponse.json(
      { error: "Doktor alınamadı." },
      { status: 500 }
    );
  }
});

export const PUT = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const data = await req.json();
    const { imageUrl, translations, order } = data;
    
    // Doktorun varlığını kontrol et
    const existingDoctor = await prisma.aboutPageDoctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return NextResponse.json(
        { error: "Doktor bulunamadı." },
        { status: 404 }
      );
    }

    // Doktoru güncelle
    await prisma.aboutPageDoctor.update({
      where: { id },
      data: {
        imageUrl: imageUrl || existingDoctor.imageUrl,
        order: order !== undefined ? order : existingDoctor.order,
      },
    });

    // Çevirileri güncelle
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        if (!translation.languageCode) continue;

        await prisma.aboutPageDoctorTranslation.upsert({
          where: {
            doctorId_languageCode: {
              doctorId: id,
              languageCode: translation.languageCode,
            },
          },
          update: {
            name: translation.name || "",
            title: translation.title || "",
            description: translation.description || "",
            profileUrl: translation.profileUrl || null,
          },
          create: {
            doctor: { connect: { id } },
            language: { connect: { code: translation.languageCode } },
            name: translation.name || "",
            title: translation.title || "",
            description: translation.description || "",
            profileUrl: translation.profileUrl || null,
          },
        });
      }
    }

    // Güncellenmiş doktoru getir
    const updatedDoctor = await prisma.aboutPageDoctor.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    console.error("Doktor güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Doktor güncellenemedi." },
      { status: 500 }
    );
  }
});

export const DELETE = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    // Doktoru ve ilişkili çevirileri sil
    await prisma.aboutPageDoctor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Doktor silinirken hata:", error);
    return NextResponse.json(
      { error: "Doktor silinemedi." },
      { status: 500 }
    );
  }
});