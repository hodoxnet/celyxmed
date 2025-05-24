import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { Language } from '@/generated/prisma';

const messagesDir = path.join(process.cwd(), 'src', 'messages');

interface Params {
  params: { id: string };
}

// PUT: Dili güncelle
export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const { name, menuLabel, flagCode, isActive, isDefault } = body; // Güncellenecek alanlar

    console.log("API - Gelen istek gövdesi:", body);
    console.log("API - isDefault değeri:", isDefault, "tipi:", typeof isDefault);

    // En az bir alanın güncellenmesi gerektiğini kontrol et (isteğe bağlı)
    if (name === undefined && menuLabel === undefined && flagCode === undefined && isActive === undefined && isDefault === undefined) {
      return NextResponse.json({ message: 'Güncellenecek en az bir alan (name, menuLabel, flagCode, isActive, isDefault) gönderilmelidir.' }, { status: 400 });
    }

    // Güncellenecek dili bul (güncelleme öncesi kodunu almak için)
    const currentLanguage = await prisma.language.findUnique({
      where: { id },
    });

    if (!currentLanguage) {
      return NextResponse.json({ message: 'Güncellenecek dil bulunamadı.' }, { status: 404 });
    }

    console.log("API - Veritabanındaki mevcut dil:", currentLanguage);

    // Eğer bu dil varsayılan olarak ayarlanıyorsa, diğerlerini false yap
    // Sadece isDefault true olarak geliyorsa bu işlemi yap
    if (isDefault === true) {
      console.log("API - Diğer dilleri varsayılan olmaktan çıkarma işlemi yapılıyor");
      await prisma.language.updateMany({
        where: { id: { not: id }, isDefault: true }, // Kendisi hariç diğer varsayılanları false yap
        data: { isDefault: false },
      });
    }

    // Veritabanında güncelle
    const updateData: Partial<Pick<Language, 'name' | 'menuLabel' | 'flagCode' | 'isActive' | 'isDefault'>> = {};
    if (name !== undefined) updateData.name = name;
    if (menuLabel !== undefined) updateData.menuLabel = menuLabel;
    if (flagCode !== undefined) updateData.flagCode = flagCode;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDefault !== undefined) {
      // Boolean'a dönüştürmeyi garantile
      updateData.isDefault = isDefault === true || isDefault === "true";
      console.log("API - isDefault güncellenecek değer:", updateData.isDefault);
    }

    console.log("API - Güncellenecek veriler:", updateData);

    const updatedLanguage = await prisma.language.update({
      where: { id: id },
      data: updateData,
    });

    console.log("API - Güncelleme sonrası:", updatedLanguage);
    return NextResponse.json(updatedLanguage);
  } catch (error: any) {
    console.error(`Error updating language ${id}:`, error);
    // Prisma'nın kaydı bulamama hatasını yakala
    if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Güncellenecek dil bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Dil güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}

// DELETE: Dili sil
export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  try {
    // Silinecek dili bul (dosya adını almak için)
    const languageToDelete = await prisma.language.findUnique({
      where: { id },
    });

    if (!languageToDelete) {
      return NextResponse.json({ message: 'Silinecek dil bulunamadı.' }, { status: 404 });
    }

    // Varsayılan dili silmeye çalışma kontrolü (opsiyonel ama önerilir)
    if (languageToDelete.isDefault) {
      return NextResponse.json({ message: 'Varsayılan dil silinemez. Önce başka bir dili varsayılan yapın.' }, { status: 400 });
    }

    // Veritabanından sil
    await prisma.language.delete({
      where: { id: id },
    });

    // İlgili mesaj dosyasını sil
    const filePath = path.join(messagesDir, `${languageToDelete.code}.json`);
    try {
      await fs.unlink(filePath);
      console.log(`Deleted message file: ${filePath}`);
    } catch (fileError: any) {
      // Dosya yoksa hata verme, ama logla
      if (fileError.code === 'ENOENT') {
        console.warn(`Message file not found, skipping deletion: ${filePath}`);
      } else {
        // Başka bir dosya hatası varsa logla ama işlemi durdurma
        console.error(`Error deleting message file ${filePath}:`, fileError);
      }
    }

    return NextResponse.json({ message: 'Dil başarıyla silindi.' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting language ${id}:`, error);
    // Prisma'nın kaydı bulamama hatasını yakala
    if (error.code === 'P2025') {
        return NextResponse.json({ message: 'Silinecek dil bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Dil silinirken bir hata oluştu.' }, { status: 500 });
  }
}
