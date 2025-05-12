import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const galleryImages = await prisma.aboutPageGalleryImage.findMany({
      where: { aboutPageId: "main" },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(galleryImages);
  } catch (error) {
    console.error("Galeri resimleri alınırken hata:", error);
    return NextResponse.json(
      { error: "Galeri resimleri alınamadı." },
      { status: 500 }
    );
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    // Yeni resim ekleme
    const galleryImage = await prisma.aboutPageGalleryImage.create({
      data: {
        aboutPageId: "main",
        imageUrl: data.imageUrl,
        altText: data.altText || "",
        order: data.order || 0,
      },
    });

    return NextResponse.json(galleryImage);
  } catch (error) {
    console.error("Galeri resmi eklenirken hata:", error);
    return NextResponse.json(
      { error: "Galeri resmi eklenemedi." },
      { status: 500 }
    );
  }
});