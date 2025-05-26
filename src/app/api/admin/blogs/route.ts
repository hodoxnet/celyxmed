import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm blogları listele
export const GET = withAdmin(async (req: Request) => {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang') || 'tr'; // Varsayılan olarak türkçe
    
    // Tüm blogları ve belirtilen dildeki çevirilerini getir
    const blogs = await prisma.blog.findMany({
      include: {
        translations: {
          where: { languageCode },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // İstemciye daha temiz bir veri yapısı dönelim
    const formattedBlogs = blogs.map(blog => {
      const translation = blog.translations[0]; // Sadece istenen dildeki çeviri
      
      return {
        id: blog.id,
        // slug: blog.slug, // Ana slug kaldırıldı
        coverImageUrl: blog.coverImageUrl,
        isPublished: blog.isPublished,
        publishedAt: blog.publishedAt,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        // Çeviri varsa onun slug'ını ve başlığını döndür
        slug: translation?.slug || null, // Çevirinin slug'ı
        title: translation?.title || null,
        fullDescription: translation?.fullDescription || null,
        hasTranslation: !!translation,
        languageCode: translation?.languageCode || languageCode // Hangi dilin döndüğünü belirt
      };
    });

    return NextResponse.json(formattedBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ message: 'Blog yazıları getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni blog ekle
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();

    // Ana slug kontrolü kaldırıldı

    // Blog ve çevirilerini transaction içinde oluştur
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ana blog kaydını oluştur (slug olmadan)
      const newBlog = await tx.blog.create({
        data: {
          // slug: body.slug, // Kaldırıldı
          coverImageUrl: body.coverImageUrl,
          isPublished: body.isPublished || false,
          publishedAt: body.isPublished ? new Date() : null, // Yayınlanma tarihi mantığı
        },
      });
      
      // 2. Çevirileri ekle
      if (body.translations && Array.isArray(body.translations)) {
        for (const translation of body.translations) {
          // Gelen çeviride gerekli alanlar var mı kontrol et (slug dahil)
          if (translation.languageCode && translation.slug && translation.title && translation.fullDescription && translation.content) {

             // Yeni slug'ın o dil için başka bir blogda kullanılıp kullanılmadığını kontrol et
             const slugExists = await tx.blogTranslation.findFirst({
              where: {
                languageCode: translation.languageCode,
                slug: translation.slug,
                // blogId kontrolüne gerek yok, yeni blog zaten
              }
            });

            if (slugExists) {
              throw new Error(`'${translation.slug}' slug'ı ${translation.languageCode} dili için zaten kullanılıyor.`);
            }

            // Çeviriyi oluştur (slug dahil)
            await tx.blogTranslation.create({
              data: {
                blogId: newBlog.id,
                languageCode: translation.languageCode,
                slug: translation.slug, // Slug eklendi
                title: translation.title,
                fullDescription: translation.fullDescription,
                content: translation.content,
                tocItems: translation.tocItems || null, // tocItems null olabilir
              },
            });
          }
        }
      }
      
      // 3. Oluşturulan blogu çevirileriyle birlikte getir
      return await tx.blog.findUnique({
        where: { id: newBlog.id },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ message: 'Blog oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});
