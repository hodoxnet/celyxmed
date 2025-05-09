import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import fs from 'fs/promises';
import path from 'path';

interface Params {
  params: { cardId: string };
}

// GET: Tek bir tedavi kartını getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { cardId } = params;
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    const item = await prisma.treatmentSectionItem.findUnique({
      where: { id: cardId },
      include: {
        translations: languageCode
          ? { where: { languageCode } }
          : true,
      },
    });

    if (!item) {
      return NextResponse.json({ message: 'Tedavi kartı bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error fetching treatment card with ID ${params.cardId}:`, error);
    return NextResponse.json({ message: 'Tedavi kartı getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Tedavi kartını güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { cardId } = params;
    const body = await req.json();
    const { imageUrl, order, isPublished, translations } = body;

    const existingItem = await prisma.treatmentSectionItem.findUnique({
      where: { id: cardId },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Tedavi kartı bulunamadı.' }, { status: 404 });
    }

    if (imageUrl && existingItem.imageUrl && imageUrl !== existingItem.imageUrl) {
      try {
        if (existingItem.imageUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', existingItem.imageUrl);
          await fs.unlink(filePath);
          console.log(`Deleted old image file for card: ${filePath}`);
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting old image file ${existingItem.imageUrl} for card:`, error);
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.treatmentSectionItem.update({
        where: { id: cardId },
        data: {
          imageUrl: imageUrl || existingItem.imageUrl,
          order: order ?? existingItem.order,
          isPublished: isPublished === undefined ? existingItem.isPublished : isPublished,
        },
      });

      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          if (translation.languageCode && translation.title && translation.description && translation.linkUrl) {
            const existingTranslation = await tx.treatmentSectionItemTranslation.findUnique({
              where: {
                treatmentSectionItemId_languageCode: {
                  treatmentSectionItemId: cardId,
                  languageCode: translation.languageCode,
                },
              },
            });

            if (existingTranslation) {
              await tx.treatmentSectionItemTranslation.update({
                where: { id: existingTranslation.id },
                data: {
                  title: translation.title,
                  description: translation.description,
                  linkUrl: translation.linkUrl,
                },
              });
            } else {
              await tx.treatmentSectionItemTranslation.create({
                data: {
                  treatmentSectionItemId: cardId,
                  languageCode: translation.languageCode,
                  title: translation.title,
                  description: translation.description,
                  linkUrl: translation.linkUrl,
                },
              });
            }
          }
        }
      }
      
      return await tx.treatmentSectionItem.findUnique({
        where: { id: cardId },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating treatment card with ID ${params.cardId}:`, error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Tedavi kartı güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Tedavi kartını sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { cardId } = params;
    
    const existingItem = await prisma.treatmentSectionItem.findUnique({
      where: { id: cardId },
    });
    
    if (!existingItem) {
      return NextResponse.json({ message: 'Tedavi kartı bulunamadı.' }, { status: 404 });
    }

    if (existingItem.imageUrl && existingItem.imageUrl.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingItem.imageUrl);
        await fs.unlink(filePath);
        console.log(`Deleted image file for card: ${filePath}`);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting image file ${existingItem.imageUrl} for card:`, error);
        }
      }
    }
    
    await prisma.treatmentSectionItem.delete({
      where: { id: cardId },
    });
    
    return NextResponse.json({ message: 'Tedavi kartı başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting treatment card with ID ${params.cardId}:`, error);
    return NextResponse.json({ message: 'Tedavi kartı silinirken bir hata oluştu.' }, { status: 500 });
  }
});
