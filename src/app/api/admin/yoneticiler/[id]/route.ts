import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@/generated/prisma';

interface Params {
  params: { id: string };
}

// GET: Belirli bir yöneticiyi getir (Şifre hariç) - İhtiyaç olursa eklenebilir
// export async function GET(request: Request, { params }: Params) { ... }

// PUT: Yöneticiyi güncelle
export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const { name, email, password } = body; // Güncellenecek alanlar

    // En az bir alanın güncellenmesi gerektiğini kontrol et
    if (!name && !email && !password) {
      return NextResponse.json({ message: 'Güncellenecek en az bir alan (isim, e-posta, şifre) gönderilmelidir.' }, { status: 400 });
    }

    const updateData: { name?: string; email?: string; password?: string } = {};
    if (name) updateData.name = name;
    if (email) {
       // Email formatı kontrolü
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
         return NextResponse.json({ message: "Geçerli bir email adresi giriniz" }, { status: 400 });
       }
       // Başka bir kullanıcı bu e-postayı kullanıyor mu? (Kendisi hariç)
       const existingUser = await prisma.user.findFirst({
         where: { email: email, NOT: { id: id } },
       });
       if (existingUser) {
         return NextResponse.json({ message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.' }, { status: 409 });
       }
       updateData.email = email;
    }
    if (password) {
      // Yeni şifreyi hashle
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: id, role: Role.ADMIN }, // Sadece admin rolündeki kullanıcıyı güncelle
      data: updateData,
      select: { // Şifreyi yanıtta gönderme
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error(`Error updating admin ${id}:`, error);
     // Prisma'nın unique constraint hatasını yakala (e-posta için)
    if (error instanceof Error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
       return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 });
    }
    // Prisma'nın kaydı bulamama hatasını yakala
    if (error instanceof Error && (error as any).code === 'P2025') {
        return NextResponse.json({ message: 'Güncellenecek yönetici bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Yönetici güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}

// DELETE: Yöneticiyi sil
export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  try {
    // Kendini silmeyi engelle? (Opsiyonel - Oturum bilgisine göre kontrol edilebilir)
    // const session = await getServerSession(authOptions); // Örnek
    // if (session?.user?.id === id) {
    //   return NextResponse.json({ message: 'Kendinizi silemezsiniz.' }, { status: 403 });
    // }

    await prisma.user.delete({
      where: { id: id, role: Role.ADMIN }, // Sadece admin rolündeki kullanıcıyı sil
    });

    return NextResponse.json({ message: 'Yönetici başarıyla silindi.' }, { status: 200 }); // Veya 204 No Content
  } catch (error) {
    console.error(`Error deleting admin ${id}:`, error);
    // Prisma'nın kaydı bulamama hatasını yakala
    if (error instanceof Error && (error as any).code === 'P2025') {
        return NextResponse.json({ message: 'Silinecek yönetici bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Yönetici silinirken bir hata oluştu.' }, { status: 500 });
  }
}
