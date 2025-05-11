import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm galeri resimlerini getir
export const GET = withAdmin(async (req: Request) => {
  try {
    // Galeri resimlerini getir
    const galleryImages = await prisma.successStoriesImage.findMany({
      where: { successStoriesSectionId: 'main' },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(galleryImages);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json({ message: 'Galeri resimleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni galeri resmi ekle
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { imageUrl, altText } = body;

    if (!imageUrl) {
      return NextResponse.json({ message: 'Resim URL\'si gereklidir.' }, { status: 400 });
    }

    // Mevcut en yüksek sıralamayı bul
    const highestOrder = await prisma.successStoriesImage.findFirst({
      where: { successStoriesSectionId: 'main' },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Ana SuccessStoriesSection'ın varlığını kontrol et, yoksa oluştur
    let successStoriesSection = await prisma.successStoriesSection.findUnique({
      where: { id: 'main' },
    });

    if (!successStoriesSection) {
      successStoriesSection = await prisma.successStoriesSection.create({
        data: {
          id: 'main',
        },
      });
    }

    // Yeni galeri resmini ekle
    const newImage = await prisma.successStoriesImage.create({
      data: {
        successStoriesSectionId: 'main',
        imageUrl,
        altText: altText || null,
        order: newOrder,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery image:", error);
    return NextResponse.json({ message: 'Galeri resmi oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});