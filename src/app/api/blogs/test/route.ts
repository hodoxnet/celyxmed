import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Bu endpoint test amaçlıdır
export async function GET() {
  try {
    // Veritabanında mevcut blog sayısını kontrol et
    const blogCount = await prisma.blog.count();
    const blogTranslationCount = await prisma.blogTranslation.count();
    
    // Dilleri getir
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      select: { code: true, name: true, isDefault: true }
    });
    
    // Blog ve çevirilerini getir (ilk 5)
    const blogs = await prisma.blog.findMany({
      take: 5,
      include: {
        translations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Blog sistemi test edildi',
      stats: {
        blogCount,
        blogTranslationCount,
        languages,
      },
      sampleData: blogs.length > 0 ? blogs : 'Henüz blog kaydı bulunmuyor',
      apiInfo: {
        endpointFormat: '/api/blogs/{locale}/{slug}',
        description: 'Blog verilerini locale ve slug parametrelerine göre alabilirsiniz'
      }
    });
  } catch (error) {
    console.error("Error testing blog system:", error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Blog sistemi test edilirken bir hata oluştu.',
      error: String(error)
    }, { status: 500 });
  }
}