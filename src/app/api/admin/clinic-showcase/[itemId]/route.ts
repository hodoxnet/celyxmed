import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import fs from 'fs/promises';
import path from 'path';

interface Params {
  params: { itemId: string };
}

// GET: Tek bir klinik showcase öğesini getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    const item = await prisma.clinicShowcase.findUnique({
      where: { id: itemId },
      include: {
        translations: languageCode
          ? { where: { languageCode } }
          : true,
      },
    });

    if (!item) {
      return NextResponse.json({ message: 'Klinik tanıtım öğesi bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error fetching clinic showcase item with ID ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Klinik tanıtım öğesi getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Klinik showcase öğesini güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;
    const body = await req.json();
    const { imageUrl, badgeText, order, isPublished, isActive, translations } = body;

    const existingItem = await prisma.clinicShowcase.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'Klinik tanıtım öğesi bulunamadı.' }, { status: 404 });
    }

    // Eğer resim değiştiyse eski resmi sil
    if (imageUrl && existingItem.imageUrl && imageUrl !== existingItem.imageUrl) {
      try {
        if (existingItem.imageUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', existingItem.imageUrl);
          await fs.unlink(filePath);
          console.log(`Deleted old image file for clinic showcase: ${filePath}`);
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting old image file ${existingItem.imageUrl} for clinic showcase:`, error);
        }
      }
    }

    // Eğer isActive=true ise, önce diğer tüm aktif öğeleri inaktif yap
    if (isActive && !existingItem.isActive) {
      try {
        await prisma.clinicShowcase.updateMany({
          where: {
            id: { not: itemId },
            isActive: true
          },
          data: { isActive: false }
        });
      } catch (error) {
        console.error("Error updating active status:", error);
        // Hata oluşsa bile işleme devam et
      }
    }

    const result = await prisma.$transaction(async (tx) => {

      await tx.clinicShowcase.update({
        where: { id: itemId },
        data: {
          imageUrl: imageUrl || existingItem.imageUrl,
          badgeText: badgeText === undefined ? existingItem.badgeText : badgeText,
          order: order ?? existingItem.order,
          isPublished: isPublished === undefined ? existingItem.isPublished : isPublished,
          isActive: isActive === undefined ? existingItem.isActive : isActive,
        },
      });

      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          if (translation.languageCode) {
            const existingTranslation = await tx.clinicShowcaseTranslation.findUnique({
              where: {
                clinicShowcaseId_languageCode: {
                  clinicShowcaseId: itemId,
                  languageCode: translation.languageCode,
                },
              },
            });

            if (existingTranslation) {
              await tx.clinicShowcaseTranslation.update({
                where: { id: existingTranslation.id },
                data: {
                  tabName: translation.tabName || "",
                  title: translation.title || "",
                  description: translation.description || "",
                  buttonText: translation.buttonText || "",
                  buttonLink: translation.buttonLink || "",
                },
              });
            } else {
              await tx.clinicShowcaseTranslation.create({
                data: {
                  clinicShowcaseId: itemId,
                  languageCode: translation.languageCode,
                  tabName: translation.tabName || "",
                  title: translation.title || "",
                  description: translation.description || "",
                  buttonText: translation.buttonText || "",
                  buttonLink: translation.buttonLink || "",
                },
              });
            }
          }
        }
      }
      
      return await tx.clinicShowcase.findUnique({
        where: { id: itemId },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating clinic showcase item with ID ${params.itemId}:`, error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Klinik tanıtım öğesi güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Klinik showcase öğesini sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { itemId } = params;
    
    const existingItem = await prisma.clinicShowcase.findUnique({
      where: { id: itemId },
    });
    
    if (!existingItem) {
      return NextResponse.json({ message: 'Klinik tanıtım öğesi bulunamadı.' }, { status: 404 });
    }

    // Resmi fiziksel olarak sil
    if (existingItem.imageUrl && existingItem.imageUrl.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingItem.imageUrl);
        await fs.unlink(filePath);
        console.log(`Deleted image file for clinic showcase: ${filePath}`);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting image file ${existingItem.imageUrl} for clinic showcase:`, error);
        }
      }
    }
    
    await prisma.clinicShowcase.delete({
      where: { id: itemId },
    });
    
    return NextResponse.json({ message: 'Klinik tanıtım öğesi başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting clinic showcase item with ID ${params.itemId}:`, error);
    return NextResponse.json({ message: 'Klinik tanıtım öğesi silinirken bir hata oluştu.' }, { status: 500 });
  }
});