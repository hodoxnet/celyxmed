import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Son 5 blog yazısını getir
    const recentBlogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        translations: {
          where: { languageCode: 'tr' },
          select: {
            title: true
          }
        }
      }
    });

    // Formatla ve döndür
    const formattedBlogs = recentBlogs.map(blog => ({
      id: blog.id,
      title: blog.translations[0]?.title || 'Başlıksız',
      createdAt: blog.createdAt.toISOString()
    }));

    return NextResponse.json(formattedBlogs);

  } catch (error) {
    console.error('Recent blogs error:', error);
    return NextResponse.json(
      { error: 'Blog yazıları yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}