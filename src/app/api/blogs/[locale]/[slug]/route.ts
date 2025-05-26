import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  params: { locale: string; slug: string };
}

// GET: Belirli bir blogu slug ve dil koduna göre getir (public API)
export async function GET(request: Request, { params }: Params) {
  try {
    const { locale, slug } = params;
    
    // İlk önce, slug ve dil kombinasyonuyla blog çevirisini bul
    const blogTranslation = await prisma.blogTranslation.findFirst({
      where: {
        slug: slug,
        languageCode: locale,
      },
      include: {
        blog: {
          select: {
            id: true,
            coverImageUrl: true,
            isPublished: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Eğer blog bulunamazsa veya yayınlanmamışsa 404 döndür
    if (!blogTranslation || !blogTranslation.blog.isPublished) {
      return NextResponse.json({ message: 'Blog bulunamadı.' }, { status: 404 });
    }

    // İstemciye göndermek için veriyi düzenle
    const blogData = {
      id: blogTranslation.blog.id,
      slug: blogTranslation.slug,
      title: blogTranslation.title,
      fullDescription: blogTranslation.fullDescription,
      content: blogTranslation.content,
      tocItems: blogTranslation.tocItems,
      coverImageUrl: blogTranslation.blog.coverImageUrl,
      publishedAt: blogTranslation.blog.publishedAt,
      languageCode: blogTranslation.languageCode,
    };

    return NextResponse.json(blogData);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json({ message: 'Blog getirilirken bir hata oluştu.' }, { status: 500 });
  }
}