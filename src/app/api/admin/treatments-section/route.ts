import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import fs from 'fs/promises';
import path from 'path';

const TREATMENT_SECTION_CONTENT_ID = "main"; // Sabit ID

// GET: Treatment Section içeriğini ve avatarlarını getir
export const GET = withAdmin(async (req: Request) => {
  try {
    let content = await prisma.treatmentSectionContent.findUnique({
      where: { id: TREATMENT_SECTION_CONTENT_ID },
      include: {
        translations: true,
        avatars: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!content) {
      content = await prisma.treatmentSectionContent.create({
        data: {
          id: TREATMENT_SECTION_CONTENT_ID,
        },
        include: {
          translations: true,
          avatars: true,
        },
      });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching treatment section content:", error);
    return NextResponse.json({ message: 'Treatment section içeriği getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Treatment Section içeriğini ve avatarlarını güncelle
export const PUT = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { translations, avatars: newAvatarsData } = body;

    // --- Fiziksel Dosya Silme Mantığı (Avatarlar için) ---
    const existingAvatars = await prisma.treatmentSectionAvatar.findMany({
      where: { treatmentSectionContentId: TREATMENT_SECTION_CONTENT_ID },
      select: { imageUrl: true },
    });
    const existingAvatarUrls = existingAvatars.map(img => img.imageUrl);
    const newAvatarUrls = newAvatarsData?.map((img: { imageUrl: string }) => img.imageUrl).filter(Boolean) || [];
    const urlsToDelete = existingAvatarUrls.filter(url => url && !newAvatarUrls.includes(url));

    for (const imageUrlToDelete of urlsToDelete) {
      try {
        if (imageUrlToDelete.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', imageUrlToDelete);
          await fs.unlink(filePath);
          console.log(`Deleted avatar file: ${filePath}`);
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting avatar file ${imageUrlToDelete}:`, error);
        }
      }
    }
    // --- Fiziksel Dosya Silme Mantığı Sonu ---

    const result = await prisma.$transaction(async (tx) => {
      await tx.treatmentSectionContent.upsert({
        where: { id: TREATMENT_SECTION_CONTENT_ID },
        update: {},
        create: { id: TREATMENT_SECTION_CONTENT_ID },
      });

      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          if (translation.languageCode) {
            await tx.treatmentSectionContentTranslation.upsert({
              where: {
                treatmentSectionContentId_languageCode: {
                  treatmentSectionContentId: TREATMENT_SECTION_CONTENT_ID,
                  languageCode: translation.languageCode,
                },
              },
              update: {
                mainTitle: translation.mainTitle ?? '', // null yerine boş string
                mainDescription: translation.mainDescription ?? '', // null yerine boş string
                exploreButtonText: translation.exploreButtonText ?? '', // null yerine boş string
                exploreButtonLink: translation.exploreButtonLink ?? '', // null yerine boş string
                avatarGroupText: translation.avatarGroupText ?? '', // null yerine boş string
              },
              create: {
                mainTitle: translation.mainTitle ?? '', // null yerine boş string
                mainDescription: translation.mainDescription ?? '', // null yerine boş string
                exploreButtonText: translation.exploreButtonText ?? '', // null yerine boş string
                exploreButtonLink: translation.exploreButtonLink ?? '', // null yerine boş string
                avatarGroupText: translation.avatarGroupText ?? '', // null yerine boş string
                language: { 
                  connect: { code: translation.languageCode },
                },
                treatmentSectionContent: { 
                  connect: { id: TREATMENT_SECTION_CONTENT_ID },
                },
              },
            });
          }
        }
      }

      if (newAvatarsData && Array.isArray(newAvatarsData)) {
        await tx.treatmentSectionAvatar.deleteMany({
          where: { treatmentSectionContentId: TREATMENT_SECTION_CONTENT_ID },
        });

        for (let i = 0; i < newAvatarsData.length; i++) {
          const avatar = newAvatarsData[i];
          if (avatar.imageUrl) {
            await tx.treatmentSectionAvatar.create({
              data: {
                treatmentSectionContentId: TREATMENT_SECTION_CONTENT_ID,
                imageUrl: avatar.imageUrl,
                altText: avatar.altText,
                order: avatar.order ?? i,
              },
            });
          }
        }
      }
      
      return await tx.treatmentSectionContent.findUnique({
        where: { id: TREATMENT_SECTION_CONTENT_ID },
        include: {
          translations: true,
          avatars: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating treatment section content:", error);
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message || 'Treatment section içeriği güncellenirken bir hata oluştu.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Treatment section içeriği güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});
