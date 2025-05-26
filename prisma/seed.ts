import { PrismaClient, Role } from '../src/generated/prisma';
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
    
    await prisma.language.upsert({
      where: { code: 'de' },
      update: { isDefault: false },
      create: {
        code: 'de',
        name: 'Deutsch',
        isActive: true,
        isDefault: false,
      },
    });
    console.log('Almanca dili eklendi/kontrol edildi.');
    
    await prisma.language.upsert({
      where: { code: 'fr' },
      update: { isDefault: false },
      create: {
        code: 'fr',
        name: 'Français',
        isActive: true,
        isDefault: false,
      },
    });
    console.log('Fransızca dili eklendi/kontrol edildi.');
    
    await prisma.language.upsert({
      where: { code: 'ru' },
      update: { isDefault: false },
      create: {
        code: 'ru',
        name: 'Русский',
        isActive: true,
        isDefault: false,
      },
    });
    console.log('Rusça dili eklendi/kontrol edildi.');
    
    await prisma.language.upsert({
      where: { code: 'it' },
      update: { isDefault: false },
      create: {
        code: 'it',
        name: 'Italiano',
        isActive: true,
        isDefault: false,
      },
    });
    console.log('İtalyanca dili eklendi/kontrol edildi.');
    
    await prisma.language.upsert({
      where: { code: 'es' },
      update: { isDefault: false },
      create: {
        code: 'es',
        name: 'Español',
        isActive: true,
        isDefault: false,
      },
    });
    console.log('İspanyolca dili eklendi/kontrol edildi.');
    // --- Başlangıç Dilleri Ekle Bitti ---
    
    // Örnek blog yazısı oluştur
    console.log('Örnek blog yazısı oluşturuluyor...');
    const blog = await prisma.blog.create({
      data: {
        coverImageUrl: '/uploads/blogs/sample-cover.jpg',
        isPublished: true,
        publishedAt: new Date(),
        translations: {
          create: [
            {
              languageCode: 'tr',
              title: 'Örnek Blog Yazısı',
              fullDescription: 'Bu bir örnek blog yazısı açıklamasıdır.',
              content: '<h1>Örnek Blog İçeriği</h1><p>Bu bir örnek blog içeriğidir. HTML formatında yazılmıştır.</p><h2>Alt Başlık</h2><p>Bu bir alt başlık içeriğidir.</p>',
              tocItems: [
                { id: 'ornek-blog-icerigi', text: 'Örnek Blog İçeriği', level: 1 },
                { id: 'alt-baslik', text: 'Alt Başlık', level: 2 }
              ]
            },
            {
              languageCode: 'en',
              title: 'Sample Blog Post',
              fullDescription: 'This is a sample blog post description.',
              content: '<h1>Sample Blog Content</h1><p>This is a sample blog content. It is written in HTML format.</p><h2>Subheading</h2><p>This is a subheading content.</p>',
              tocItems: [
                { id: 'sample-blog-content', text: 'Sample Blog Content', level: 1 },
                { id: 'subheading', text: 'Subheading', level: 2 }
              ]
            }
          ]
        }
      }
    });
    console.log('Örnek blog yazısı oluşturuldu:', blog.id);

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
