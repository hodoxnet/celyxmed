import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";

export const GET = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    const galleryImage = await prisma.aboutPageGalleryImage.findUnique({
      where: { id },
    });

    if (!galleryImage) {
      return NextResponse.json(
        { error: "Galeri resmi bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(galleryImage);
  } catch (error) {
    console.error("Galeri resmi alınırken hata:", error);
    return NextResponse.json(
      { error: "Galeri resmi alınamadı." },
      { status: 500 }
    );
  }
});

export const PUT = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const data = await req.json();
    
    const galleryImage = await prisma.aboutPageGalleryImage.update({
      where: { id },
      data: {
        imageUrl: data.imageUrl,
        altText: data.altText,
        order: data.order,
      },
    });

    return NextResponse.json(galleryImage);
  } catch (error) {
    console.error("Galeri resmi güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Galeri resmi güncellenemedi." },
      { status: 500 }
    );
  }
});

export const DELETE = withAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    
    await prisma.aboutPageGalleryImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Galeri resmi silinirken hata:", error);
    return NextResponse.json(
      { error: "Galeri resmi silinemedi." },
      { status: 500 }
    );
  }
});