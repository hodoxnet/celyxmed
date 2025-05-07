import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { Role } from "@/generated/prisma";

// --- Zod Şemaları (hizmet-form.tsx'den alındı, idealde ayrı dosyada olmalı) ---
const hizmetTocItemSchema = z.object({ id: z.string().optional(), text: z.string().min(1), isBold: z.boolean().default(false), level: z.number().optional().nullable(), order: z.number().default(0) });
const hizmetIntroLinkSchema = z.object({ id: z.string().optional(), targetId: z.string().min(1), number: z.string().min(1), text: z.string().min(1), order: z.number().default(0) });
const hizmetStepSchema = z.object({ id: z.string().optional(), title: z.string().min(1), description: z.string().min(1), linkText: z.string().optional().nullable(), order: z.number().default(0) });
const hizmetFaqItemSchema = z.object({ id: z.string().optional(), question: z.string().min(1), answer: z.string().min(1), order: z.number().default(0) });
const hizmetTranslationSchema = z.object({
  languageCode: z.string(), slug: z.string().min(1), title: z.string().min(1), description: z.string().min(1), breadcrumb: z.string().default(""),
  tocTitle: z.string().default("İçindekiler"), tocAuthorInfo: z.string().default(""), tocCtaDescription: z.string().default(""), tocItems: z.array(hizmetTocItemSchema).default([]),
  introVideoId: z.string().optional().nullable().default(null), introTitle: z.string().default(""), introDescription: z.string().default(""), introPrimaryButtonText: z.string().default(""), introPrimaryButtonLink: z.string().default(""), introSecondaryButtonText: z.string().default(""), introSecondaryButtonLink: z.string().default(""), introLinks: z.array(hizmetIntroLinkSchema).default([]),
  overviewSectionTitle: z.string().default("Genel Bakış"), overviewSectionDescription: z.string().default(""), whySectionTitle: z.string().default("Neden Biz?"), gallerySectionTitle: z.string().default("Galeri"), gallerySectionDescription: z.string().default(""), testimonialsSectionTitle: z.string().optional().nullable().default("Yorumlar"),
  stepsSectionTitle: z.string().default("Adımlar"), stepsSectionDescription: z.string().default(""), steps: z.array(hizmetStepSchema).default([]), recoverySectionTitle: z.string().default("İyileşme Süreci"), recoverySectionDescription: z.string().default(""),
  ctaTagline: z.string().optional().nullable().default(null), ctaTitle: z.string().default("Bize Ulaşın"), ctaDescription: z.string().default(""), ctaButtonText: z.string().default("Randevu Al"), ctaButtonLink: z.string().optional().nullable().default(null), ctaAvatarText: z.string().optional().nullable().default(null),
  pricingSectionTitle: z.string().default("Fiyatlandırma"), pricingSectionDescription: z.string().default(""), expertsSectionTitle: z.string().default("Uzmanlarımız"), expertsTagline: z.string().optional().nullable().default(null),
  faqSectionTitle: z.string().default("Sıkça Sorulan Sorular"), faqSectionDescription: z.string().default(""), faqs: z.array(hizmetFaqItemSchema).default([]),
  metaTitle: z.string().optional().nullable().default(null), metaDescription: z.string().optional().nullable().default(null), metaKeywords: z.string().optional().nullable().default(null),
});
const hizmetOverviewTabTranslationSchema = z.object({ languageCode: z.string(), triggerText: z.string().min(1), title: z.string().min(1), content: z.string().min(1), buttonText: z.string().default("Detaylar"), buttonLink: z.string().optional().nullable().default(null) });
const hizmetOverviewTabDefinitionSchema = z.object({ id: z.string().optional(), value: z.string().min(1), imagePath: z.string().optional().nullable().default(null), imageAlt: z.string().optional().nullable().default(null), order: z.number().default(0), translations: z.record(z.string(), hizmetOverviewTabTranslationSchema) });
const hizmetWhyItemTranslationSchema = z.object({ languageCode: z.string(), title: z.string().min(1), description: z.string().min(1) });
const hizmetWhyItemDefinitionSchema = z.object({ id: z.string().optional(), number: z.string().min(1), order: z.number().default(0), translations: z.record(z.string(), hizmetWhyItemTranslationSchema) });
const hizmetTestimonialTranslationSchema = z.object({ languageCode: z.string(), text: z.string().min(1), author: z.string().min(1), treatment: z.string().optional().nullable() });
const hizmetTestimonialDefinitionSchema = z.object({ id: z.string().optional(), stars: z.number().min(1).max(5).default(5), imageUrl: z.string().optional().nullable(), order: z.number().default(0), translations: z.record(z.string(), hizmetTestimonialTranslationSchema) });
const hizmetRecoveryItemTranslationSchema = z.object({ languageCode: z.string(), title: z.string().min(1), description: z.string().min(1) });
const hizmetRecoveryItemDefinitionSchema = z.object({ id: z.string().optional(), imageUrl: z.string().min(1), imageAlt: z.string().min(1), order: z.number().default(0), translations: z.record(z.string(), hizmetRecoveryItemTranslationSchema) });
const hizmetExpertItemTranslationSchema = z.object({ languageCode: z.string(), name: z.string().min(1), title: z.string().min(1), description: z.string().min(1), ctaText: z.string().optional().nullable() });
const hizmetExpertItemDefinitionSchema = z.object({ id: z.string().optional(), imageUrl: z.string().min(1), imageAlt: z.string().min(1), order: z.number().default(0), translations: z.record(z.string(), hizmetExpertItemTranslationSchema) });
const hizmetPricingPackageTranslationSchema = z.object({ languageCode: z.string(), title: z.string().min(1), price: z.string().min(1), features: z.array(z.string()).default([]) });
const hizmetPricingPackageDefinitionSchema = z.object({ id: z.string().optional(), isFeatured: z.boolean().default(false), order: z.number().default(0), translations: z.record(z.string(), hizmetPricingPackageTranslationSchema) });
const hizmetFormSchema = z.object({
  id: z.string().optional(), published: z.boolean().default(false), heroImageUrl: z.string().optional().nullable().default(null), heroImageAlt: z.string().optional().nullable().default(null), whyBackgroundImageUrl: z.string().optional().nullable().default(null), ctaBackgroundImageUrl: z.string().optional().nullable().default(null), ctaMainImageUrl: z.string().optional().nullable().default(null), ctaMainImageAlt: z.string().optional().nullable().default(null),
  marqueeImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]), galleryImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]), ctaAvatars: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]),
  translations: z.record(z.string(), hizmetTranslationSchema),
  overviewTabDefinitions: z.array(hizmetOverviewTabDefinitionSchema).default([]), whyItemDefinitions: z.array(hizmetWhyItemDefinitionSchema).default([]), testimonialDefinitions: z.array(hizmetTestimonialDefinitionSchema).default([]), recoveryItemDefinitions: z.array(hizmetRecoveryItemDefinitionSchema).default([]), expertItemDefinitions: z.array(hizmetExpertItemDefinitionSchema).default([]), pricingPackageDefinitions: z.array(hizmetPricingPackageDefinitionSchema).default([]),
});
// --- Şema kopyalama sonu ---

