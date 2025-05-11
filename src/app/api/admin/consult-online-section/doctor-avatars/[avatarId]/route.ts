import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAdmin";
import { NextResponse } from "next/server";

// Admin GET endpoint for a specific doctor avatar
export const GET = withAdmin(async (
  _req: Request,
  { params }: { params: { avatarId: string } }
) => {
  try {
    const { avatarId } = params;

    const doctorAvatar = await prisma.consultOnlineDoctorAvatar.findUnique({
      where: {
        id: avatarId,
      },
    });

    if (!doctorAvatar) {
      return NextResponse.json(
        { error: "Doctor avatar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(doctorAvatar);
  } catch (error) {
    console.error("Error fetching doctor avatar:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor avatar" },
      { status: 500 }
    );
  }
});

// Admin PUT endpoint for updating a doctor avatar
export const PUT = withAdmin(async (
  req: Request,
  { params }: { params: { avatarId: string } }
) => {
  try {
    const { avatarId } = params;
    const data = await req.json();
    const { imageUrl, altText, order } = data;

    const doctorAvatar = await prisma.consultOnlineDoctorAvatar.update({
      where: {
        id: avatarId,
      },
      data: {
        imageUrl,
        altText,
        order,
      },
    });

    return NextResponse.json(doctorAvatar);
  } catch (error) {
    console.error("Error updating doctor avatar:", error);
    return NextResponse.json(
      { error: "Failed to update doctor avatar" },
      { status: 500 }
    );
  }
});

// Admin DELETE endpoint for removing a doctor avatar
export const DELETE = withAdmin(async (
  _req: Request,
  { params }: { params: { avatarId: string } }
) => {
  try {
    const { avatarId } = params;

    await prisma.consultOnlineDoctorAvatar.delete({
      where: {
        id: avatarId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting doctor avatar:", error);
    return NextResponse.json(
      { error: "Failed to delete doctor avatar" },
      { status: 500 }
    );
  }
});