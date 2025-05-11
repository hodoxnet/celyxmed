import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

interface Params {
  params: { id: string };
}

// GET: Belirli bir galeri resmini getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    
    // Galeri resmini getir
    const galleryImage = await prisma.successStoriesImage.findUnique({
      where: { id },
    });
    
    if (!galleryImage) {
      return NextResponse.json({ message: 'Galeri resmi bulunamadı.' }, { status: 404 });
    }
    
    return NextResponse.json(galleryImage);
  } catch (error) {
    console.error(`Error fetching gallery image with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Galeri resmi getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Galeri resmini güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { imageUrl, altText, order } = body;
    
    // Galeri resmi kontrol
    const existingImage = await prisma.successStoriesImage.findUnique({
      where: { id },
    });
    
    if (!existingImage) {
      return NextResponse.json({ message: 'Galeri resmi bulunamadı.' }, { status: 404 });
    }
    
    // Galeri resmini güncelle
    const updatedImage = await prisma.successStoriesImage.update({
      where: { id },
      data: {
        imageUrl: imageUrl || existingImage.imageUrl,
        altText: altText !== undefined ? altText : existingImage.altText,
        ...(order !== undefined ? { order } : {}),
      },
    });
    
    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error(`Error updating gallery image with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Galeri resmi güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Galeri resmini sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    
    // Galeri resmi kontrol
    const existingImage = await prisma.successStoriesImage.findUnique({
      where: { id },
    });
    
    if (!existingImage) {
      return NextResponse.json({ message: 'Galeri resmi bulunamadı.' }, { status: 404 });
    }
    
    // Galeri resmini sil
    await prisma.successStoriesImage.delete({
      where: { id },
    });
    
    // Kalan resimlerin order değerlerini yeniden düzenle
    const remainingImages = await prisma.successStoriesImage.findMany({
      where: { successStoriesSectionId: 'main' },
      orderBy: { order: 'asc' },
    });
    
    if (remainingImages.length > 0) {
      await prisma.$transaction(
        remainingImages.map((image, index) => 
          prisma.successStoriesImage.update({
            where: { id: image.id },
            data: { order: index },
          })
        )
      );
    }
    
    return NextResponse.json({ message: 'Galeri resmi başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting gallery image with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Galeri resmi silinirken bir hata oluştu.' }, { status: 500 });
  }
});