export async function POST(req: Request) {
  try {
    // 1. Oturum kontrolü ve yetkilendirme
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. İstek gövdesini al ve doğrula
    const body = await req.json();
    const validationResult = hizmetFormSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation Errors:", validationResult.error.flatten().fieldErrors);
      const errors = Object.entries(validationResult.error.flatten().fieldErrors)
        .map(([key, value]) => `${key}: ${value.join(', ')}`)
        .join('; ');
      return new NextResponse(JSON.stringify({ message: `Doğrulama hatası: ${errors}` }), { status: 400 });
    }

    // Doğrulanmış veriyi al
    const {
      id, // POST isteğinde ID olmamalı, PATCH'te olacak. Şimdilik görmezden geliyoruz.
      published,
      heroImageUrl,
      heroImageAlt,
      whyBackgroundImageUrl,
      ctaBackgroundImageUrl,
      ctaMainImageUrl,
      ctaMainImageAlt,
      marqueeImages,
      galleryImages,
      ctaAvatars,
      translations, // Bu bir nesne { tr: {...}, en: {...} }
      overviewTabDefinitions,
      whyItemDefinitions,
      testimonialDefinitions,
      recoveryItemDefinitions,
      expertItemDefinitions,
      pricingPackageDefinitions,
    } = validationResult.data;

    // Ana Hizmet verilerini topla
    const hizmetMainData = {
      published,
      heroImageUrl,
      heroImageAlt,
      whyBackgroundImageUrl,
      ctaBackgroundImageUrl,
      ctaMainImageUrl,
      ctaMainImageAlt,
    };

    // 3. Veritabanı işlemi (Transaction içinde)
    const newHizmet = await prisma.$transaction(async (tx) => {
      // Ana Hizmet kaydını oluştur
      const createdHizmet = await tx.hizmet.create({
        data: {
          ...hizmetMainData,
          // Dil bağımsız koleksiyonları nested create ile ekle
          marqueeImages: { createMany: { data: marqueeImages || [] } },
          galleryImages: { createMany: { data: galleryImages || [] } },
          ctaAvatars: { createMany: { data: ctaAvatars || [] } },
        },
      });

      // Çevirileri oluştur
      for (const langCode in translations) {
        const translationData = translations[langCode];
        // İlişkili listeleri ayır
        const { tocItems, introLinks, steps, faqs, ...mainTranslationData } = translationData;
        await tx.hizmetTranslation.create({
          data: {
            ...mainTranslationData, // slug, title, description etc.
            hizmetId: createdHizmet.id,
            languageCode: langCode,
            // Nested creates for translation-specific items
            tocItems: { createMany: { data: tocItems || [] } },
            introLinks: { createMany: { data: introLinks || [] } },
            steps: { createMany: { data: steps || [] } },
            faqs: { createMany: { data: faqs || [] } },
          },
        });
      }

      // Definition ve Translation'larını oluştur
      const createDefinitionsAndTranslations = async (
        definitions: any[],
        definitionModel: keyof typeof tx,
        translationModel: keyof typeof tx
      ) => {
        for (const defData of definitions || []) {
          const { translations: defTranslations, ...mainDefData } = defData;
          // @ts-ignore - Model isimlerini dinamik kullanmak için
          const createdDef = await tx[definitionModel].create({
            data: {
              ...mainDefData,
              hizmetId: createdHizmet.id,
            },
          });
          for (const langCode in defTranslations) {
             // @ts-ignore - Model isimlerini dinamik kullanmak için
            await tx[translationModel].create({
              data: {
                definitionId: createdDef.id,
                languageCode: langCode,
                ...defTranslations[langCode],
              },
            });
          }
        }
      };

      await createDefinitionsAndTranslations(overviewTabDefinitions, 'hizmetOverviewTabDefinition', 'hizmetOverviewTabTranslation');
      await createDefinitionsAndTranslations(whyItemDefinitions, 'hizmetWhyItemDefinition', 'hizmetWhyItemTranslation');
      await createDefinitionsAndTranslations(testimonialDefinitions, 'hizmetTestimonialDefinition', 'hizmetTestimonialTranslation');
      await createDefinitionsAndTranslations(recoveryItemDefinitions, 'hizmetRecoveryItemDefinition', 'hizmetRecoveryItemTranslation');
      await createDefinitionsAndTranslations(expertItemDefinitions, 'hizmetExpertItemDefinition', 'hizmetExpertItemTranslation');
      await createDefinitionsAndTranslations(pricingPackageDefinitions, 'hizmetPricingPackageDefinition', 'hizmetPricingPackageTranslation');

      // Oluşturulan ana hizmeti döndür
      return createdHizmet;
    });

    // Yanıtı güncelle
    return NextResponse.json(newHizmet, { status: 201 });

  } catch (error) {
    console.error("[POST /api/admin/hizmetler] Error:", error);
    if (error instanceof z.ZodError) {
       return new NextResponse(JSON.stringify({ message: "Doğrulama hatası", errors: error.flatten().fieldErrors }), { status: 400 });
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        const target = (error as any).meta?.target || [];
        let message = 'Benzersizlik kısıtlaması ihlal edildi.';
        if (target.includes('slug') && target.includes('languageCode')) {
            message = 'Bu dil için belirtilen slug zaten kullanılıyor.';
        }
        return new NextResponse(JSON.stringify({ message }), { status: 409 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET: Tüm hizmetleri listele (Yeni yapıya göre güncellendi)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Hizmetleri ve varsayılan dildeki çevirilerini çek
    const defaultLanguage = await prisma.language.findFirst({ where: { isDefault: true } });
    const defaultLangCode = defaultLanguage?.code || 'tr'; // Varsayılan dil yoksa 'tr' kullan

    const hizmetler = await prisma.hizmet.findMany({
      select: {
        id: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        translations: {
          where: { languageCode: defaultLangCode },
          select: {
            title: true,
            slug: true,
            languageCode: true,
          },
          take: 1, // Her hizmet için sadece varsayılan dil çevirisini al
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Yanıtı formatla (her hizmet için başlık, slug vb. ekle)
    const formattedHizmetler = hizmetler.map(h => ({
      id: h.id,
      published: h.published,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
      title: h.translations[0]?.title || `[${defaultLangCode} Başlık Eksik]`, // Başlık yoksa belirt
      slug: h.translations[0]?.slug || '',
      languageCode: h.translations[0]?.languageCode || defaultLangCode,
    }));

    return NextResponse.json(formattedHizmetler);

  } catch (error) {
    console.error("[GET /api/admin/hizmetler] Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
