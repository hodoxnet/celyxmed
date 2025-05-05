import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Varsayılan auth options yolu
import prisma from '@/lib/prisma';
import { hizmetDetayFormSchema } from '@/lib/validators/admin';
import { Role } from '@/generated/prisma'; // Enum'u import et

export async function POST(req: Request) {
  try {
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
    const newHizmetDetay = await prisma.$transaction(async (tx) => {
      // İlişkili verileri ayır
      const {
        tocItems,
        marqueeImages,
        introLinks,
        overviewTabs,
        whyItems,
        galleryImages,
        testimonials,
        steps,
        recoveryItems,
        ctaAvatars,
        pricingPackages,
        expertItems,
        faqs,
        ...mainData // Ana HizmetDetay verileri
      } = data;

      // Ana HizmetDetay kaydını oluştur
      const createdHizmet = await tx.hizmetDetay.create({
        data: {
          ...mainData,
          // İlişkili kayıtları nested create ile ekle
          tocItems: {
            createMany: { data: tocItems || [] },
          },
          marqueeImages: {
            createMany: { data: marqueeImages || [] },
          },
          introLinks: {
            createMany: { data: introLinks || [] },
          },
          overviewTabs: {
            createMany: { data: overviewTabs || [] },
          },
          whyItems: {
            createMany: { data: whyItems || [] },
          },
          galleryImages: {
            createMany: { data: galleryImages || [] },
          },
          testimonials: {
            createMany: { data: testimonials || [] },
          },
          steps: {
            createMany: { data: steps || [] },
          },
          recoveryItems: {
            createMany: { data: recoveryItems || [] },
          },
          ctaAvatars: {
            createMany: { data: ctaAvatars || [] },
          },
          pricingPackages: {
            createMany: { data: pricingPackages || [] },
          },
          expertItems: {
            createMany: { data: expertItems || [] },
          },
          faqs: {
            createMany: { data: faqs || [] },
          },
        },
        // Oluşturulan ilişkili kayıtları da yanıtla döndürmek için include kullanabiliriz
        // Ancak şimdilik sadece ana kaydı döndürelim
      });

      return createdHizmet;
    });

    return NextResponse.json(newHizmetDetay, { status: 201 });

  } catch (error) {
    console.error("[POST /api/admin/hizmetler] Error:", error);
    // Prisma'nın unique constraint hatasını yakala (örn: slug + languageCode)
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        // Hangi alanın unique constraint'i ihlal ettiğini bulmaya çalışabiliriz
        // error.meta.target içinde alanlar bulunur ['slug', 'languageCode'] gibi
        const target = (error as any).meta?.target || [];
        let message = 'Benzersizlik kısıtlaması ihlal edildi.';
        if (target.includes('slug') && target.includes('languageCode')) {
            message = 'Bu dil için belirtilen slug zaten kullanılıyor.';
        }
        return new NextResponse(JSON.stringify({ message }), { status: 409 }); // 409 Conflict
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET: Tüm hizmet detaylarını listele
export async function GET(req: Request) {
  try {
    // 1. Oturum kontrolü ve yetkilendirme
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Veritabanından tüm hizmetleri çek (şimdilik basit listeleme)
    // Sadece temel bilgileri çekmek performansı artırabilir.
    const hizmetler = await prisma.hizmetDetay.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        languageCode: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc', // En yeniden eskiye sırala
      },
    });

    return NextResponse.json(hizmetler);

  } catch (error) {
    console.error("[GET /api/admin/hizmetler] Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
