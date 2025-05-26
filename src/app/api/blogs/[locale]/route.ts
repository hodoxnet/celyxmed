import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: Promise<{ locale: string }>;
}

// GET: Belirli bir dildeki tüm yayınlanmış blogları listele (public API)
export async function GET(request: Request, { params }: Params) {
  try {
    const { locale } = await params;
    
    // Yayınlanmış blogları ve belirtilen dildeki çevirilerini getir
    const blogs = await prisma.blog.findMany({
      where: {
        isPublished: true,
        translations: {
          some: {
            languageCode: locale,
          },
        },
      },
      include: {
        translations: {
          where: {
            languageCode: locale,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // İstemciye daha temiz bir veri yapısı dönelim
    const formattedBlogs = blogs.map(blog => {
      const translation = blog.translations[0]; // Bu dildeki tek çeviri
      
      if (!translation) {
        return null; // Çevirisi olmayan blogları filtreleyeceğiz
      }
      
      return {
        id: blog.id,
        slug: translation.slug,
        title: translation.title,
        fullDescription: translation.fullDescription,
        coverImageUrl: blog.coverImageUrl,
        publishedAt: blog.publishedAt,
        languageCode: translation.languageCode,
      };
    }).filter(Boolean); // null değerleri filtrele

    return NextResponse.json(formattedBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ message: 'Blog yazıları getirilirken bir hata oluştu.' }, { status: 500 });
  }
}