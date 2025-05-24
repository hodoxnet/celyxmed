import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Prisma istemcisini import et

export async function GET() {
  try {
    // Veritabanından sadece aktif olan dilleri çek
    const activeLanguages = await prisma.language.findMany({
      where: {
        isActive: true, // Sadece aktif dilleri filtrele
      },
      select: {
        code: true, // Dil kodunu seç
        name: true, // Dil adını seç
        menuLabel: true, // Menüde gösterilecek etiket
        flagCode: true, // Bayrak kodu
        isActive: true, // Debugging/future use
        isDefault: true, // Debugging/future use
      },
      orderBy: {
        // İsteğe bağlı: Dilleri kodlarına göre sırala
        code: 'asc', 
      },
    });
    console.log("[API/LANGUAGES] Found active languages:", activeLanguages); // Add log here

    // Başarılı yanıtı JSON olarak döndür
    return NextResponse.json(activeLanguages);

  } catch (error) {
    console.error('[API/LANGUAGES] Error fetching active languages:', error);
    // Hata durumunda 500 Internal Server Error döndür
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
