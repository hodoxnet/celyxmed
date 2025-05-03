import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Veritabanı seed işlemi başlatılıyor...');

    // Mevcut admin kullanıcı kontrolü
    const existingUser = await prisma.user.findFirst({
      where: {
        email: 'admin@celyxmed.com',
      },
    });

    if (existingUser) {
      console.log('Admin kullanıcısı zaten mevcut, atlıyorum.');
    } else {
      // Admin şifresini hashle
      const hashedPassword = await bcrypt.hash('Celyx123!', 10);

      // Admin kullanıcısını oluştur
      const admin = await prisma.user.create({
        data: {
          name: 'CelyxMed Admin',
          email: 'admin@celyxmed.com',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log(`Admin kullanıcısı oluşturuldu: ${admin.email}`);
    }
  } catch (error) {
    console.error('Seed işlemi sırasında hata oluştu:', error);
    process.exit(1);
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