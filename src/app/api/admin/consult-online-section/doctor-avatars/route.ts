import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";
import { NextResponse } from "next/server";

// Admin GET endpoint for consulting doctor avatars
export const GET = withAdmin(async () => {
  try {
    const doctorAvatars = await prisma.consultOnlineDoctorAvatar.findMany({
      where: {
        consultOnlineSectionId: "main",
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(doctorAvatars);
  } catch (error) {
    console.error("Error fetching doctor avatars:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor avatars" },
      { status: 500 }
    );
  }
});

// Admin POST endpoint for adding a doctor avatar
export const POST = withAdmin(async (req: Request) => {
  try {
    const data = await req.json();
    const { imageUrl, altText, order } = data;

    // Yeni doktor avatarı oluştur
    const doctorAvatar = await prisma.consultOnlineDoctorAvatar.create({
      data: {
        consultOnlineSection: {
          connectOrCreate: {
            where: { id: "main" },
            create: { id: "main" },
          },
        },
        imageUrl,
        altText,
        order: order || 0,
      },
    });

    return NextResponse.json(doctorAvatar);
  } catch (error) {
    console.error("Error creating doctor avatar:", error);
    return NextResponse.json(
      { error: "Failed to create doctor avatar" },
      { status: 500 }
    );
  }
});