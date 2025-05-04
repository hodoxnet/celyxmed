import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Prisma client import
import bcrypt from 'bcryptjs'; // Şifre hashleme için
import { Role } from '@/generated/prisma'; // Role enum import generated client'dan alınmalı

// GET: Tüm yöneticileri listele (ADMIN rolüne sahip kullanıcılar)
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { // Şifreyi dışarıda bırak
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc', // En yeni eklenenler üstte
      },
    });
    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ message: 'Yöneticiler getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// POST: Yeni yönetici oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'İsim, e-posta ve şifre alanları zorunludur.' }, { status: 400 });
    }

     // Email formatı kontrolü (Basit)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Geçerli bir email adresi giriniz" },
        { status: 400 }
      );
    }

    // E-posta zaten var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 }); // 409 Conflict
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN, // Rolü ADMIN olarak ayarla
      },
      select: { // Şifreyi yanıtta gönderme
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newAdmin, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Error creating admin:", error);
    // Prisma'nın unique constraint hatasını yakala
    if (error instanceof Error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
       return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanılıyor.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Yönetici oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}
