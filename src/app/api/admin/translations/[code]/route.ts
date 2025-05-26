import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const messagesDir = path.join(process.cwd(), 'src', 'messages');

interface Params {
  params: { code: string };
}

// GET: Belirli bir dilin çeviri dosyasını oku
export async function GET(request: Request, { params }: Params) {
  const { code } = params;
  const filePath = path.join(messagesDir, `${code}.json`);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const translations = JSON.parse(fileContent);
    return NextResponse.json(translations);
  } catch (error: any) {
    // Dosya yoksa boş obje döndür veya hata ver
    if (error.code === 'ENOENT') {
      console.warn(`Translation file not found for code ${code}, returning empty object.`);
      return NextResponse.json({}); // Boş obje döndür
      // Veya hata döndür:
      // return NextResponse.json({ message: `Çeviri dosyası bulunamadı: ${code}.json` }, { status: 404 });
    }
    console.error(`Error reading translation file ${code}.json:`, error);
    return NextResponse.json({ message: 'Çeviri dosyası okunurken bir hata oluştu.' }, { status: 500 });
  }
}

// PUT: Belirli bir dilin çeviri dosyasını güncelle
export async function PUT(request: Request, { params }: Params) {
  const { code } = params;
  const filePath = path.join(messagesDir, `${code}.json`);

  try {
    const body = await request.json();

    // Gelen verinin bir obje olduğundan emin ol (isteğe bağlı ama önerilir)
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
       return NextResponse.json({ message: 'Geçersiz veri formatı. JSON object bekleniyor.' }, { status: 400 });
    }

    // Dosyayı yeni içerikle güncelle (üzerine yaz)
    // JSON.stringify'ın 3. parametresi (space) okunabilirliği artırır
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');

    return NextResponse.json({ message: `Çeviri dosyası (${code}.json) başarıyla güncellendi.` });

  } catch (error: any) {
    console.error(`Error writing translation file ${code}.json:`, error);
    // Dosya yazma hatalarını daha detaylı ele alabiliriz (örn: izinler)
    return NextResponse.json({ message: 'Çeviri dosyası güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}
