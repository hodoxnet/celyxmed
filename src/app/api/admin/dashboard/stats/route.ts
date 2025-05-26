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

    // Blog sayısını al
    const blogCount = await prisma.blog.count({
      where: { isPublished: true }
    });

    // Bu ayki blog sayısını al
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const blogTrend = await prisma.blog.count({
      where: {
        isPublished: true,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Hizmet sayısını al
    const hizmetCount = await prisma.hizmet.count({
      where: { published: true }
    });

    // Bu ayki hizmet sayısını al
    const hizmetTrend = await prisma.hizmet.count({
      where: {
        published: true,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Kullanıcı sayısını al
    const userCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    // Dil sayısını al
    const languageCount = await prisma.language.count({
      where: { isActive: true }
    });

    return NextResponse.json({
      blogCount,
      blogTrend,
      hizmetCount,
      hizmetTrend,
      userCount,
      languageCount,
      messageCount: 0, // İletişim formu veritabanında yok
      messageTrend: 0,
      pageViews: 2345, // Google Analytics entegrasyonu gerekir
      pageViewsTrend: 12
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}