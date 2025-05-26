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
  // introVideoId alanı Hizmet modeline ait olduğu için buradan kaldırıldı.
  introTitle: z.string().default(""), introDescription: z.string().default(""), introPrimaryButtonText: z.string().default(""), introPrimaryButtonLink: z.string().default(""), introSecondaryButtonText: z.string().default(""), introSecondaryButtonLink: z.string().default(""), introLinks: z.array(hizmetIntroLinkSchema).default([]),
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
const HizmetBasicInfoSectionTranslationSchema = z.object({ languageCode: z.string(), slug: z.string().min(1), title: z.string().min(1), description: z.string().min(1), breadcrumb: z.string().optional().default("") });
const HizmetTocSectionTranslationSchema = z.object({ languageCode: z.string(), tocTitle: z.string().default("İçindekiler"), tocAuthorInfo: z.string().optional().default(""), tocCtaDescription: z.string().optional().default(""), tocItems: z.array(hizmetTocItemSchema).default([]) });
const HizmetIntroSectionDefinitionSchema = z.object({ videoId: z.string().optional().nullable().default(null) });
const HizmetIntroSectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default(""), description: z.string().default(""), primaryButtonText: z.string().default(""), primaryButtonLink: z.string().default(""), secondaryButtonText: z.string().default(""), secondaryButtonLink: z.string().default(""), introLinks: z.array(hizmetIntroLinkSchema).default([]) });
const HizmetSeoSectionTranslationSchema = z.object({ languageCode: z.string(), metaTitle: z.string().optional().nullable().default(null), metaDescription: z.string().optional().nullable().default(null), metaKeywords: z.string().optional().nullable().default(null) });
const HizmetOverviewSectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("Genel Bakış"), description: z.string().optional().default("") });
const HizmetOverviewSectionDefinitionSchema = z.object({ tabs: z.array(hizmetOverviewTabDefinitionSchema).default([]) });
const HizmetWhySectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("Neden Biz?") });
const HizmetWhySectionDefinitionSchema = z.object({ items: z.array(hizmetWhyItemDefinitionSchema).default([]) });
const HizmetGallerySectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("Galeri"), description: z.string().optional().default("") });
const HizmetTestimonialsSectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().optional().nullable().default("Yorumlar") });
const HizmetTestimonialsSectionDefinitionSchema = z.object({ items: z.array(hizmetTestimonialDefinitionSchema).default([]) });
const HizmetStepsSectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("Adımlar"), description: z.string().optional().default(""), steps: z.array(hizmetStepSchema).default([]) });
const HizmetRecoverySectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("İyileşme Süreci"), description: z.string().optional().default("") });
const HizmetRecoverySectionDefinitionSchema = z.object({ items: z.array(hizmetRecoveryItemDefinitionSchema).default([]) });
const HizmetCtaSectionTranslationSchema = z.object({ languageCode: z.string(), tagline: z.string().optional().nullable().default(null), title: z.string().default("Bize Ulaşın"), description: z.string().default(""), buttonText: z.string().default("Randevu Al"), buttonLink: z.string().optional().nullable().default(null), avatarText: z.string().optional().nullable().default(null) });
const HizmetPricingSectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("Fiyatlandırma"), description: z.string().optional().default("") });
const HizmetPricingSectionDefinitionSchema = z.object({ packages: z.array(hizmetPricingPackageDefinitionSchema).default([]) });
const HizmetExpertsSectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("Uzmanlarımız"), tagline: z.string().optional().nullable().default(null) });
const HizmetExpertsSectionDefinitionSchema = z.object({ items: z.array(hizmetExpertItemDefinitionSchema).default([]) });
const HizmetFaqSectionTranslationSchema = z.object({ languageCode: z.string(), title: z.string().default("Sıkça Sorulan Sorular"), description: z.string().optional().default(""), faqs: z.array(hizmetFaqItemSchema).default([]) });

