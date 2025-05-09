import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import { withAdmin } from '@/middleware/withAdmin'; // Eğer admin yetkilendirmesi gerekiyorsa

// Bu endpoint'ler genellikle yetkilendirme gerektirir.
// Frontend'den gelen istek /api/menus/... olduğu için,
// withAdmin middleware'i burada da kullanılabilir veya farklı bir yetkilendirme mekanizması olabilir.
// Şimdilik yetkilendirmesiz bırakıyorum, ancak production'da eklenmelidir.

export async function DELETE(
  req: Request,
  { params }: { params: { menuId: string } }
) {
  const { menuId } = params;

  if (!menuId) {
    return NextResponse.json({ message: 'Menü ID gereklidir.' }, { status: 400 });
  }

  try {
    // HeaderMenu silindiğinde, ilişkili HeaderMenuTranslation ve HeaderMenuItem (eğer onDelete: Cascade ise)
    // kayıtları da Prisma şemasındaki ayarlara göre otomatik olarak silinecektir.
    const existingMenu = await prisma.headerMenu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return NextResponse.json({ message: 'Silinecek header menüsü bulunamadı.' }, { status: 404 });
    }

    await prisma.headerMenu.delete({
      where: { id: menuId },
    });

    return NextResponse.json({ message: 'Header menüsü başarıyla silindi.' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting header menu (ID: ${menuId}):`, error);
    // Prisma'nın P2025 hatası (kayıt bulunamadı) yukarıda zaten ele alındı.
    // Diğer potansiyel hatalar için genel bir mesaj dönebiliriz.
    return NextResponse.json({ message: 'Header menüsü silinirken bir hata oluştu.' }, { status: 500 });
  }
}

// Örnek GET (tek menü getirme) ve PUT (tek menü güncelleme) metodları:
// Bu metodlar da admin panelindeki "Düzenle" ve "Öğeleri Yönet" gibi işlevler için gerekebilir.

// export async function GET(
//   req: Request,
//   { params }: { params: { menuId: string } }
// ) {
//   const { menuId } = params;
//   try {
//     const menu = await prisma.headerMenu.findUnique({
//       where: { id: menuId },
//       include: { 
//         translations: true,
//         items: { include: { translations: true, children: { include: { translations: true }} } } 
//       }
//     });
//     if (!menu) {
//       return NextResponse.json({ message: "Header menüsü bulunamadı." }, { status: 404 });
//     }
//     return NextResponse.json(menu);
//   } catch (error: any) {
//     console.error("Error fetching header menu:", error);
//     return NextResponse.json({ message: "Header menüsü getirilirken bir hata oluştu." }, { status: 500 });
//   }
// }

// export async function PUT(
//   req: Request,
//   { params }: { params: { menuId: string } }
// ) {
//   const { menuId } = params;
//   try {
//     const body = await req.json();
//     // Burada da zod ile doğrulama ve güncelleme mantığı olmalı
//     // Örneğin: const { translations, isActive } = validatedBody;
//     // const updatedMenu = await prisma.headerMenu.update({
//     //   where: { id: menuId },
//     //   data: { isActive, translations: { /* güncelleme mantığı */ } },
//     //   include: { translations: true }
//     // });
//     // return NextResponse.json(updatedMenu);
//     return NextResponse.json({ message: "PUT metodu henüz implemente edilmedi." }, { status: 501 });
//   } catch (error: any) {
//     console.error("Error updating header menu:", error);
//     return NextResponse.json({ message: "Header menüsü güncellenirken bir hata oluştu." }, { status: 500 });
//   }
// }
