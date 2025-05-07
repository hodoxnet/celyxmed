"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Hizmet, Language } from "@/generated/prisma";
import { ensureArray } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Alt form bileşenleri
import { BasicInfoSection } from "./BasicInfoSection";
import { HeroSectionForm } from "./HeroSectionForm";
import { TocSectionForm } from "./TocSectionForm";
import { MarqueeSectionForm } from "./MarqueeSectionForm";
import { IntroSectionForm } from "./IntroSectionForm";
import { OverviewSectionForm } from "./OverviewSectionForm";
import { WhySectionForm } from "./WhySectionForm";
import { GallerySectionForm } from "./GallerySectionForm";
import { TestimonialsSectionForm } from "./TestimonialsSectionForm";
import { StepsSectionForm } from "./StepsSectionForm";
import { RecoverySectionForm } from "./RecoverySectionForm";
import { CtaSectionForm } from "./CtaSectionForm";
import { PricingSectionForm } from "./PricingSectionForm";
import { ExpertsSectionForm } from "./ExpertsSectionForm";
import { FaqSectionForm } from "./FaqSectionForm";
import { SeoSectionForm } from "./SeoSectionForm";

// Prisma tiplerini import et (FullHizmetData içinde kullanılacak)
import {
  HizmetTranslation,
  HizmetTocItem,
  HizmetIntroLink, // Schema.prisma'da hala var
  HizmetStep,
  HizmetFaqItem,
  HizmetMarqueeImage,
  HizmetGalleryImage,
  HizmetCtaAvatar,
  HizmetOverviewTabDefinition,
  HizmetOverviewTabTranslation,
  HizmetWhyItemDefinition,
  HizmetWhyItemTranslation,
  HizmetTestimonialDefinition,
  HizmetTestimonialTranslation,
  HizmetRecoveryItemDefinition,
  HizmetRecoveryItemTranslation,
  HizmetExpertItemDefinition,
  HizmetExpertItemTranslation,
  HizmetPricingPackageDefinition,
  HizmetPricingPackageTranslation,
} from "@/generated/prisma";


// ### BÖLÜM ŞEMALARI ###

// Basic Info Section
const HizmetBasicInfoSectionTranslationSchema = z.object({
  languageCode: z.string(),
  slug: z.string().min(1, "Slug gerekli."),
  title: z.string().min(1, "Başlık gerekli."),
  description: z.string().min(1, "Açıklama gerekli."),
  breadcrumb: z.string().optional().default(""),
});

// TOC Section
const hizmetTocItemSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Metin gerekli"),
  isBold: z.boolean().default(false),
  level: z.number().int().min(1).max(3).optional().nullable(),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(), // API'den gelirse
});
const HizmetTocSectionTranslationSchema = z.object({
  languageCode: z.string(),
  tocTitle: z.string().default("İçindekiler"),
  tocAuthorInfo: z.string().optional().default(""),
  tocCtaDescription: z.string().optional().default(""),
  tocItems: z.array(hizmetTocItemSchema).default([]),
});

// Intro Section
// HizmetIntroLink artık HizmetTranslation'a bağlı olduğu için basitleştirildi
const hizmetIntroLinkSchema = z.object({
  id: z.string().optional(),
  targetId: z.string().min(1, "Hedef ID/URL gerekli"),
  number: z.string().min(1, "Numara metni gerekli"),
  text: z.string().min(1, "Link metni gerekli"),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(), // API'den gelirse
});
const HizmetIntroSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default(""),
  description: z.string().default(""),
  primaryButtonText: z.string().default(""),
  primaryButtonLink: z.string().default(""),
  secondaryButtonText: z.string().default(""),
  secondaryButtonLink: z.string().default(""),
  introLinks: z.array(hizmetIntroLinkSchema).default([]),
});
const HizmetIntroSectionDefinitionSchema = z.object({
  videoId: z.string().optional().nullable().default(null),
});

// SEO Section
const HizmetSeoSectionTranslationSchema = z.object({
  languageCode: z.string(),
  metaTitle: z.string().optional().nullable().default(null),
  metaDescription: z.string().optional().nullable().default(null),
  metaKeywords: z.string().optional().nullable().default(null),
});

// Overview Section
const HizmetOverviewTabTranslationSchema = z.object({
  languageCode: z.string(),
  triggerText: z.string().min(1, "Sekme başlığı gerekli"),
  title: z.string().min(1, "İçerik başlığı gerekli"),
  content: z.string().min(1, "İçerik gerekli"),
  buttonText: z.string().default("Detaylar"),
  buttonLink: z.string().optional().nullable().default(null),
});
const HizmetOverviewTabDefinitionSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Sekme değeri gerekli (unique olmalı)"),
  imagePath: z.string().optional().nullable().default(null),
  imageAlt: z.string().optional().nullable().default(null),
  order: z.number().default(0),
  translations: z.record(z.string(), HizmetOverviewTabTranslationSchema),
});
const HizmetOverviewSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Genel Bakış"),
  description: z.string().optional().default(""),
});
const HizmetOverviewSectionDefinitionSchema = z.object({
  tabs: z.array(HizmetOverviewTabDefinitionSchema).default([]),
});

