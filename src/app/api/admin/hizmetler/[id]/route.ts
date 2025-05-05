import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { hizmetDetayFormSchema } from '@/lib/validators/admin';
import { Role } from '@/generated/prisma';
import { unlink } from 'fs/promises'; // Dosya silmek için
import { join } from 'path'; // Yol birleştirmek için

interface Context {
  params: {
    id: string;
  };
}

// Yardımcı fonksiyon: Fiziksel dosyayı siler (Sadece string kabul eder)
async function deleteFile(relativePath: string) {
  // Null/undefined kontrolü çağrıldığı yerde yapıldığı için burada tekrar gerekmez.
  // Sadece /uploads/ ile başladığını kontrol edelim.
   if (!relativePath.startsWith('/uploads/')) {
     console.warn(`Geçersiz dosya yolu formatı: ${relativePath}`);
     return;
  }
  try {
    const filename = relativePath.split('/').pop(); // Sadece dosya adını al
    if (!filename) return;

    // Güvenlik: Path traversal saldırılarını önlemek için sadece dosya adını kullan
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, ''); // Güvenli karakterler dışındakileri temizle
    if (safeFilename !== filename) {
        console.warn(`Potansiyel path traversal engellendi: ${relativePath}`);
        return; // Şüpheli yol ise silme
    }

    const filePath = join(process.cwd(), 'public', 'uploads', 'hizmetler', safeFilename);
    await unlink(filePath);
    console.log(`Dosya silindi: ${filePath}`);
  } catch (error: any) {
    // Dosya bulunamazsa hata verme (zaten silinmiş olabilir)
    if (error.code !== 'ENOENT') {
      console.error(`Dosya silme hatası (${relativePath}):`, error);
    }
  }
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

    // 3. Güncellemeden önce mevcut veriyi çek (silinecek dosyaları belirlemek için)
    const currentHizmet = await prisma.hizmetDetay.findUnique({
        where: { id },
        include: {
            marqueeImages: { select: { src: true } },
            galleryImages: { select: { src: true } },
            overviewTabs: { select: { imageUrl: true } },
            recoveryItems: { select: { imageUrl: true } },
            ctaAvatars: { select: { src: true } },
            expertItems: { select: { imageUrl: true } },
            testimonials: { select: { imageUrl: true } },
        }
    });

    if (!currentHizmet) {
        return new NextResponse('Not Found', { status: 404 });
    }

    // 4. Veritabanı işlemi (Transaction içinde)
    const updatedHizmetDetay = await prisma.$transaction(async (tx) => {
      // İlişkili verileri ayır (formdan gelen yeni veri)
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
        ...mainData // Ana HizmetDetay verileri (formdan gelen yeni veri)
      } = data;

      // 5. Silinecek fiziksel dosyaları belirle ve sil
      const deletePromises: Promise<void>[] = [];

      // Ana resimler (eğer değişmişse ve eskisi geçerliyse sil) - Null kontrolü yapılıp sadece string ile çağır
      const oldHeroImage = currentHizmet.heroImageUrl;
      if (oldHeroImage && oldHeroImage !== mainData.heroImageUrl) {
         deletePromises.push(deleteFile(oldHeroImage));
      }
      const oldWhyBg = currentHizmet.whyBackgroundImageUrl;
      if (oldWhyBg && oldWhyBg !== mainData.whyBackgroundImageUrl) {
         deletePromises.push(deleteFile(oldWhyBg));
      }
      const oldCtaBg = currentHizmet.ctaBackgroundImageUrl;
      if (oldCtaBg && oldCtaBg !== mainData.ctaBackgroundImageUrl) {
         deletePromises.push(deleteFile(oldCtaBg));
      }
      const oldCtaMain = currentHizmet.ctaMainImageUrl;
       if (oldCtaMain && oldCtaMain !== mainData.ctaMainImageUrl) {
         deletePromises.push(deleteFile(oldCtaMain));
      }

      // İlişkili listelerdeki resimler (eskide olup yenide olmayanları sil)
      const currentMarqueeSrcs = new Set(currentHizmet.marqueeImages?.map(item => item.src));
      const newMarqueeSrcs = new Set(marqueeImages.map(item => item.src));
      currentMarqueeSrcs.forEach(src => {
        if (!newMarqueeSrcs.has(src)) {
          deletePromises.push(deleteFile(src));
        }
      });
      // Diğer listeler için benzer karşılaştırmalar... (galleryImages, overviewTabs, recoveryItems, ctaAvatars, expertItems, testimonials)
       const currentGallerySrcs = new Set(currentHizmet.galleryImages?.map(item => item.src));
       const newGallerySrcs = new Set(galleryImages.map(item => item.src));
       currentGallerySrcs.forEach(src => !newGallerySrcs.has(src) && deletePromises.push(deleteFile(src)));

       const currentOverviewUrls = new Set(currentHizmet.overviewTabs?.map(item => item.imageUrl));
       const newOverviewUrls = new Set(overviewTabs.map(item => item.imageUrl));
       currentOverviewUrls.forEach(url => !newOverviewUrls.has(url) && deletePromises.push(deleteFile(url)));

       const currentRecoveryUrls = new Set(currentHizmet.recoveryItems?.map(item => item.imageUrl));
       const newRecoveryUrls = new Set(recoveryItems.map(item => item.imageUrl));
       currentRecoveryUrls.forEach(url => !newRecoveryUrls.has(url) && deletePromises.push(deleteFile(url)));

       const currentCtaAvatarSrcs = new Set(currentHizmet.ctaAvatars?.map(item => item.src));
       const newCtaAvatarSrcs = new Set(ctaAvatars.map(item => item.src));
       currentCtaAvatarSrcs.forEach(src => !newCtaAvatarSrcs.has(src) && deletePromises.push(deleteFile(src)));

       const currentExpertUrls = new Set(currentHizmet.expertItems?.map(item => item.imageUrl));
       const newExpertUrls = new Set(expertItems.map(item => item.imageUrl));
       currentExpertUrls.forEach(url => !newExpertUrls.has(url) && deletePromises.push(deleteFile(url)));

       const currentTestimonialUrls = new Set(currentHizmet.testimonials?.map(item => item.imageUrl).filter((url): url is string => !!url)); // filter(Boolean) yerine type guard
       const newTestimonialUrls = new Set(testimonials.map(item => item.imageUrl).filter((url): url is string => !!url));
       currentTestimonialUrls.forEach(url => {
           if (!newTestimonialUrls.has(url)) {
               deletePromises.push(deleteFile(url)); // url burada string olmalı
           }
       });


      // Dosya silme işlemlerini bekle (veritabanı güncellemesinden önce)
      await Promise.allSettled(deletePromises);


      // 6. Mevcut ilişkili tüm öğeleri sil (basit yaklaşım)
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

    // 2. Silmeden önce hizmet detayını ve ilişkili resim yollarını al
    const hizmetToSil = await prisma.hizmetDetay.findUnique({
      where: { id },
      include: {
        marqueeImages: { select: { src: true } },
        galleryImages: { select: { src: true } },
        overviewTabs: { select: { imageUrl: true } },
        recoveryItems: { select: { imageUrl: true } },
        ctaAvatars: { select: { src: true } },
        expertItems: { select: { imageUrl: true } },
        testimonials: { select: { imageUrl: true } }, // Testimonials eklendi
        // Diğer resim içeren ilişkili modelleri de ekle (varsa)
      }
    });

    if (!hizmetToSil) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // 3. İlişkili fiziksel dosyaları sil
    const deletePromises: Promise<void>[] = [];

    // Ana resimler - Null kontrolü eklendi
    if (hizmetToSil.heroImageUrl) {
        deletePromises.push(deleteFile(hizmetToSil.heroImageUrl));
    }
    if (hizmetToSil.whyBackgroundImageUrl) {
        deletePromises.push(deleteFile(hizmetToSil.whyBackgroundImageUrl));
    }
    if (hizmetToSil.ctaBackgroundImageUrl) {
        deletePromises.push(deleteFile(hizmetToSil.ctaBackgroundImageUrl));
    }
    if (hizmetToSil.ctaMainImageUrl) {
        deletePromises.push(deleteFile(hizmetToSil.ctaMainImageUrl));
    }

    // İlişkili listelerdeki resimler
    hizmetToSil.marqueeImages?.forEach(item => deletePromises.push(deleteFile(item.src)));
    hizmetToSil.galleryImages?.forEach(item => deletePromises.push(deleteFile(item.src)));
    hizmetToSil.overviewTabs?.forEach(item => deletePromises.push(deleteFile(item.imageUrl)));
    hizmetToSil.recoveryItems?.forEach(item => deletePromises.push(deleteFile(item.imageUrl)));
    hizmetToSil.ctaAvatars?.forEach(item => deletePromises.push(deleteFile(item.src)));
    hizmetToSil.expertItems?.forEach(item => deletePromises.push(deleteFile(item.imageUrl)));
    hizmetToSil.testimonials?.forEach(item => deletePromises.push(deleteFile(item.imageUrl))); // Testimonials imageUrl eklendi

    // Tüm silme işlemlerinin tamamlanmasını bekle (hataları yoksayarak)
    await Promise.allSettled(deletePromises);

    // 4. Veritabanı kaydını sil
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
