import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

// Bu endpoint yalnızca ilk yönetici kullanıcıyı oluşturmak için kullanılmalıdır.
export async function POST(request: NextRequest) {
  try {
    // Güvenlik kontrolü: Zaten admin varsa eklemeyi reddet
    const existingAdmins = await prisma.user.count({
      where: { role: "ADMIN" }
    });

    if (existingAdmins > 0) {
      return NextResponse.json(
        { error: "Zaten bir admin kullanıcısı mevcut. Güvenlik nedeniyle reddedildi." },
        { status: 403 }
      );
    }

    const { name, email, password } = await request.json();

    // Temel doğrulama
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email ve password alanları zorunludur" },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir email adresi giriniz" },
        { status: 400 }
      );
    }

    // Şifreyi hash'le
    const hashedPassword = await hash(password, 10);

    // Admin kullanıcısı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Hassas verileri kaldır
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        user: userWithoutPassword,
        message: "Admin kullanıcısı başarıyla oluşturuldu" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin kullanıcısı oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Admin kullanıcısı oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}