// Why Section
const HizmetWhyItemTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
});
const HizmetWhyItemDefinitionSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "Numara gerekli"),
  order: z.number().default(0),
  translations: z.record(z.string(), HizmetWhyItemTranslationSchema),
});
const HizmetWhySectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Neden Biz?"),
});
const HizmetWhySectionDefinitionSchema = z.object({
  items: z.array(HizmetWhyItemDefinitionSchema).default([]),
});

// Gallery Section (Sadece çevirilebilir başlık ve açıklama, resimler ana şemada)
const HizmetGallerySectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Galeri"),
  description: z.string().optional().default(""),
});

// Testimonials Section
const HizmetTestimonialTranslationSchema = z.object({
  languageCode: z.string(),
  text: z.string().min(1, "Yorum metni gerekli"),
  author: z.string().min(1, "Yazar gerekli"),
  treatment: z.string().optional().nullable().default(null),
});
const HizmetTestimonialDefinitionSchema = z.object({
  id: z.string().optional(),
  stars: z.number().min(1).max(5).default(5),
  imageUrl: z.string().optional().nullable().default(null),
  order: z.number().default(0),
  translations: z.record(z.string(), HizmetTestimonialTranslationSchema),
});
const HizmetTestimonialsSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().optional().nullable().default("Yorumlar"),
});
const HizmetTestimonialsSectionDefinitionSchema = z.object({
  items: z.array(HizmetTestimonialDefinitionSchema).default([]),
});

// Steps Section
const hizmetStepSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
  linkText: z.string().optional().nullable().default(null),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(), // API'den gelirse
});
const HizmetStepsSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Adımlar"),
  description: z.string().optional().default(""),
  steps: z.array(hizmetStepSchema).default([]),
});

// Recovery Section
const HizmetRecoveryItemTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
});
const HizmetRecoveryItemDefinitionSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Resim URL gerekli"),
  imageAlt: z.string().min(1, "Resim açıklaması gerekli"),
  order: z.number().default(0),
  translations: z.record(z.string(), HizmetRecoveryItemTranslationSchema),
});
const HizmetRecoverySectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("İyileşme Süreci"),
  description: z.string().optional().default(""),
});
const HizmetRecoverySectionDefinitionSchema = z.object({
  items: z.array(HizmetRecoveryItemDefinitionSchema).default([]),
});

// CTA Section
const HizmetCtaSectionTranslationSchema = z.object({
  languageCode: z.string(),
  tagline: z.string().optional().nullable().default(null),
  title: z.string().default("Bize Ulaşın"),
  description: z.string().default(""),
  buttonText: z.string().default("Randevu Al"),
  buttonLink: z.string().optional().nullable().default(null),
  avatarText: z.string().optional().nullable().default(null),
});

// Pricing Section
const HizmetPricingPackageTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().min(1, "Paket başlığı gerekli"),
  price: z.string().min(1, "Fiyat gerekli"),
  features: z.array(z.string()).default([]),
});
const HizmetPricingPackageDefinitionSchema = z.object({
  id: z.string().optional(),
  isFeatured: z.boolean().default(false),
  order: z.number().default(0),
  translations: z.record(z.string(), HizmetPricingPackageTranslationSchema),
});
const HizmetPricingSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Fiyatlandırma"),
  description: z.string().optional().default(""),
});
const HizmetPricingSectionDefinitionSchema = z.object({
  packages: z.array(HizmetPricingPackageDefinitionSchema).default([]),
});

// Experts Section
const HizmetExpertItemTranslationSchema = z.object({
  languageCode: z.string(),
  name: z.string().min(1, "Uzman adı gerekli"),
  title: z.string().min(1, "Uzman unvanı gerekli"),
  description: z.string().min(1, "Uzman açıklaması gerekli"),
  ctaText: z.string().optional().nullable().default(null),
});
const HizmetExpertItemDefinitionSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, "Resim URL gerekli"),
  imageAlt: z.string().min(1, "Resim açıklaması gerekli"),
  order: z.number().default(0),
  translations: z.record(z.string(), HizmetExpertItemTranslationSchema),
});
const HizmetExpertsSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Uzmanlarımız"),
  tagline: z.string().optional().nullable().default(null),
});
const HizmetExpertsSectionDefinitionSchema = z.object({
  items: z.array(HizmetExpertItemDefinitionSchema).default([]),
});

// FAQ Section
const hizmetFaqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Soru gerekli"),
  answer: z.string().min(1, "Cevap gerekli"),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(), // API'den gelirse
});
const HizmetFaqSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Sıkça Sorulan Sorular"),
  description: z.string().optional().default(""),
  faqs: z.array(hizmetFaqItemSchema).default([]),
});


