import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";
import { NextResponse } from "next/server";

// Admin GET endpoint for ConsultOnlineSection
export const GET = withAdmin(async () => {
  try {
    // Ana kaydı bul, yoksa oluştur (singleton pattern)
    let consultOnlineSection = await prisma.consultOnlineSection.findUnique({
      where: {
        id: "main",
      },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
        doctorAvatars: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!consultOnlineSection) {
      // Kayıt yoksa oluştur
      consultOnlineSection = await prisma.consultOnlineSection.create({
        data: {
          id: "main",
        },
        include: {
          translations: {
            include: {
              language: true,
            },
          },
          doctorAvatars: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    }

    return NextResponse.json(consultOnlineSection);
  } catch (error) {
    console.error("Error fetching consult online section:", error);
    return NextResponse.json(
      { error: "Failed to fetch consult online section" },
      { status: 500 }
    );
  }
});

// Admin PUT endpoint for updating ConsultOnlineSection
export const PUT = withAdmin(async (req: Request) => {
  try {
    const data = await req.json();
    const { imageUrl, translations } = data;

    // Ana kaydı güncelle
    const consultOnlineSection = await prisma.consultOnlineSection.update({
      where: {
        id: "main",
      },
      data: {
        imageUrl,
      },
    });

    // Çevirileri güncelle (upsert)
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        const { languageCode, tagText, title, description, avatarText, buttonText, buttonLink } = translation;

        await prisma.consultOnlineSectionTranslation.upsert({
          where: {
            consultOnlineSectionId_languageCode: {
              consultOnlineSectionId: "main",
              languageCode,
            },
          },
          update: {
            tagText,
            title,
            description,
            avatarText,
            buttonText,
            buttonLink,
          },
          create: {
            consultOnlineSectionId: "main",
            languageCode,
            tagText,
            title,
            description,
            avatarText,
            buttonText, 
            buttonLink,
          },
        });
      }
    }

    return NextResponse.json({ success: true, consultOnlineSection });
  } catch (error) {
    console.error("Error updating consult online section:", error);
    return NextResponse.json(
      { error: "Failed to update consult online section" },
      { status: 500 }
    );
  }
});