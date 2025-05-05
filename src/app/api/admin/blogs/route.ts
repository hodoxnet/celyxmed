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
      const translation = blog.translations[0];
      
      return {
        id: blog.id,
        slug: blog.slug,
        coverImageUrl: blog.coverImageUrl,
        isPublished: blog.isPublished,
        publishedAt: blog.publishedAt,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        title: translation?.title || null,
        fullDescription: translation?.fullDescription || null,
        hasTranslation: !!translation,
        languageCode
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
    
    // Zorunlu alanların kontrolü
    if (!body.slug) {
      return NextResponse.json({ message: 'Slug alanı zorunludur.' }, { status: 400 });
    }
    
    // Slug kontrolü - benzersiz olmalı
    const existingBlog = await prisma.blog.findUnique({
      where: { slug: body.slug },
    });
    
    if (existingBlog) {
      return NextResponse.json({ message: 'Bu slug zaten kullanılmaktadır.' }, { status: 409 });
    }
    
    // Blog ve çevirilerini transaction içinde oluştur
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ana blog kaydını oluştur
      const newBlog = await tx.blog.create({
        data: {
          slug: body.slug,
          coverImageUrl: body.coverImageUrl,
          isPublished: body.isPublished || false,
          publishedAt: body.isPublished ? new Date() : null,
        },
      });
      
      // 2. Çevirileri ekle
      if (body.translations && Array.isArray(body.translations)) {
        for (const translation of body.translations) {
          if (translation.languageCode && translation.title && translation.fullDescription && translation.content) {
            await tx.blogTranslation.create({
              data: {
                blogId: newBlog.id,
                languageCode: translation.languageCode,
                title: translation.title,
                fullDescription: translation.fullDescription,
                content: translation.content,
                tocItems: translation.tocItems || null,
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