// ### ANA FORM ŞEMASI ###
const hizmetFormSchema = z.object({
  id: z.string().optional(),
  published: z.boolean().default(false),

  // Dil bağımsız ana görseller
  heroImageUrl: z.string().optional().nullable().default(null),
  heroImageAlt: z.string().optional().nullable().default(null),
  whyBackgroundImageUrl: z.string().optional().nullable().default(null),
  ctaBackgroundImageUrl: z.string().optional().nullable().default(null),
  ctaMainImageUrl: z.string().optional().nullable().default(null),
  ctaMainImageAlt: z.string().optional().nullable().default(null),
  
  marqueeImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1,"Resim linki gerekli"), alt: z.string().min(1,"Resim açıklaması gerekli"), order: z.number().default(0) })).default([]),
  galleryImages: z.array(z.object({ id: z.string().optional(), src: z.string().min(1,"Resim linki gerekli"), alt: z.string().min(1,"Resim açıklaması gerekli"), order: z.number().default(0) })).default([]),
  ctaAvatars: z.array(z.object({ id: z.string().optional(), src: z.string().min(1,"Resim linki gerekli"), alt: z.string().min(1,"Resim açıklaması gerekli"), order: z.number().default(0) })).default([]),

  // Bölüm Bazlı Yapılar
  basicInfoSection: z.object({
    translations: z.record(z.string(), HizmetBasicInfoSectionTranslationSchema),
  }).default({ translations: {} }),

  tocSection: z.object({
    translations: z.record(z.string(), HizmetTocSectionTranslationSchema),
  }).default({ translations: {} }),

  introSection: z.object({
    definition: HizmetIntroSectionDefinitionSchema.default({ videoId: null }),
    translations: z.record(z.string(), HizmetIntroSectionTranslationSchema),
  }).default({ definition: { videoId: null }, translations: {} }),
  
  seoSection: z.object({
    translations: z.record(z.string(), HizmetSeoSectionTranslationSchema),
  }).default({ translations: {} }),

  overviewSection: z.object({
    definition: HizmetOverviewSectionDefinitionSchema.default({ tabs: [] }),
    translations: z.record(z.string(), HizmetOverviewSectionTranslationSchema),
  }).default({ definition: { tabs: [] }, translations: {} }),

  whySection: z.object({
    definition: HizmetWhySectionDefinitionSchema.default({ items: [] }),
    translations: z.record(z.string(), HizmetWhySectionTranslationSchema),
  }).default({ definition: { items: [] }, translations: {} }),

  gallerySection: z.object({ // Sadece çevirilebilir başlık/açıklama
    translations: z.record(z.string(), HizmetGallerySectionTranslationSchema),
  }).default({ translations: {} }),

  testimonialsSection: z.object({
    definition: HizmetTestimonialsSectionDefinitionSchema.default({ items: [] }),
    translations: z.record(z.string(), HizmetTestimonialsSectionTranslationSchema),
  }).default({ definition: { items: [] }, translations: {} }),

  stepsSection: z.object({
    translations: z.record(z.string(), HizmetStepsSectionTranslationSchema),
  }).default({ translations: {} }),

  recoverySection: z.object({
    definition: HizmetRecoverySectionDefinitionSchema.default({ items: [] }),
    translations: z.record(z.string(), HizmetRecoverySectionTranslationSchema),
  }).default({ definition: { items: [] }, translations: {} }),

  ctaSection: z.object({ // Ana görseller ve avatarlar üst seviyede
    translations: z.record(z.string(), HizmetCtaSectionTranslationSchema),
  }).default({ translations: {} }),

  pricingSection: z.object({
    definition: HizmetPricingSectionDefinitionSchema.default({ packages: [] }),
    translations: z.record(z.string(), HizmetPricingSectionTranslationSchema),
  }).default({ definition: { packages: [] }, translations: {} }),

  expertsSection: z.object({
    definition: HizmetExpertsSectionDefinitionSchema.default({ items: [] }),
    translations: z.record(z.string(), HizmetExpertsSectionTranslationSchema),
  }).default({ definition: { items: [] }, translations: {} }),

  faqSection: z.object({
    translations: z.record(z.string(), HizmetFaqSectionTranslationSchema),
  }).default({ translations: {} }),
});

export type HizmetFormValues = z.infer<typeof hizmetFormSchema>;

// Hizmet ve ilişkili tüm verilerini içeren tip (API'den gelen veri için)
// Bu tip, Prisma'dan gelen ve `HizmetTranslation` içinde birçok alanı barındıran yapıyı yansıtır.
// `getInitialFormValues` bu tipten `HizmetFormValues` tipine dönüşüm yapar.
export type FullHizmetData = Hizmet & {
  translations: Array<
    HizmetTranslation & { // Prisma'daki HizmetTranslation
      language: Language;
      // Eskiden HizmetTranslation'da olan ve şimdi formda ayrı bölümlere ayrılan alanlar:
      tocItems?: HizmetTocItem[]; // Prisma'da HizmetTranslation'a bağlı
      introLinks?: HizmetIntroLink[]; // Prisma'da HizmetTranslation'a bağlı
      steps?: HizmetStep[]; // Prisma'da HizmetTranslation'a bağlı
      faqs?: HizmetFaqItem[]; // Prisma'da HizmetTranslation'a bağlı
    }
  >;
  marqueeImages?: HizmetMarqueeImage[];
  galleryImages?: HizmetGalleryImage[];
  ctaAvatars?: HizmetCtaAvatar[];
  introVideoId?: string | null; // Şemada HizmetTranslation'da ama formda ayrı bir alanda
  
  // Definition/Translation yapısındaki ilişkiler
  overviewTabDefinitions?: Array<
    HizmetOverviewTabDefinition & {
      translations: Array<HizmetOverviewTabTranslation & { language: Language }>;
    }
  >;
  whyItemDefinitions?: Array<
    HizmetWhyItemDefinition & {
      translations: Array<HizmetWhyItemTranslation & { language: Language }>;
    }
  >;
  testimonialDefinitions?: Array<
    HizmetTestimonialDefinition & {
      translations: Array<HizmetTestimonialTranslation & { language: Language }>;
    }
  >;
  recoveryItemDefinitions?: Array<
    HizmetRecoveryItemDefinition & {
      translations: Array<HizmetRecoveryItemTranslation & { language: Language }>;
    }
  >;
  expertItemDefinitions?: Array<
    HizmetExpertItemDefinition & {
      translations: Array<HizmetExpertItemTranslation & { language: Language }>;
    }
  >;
  pricingPackageDefinitions?: Array<
    HizmetPricingPackageDefinition & {
      translations: Array<HizmetPricingPackageTranslation & { language: Language }>;
    }
  >;
};


