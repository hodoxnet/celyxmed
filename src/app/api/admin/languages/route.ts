import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises'; // Dosya sistemi işlemleri için
import path from 'path'; // Path işlemleri için
import { Language } from '@/generated/prisma'; // Prisma tipini generated client'dan import et

const messagesDir = path.join(process.cwd(), 'src', 'messages'); // Mesaj dosyalarının yolu

// GET: Tüm dilleri listele
export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { createdAt: 'asc' }, // Veya isme göre sırala: name: 'asc'
    });
    return NextResponse.json(languages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json({ message: 'Diller getirilirken bir hata oluştu.' }, { status: 500 });
  }
}

// POST: Yeni dil ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, isActive, isDefault } = body;

    if (!code || !name) {
      return NextResponse.json({ message: 'Dil kodu ve adı zorunludur.' }, { status: 400 });
    }

    // Küçük harfe çevir ve boşlukları temizle
    const languageCode = code.toLowerCase().trim();
    if (languageCode.length !== 2 && languageCode.length !== 5) { // örn: en, en-US
       return NextResponse.json({ message: 'Dil kodu 2 veya 5 karakter olmalıdır (örn: en, en-US).' }, { status: 400 });
    }

    // Eğer bu dil varsayılan olarak ayarlanıyorsa, diğerlerini false yap
    if (isDefault === true) {
      await prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Veritabanına ekle
    const newLanguage = await prisma.language.create({
      data: {
        code: languageCode,
        name,
        isActive: isActive !== undefined ? isActive : true, // Varsayılan aktif
        isDefault: isDefault === true, // Sadece true ise true yap
      },
    });

    // Yeni dil için boş mesaj dosyası oluştur
    const filePath = path.join(messagesDir, `${languageCode}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify({}, null, 2), { flag: 'wx' }); // 'wx' flag'i dosya varsa hata verir
      console.log(`Created message file: ${filePath}`);
    } catch (fileError: any) {
      // Dosya zaten varsa hata verme, ama logla
      if (fileError.code === 'EEXIST') {
        console.warn(`Message file already exists, skipping creation: ${filePath}`);
      } else {
        // Başka bir dosya hatası varsa logla ama işlemi durdurma
        console.error(`Error creating message file ${filePath}:`, fileError);
        // İsteğe bağlı: Burada işlemi geri alabilir veya kullanıcıya bilgi verebiliriz.
        // Şimdilik devam ediyoruz.
      }
    }

    return NextResponse.json(newLanguage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating language:", error);
    // Prisma unique constraint hatası (code için)
    // 'body' burada mevcut değil, 'languageCode' veya isteğin orijinal 'code' değeri kullanılabilir.
    // Ancak 'languageCode' try bloğunda tanımlı, bu yüzden doğrudan mesaj yazalım.
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      // return NextResponse.json({ message: `Dil kodu '${body.code}' zaten mevcut.` }, { status: 409 }); // Hatalı
      return NextResponse.json({ message: `Bu dil kodu zaten mevcut.` }, { status: 409 }); // Düzeltildi
    }
    return NextResponse.json({ message: 'Dil oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}
