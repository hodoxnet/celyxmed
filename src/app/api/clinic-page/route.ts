import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Klinik sayfası verilerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'tr';

    // Klinik sayfası verilerini çek
    const clinicPage = await prisma.clinicPage.findFirst({
      include: {
        translations: {
          where: {
            languageCode: lang
          }
        }
      }
    });

    if (!clinicPage || clinicPage.translations.length === 0) {
      return NextResponse.json({
        heroTitle: "Son Teknoloji Kliniğimizde Birinci Sınıf Bakımı Deneyimleyin",
        heroDescription: "İstanbul Ataşehir'deki JCI akreditasyonlu kliniğimiz, en son teknolojiyi ve hasta öncelikli bir yaklaşımı sunmaktadır. İlk konsültasyonunuzdan tedavi sonrası bakıma kadar güvenli, konforlu ve kişiselleştirilmiş bir sağlık hizmeti yolculuğu sağlıyoruz."
      });
    }

    const translation = clinicPage.translations[0];

    return NextResponse.json({
      heroTitle: translation.heroTitle,
      heroDescription: translation.heroDescription
    });

  } catch (error) {
    console.error('Klinik sayfası verileri alınırken hata:', error);
    return NextResponse.json(
      { error: 'Veriler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Klinik sayfası verilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { heroTitle, heroDescription, languageCode = 'tr' } = body;

    // Önce klinik sayfası kaydı var mı kontrol et
    let clinicPage = await prisma.clinicPage.findFirst();

    if (!clinicPage) {
      // Yoksa oluştur
      clinicPage = await prisma.clinicPage.create({
        data: {}
      });
    }

    // Çeviri kaydını güncelle veya oluştur
    await prisma.clinicPageTranslation.upsert({
      where: {
        clinicPageId_languageCode: {
          clinicPageId: clinicPage.id,
          languageCode: languageCode
        }
      },
      update: {
        heroTitle,
        heroDescription
      },
      create: {
        clinicPageId: clinicPage.id,
        languageCode,
        heroTitle,
        heroDescription
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Klinik sayfası güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Güncelleme sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}