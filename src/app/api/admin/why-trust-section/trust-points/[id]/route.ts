import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

interface Params {
  params: { id: string };
}

// GET: Belirli bir trust point'i getir
export const GET = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');
    
    // Trust point ve çevirilerini getir
    const trustPoint = await prisma.whyTrustPoint.findUnique({
      where: { id },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
      },
    });
    
    if (!trustPoint) {
      return NextResponse.json({ message: 'Trust point bulunamadı.' }, { status: 404 });
    }
    
    return NextResponse.json(trustPoint);
  } catch (error) {
    console.error(`Error fetching trust point with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Trust point getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// PUT: Trust point güncelle
export const PUT = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { number, order, translations } = body;
    
    // Trust point kontrol
    const existingTrustPoint = await prisma.whyTrustPoint.findUnique({
      where: { id },
    });
    
    if (!existingTrustPoint) {
      return NextResponse.json({ message: 'Trust point bulunamadı.' }, { status: 404 });
    }
    
    // Trust point ve çevirilerini transaction içinde güncelle
    const result = await prisma.$transaction(async (tx) => {
      // 1. Trust point'i güncelle
      const updatedTrustPoint = await tx.whyTrustPoint.update({
        where: { id },
        data: {
          number,
          ...(order !== undefined ? { order } : {}),
        },
      });
      
      // 2. Çevirileri güncelle veya ekle
      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          const { languageCode, title, description } = translation;
          
          // Çeviride gerekli alanlar var mı kontrol et
          if (languageCode && (title !== undefined || description !== undefined)) {
            // Mevcut çeviriyi bul
            const existingTranslation = await tx.whyTrustPointTranslation.findUnique({
              where: {
                whyTrustPointId_languageCode: {
                  whyTrustPointId: id,
                  languageCode,
                },
              },
            });
            
            if (existingTranslation) {
              // Mevcut çeviriyi güncelle
              await tx.whyTrustPointTranslation.update({
                where: { id: existingTranslation.id },
                data: {
                  title: title !== undefined ? title : existingTranslation.title,
                  description: description !== undefined ? description : existingTranslation.description,
                },
              });
            } else {
              // Yeni çeviri ekle
              await tx.whyTrustPointTranslation.create({
                data: {
                  whyTrustPointId: id,
                  languageCode,
                  title: title || '',
                  description: description || '',
                },
              });
            }
          }
        }
      }
      
      // 3. Güncel trust point'i getir
      return await tx.whyTrustPoint.findUnique({
        where: { id },
        include: {
          translations: true,
        },
      });
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating trust point with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Trust point güncellenirken bir hata oluştu.' }, { status: 500 });
  }
});

// DELETE: Trust point sil
export const DELETE = withAdmin(async (req: Request, { params }: Params) => {
  try {
    const { id } = params;
    
    // Trust point kontrol
    const existingTrustPoint = await prisma.whyTrustPoint.findUnique({
      where: { id },
    });
    
    if (!existingTrustPoint) {
      return NextResponse.json({ message: 'Trust point bulunamadı.' }, { status: 404 });
    }
    
    // Trust point'i ve ilişkili tüm çevirileri sil (Cascade delete sayesinde otomatik)
    await prisma.whyTrustPoint.delete({
      where: { id },
    });
    
    // Kalan trust pointlerin order değerlerini yeniden düzenle
    const remainingTrustPoints = await prisma.whyTrustPoint.findMany({
      where: { whyTrustSectionId: 'main' },
      orderBy: { order: 'asc' },
    });
    
    if (remainingTrustPoints.length > 0) {
      await prisma.$transaction(
        remainingTrustPoints.map((point, index) => 
          prisma.whyTrustPoint.update({
            where: { id: point.id },
            data: { order: index },
          })
        )
      );
    }
    
    return NextResponse.json({ message: 'Trust point başarıyla silindi.' });
  } catch (error) {
    console.error(`Error deleting trust point with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Trust point silinirken bir hata oluştu.' }, { status: 500 });
  }
});