import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

interface Params {
  params: { id: string };
}

// GET: Belirli bir blogu getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    console.log(`Blog GET API: Requested blog with ID ${id}`);
    
    // URL'den dil parametresini al (opsiyonel)
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang'); // Belirli bir dil istenirse
    console.log(`Language parameter: ${languageCode || 'None (all languages)'}`);
    
    // Blog ve çevirilerini getir
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        translations: languageCode 
          ? { where: { languageCode } }  // Belirli bir dil istenirse
          : true,                        // Tüm dilleri getir
      },
    });
    
    if (!blog) {
      console.log(`Blog not found with ID: ${id}`);
      return NextResponse.json({ message: 'Blog bulunamadı.' }, { status: 404 });
    }
    
    console.log(`Blog found: ${blog.slug}`);
    return NextResponse.json(blog);
  } catch (error) {
    console.error(`Error fetching blog with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Blog getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Blogu güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    const body = await req.json();
    
    // Blog kontrol
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });
    
    if (!existingBlog) {
      return NextResponse.json({ message: 'Blog bulunamadı.' }, { status: 404 });
    }
    
    // Slug değişirse, kontrolü yapılmalı
    if (body.slug && body.slug !== existingBlog.slug) {
      const slugExists = await prisma.blog.findUnique({
        where: { slug: body.slug },
      });
      
      if (slugExists) {
        return NextResponse.json({ message: 'Bu slug zaten kullanılmaktadır.' }, { status: 409 });
      }
    }
    
    // Blog ve çevirilerini transaction içinde güncelle
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ana blog kaydını güncelle
      const updatedBlog = await tx.blog.update({
        where: { id },
        data: {
          slug: body.slug,
          coverImageUrl: body.coverImageUrl,
          isPublished: body.isPublished,
          publishedAt: body.isPublished && !existingBlog.isPublished ? new Date() : existingBlog.publishedAt,
        },
      });
      
      // 2. Çevirileri güncelle veya ekle
      if (body.translations && Array.isArray(body.translations)) {
        for (const translation of body.translations) {
          if (translation.languageCode && translation.title && translation.fullDescription && translation.content) {
            // Çeviri var mı kontrol et
            const existingTranslation = await tx.blogTranslation.findUnique({
              where: {
                blogId_languageCode: {
                  blogId: id,
                  languageCode: translation.languageCode,
                },
              },
            });
            
            if (existingTranslation) {
              // Mevcut çeviriyi güncelle
              await tx.blogTranslation.update({
                where: { id: existingTranslation.id },
                data: {
                  title: translation.title,
                  fullDescription: translation.fullDescription,
                  content: translation.content,
                  tocItems: translation.tocItems || existingTranslation.tocItems,
                },
              });
            } else {
              // Yeni çeviri ekle
              await tx.blogTranslation.create({
                data: {
                  blogId: id,
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
      }
      
      // 3. Güncel blogu getir
      return await tx.blog.findUnique({
        where: { id },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating blog with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Blog güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Blogu sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    
    // Blog kontrol
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });
    
    if (!existingBlog) {
      return NextResponse.json({ message: 'Blog bulunamadı.' }, { status: 404 });
    }
    
    // Blogu ve ilişkili tüm çevirilerini sil
    // (Cascading delete sayesinde blog silindiğinde çeviriler de silinecek)
    await prisma.blog.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Blog başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting blog with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Blog silinirken bir hata oluştu.' }, { status: 500 });
  }
});