interface HizmetFormProps {
  initialData: FullHizmetData | null;
  diller: Language[];
}

export function HizmetForm({ initialData, diller }: HizmetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultLangCode = diller.find(d => d.isDefault)?.code || diller[0]?.code || "tr";
  const [activeLang, setActiveLang] = useState<string>(defaultLangCode);

  const isEditing = !!initialData?.id;
  const actionButtonText = isEditing ? "Değişiklikleri Kaydet" : "Hizmeti Oluştur";
  const toastMessageSuccess = isEditing ? "Hizmet güncellendi." : "Hizmet oluşturuldu.";
  const toastMessageError = isEditing ? "Hizmet güncellenirken bir hata oluştu." : "Hizmet oluşturulurken bir hata oluştu.";

  const getInitialFormValues = (): HizmetFormValues => {
    try {
      // Kullanılan metin şablonları - başlangıç değerleri
      const initialEmptyText = {
        slug: "hizmet-slug", // Benzersiz bir slug başlangıç değeri olmalı
        title: "Başlık",
        description: "Açıklama"
      };
      
      const baseValues: Partial<HizmetFormValues> = {
        id: initialData?.id,
        published: initialData?.published ?? false,
        heroImageUrl: initialData?.heroImageUrl ?? null,
        heroImageAlt: initialData?.heroImageAlt ?? null,
        whyBackgroundImageUrl: initialData?.whyBackgroundImageUrl ?? null,
        ctaBackgroundImageUrl: initialData?.ctaBackgroundImageUrl ?? null,
        ctaMainImageUrl: initialData?.ctaMainImageUrl ?? null,
        ctaMainImageAlt: initialData?.ctaMainImageAlt ?? null,
        marqueeImages: ensureArray(initialData?.marqueeImages).map(img => ({ 
          id: img.id, 
          src: img.src || "", 
          alt: img.alt || "", 
          order: img.order ?? 0 
        })),
        galleryImages: ensureArray(initialData?.galleryImages).map(img => ({ 
          id: img.id, 
          src: img.src || "", 
          alt: img.alt || "", 
          order: img.order ?? 0 
        })),
        ctaAvatars: ensureArray(initialData?.ctaAvatars).map(img => ({ 
          id: img.id, 
          src: img.src || "", 
          alt: img.alt || "", 
          order: img.order ?? 0 
        })),
        
        basicInfoSection: { translations: {} },
        tocSection: { translations: {} },
        introSection: { definition: { videoId: initialData?.introVideoId ?? null }, translations: {} },
        seoSection: { translations: {} },
        overviewSection: { definition: { tabs: [] }, translations: {} },
        whySection: { definition: { items: [] }, translations: {} },
        gallerySection: { translations: {} },
        testimonialsSection: { definition: { items: [] }, translations: {} },
        stepsSection: { translations: {} },
        recoverySection: { definition: { items: [] }, translations: {} },
        ctaSection: { translations: {} },
        pricingSection: { definition: { packages: [] }, translations: {} },
        expertsSection: { definition: { items: [] }, translations: {} },
        faqSection: { translations: {} },
      };

    // HizmetTranslation'dan gelen verileri bölümlere dağıt
    diller.forEach(lang => {
      // initialData varsa özelliklerini kullan, yoksa başlangıç değerleriyle doldur
      const tr = initialData?.translations.find(t => t.languageCode === lang.code);
      
      // Yeni form oluşturuluyorsa (initialData yoksa), her dil için varsayılan değerler ekleyin
      if (!initialData) {
        // Varsayılan değerlerle tüm bölümleri oluştur (zorunlu alanlar)
        baseValues.basicInfoSection!.translations[lang.code] = {
          languageCode: lang.code,
          slug: `hizmet-${Date.now()}-${lang.code}`, // Benzersiz bir slug oluştur - timestamp ve dil kodu ile
          title: "Yeni Hizmet",
          description: "Hizmet açıklaması",
          breadcrumb: "Anasayfa > Hizmetler > Yeni Hizmet"
        };
        
        // Diğer bölümler için de varsayılan değerler atanabilir
        // Ancak şimdilik sadece temel bilgiler yeterli
      }
      else {
        // initialData varsa, mevcut verileri kullan
        // Daha esnek bir yaklaşım, eksik alanlar için varsayılan değerler kullan
        baseValues.basicInfoSection!.translations[lang.code] = HizmetBasicInfoSectionTranslationSchema.parse({
          languageCode: lang.code,
          slug: tr?.slug || "",
          title: tr?.title || "",
          description: tr?.description || "",
          breadcrumb: tr?.breadcrumb || "",
        });

        baseValues.tocSection!.translations[lang.code] = HizmetTocSectionTranslationSchema.parse({
          languageCode: lang.code,
          tocTitle: tr?.tocTitle || "İçindekiler",
          tocAuthorInfo: tr?.tocAuthorInfo || "",
          tocCtaDescription: tr?.tocCtaDescription || "",
          tocItems: ensureArray(tr?.tocItems).map(item => hizmetTocItemSchema.parse({
            id: item.id,
            text: item.text || "", 
            isBold: item.isBold || false,
            level: item.level || 1,
            order: item.order || 0,
            hizmetTranslationId: item.hizmetTranslationId
          })),
        });
        
        baseValues.introSection!.translations[lang.code] = HizmetIntroSectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.introTitle || "",
          description: tr?.introDescription || "",
          primaryButtonText: tr?.introPrimaryButtonText || "",
          primaryButtonLink: tr?.introPrimaryButtonLink || "",
          secondaryButtonText: tr?.introSecondaryButtonText || "",
          secondaryButtonLink: tr?.introSecondaryButtonLink || "",
          introLinks: ensureArray(tr?.introLinks).map(link => hizmetIntroLinkSchema.parse({
            id: link.id,
            targetId: link.targetId || "",
            number: link.number || "1",
            text: link.text || "",
            order: link.order || 0,
            hizmetTranslationId: link.hizmetTranslationId
          })),
        });
        // introSection.definition.videoId zaten yukarıda baseValues'da ayarlandı.
        baseValues.seoSection!.translations[lang.code] = HizmetSeoSectionTranslationSchema.parse({
          languageCode: lang.code,
          metaTitle: tr?.metaTitle || null,
          metaDescription: tr?.metaDescription || null,
          metaKeywords: tr?.metaKeywords || null,
        });

        baseValues.overviewSection!.translations[lang.code] = HizmetOverviewSectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.overviewSectionTitle || "Genel Bakış",
          description: tr?.overviewSectionDescription || "",
        });
        
        baseValues.whySection!.translations[lang.code] = HizmetWhySectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.whySectionTitle || "Neden Biz?",
        });

        baseValues.gallerySection!.translations[lang.code] = HizmetGallerySectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.gallerySectionTitle || "Galeri",
          description: tr?.gallerySectionDescription || "",
        });

        baseValues.testimonialsSection!.translations[lang.code] = HizmetTestimonialsSectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.testimonialsSectionTitle || "Yorumlar",
        });

        baseValues.stepsSection!.translations[lang.code] = HizmetStepsSectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.stepsSectionTitle || "Adımlar",
          description: tr?.stepsSectionDescription || "",
          steps: ensureArray(tr?.steps).map(s => hizmetStepSchema.parse({
            id: s.id,
            title: s.title || "",
            description: s.description || "",
            linkText: s.linkText || null,
            order: s.order || 0,
            hizmetTranslationId: s.hizmetTranslationId
          })),
        });

        baseValues.recoverySection!.translations[lang.code] = HizmetRecoverySectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.recoverySectionTitle || "İyileşme Süreci",
          description: tr?.recoverySectionDescription || "",
        });
        
        baseValues.ctaSection!.translations[lang.code] = HizmetCtaSectionTranslationSchema.parse({
          languageCode: lang.code,
          tagline: tr?.ctaTagline || null,
          title: tr?.ctaTitle || "Bize Ulaşın",
          description: tr?.ctaDescription || "",
          buttonText: tr?.ctaButtonText || "Randevu Al",
          buttonLink: tr?.ctaButtonLink || null,
          avatarText: tr?.ctaAvatarText || null,
        });

        baseValues.pricingSection!.translations[lang.code] = HizmetPricingSectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.pricingSectionTitle || "Fiyatlandırma",
          description: tr?.pricingSectionDescription || "",
        });

        baseValues.expertsSection!.translations[lang.code] = HizmetExpertsSectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.expertsSectionTitle || "Uzmanlarımız",
          tagline: tr?.expertsTagline || null,
        });
        
        baseValues.faqSection!.translations[lang.code] = HizmetFaqSectionTranslationSchema.parse({
          languageCode: lang.code,
          title: tr?.faqSectionTitle || "Sıkça Sorulan Sorular",
          description: tr?.faqSectionDescription || "",
          faqs: ensureArray(tr?.faqs).map(f => hizmetFaqItemSchema.parse({
            id: f.id,
            question: f.question || "",
            answer: f.answer || "",
            order: f.order || 0,
            hizmetTranslationId: f.hizmetTranslationId
          })),
        });
      }
    });

    // Definition tabanlı verileri işle
    const mapDefWithTranslations = <T extends z.ZodRawShape, U extends z.ZodRawShape>(
      prismaDefs: any[] | undefined,
      defSchema: z.ZodObject<T>,
      transSchema: z.ZodObject<U>
    ) => {
      return ensureArray(prismaDefs).map(def => {
        // Tipleme hatalarını gidermek için burada açık bir şekilde yapılandırılmış obje kullanıyoruz
        const schemaShape = defSchema.shape;
        const baseObj: any = {};
        
        // translations dışındaki tüm özellikleri kopyala
        Object.keys(schemaShape).forEach(key => {
          if (key !== 'translations') {
            baseObj[key] = def[key];
          }
        });
        
        // parse edilen nesneyi oluştur
        const parsedDef = defSchema.omit({ translations: true } as any).parse(baseObj);
        
        // translations objesi ekle
        (parsedDef as any).translations = {};
        
        // her dil için çeviri ekle
        diller.forEach(lang => {
          const existingTrans = def.translations?.find((t: any) => t.languageCode === lang.code);
          (parsedDef as any).translations[lang.code] = transSchema.parse({
            languageCode: lang.code,
            ...(existingTrans || {}), // Prisma'dan gelen çeviriyi veya boş obje
          });
        });
        
        return parsedDef;
      });
    };
    
    // introLinks are now directly mapped from HizmetTranslation
    if (initialData?.overviewTabDefinitions) {
      const mappedTabs = mapDefWithTranslations(
        initialData.overviewTabDefinitions,
        HizmetOverviewTabDefinitionSchema,
        HizmetOverviewTabTranslationSchema
      );
      baseValues.overviewSection!.definition!.tabs = mappedTabs as any;
    }
    if (initialData?.whyItemDefinitions) {
      const mappedItems = mapDefWithTranslations(
        initialData.whyItemDefinitions,
        HizmetWhyItemDefinitionSchema,
        HizmetWhyItemTranslationSchema
      );
      baseValues.whySection!.definition!.items = mappedItems as any;
    }
    if (initialData?.testimonialDefinitions) {
      const mappedItems = mapDefWithTranslations(
        initialData.testimonialDefinitions,
        HizmetTestimonialDefinitionSchema,
        HizmetTestimonialTranslationSchema
      );
      baseValues.testimonialsSection!.definition!.items = mappedItems as any;
    }
    if (initialData?.recoveryItemDefinitions) {
      const mappedItems = mapDefWithTranslations(
        initialData.recoveryItemDefinitions,
        HizmetRecoveryItemDefinitionSchema,
        HizmetRecoveryItemTranslationSchema
      );
      baseValues.recoverySection!.definition!.items = mappedItems as any;
    }
    if (initialData?.expertItemDefinitions) {
      const mappedItems = mapDefWithTranslations(
        initialData.expertItemDefinitions,
        HizmetExpertItemDefinitionSchema,
        HizmetExpertItemTranslationSchema
      );
      baseValues.expertsSection!.definition!.items = mappedItems as any;
    }
    if (initialData?.pricingPackageDefinitions) {
      const mappedPackages = mapDefWithTranslations(
        initialData.pricingPackageDefinitions,
        HizmetPricingPackageDefinitionSchema,
        HizmetPricingPackageTranslationSchema
      );
      baseValues.pricingSection!.definition!.packages = mappedPackages as any;
    }
    
      try {
        // Normal durumlarda parse işlemi
        const parsedValues = hizmetFormSchema.parse(baseValues);
        return parsedValues;
      } catch (parseError) {
        console.error("Zod validation error in getInitialFormValues (primary parse):", parseError);
        
        // Parse hatası durumunda - basit varsayılan değerlerle yeni bir boş form oluştur
        // (özellikle yeni form oluşturulurken)
        if (!initialData) {
          console.log("Creating new form with default values");
          const emptyForm: any = {
            published: false,
            basicInfoSection: { translations: {} },
            tocSection: { translations: {} },
            introSection: { definition: { videoId: null }, translations: {} },
            seoSection: { translations: {} },
            overviewSection: { definition: { tabs: [] }, translations: {} },
            whySection: { definition: { items: [] }, translations: {} },
            gallerySection: { translations: {} },
            testimonialsSection: { definition: { items: [] }, translations: {} },
            stepsSection: { translations: {} },
            recoverySection: { definition: { items: [] }, translations: {} },
            ctaSection: { translations: {} },
            pricingSection: { definition: { packages: [] }, translations: {} },
            expertsSection: { definition: { items: [] }, translations: {} },
            faqSection: { translations: {} },
            marqueeImages: [],
            galleryImages: [],
            ctaAvatars: []
          };
          
          // Tüm diller için gerekli alanları manuel olarak ekle
          diller.forEach(lang => {
            // Temel bilgiler - zorunlu alanlar
            emptyForm.basicInfoSection.translations[lang.code] = {
              languageCode: lang.code,
              slug: `hizmet-${Date.now()}-${lang.code}`,
              title: "Yeni Hizmet",
              description: "Hizmet açıklaması",
              breadcrumb: "Anasayfa > Hizmetler > Yeni Hizmet"
            };
            
            // Diğer tüm alanlar varsayılan değerlerle eklenebilir
            // Bu örnekte sadece minimum gerekli alanlar eklendi
          });
          
          // Manuel oluşturulan formu dön
          return emptyForm as HizmetFormValues;
        }
        
        // Eğer düzenleme modundaysa ve yine de hata varsa, boş bir form dön
        console.error("Failed to create form values, returning empty schema");
        return hizmetFormSchema.parse({});
      }
    } catch (error) {
      console.error("Unhandled error in getInitialFormValues:", error);
      // En son çare - tamamen boş bir form
      return hizmetFormSchema.parse({});
    }
  };


  const form = useForm<HizmetFormValues>({
    resolver: zodResolver(hizmetFormSchema) as any, // Type assertion to resolve resolver type issue
    defaultValues: getInitialFormValues(),
  }) as UseFormReturn<HizmetFormValues>; // Type assertion to resolve form type issues
  
  useEffect(() => {
     form.reset(getInitialFormValues());
  }, [initialData, diller, form]); // form'u bağımlılıklardan kaldırdık, reset içinde zaten var


  const onSubmit = async (values: HizmetFormValues) => {
    setLoading(true);
    try {
      // Gönderim sırasında form değerlerini konsola yazdır - debug için
      console.log("Form values being submitted:", values);
      
      // API'nin beklediği yapıya dönüştürme
      // API'nin beklediği format:
      // - translations: Record<string, HizmetTranslationSchema>
      // - overviewTabDefinitions, whyItemDefinitions, etc. (bunlar zaten doğru formatta)
      
      // Tüm translations objelerini tek bir yerde topla
      const translations: Record<string, any> = {};
      
      // Aktif diller için işlem yap
      diller.forEach(lang => {
        const langCode = lang.code;
        
        // Basic Info alanlarını kontrol et ve logla - debug için
        const basicInfoForLang = values.basicInfoSection.translations[langCode];
        console.log(`[DEBUG] BasicInfo for ${langCode}:`, 
          JSON.stringify({
            slug: basicInfoForLang?.slug,
            title: basicInfoForLang?.title,
            description: basicInfoForLang?.description
          })
        );
        
        // Her bölümün verilerini alıp tek bir objeye birleştir
        translations[langCode] = {
          // BasicInfo
          languageCode: langCode,
          slug: values.basicInfoSection.translations[langCode]?.slug || "",
          title: values.basicInfoSection.translations[langCode]?.title || "",
          description: values.basicInfoSection.translations[langCode]?.description || "",
          breadcrumb: values.basicInfoSection.translations[langCode]?.breadcrumb || "",
          
          // Toc Section
          tocTitle: values.tocSection.translations[langCode]?.tocTitle || "İçindekiler",
          tocAuthorInfo: values.tocSection.translations[langCode]?.tocAuthorInfo || "",
          tocCtaDescription: values.tocSection.translations[langCode]?.tocCtaDescription || "",
          tocItems: values.tocSection.translations[langCode]?.tocItems || [],
          
          // Intro Section
          introTitle: values.introSection.translations[langCode]?.title || "",
          introDescription: values.introSection.translations[langCode]?.description || "",
          introPrimaryButtonText: values.introSection.translations[langCode]?.primaryButtonText || "",
          introPrimaryButtonLink: values.introSection.translations[langCode]?.primaryButtonLink || "",
          introSecondaryButtonText: values.introSection.translations[langCode]?.secondaryButtonText || "",
          introSecondaryButtonLink: values.introSection.translations[langCode]?.secondaryButtonLink || "",
          introLinks: values.introSection.translations[langCode]?.introLinks || [],
          
          // SEO
          metaTitle: values.seoSection.translations[langCode]?.metaTitle || null,
          metaDescription: values.seoSection.translations[langCode]?.metaDescription || null,
          metaKeywords: values.seoSection.translations[langCode]?.metaKeywords || null,

          // Overview Section
          overviewSectionTitle: values.overviewSection.translations[langCode]?.title || "Genel Bakış",
          overviewSectionDescription: values.overviewSection.translations[langCode]?.description || "",
          
          // Why Section
          whySectionTitle: values.whySection.translations[langCode]?.title || "Neden Biz?",
          
          // Gallery Section
          gallerySectionTitle: values.gallerySection.translations[langCode]?.title || "Galeri",
          gallerySectionDescription: values.gallerySection.translations[langCode]?.description || "",
          
          // Testimonials Section
          testimonialsSectionTitle: values.testimonialsSection.translations[langCode]?.title || "Yorumlar",
          
          // Steps Section
          stepsSectionTitle: values.stepsSection.translations[langCode]?.title || "Adımlar",
          stepsSectionDescription: values.stepsSection.translations[langCode]?.description || "",
          steps: values.stepsSection.translations[langCode]?.steps || [],
          
          // Recovery Section
          recoverySectionTitle: values.recoverySection.translations[langCode]?.title || "İyileşme Süreci",
          recoverySectionDescription: values.recoverySection.translations[langCode]?.description || "",
          
          // CTA Section
          ctaTagline: values.ctaSection.translations[langCode]?.tagline || null,
          ctaTitle: values.ctaSection.translations[langCode]?.title || "Bize Ulaşın",
          ctaDescription: values.ctaSection.translations[langCode]?.description || "",
          ctaButtonText: values.ctaSection.translations[langCode]?.buttonText || "Randevu Al",
          ctaButtonLink: values.ctaSection.translations[langCode]?.buttonLink || null,
          ctaAvatarText: values.ctaSection.translations[langCode]?.avatarText || null,
          
          // Pricing Section
          pricingSectionTitle: values.pricingSection.translations[langCode]?.title || "Fiyatlandırma",
          pricingSectionDescription: values.pricingSection.translations[langCode]?.description || "",
          
          // Experts Section
          expertsSectionTitle: values.expertsSection.translations[langCode]?.title || "Uzmanlarımız",
          expertsTagline: values.expertsSection.translations[langCode]?.tagline || null,
          
          // FAQ Section
          faqSectionTitle: values.faqSection.translations[langCode]?.title || "Sıkça Sorulan Sorular",
          faqSectionDescription: values.faqSection.translations[langCode]?.description || "",
          faqs: values.faqSection.translations[langCode]?.faqs || [],
        };
      });
      
      // API'nin beklediği payload'ı oluştur
      const payload = {
        id: values.id,
        published: values.published,
        heroImageUrl: values.heroImageUrl,
        heroImageAlt: values.heroImageAlt,
        whyBackgroundImageUrl: values.whyBackgroundImageUrl,
        ctaBackgroundImageUrl: values.ctaBackgroundImageUrl,
        ctaMainImageUrl: values.ctaMainImageUrl,
        ctaMainImageAlt: values.ctaMainImageAlt,
        introVideoId: values.introSection.definition?.videoId === "" ? null : values.introSection.definition?.videoId,
        marqueeImages: values.marqueeImages,
        galleryImages: values.galleryImages,
        ctaAvatars: values.ctaAvatars,
        translations,
        overviewTabDefinitions: values.overviewSection.definition?.tabs || [],
        whyItemDefinitions: values.whySection.definition?.items || [],
        testimonialDefinitions: values.testimonialsSection.definition?.items || [],
        recoveryItemDefinitions: values.recoverySection.definition?.items || [],
        expertItemDefinitions: values.expertsSection.definition?.items || [],
        pricingPackageDefinitions: values.pricingSection.definition?.packages || [],
      };

      const url = isEditing && initialData?.id
        ? `/api/admin/hizmetler/${initialData.id}`
        : '/api/admin/hizmetler';
      const method = isEditing ? 'PATCH' : 'POST';

      console.log("API Payload:", JSON.stringify(payload, null, 2));
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Debug için - API yanıtını tam olarak logla
      const responseText = await response.text();
      console.log(`API Response (${response.status}):`, responseText);
      
      // Yanıt başarılı değilse, hatayı işle
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: `Sunucu hatası (${response.status}) veya geçersiz JSON yanıtı.` };
        }
        throw new Error(errorData.message || `İşlem sırasında bir hata oluştu (${response.status})`);
      }

      // API yanıtını parse et
      const resultData = JSON.parse(responseText);
      console.log("API Success Result:", resultData);
      
      toast.success(toastMessageSuccess);
      router.push('/admin/hizmetler');
      router.refresh();
    } catch (error: unknown) {
      console.error("Form submit error:", error);
      const message = error instanceof Error ? error.message : toastMessageError;
      toast.error(message);
      // Zod validation error ise detayları logla
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tabs value={activeLang} onValueChange={setActiveLang} className="mb-6">
        <TabsList>
          {diller.map(lang => (
            <TabsTrigger key={lang.code} value={lang.code}>
              {lang.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-2">Genel Ayarlar (Dil Bağımsız)</h3>
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Yayın Durumu</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                  </FormControl>
                </FormItem>
              )}
            />
             <HeroSectionForm form={form} loading={loading} />
             <Separator className="my-4" />
             <MarqueeSectionForm form={form} loading={loading} />
             {/* WhySectionForm (whyBackgroundImageUrl) ve CtaSectionForm (ctaBackgroundImageUrl, ctaMainImageUrl) dil bağımsız resimleri burada yönetiliyor. */}
             {/* GallerySectionForm'un ana resim listesi (galleryImages) burada yönetiliyor. */}
          </div>
          
          {/* Bu bileşenin diller prop'una ihtiyacı var mı kontrol et */}
          <BasicInfoSection form={form} loading={loading} isEditing={isEditing} activeLang={activeLang} />
          <Separator />
          <TocSectionForm form={form} loading={loading} activeLang={activeLang} />
          <Separator />
          <IntroSectionForm form={form} loading={loading} activeLang={activeLang} />
          <Separator />
          <OverviewSectionForm form={form} loading={loading} activeLang={activeLang} diller={diller} />
          <Separator />
          <WhySectionForm form={form} loading={loading} activeLang={activeLang} diller={diller} />
          <Separator />
          <GallerySectionForm form={form} loading={loading} activeLang={activeLang} />
          <Separator />
          <TestimonialsSectionForm form={form} loading={loading} activeLang={activeLang} diller={diller} />
          <Separator />
          <StepsSectionForm form={form} loading={loading} activeLang={activeLang} />
          <Separator />
          <RecoverySectionForm form={form} loading={loading} activeLang={activeLang} diller={diller} />
          <Separator />
          <CtaSectionForm form={form} loading={loading} activeLang={activeLang} />
          <Separator />
          <PricingSectionForm form={form} loading={loading} activeLang={activeLang} diller={diller} />
          <Separator />
          <ExpertsSectionForm form={form} loading={loading} activeLang={activeLang} diller={diller} />
          <Separator />
          <FaqSectionForm form={form} loading={loading} activeLang={activeLang} />
          <Separator />
          <SeoSectionForm form={form} loading={loading} activeLang={activeLang} />
          
          <Button type="submit" disabled={loading} className="mt-8">
            {actionButtonText}
          </Button>
        </form>
      </Form>
    </>
  );
}
