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

    console.log(`[ADMIN-API] Updating ConsultOnlineSection with imageUrl:`, !!imageUrl);
    console.log(`[ADMIN-API] Received ${translations?.length || 0} translations`);

    // Önce konsultasyon bölümünün var olup olmadığını kontrol edelim
    const existingSection = await prisma.consultOnlineSection.findUnique({
      where: { id: "main" },
    });

    // Ana kaydı güncelle veya oluştur
    const consultOnlineSection = existingSection
      ? await prisma.consultOnlineSection.update({
          where: { id: "main" },
          data: { imageUrl },
        })
      : await prisma.consultOnlineSection.create({
          data: {
            id: "main",
            imageUrl,
          },
        });

    console.log(`[ADMIN-API] ConsultOnlineSection ${existingSection ? 'updated' : 'created'} with ID:`, consultOnlineSection.id);

    // Çevirileri güncelle (upsert)
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        const { languageCode, tagText, title, description, avatarText, buttonText, buttonLink } = translation;

        console.log(`[ADMIN-API] Processing translation for language: ${languageCode} with title: ${title}`);

        const result = await prisma.consultOnlineSectionTranslation.upsert({
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

        console.log(`[ADMIN-API] Translation ${result.id} for ${languageCode} was ${result.createdAt === result.updatedAt ? 'created' : 'updated'}`);
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