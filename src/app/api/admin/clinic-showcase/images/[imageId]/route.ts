import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import fs from 'fs/promises';
import path from 'path';

interface Params {
  params: { imageId: string };
}

// GET: Tek bir resmi getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { imageId } = params;
    const image = await prisma.clinicShowcaseImage.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return NextResponse.json({ message: 'Resim bulunamadı.' }, { status: 404 });
    }
    
    return NextResponse.json(image);
  } catch (error) {
    console.error(`Error fetching clinic showcase image with ID ${params.imageId}:`, error);
    return NextResponse.json({ message: 'Klinik tanıtım resmi getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Resmi güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { imageId } = params;
    const body = await req.json();
    const { imageUrl, altText, order, isPublished } = body;

    const existingImage = await prisma.clinicShowcaseImage.findUnique({
      where: { id: imageId }
    });

    if (!existingImage) {
      return NextResponse.json({ message: 'Resim bulunamadı.' }, { status: 404 });
    }

    // Eğer resim değiştiyse eski resmi sil
    if (imageUrl && existingImage.imageUrl && imageUrl !== existingImage.imageUrl) {
      try {
        if (existingImage.imageUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', existingImage.imageUrl);
          await fs.unlink(filePath);
          console.log(`Deleted old image file for clinic showcase: ${filePath}`);
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting old image file ${existingImage.imageUrl} for clinic showcase:`, error);
        }
      }
    }

    // Resmi güncelle
    const updatedImage = await prisma.clinicShowcaseImage.update({
      where: { id: imageId },
      data: {
        imageUrl: imageUrl || existingImage.imageUrl,
        altText: altText === undefined ? existingImage.altText : altText,
        order: order === undefined ? existingImage.order : order,
        isPublished: isPublished === undefined ? existingImage.isPublished : isPublished,
      }
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error(`Error updating clinic showcase image with ID ${params.imageId}:`, error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Klinik tanıtım resmi güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Resmi sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { imageId } = params;
    
    const existingImage = await prisma.clinicShowcaseImage.findUnique({
      where: { id: imageId }
    });
    
    if (!existingImage) {
      return NextResponse.json({ message: 'Resim bulunamadı.' }, { status: 404 });
    }

    // Resim dosyasını fiziksel olarak sil
    if (existingImage.imageUrl && existingImage.imageUrl.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingImage.imageUrl);
        await fs.unlink(filePath);
        console.log(`Deleted image file for clinic showcase: ${filePath}`);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting image file ${existingImage.imageUrl} for clinic showcase:`, error);
        }
      }
    }
    
    // Veritabanından resmi sil
    await prisma.clinicShowcaseImage.delete({
      where: { id: imageId }
    });
    
    return NextResponse.json({ message: 'Klinik tanıtım resmi başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting clinic showcase image with ID ${params.imageId}:`, error);
    return NextResponse.json({ message: 'Klinik tanıtım resmi silinirken bir hata oluştu.' }, { status: 500 });
  }
});