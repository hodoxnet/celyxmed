import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hizmetDetayFormSchema } from '@/lib/validators/admin';
import { Role } from '@/generated/prisma';
// Prisma importu kaldırıldı, SortOrder için kullanmıyoruz.
// import { Prisma } from '@prisma/client';

interface Context {
  params: {
    id: string;
  };
}

// GET: Belirli bir hizmet detayını getir
export async function GET(req: Request, context: Context) {
  try {
    const { id } = context.params;

    // Oturum kontrolü (GET için opsiyonel, admin paneli olduğu için ekleyelim)
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      // Public GET için yetki kontrolü kaldırılabilir veya farklı bir rota kullanılabilir.
      // Admin paneli için zorunlu tutalım.
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const hizmetDetay = await prisma.hizmetDetay.findUnique({
      where: { id },
      // include objesi doğrudan tanımlandı
      include: {
        tocItems: { orderBy: { order: 'asc' } },
        marqueeImages: { orderBy: { order: 'asc' } },
        introLinks: { orderBy: { order: 'asc' } },
        overviewTabs: { orderBy: { order: 'asc' } },
        whyItems: { orderBy: { order: 'asc' } },
        galleryImages: { orderBy: { order: 'asc' } },
        testimonials: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        recoveryItems: { orderBy: { order: 'asc' } },
        ctaAvatars: { orderBy: { order: 'asc' } },
        pricingPackages: { orderBy: { order: 'asc' } },
        expertItems: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
      },
    });

    if (!hizmetDetay) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(hizmetDetay);

  } catch (error) {
    console.error(`[GET /api/admin/hizmetler/${context.params.id}] Error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH: Belirli bir hizmet detayını güncelle
export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = context.params;

    // 1. Oturum kontrolü ve yetkilendirme
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. İstek gövdesini al ve doğrula
    const body = await req.json();
    const validationResult = hizmetDetayFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.flatten().fieldErrors);
      return new NextResponse(JSON.stringify({ errors: validationResult.error.flatten().fieldErrors }), { status: 400 });
    }

    const data = validationResult.data;

    // 3. Veritabanı işlemi (Transaction içinde)
    const updatedHizmetDetay = await prisma.$transaction(async (tx) => {
      // İlişkili verileri ayır
      const {
        tocItems = [],
        marqueeImages = [],
        introLinks = [],
        overviewTabs = [],
        whyItems = [],
        galleryImages = [],
        testimonials = [],
        steps = [],
        recoveryItems = [],
        ctaAvatars = [],
        pricingPackages = [],
        expertItems = [],
        faqs = [],
        ...mainData // Ana HizmetDetay verileri
      } = data;

      // Önce mevcut ilişkili tüm öğeleri sil (basit yaklaşım)
      // Daha sofistike: Gelen ID'lere göre update/create/delete yapılabilir ama daha karmaşık.
      await Promise.all([
        tx.hizmetTocItem.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetMarqueeImage.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetIntroLink.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetOverviewTab.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetWhyItem.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetGalleryImage.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetTestimonial.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetStep.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetRecoveryItem.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetCtaAvatar.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetPricingPackage.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetExpertItem.deleteMany({ where: { hizmetDetayId: id } }),
        tx.hizmetFaqItem.deleteMany({ where: { hizmetDetayId: id } }),
      ]);

      // Ana HizmetDetay kaydını güncelle ve yeni ilişkili öğeleri ekle
      const updatedHizmet = await tx.hizmetDetay.update({
        where: { id },
        data: {
          ...mainData,
          // İlişkili kayıtları nested create ile ekle
          tocItems: { createMany: { data: tocItems } },
          marqueeImages: { createMany: { data: marqueeImages } },
          introLinks: { createMany: { data: introLinks } },
          overviewTabs: { createMany: { data: overviewTabs } },
          whyItems: { createMany: { data: whyItems } },
          galleryImages: { createMany: { data: galleryImages } },
          testimonials: { createMany: { data: testimonials } },
          steps: { createMany: { data: steps } },
          recoveryItems: { createMany: { data: recoveryItems } },
          ctaAvatars: { createMany: { data: ctaAvatars } },
          pricingPackages: { createMany: { data: pricingPackages } },
          expertItems: { createMany: { data: expertItems } },
          faqs: { createMany: { data: faqs } },
        },
        // include objesi doğrudan tanımlandı
        include: {
          tocItems: { orderBy: { order: 'asc' } },
          marqueeImages: { orderBy: { order: 'asc' } },
          introLinks: { orderBy: { order: 'asc' } },
          overviewTabs: { orderBy: { order: 'asc' } },
          whyItems: { orderBy: { order: 'asc' } },
          galleryImages: { orderBy: { order: 'asc' } },
          testimonials: { orderBy: { order: 'asc' } },
          steps: { orderBy: { order: 'asc' } },
          recoveryItems: { orderBy: { order: 'asc' } },
          ctaAvatars: { orderBy: { order: 'asc' } },
          pricingPackages: { orderBy: { order: 'asc' } },
          expertItems: { orderBy: { order: 'asc' } },
          faqs: { orderBy: { order: 'asc' } },
        },
      });

      return updatedHizmet;
    });

    return NextResponse.json(updatedHizmetDetay);

  } catch (error) {
    console.error(`[PATCH /api/admin/hizmetler/${context.params.id}] Error:`, error);
     // Prisma'nın unique constraint hatasını yakala (örn: slug + languageCode)
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        const target = (error as any).meta?.target || [];
        let message = 'Benzersizlik kısıtlaması ihlal edildi.';
        if (target.includes('slug') && target.includes('languageCode')) {
            message = 'Bu dil için belirtilen slug zaten kullanılıyor.';
        }
        return new NextResponse(JSON.stringify({ message }), { status: 409 }); // 409 Conflict
    }
    // Kayıt bulunamadı hatası (update için)
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return new NextResponse('Not Found', { status: 404 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// DELETE: Belirli bir hizmet detayını sil
export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = context.params;

    // 1. Oturum kontrolü ve yetkilendirme
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Veritabanı işlemi
    await prisma.hizmetDetay.delete({
      where: { id },
    });
    // İlişkili kayıtlar onDelete: Cascade sayesinde otomatik silinecek

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error(`[DELETE /api/admin/hizmetler/${context.params.id}] Error:`, error);
    // Kayıt bulunamadı hatası (delete için)
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return new NextResponse('Not Found', { status: 404 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
