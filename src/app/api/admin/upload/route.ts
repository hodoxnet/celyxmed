import { NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/withAdmin';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Resim yükleme için POST endpoint
export const POST = withAdmin(async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Geçersiz dosya. Sadece resim dosyaları yüklenebilir.' },
        { status: 400 }
      );
    }
    
    // Dosyanın tipini al ve uygun uzantıyı belirle
    const fileType = file.type.split('/')[1]; // "image/jpeg" -> "jpeg"
    const validTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif'];
    
    if (!validTypes.includes(fileType)) {
      return NextResponse.json(
        { message: 'Desteklenmeyen dosya formatı. Sadece JPG, PNG, GIF, WEBP veya AVIF dosyaları yüklenebilir.' },
        { status: 400 }
      );
    }
    
    // Dosyanın boyutunu kontrol et (10MB'ı geçmemeli)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.' },
        { status: 400 }
      );
    }

    // Query parametresinden hedef klasörü al
    const { searchParams } = new URL(req.url);
    let targetFolder = searchParams.get('folder') || 'diger'; // Varsayılan 'diger'

    // Güvenlik için klasör adını temizle (sadece harf, rakam, tire, alt çizgi)
    targetFolder = targetFolder.replace(/[^a-zA-Z0-9-_]/g, ''); 
    if (!targetFolder) {
      targetFolder = 'diger'; // Temizleme sonrası boş kalırsa varsayılana dön
    }

    // Yükleme yolu (static directory)
    const staticDir = join(process.cwd(), 'public');
    const uploadDir = join(staticDir, 'uploads', targetFolder); // Dinamik klasör

    // Klasörün varlığını kontrol et, yoksa oluştur
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Upload directory creation error:', err);
      console.error(`Upload directory creation error for ${uploadDir}:`, err);
      // Hata durumunda işlemi durdurabilir veya loglayıp devam edebiliriz. Şimdilik durduralım.
      return NextResponse.json({ message: 'Yükleme klasörü oluşturulamadı.' }, { status: 500 });
    }
    
    // Benzersiz bir dosya adı oluştur
    const fileName = `${uuidv4()}.${fileType}`;
    const filePath = join(uploadDir, fileName);
    
    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Dosya yolu ve URL döndür (dinamik klasör ile)
    const fileUrl = `/uploads/${targetFolder}/${fileName}`;

    return NextResponse.json({ url: fileUrl, message: 'Dosya başarıyla yüklendi' });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { message: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
});