const hizmetFormSchema = z.object({
  id: z.string().optional(),
  published: z.boolean().default(false),
  heroImageUrl: z.string().optional().nullable().default(null),
  heroImageAlt: z.string().optional().nullable().default(null),
  whyBackgroundImageUrl: z.string().optional().nullable().default(null),
  ctaBackgroundImageUrl: z.string().optional().nullable().default(null),
  ctaMainImageUrl: z.string().optional().nullable().default(null),
  ctaMainImageAlt: z.string().optional().nullable().default(null),
  marqueeImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]),
  galleryImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]),
  ctaAvatars: z.array(z.object({ id: z.string().optional(), src: z.string().min(1), alt: z.string().min(1), order: z.number().default(0) })).default([]),

  // Bölüm Bazlı Yapılar (hizmet-form.tsx'deki gibi eklendi)
  basicInfoSection: z.object({ translations: z.record(z.string(), HizmetBasicInfoSectionTranslationSchema) }).default({ translations: {} }),
  tocSection: z.object({ translations: z.record(z.string(), HizmetTocSectionTranslationSchema) }).default({ translations: {} }),
  introSection: z.object({ definition: HizmetIntroSectionDefinitionSchema.default({ videoId: null }), translations: z.record(z.string(), HizmetIntroSectionTranslationSchema) }).default({ definition: { videoId: null }, translations: {} }),
  seoSection: z.object({ translations: z.record(z.string(), HizmetSeoSectionTranslationSchema) }).default({ translations: {} }),
  overviewSection: z.object({ definition: HizmetOverviewSectionDefinitionSchema.default({ tabs: [] }), translations: z.record(z.string(), HizmetOverviewSectionTranslationSchema) }).default({ definition: { tabs: [] }, translations: {} }),
  whySection: z.object({ definition: HizmetWhySectionDefinitionSchema.default({ items: [] }), translations: z.record(z.string(), HizmetWhySectionTranslationSchema) }).default({ definition: { items: [] }, translations: {} }),
  gallerySection: z.object({ translations: z.record(z.string(), HizmetGallerySectionTranslationSchema) }).default({ translations: {} }),
  testimonialsSection: z.object({ definition: HizmetTestimonialsSectionDefinitionSchema.default({ items: [] }), translations: z.record(z.string(), HizmetTestimonialsSectionTranslationSchema) }).default({ definition: { items: [] }, translations: {} }),
  stepsSection: z.object({ translations: z.record(z.string(), HizmetStepsSectionTranslationSchema) }).default({ translations: {} }),
  recoverySection: z.object({ definition: HizmetRecoverySectionDefinitionSchema.default({ items: [] }), translations: z.record(z.string(), HizmetRecoverySectionTranslationSchema) }).default({ definition: { items: [] }, translations: {} }),
  ctaSection: z.object({ translations: z.record(z.string(), HizmetCtaSectionTranslationSchema) }).default({ translations: {} }),
  pricingSection: z.object({ definition: HizmetPricingSectionDefinitionSchema.default({ packages: [] }), translations: z.record(z.string(), HizmetPricingSectionTranslationSchema) }).default({ definition: { packages: [] }, translations: {} }),
  expertsSection: z.object({ definition: HizmetExpertsSectionDefinitionSchema.default({ items: [] }), translations: z.record(z.string(), HizmetExpertsSectionTranslationSchema) }).default({ definition: { items: [] }, translations: {} }),
  faqSection: z.object({ translations: z.record(z.string(), HizmetFaqSectionTranslationSchema) }).default({ translations: {} }),

  // Eski translations ve definition dizileri (artık bölümlerin içinde)
  // translations: z.record(z.string(), hizmetTranslationSchema), // Bu satır kaldırılmalı veya yorumlanmalı
  // overviewTabDefinitions: z.array(hizmetOverviewTabDefinitionSchema).default([]), // Bu satır kaldırılmalı veya yorumlanmalı
  // whyItemDefinitions: z.array(hizmetWhyItemDefinitionSchema).default([]), // Bu satır kaldırılmalı veya yorumlanmalı
  // testimonialDefinitions: z.array(hizmetTestimonialDefinitionSchema).default([]), // Bu satır kaldırılmalı veya yorumlanmalı
  // recoveryItemDefinitions: z.array(hizmetRecoveryItemDefinitionSchema).default([]), // Bu satır kaldırılmalı veya yorumlanmalı
  // expertItemDefinitions: z.array(hizmetExpertItemDefinitionSchema).default([]), // Bu satır kaldırılmalı veya yorumlanmalı
  // pricingPackageDefinitions: z.array(hizmetPricingPackageDefinitionSchema).default([]), // Bu satır kaldırılmalı veya yorumlanmalı
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
      // introVideoId doğrudan burada değil, introSection içinde
      marqueeImages,
      galleryImages,
      ctaAvatars,
      // Bölüm bazlı verileri alacağız, ana seviyede değil
      // translations, 
      // overviewTabDefinitions,
      // whyItemDefinitions,
      // testimonialDefinitions,
      // recoveryItemDefinitions,
      // expertItemDefinitions,
      // pricingPackageDefinitions,
      basicInfoSection,
      tocSection,
      introSection,
      seoSection,
      overviewSection,
      whySection,
      gallerySection,
      testimonialsSection,
      stepsSection,
      recoverySection,
      ctaSection,
      pricingSection,
      expertsSection,
      faqSection,
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
      introVideoId: introSection?.definition?.videoId, // introVideoId'yi introSection'dan al
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

      // Çevirileri oluştur (Her bölümün çevirisini alarak)
      const allLanguageCodes = Object.keys(basicInfoSection.translations); // Tüm dilleri al
      
      // Tüm mevcut dil kodlarını logla
      console.log(`[API DEBUG] Found translations for languages:`, allLanguageCodes);
      
      for (const langCode of allLanguageCodes) {
          const basicInfoTrans = basicInfoSection.translations[langCode];
          const tocTrans = tocSection.translations[langCode];
          const introTrans = introSection.translations[langCode];
          const seoTrans = seoSection.translations[langCode];
          const overviewTrans = overviewSection.translations[langCode];
          const whyTrans = whySection.translations[langCode];
          const galleryTrans = gallerySection.translations[langCode];
          const testimonialsTrans = testimonialsSection.translations[langCode];
          const stepsTrans = stepsSection.translations[langCode];
          const recoveryTrans = recoverySection.translations[langCode];
          const ctaTrans = ctaSection.translations[langCode];
          const pricingTrans = pricingSection.translations[langCode];
          const expertsTrans = expertsSection.translations[langCode];
          const faqTrans = faqSection.translations[langCode];
          
          // Her dil için gelen verileri logla
          console.log(`[API DEBUG] Processing ${langCode} data:`, 
            JSON.stringify({
              title: basicInfoTrans?.title || "MISSING TITLE", 
              slug: basicInfoTrans?.slug || "MISSING SLUG"
            })
          );

          // Başlık, slug ve açıklama gibi ana alanlar için özel kontrol
          if (!basicInfoTrans?.title || !basicInfoTrans?.slug || !basicInfoTrans?.description) {
            console.warn(`[API WARN] Missing critical fields for language ${langCode}. title: ${!!basicInfoTrans?.title}, slug: ${!!basicInfoTrans?.slug}, description: ${!!basicInfoTrans?.description}`);
          }

          // Dile göre varsayılan değerleri oluşturan yardımcı fonksiyon
          const getDefaultValueForLanguage = (langCode: string, key: string): string => {
                // Desteklenen diller ve varsayılan değerleri
                const defaults: Record<string, Record<string, string>> = {
                  // TR - Türkçe
                  'tr': {
                    'title': 'Yeni Hizmet',
                    'description': 'Hizmet açıklaması',
                    'tocTitle': 'İçindekiler',
                    'overviewTitle': 'Genel Bakış',
                    'whyTitle': 'Neden Biz?',
                    'galleryTitle': 'Galeri',
                    'testimonialsTitle': 'Müşteri Yorumları',
                    'stepsTitle': 'Prosedür Adımları',
                    'recoveryTitle': 'İyileşme Süreci',
                    'ctaTitle': 'Bize Ulaşın',
                    'ctaButtonText': 'Randevu Al',
                    'pricingTitle': 'Fiyatlandırma',
                    'expertsTitle': 'Uzmanlarımız',
                    'faqTitle': 'Sıkça Sorulan Sorular',
                  },
                  // EN - İngilizce
                  'en': {
                    'title': 'New Service',
                    'description': 'Service description',
                    'tocTitle': 'Table of Contents',
                    'overviewTitle': 'Overview',
                    'whyTitle': 'Why Us?',
                    'galleryTitle': 'Gallery',
                    'testimonialsTitle': 'Testimonials',
                    'stepsTitle': 'Procedure Steps',
                    'recoveryTitle': 'Recovery Process',
                    'ctaTitle': 'Contact Us',
                    'ctaButtonText': 'Book Appointment',
                    'pricingTitle': 'Pricing',
                    'expertsTitle': 'Our Experts',
                    'faqTitle': 'Frequently Asked Questions',
                  },
                  // DE - Almanca
                  'de': {
                    'title': 'Neuer Service',
                    'description': 'Servicebeschreibung',
                    'tocTitle': 'Inhaltsverzeichnis',
                    'overviewTitle': 'Überblick',
                    'whyTitle': 'Warum Wir?',
                    'galleryTitle': 'Galerie',
                    'testimonialsTitle': 'Kundenbewertungen',
                    'stepsTitle': 'Verfahrensschritte',
                    'recoveryTitle': 'Erholungsprozess',
                    'ctaTitle': 'Kontaktieren Sie uns',
                    'ctaButtonText': 'Termin Buchen',
                    'pricingTitle': 'Preisgestaltung',
                    'expertsTitle': 'Unsere Experten',
                    'faqTitle': 'Häufig gestellte Fragen',
                  },
                  // Daha fazla dil eklenebilir...
                  
                  // Fallback/universal değerler
                  'default': {
                    'title': 'New Service',
                    'description': 'Service description',
                    'tocTitle': 'Table of Contents',
                    'overviewTitle': 'Overview',
                    'whyTitle': 'Why Us?',
                    'galleryTitle': 'Gallery',
                    'testimonialsTitle': 'Testimonials',
                    'stepsTitle': 'Procedure Steps',
                    'recoveryTitle': 'Recovery Process', 
                    'ctaTitle': 'Contact Us',
                    'ctaButtonText': 'Book Appointment',
                    'pricingTitle': 'Pricing',
                    'expertsTitle': 'Our Experts',
                    'faqTitle': 'FAQ',
                  }
                };
                
                // Önce ilgili dilde değer var mı kontrol et
                if (defaults[langCode] && defaults[langCode][key]) {
                  return defaults[langCode][key];
                }
                
                // Dile özgü değer yoksa, Türkçe varsayılanını dene
                if (defaults['tr'] && defaults['tr'][key]) {
                  return defaults['tr'][key];
                }
                
                // Son çare - genel varsayılan değeri kullan
                if (defaults['default'] && defaults['default'][key]) {
                  return defaults['default'][key];
                }
                
                // Hiçbir değer bulunamazsa boş string döndür
                return '';
              };
          
          const translationCreateData = {
              hizmetId: createdHizmet.id,
              languageCode: langCode,
              
              // Basic Info - daha güçlü kontroller
              slug: basicInfoTrans?.slug || `hizmet-${Date.now()}-${langCode}`,
              title: basicInfoTrans?.title || getDefaultValueForLanguage(langCode, 'title'),
              description: basicInfoTrans?.description || getDefaultValueForLanguage(langCode, 'description'),
              breadcrumb: basicInfoTrans?.breadcrumb || "",
              // TOC
              tocTitle: tocTrans?.tocTitle || getDefaultValueForLanguage(langCode, 'tocTitle'),
              tocAuthorInfo: tocTrans?.tocAuthorInfo || "",
              tocCtaDescription: tocTrans?.tocCtaDescription || "",
              tocItems: { createMany: { data: tocTrans?.tocItems || [] } },
              // Intro
              introTitle: introTrans?.title || "",
              introDescription: introTrans?.description || "",
              introPrimaryButtonText: introTrans?.primaryButtonText || "",
              introPrimaryButtonLink: introTrans?.primaryButtonLink || "",
              introSecondaryButtonText: introTrans?.secondaryButtonText || "",
              introSecondaryButtonLink: introTrans?.secondaryButtonLink || "",
              introLinks: { createMany: { data: introTrans?.introLinks || [] } },
              // SEO
              metaTitle: seoTrans?.metaTitle || null,
              metaDescription: seoTrans?.metaDescription || null,
              metaKeywords: seoTrans?.metaKeywords || null,
              // Overview
              overviewSectionTitle: overviewTrans?.title || getDefaultValueForLanguage(langCode, 'overviewTitle'),
              overviewSectionDescription: overviewTrans?.description || "",
              // Why
              whySectionTitle: whyTrans?.title || getDefaultValueForLanguage(langCode, 'whyTitle'),
              // Gallery
              gallerySectionTitle: galleryTrans?.title || getDefaultValueForLanguage(langCode, 'galleryTitle'),
              gallerySectionDescription: galleryTrans?.description || "",
              // Testimonials
              testimonialsSectionTitle: testimonialsTrans?.title || getDefaultValueForLanguage(langCode, 'testimonialsTitle'),
              // Steps
              stepsSectionTitle: stepsTrans?.title || getDefaultValueForLanguage(langCode, 'stepsTitle'),
              stepsSectionDescription: stepsTrans?.description || "",
              steps: { createMany: { data: stepsTrans?.steps || [] } },
              // Recovery
              recoverySectionTitle: recoveryTrans?.title || getDefaultValueForLanguage(langCode, 'recoveryTitle'),
              recoverySectionDescription: recoveryTrans?.description || "",
              // CTA
              ctaTagline: ctaTrans?.tagline || null,
              ctaTitle: ctaTrans?.title || getDefaultValueForLanguage(langCode, 'ctaTitle'),
              ctaDescription: ctaTrans?.description || "",
              ctaButtonText: ctaTrans?.buttonText || getDefaultValueForLanguage(langCode, 'ctaButtonText'),
              ctaButtonLink: ctaTrans?.buttonLink || null,
              ctaAvatarText: ctaTrans?.avatarText || null,
              // Pricing
              pricingSectionTitle: pricingTrans?.title || getDefaultValueForLanguage(langCode, 'pricingTitle'),
              pricingSectionDescription: pricingTrans?.description || "",
              // Experts
              expertsSectionTitle: expertsTrans?.title || getDefaultValueForLanguage(langCode, 'expertsTitle'),
              expertsTagline: expertsTrans?.tagline || null,
              // FAQ
              faqSectionTitle: faqTrans?.title || getDefaultValueForLanguage(langCode, 'faqTitle'),
              faqSectionDescription: faqTrans?.description || "",
              faqs: { createMany: { data: faqTrans?.faqs || [] } },
          };

          // Veritabanına yazmadan önce logla
          console.log(`[API DEBUG] Creating HizmetTranslation for ${langCode}:`, JSON.stringify({
              title: translationCreateData.title,
              slug: translationCreateData.slug,
              description: translationCreateData.description.substring(0, 30) + '...'
          }));

          await tx.hizmetTranslation.create({
              data: translationCreateData,
          });
      } // for döngüsünün doğru kapanışı

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

      // Definitionları ilgili bölüm objelerinden al
      await createDefinitionsAndTranslations(overviewSection.definition?.tabs, 'hizmetOverviewTabDefinition', 'hizmetOverviewTabTranslation');
      await createDefinitionsAndTranslations(whySection.definition?.items, 'hizmetWhyItemDefinition', 'hizmetWhyItemTranslation');
      await createDefinitionsAndTranslations(testimonialsSection.definition?.items, 'hizmetTestimonialDefinition', 'hizmetTestimonialTranslation');
      await createDefinitionsAndTranslations(recoverySection.definition?.items, 'hizmetRecoveryItemDefinition', 'hizmetRecoveryItemTranslation');
      await createDefinitionsAndTranslations(expertsSection.definition?.items, 'hizmetExpertItemDefinition', 'hizmetExpertItemTranslation');
      await createDefinitionsAndTranslations(pricingSection.definition?.packages, 'hizmetPricingPackageDefinition', 'hizmetPricingPackageTranslation');

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
    // Daha detaylı hata loglama
    let errorMessage = 'Internal Server Error';
    let errorDetails = {};
    if (error instanceof Error) {
        errorMessage = error.message;
        // Prisma'ya özgü hataları yakala
        if ('code' in error) {
            errorDetails = { code: error.code, meta: (error as any).meta, clientVersion: (error as any).clientVersion };
        } else {
             errorDetails = { name: error.name, stack: error.stack };
        }
    }
    console.error("Detailed Error:", JSON.stringify({ errorMessage, errorDetails }, null, 2));
    
    return new NextResponse(JSON.stringify({ message: errorMessage, details: errorDetails }), { status: 500 });
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
