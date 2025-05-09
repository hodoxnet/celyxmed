import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Klinik Showcase Resimlerini Getir
export const GET = withAdmin(async (req: Request) => {
  try {
    const images = await prisma.clinicShowcaseImage.findMany({
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching clinic showcase images:", error);
    return NextResponse.json({ message: 'Klinik tanıtım resimleri getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni Klinik Showcase Resmi Ekle
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { imageUrl, altText, order, isPublished } = body;

    if (!imageUrl) {
      return NextResponse.json({ message: 'Resim URL\'si gereklidir.' }, { status: 400 });
    }

    // Önce ana Clinic Showcase içeriğinin var olduğundan emin ol
    let clinicShowcase = await prisma.clinicShowcase.findUnique({
      where: { id: "main" }
    });

    if (!clinicShowcase) {
      clinicShowcase = await prisma.clinicShowcase.create({
        data: { id: "main" }
      });
    }

    // Son sıra numarasını bul ve yeni resmin sırasını belirle
    let newOrder = order;
    if (newOrder === undefined) {
      const lastImage = await prisma.clinicShowcaseImage.findFirst({
        orderBy: { order: 'desc' }
      });
      newOrder = lastImage ? lastImage.order + 1 : 0;
    }

    // Yeni resmi ekle
    const newImage = await prisma.clinicShowcaseImage.create({
      data: {
        clinicShowcaseId: "main",
        imageUrl,
        altText: altText || null,
        order: newOrder,
        isPublished: isPublished !== undefined ? isPublished : true
      }
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Error creating clinic showcase image:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Klinik tanıtım resmi eklenirken bir hata oluştu.' }, { status: 500 });
  }
});