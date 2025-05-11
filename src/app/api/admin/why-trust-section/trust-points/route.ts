import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';

// GET: Tüm trust pointleri getir
export const GET = withAdmin(async (req: Request) => {
  try {
    // URL'den dil parametresini al
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('lang');

    // Trust pointleri ve çevirilerini getir
    const trustPoints = await prisma.whyTrustPoint.findMany({
      where: { whyTrustSectionId: 'main' },
      include: {
        translations: languageCode 
          ? { where: { languageCode } } 
          : true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(trustPoints);
  } catch (error) {
    console.error("Error fetching trust points:", error);
    return NextResponse.json({ message: 'Trust pointler getirilirken bir hata oluştu.' }, { status: 500 });
  }
});

// POST: Yeni trust point ekle
export const POST = withAdmin(async (req: Request) => {
  try {
    const body = await req.json();
    const { number, translations } = body;

    // Mevcut en yüksek sıralamayı bul
    const highestOrder = await prisma.whyTrustPoint.findFirst({
      where: { whyTrustSectionId: 'main' },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Ana WhyTrustSection'ın varlığını kontrol et, yoksa oluştur
    let whyTrustSection = await prisma.whyTrustSection.findUnique({
      where: { id: 'main' },
    });

    if (!whyTrustSection) {
      whyTrustSection = await prisma.whyTrustSection.create({
        data: {
          id: 'main',
        },
      });
    }

    // Yeni trust point'i ve çevirilerini transaction içinde ekle
    const result = await prisma.$transaction(async (tx) => {
      // Trust point oluştur
      const newTrustPoint = await tx.whyTrustPoint.create({
        data: {
          whyTrustSectionId: 'main',
          number: number || `0${newOrder + 1}`, // Otomatik numara oluştur (01, 02, vb.)
          order: newOrder,
        },
      });

      // Çevirileri ekle
      if (translations && Array.isArray(translations)) {
        for (const translation of translations) {
          const { languageCode, title, description } = translation;

          if (!languageCode) {
            throw new Error('Dil kodu belirtilmedi');
          }

          await tx.whyTrustPointTranslation.create({
            data: {
              whyTrustPointId: newTrustPoint.id,
              languageCode,
              title: title || '',
              description: description || '',
            },
          });
        }
      }

      // Oluşturulan trust point'i çevirileriyle birlikte getir
      return await tx.whyTrustPoint.findUnique({
        where: { id: newTrustPoint.id },
        include: {
          translations: true,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating trust point:", error);
    return NextResponse.json({ message: 'Trust point oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
});