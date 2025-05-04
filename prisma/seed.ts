import { PrismaClient, Role } from '@/generated/prisma';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Kısa bir bekleme fonksiyonu
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  try {
    console.log('Veritabanı seed işlemi başlatılıyor... (2 saniye bekleniyor)');
    await delay(2000); // 2 saniye bekle

    // Doğrudan admin kullanıcısını oluşturmayı dene
    console.log('Admin kullanıcısı oluşturuluyor...');
    const hashedPassword = await hash('Celyx123!', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'CelyxMed Admin',
        email: 'admin@celyxmed.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Admin kullanıcısı oluşturuldu: ${admin.email}`);

    // --- Başlangıç Dillerini Ekle ---
    console.log('Başlangıç dilleri ekleniyor/güncelleniyor...');
    await prisma.language.upsert({
      where: { code: 'tr' },
      update: {}, // Eğer varsa güncelleme yapma
      create: {
        code: 'tr',
        name: 'Türkçe',
        isActive: true,
        isDefault: true, // Türkçe varsayılan
      },
    });
    console.log('Türkçe dili eklendi/kontrol edildi.');

    await prisma.language.upsert({
      where: { code: 'en' },
      update: { isDefault: false }, // İngilizce'nin varsayılan olmadığından emin ol
      create: {
        code: 'en',
        name: 'English',
        isActive: true,
        isDefault: false,
      },
    });
    console.log('İngilizce dili eklendi/kontrol edildi.');
    // --- Başlangıç Dilleri Ekle Bitti ---

  } catch (error: any) {
    // Eğer kullanıcı zaten varsa (unique constraint hatası P2002), bunu görmezden gel
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      console.log('Admin kullanıcısı zaten mevcut, oluşturma atlandı.');
    } else {
      // Diğer hataları logla ve çık
      console.error('Seed işlemi sırasında hata oluştu:', error);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Seed işlemi başarıyla tamamlandı'))
  .catch((e) => {
    console.error('Seed işlemi başarısız oldu:', e);
    process.exit(1);
  });
