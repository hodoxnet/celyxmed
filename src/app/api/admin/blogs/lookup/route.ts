import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Yayınlanmış blogları lookup için listele (ID ve Başlık)
export const GET = withAdmin(async (req: Request) => {
  try {
    // Varsayılan veya belirli bir dildeki başlığı almak için dil kodu (opsiyonel)
    // Şimdilik varsayılan dili (veya ilk bulduğunu) alalım
    // const defaultLanguageCode = 'tr'; // Veya ayarlardan alınabilir

    const blogs = await prisma.blog.findMany({
      where: { isPublished: true }, // Sadece yayınlanmış olanlar
      select: {
        id: true,
        translations: {
          // Varsayılan dildeki veya mevcut herhangi bir dildeki başlığı almak için
          // orderBy: { language: { isDefault: 'desc' } }, // Varsayılan dili önceliklendir (şemada isDefault varsa)
          // take: 1, // Sadece bir çeviri (başlık için)
          select: {
            title: true,
            languageCode: true, // Hangi dildeki başlığın geldiğini bilmek faydalı olabilir
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // İstemciye daha basit bir formatta döndür
    const formattedBlogs = blogs.map(blog => {
      // Basitlik için ilk çevirinin başlığını alalım
      const title = blog.translations[0]?.title || `Blog ID: ${blog.id}`;
      return {
        id: blog.id,
        title: title, // Örn: "Blog Başlığı (tr)"
      };
    }).filter(blog => blog.title); // Başlığı olmayanları filtrele (teorik olarak olmamalı)

    return NextResponse.json(formattedBlogs);
  } catch (error) {
    console.error("Error fetching blogs for lookup:", error);
    return NextResponse.json({ message: 'Blog lookup verisi getirilirken bir hata oluştu.' }, { status: 500 });
  }
});
