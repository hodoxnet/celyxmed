import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { withAdmin } from '@/middleware/withAdmin'; // Eğer admin yetkilendirmesi gerekiyorsa

export async function DELETE(
  req: Request,
  { params }: { params: { menuId: string } }
) {
  const { menuId } = params;

  if (!menuId) {
    return NextResponse.json({ message: 'Menü ID gereklidir.' }, { status: 400 });
  }

  try {
    // FooterMenu silindiğinde, ilişkili FooterMenuTranslation ve FooterMenuItem (eğer onDelete: Cascade ise)
    // kayıtları da Prisma şemasındaki ayarlara göre otomatik olarak silinecektir.
    const existingMenu = await prisma.footerMenu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return NextResponse.json({ message: 'Silinecek footer menü grubu bulunamadı.' }, { status: 404 });
    }

    await prisma.footerMenu.delete({
      where: { id: menuId },
    });

    return NextResponse.json({ message: 'Footer menü grubu başarıyla silindi.' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting footer menu (ID: ${menuId}):`, error);
    return NextResponse.json({ message: 'Footer menü grubu silinirken bir hata oluştu.' }, { status: 500 });
  }
}

// Benzer şekilde GET (tek footer menü grubu getirme) ve PUT (güncelleme) metodları da eklenebilir.
