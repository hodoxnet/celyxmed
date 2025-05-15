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
  triggerText: z.string().default(""), // .min(1) kaldırıldı
  title: z.string().default(""), // .min(1) kaldırıldı
  content: z.string().default(""), // .min(1) kaldırıldı
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
  title: z.string().default(""), // .min(1) kaldırıldı
  description: z.string().default(""), // .min(1) kaldırıldı
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
  text: z.string().default(""), // .min(1) kaldırıldı
  author: z.string().default(""), // .min(1) kaldırıldı
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
  title: z.string().default(""), // .min(1) kaldırıldı
  description: z.string().default(""), // .min(1) kaldırıldı
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
  title: z.string().default(""), // .min(1) kaldırıldı
  price: z.string().default(""), // .min(1) kaldırıldı
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
  name: z.string().default(""), // .min(1) kaldırıldı
  title: z.string().default(""), // .min(1) kaldırıldı
  description: z.string().default(""), // .min(1) kaldırıldı
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
        // Dil koduna göre başlık ve açıklamalar oluşturalım - dinamik dil desteğiyle
        const getLocalizedDefaults = (langCode: string) => {
          const defaults: Record<string, Record<string, string>> = {
            'tr': {
              title: 'Yeni Hizmet',
              description: 'Hizmet açıklaması',
              slug: `hizmet-${Date.now()}-tr`,
            },
            'en': {
              title: 'New Service',
              description: 'Service description',
              slug: `service-${Date.now()}-en`,
            },
            'de': {
              title: 'Neuer Service',
              description: 'Servicebeschreibung',
              slug: `dienst-${Date.now()}-de`,
            },
            'ru': {
              title: 'Новая Услуга',
              description: 'Описание услуги',
              slug: `usluga-${Date.now()}-ru`,
            },
            'fr': {
              title: 'Nouveau Service',
              description: 'Description du service',
              slug: `service-${Date.now()}-fr`,
            },
            'es': {
              title: 'Nuevo Servicio',
              description: 'Descripción del servicio',
              slug: `servicio-${Date.now()}-es`,
            },
            'it': {
              title: 'Nuovo Servizio',
              description: 'Descrizione del servizio',
              slug: `servizio-${Date.now()}-it`,
            },
          };

          return defaults[langCode] || defaults['en'];
        };
        
        const localizedValues = getLocalizedDefaults(lang.code);
        const uniqueTimestamp = Date.now();
        
        // Varsayılan değerlerle tüm bölümleri oluştur (zorunlu alanlar)
        baseValues.basicInfoSection!.translations[lang.code] = {
          languageCode: lang.code,
          slug: localizedValues.slug || `service-${Date.now()}-${lang.code}`,
          title: localizedValues.title,
          description: localizedValues.description,
        };
        baseValues.tocSection!.translations[lang.code] = {
          languageCode: lang.code,
          tocTitle: "İçindekiler",
          tocAuthorInfo: "",
          tocCtaDescription: "",
          tocItems: [],
        };
        baseValues.introSection!.translations[lang.code] = {
          languageCode: lang.code,
          title: localizedValues.title,
          description: localizedValues.description,
          primaryButtonText: "Ana Buton",
          primaryButtonLink: "#",
          secondaryButtonText: "İkincil Buton",
          secondaryButtonLink: "#",
          introLinks: [],
        };
        baseValues.seoSection!.translations[lang.code] = {
          languageCode: lang.code,
          metaTitle: localizedValues.title,
          metaDescription: localizedValues.description,
          metaKeywords: "anahtar,kelimeler",
        };
        baseValues.overviewSection!.translations[lang.code] = {
          languageCode: lang.code,
          title: localizedValues.title,
          description: localizedValues.description,
        };
        baseValues.whySection!.translations[lang.code] = {
          languageCode: lang.code,
          title: localizedValues.title,
        };
        baseValues.gallerySection!.translations[lang.code] = {
          languageCode: lang.code,
          title: localizedValues.title,
          description: localizedValues.description,
        };
        baseValues.testimonialsSection!.translations[lang.code] = {
          languageCode: lang.code,
          title: "Müşteri Yorumları",
        };
        baseValues.stepsSection!.translations[lang.code] = {
          languageCode: lang.code,
          title: "Prosedür Adımları",
          description: "Adım açıklamaları",
          steps: [],
        };
        baseValues.recoverySection!.translations[lang.code] = {
          languageCode: lang.code,
          title: "İyileşme Süreci",
          description: "İyileşme süreci açıklaması",
        };
        baseValues.ctaSection!.translations[lang.code] = {
          languageCode: lang.code,
          tagline: "Slogan",
          title: "Harekete Geçirici Mesaj Başlığı",
          description: "Harekete geçirici mesaj açıklaması",
          buttonText: "Buton Metni",
          buttonLink: "#",
          avatarText: "Avatar Metni",
        };
        baseValues.pricingSection!.translations[lang.code] = {
          languageCode: lang.code,
          title: "Fiyatlandırma",
          description: "Fiyatlandırma açıklaması",
        };
        baseValues.expertsSection!.translations[lang.code] = {
          languageCode: lang.code,
          title: "Uzmanlarımız",
          tagline: "Uzmanlarımız sloganı",
        };
        baseValues.faqSection!.translations[lang.code] = {
          languageCode: lang.code,
          title: "Sıkça Sorulan Sorular",
          description: "SSS açıklaması",
          faqs: [],
        };
      }
      else {
        // initialData varsa, mevcut verileri kullan
        // safeParse kullanarak daha güvenli doğrulama yap
        const basicInfoParseResult = HizmetBasicInfoSectionTranslationSchema.safeParse({
          languageCode: lang.code,
          slug: tr?.slug || "",
          title: tr?.title || "",
          description: tr?.description || "",
        });

        if (basicInfoParseResult.success) {
          baseValues.basicInfoSection!.translations[lang.code] = basicInfoParseResult.data;
        } else {
          console.warn(`[getInitialFormValues] Zod validation failed for basicInfoSection, lang: ${lang.code}. Attempting to use original values or fallbacks.`, basicInfoParseResult.error.flatten().fieldErrors);
          // Hata durumunda, orijinal veriyi (boş olsa bile) korumaya çalış veya daha anlamlı varsayılan ata
          baseValues.basicInfoSection!.translations[lang.code] = {
            languageCode: lang.code,
            slug: tr?.slug || `hizmet-${initialData?.id || 'error'}-${lang.code}`, // Orijinal slug'ı (boşsa boş) veya varsayılanı kullan
            title: tr?.title || `[${lang.code.toUpperCase()} Başlık Girilmemiş]`, // Orijinal başlığı veya varsayılanı kullan
            description: tr?.description || `[${lang.code.toUpperCase()} Açıklama Girilmemiş]`, // Orijinal açıklamayı veya varsayılanı kullan
          };
        }

        // Diğer bölümler için de safeParse kullanılabilir, şimdilik parse ile devam ediyoruz
        // TODO: Diğer parse çağrılarını da safeParse ile güncelle
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
          // ADD LOGGING HERE:
          if (lang.code === 'en') {
            // Güvenli loglama (döngüsel yapı içerebilecek nesneler için)
            const safeTrans = existingTrans ? {
              id: existingTrans.id,
              languageCode: existingTrans.languageCode,
              // Sadece bazı önemli alanları logla
              keys: Object.keys(existingTrans).filter(k => k !== 'language')
            } : null;
            console.log(`[DEBUG getInitial] Found existing 'en' trans for def ${def.id}:`, safeTrans);
          }
          const parsedTranslation = transSchema.parse({
            languageCode: lang.code,
            ...(existingTrans || {}), // Prisma'dan gelen çeviriyi veya boş obje
          });
          (parsedDef as any).translations[lang.code] = parsedTranslation;
          // ADD LOGGING HERE:
          if (lang.code === 'en') {
             const safeResult = {
               languageCode: parsedTranslation.languageCode,
               // Diğer önemli alanları logla (döngüsel referans olmadığından emin olarak)
               hasData: Object.keys(parsedTranslation).length > 1 // languageCode dışında alan var mı
             };
             console.log(`[DEBUG getInitial] Parsed 'en' trans for def ${def.id}:`, safeResult);
          }
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
              description: "Hizmet açıklaması"
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

 // Debug: Form validasyon hatalarını konsola yazdır
 useEffect(() => {
   if (Object.keys(form.formState.errors).length > 0) {
     // Güvenli bir şekilde döngüsel yapıları önleme (circular references)
     const safeErrors = {};
     Object.keys(form.formState.errors).forEach(key => {
       if (form.formState.errors[key]) {
         safeErrors[key] = {
           type: form.formState.errors[key].type,
           message: form.formState.errors[key].message
         };
       }
     });
     console.log("Form Validation Errors:", safeErrors);
   }
 }, [form.formState.errors]);
 
 // Aktif dil değiştiğinde kullanıcıya bilgi ver ve form içeriğini reset et
 useEffect(() => {
   console.log("Active Language Changed to:", activeLang);
   // Kullanıcı arayüzünde aktif dil göstergesi
   console.log(`%c ŞU AN AKTİF DİL: ${activeLang.toUpperCase()} `, 'background: #4CAF50; color: white; font-size: 14px; font-weight: bold; padding: 4px 8px;');
   
   // ÖNEMLİ: Dil değiştiğinde form değerleri tamamen baştan alınmalı
   // Bu, dil sekmeleri arasında değerlerin paylaşılmasını önler
   form.reset(getInitialFormValues());
   
   // Debug için form state'ini konsola yazdır
   console.log("Current Form Values Structure:", Object.keys(form.getValues()));
 }, [activeLang]);

  const onSubmit = async (values: HizmetFormValues) => {
    setLoading(true);
    try {
      // Gönderim sırasında form değerlerini konsola yazdır - debug için
      console.log("Form values being submitted:", values);
      
      // API'nin beklediği yapıya dönüştürme
      // API'nin beklediği format:
      // - translations: Record<string, HizmetTranslationSchema>
      // - overviewTabDefinitions, whyItemDefinitions, etc. (bunlar zaten doğru formatta)
      
      // TÜM DİLLER için translations objesi oluştur
      const allTranslations: Record<string, any> = {};
      
      // TÜM DİLLER için işlem yap
      diller.forEach(lang => {
        const langCode = lang.code;
        
        // Basic Info alanlarını kontrol et ve logla - debug için
        const basicInfoForLang = values.basicInfoSection.translations[langCode];
        console.log(`[DEBUG] Processing BasicInfo for lang ${langCode}:`, {
            slug: basicInfoForLang?.slug || "undefined", 
            title: basicInfoForLang?.title || "undefined",
            description: basicInfoForLang?.description ? (basicInfoForLang.description.length > 30 ? basicInfoForLang.description.substring(0, 30) + "..." : basicInfoForLang.description) : "undefined"
        });
        
        // Her dil için veri dönüşümü yap
        allTranslations[langCode] = {
          // BasicInfo
          languageCode: langCode,
        slug: values.basicInfoSection.translations[langCode]?.slug || "",
        title: values.basicInfoSection.translations[langCode]?.title || "",
        description: values.basicInfoSection.translations[langCode]?.description || "",
        
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
      }); // diller.forEach döngüsü sonu
      
      // API'nin beklediği payload'ı oluştur

      // Yardımcı fonksiyon: Definition dizilerindeki TÜM çevirileri alır
      const processDefinitionsForPayload = (definitions: any[] | undefined) => {
        if (!definitions) return [];
        return definitions.map(def => {
          const processedTranslations: Record<string, any> = {};
          
          // TÜM dillerin çevirilerini kopyala
          diller.forEach(lang => {
            const langCode = lang.code;
            if (def.translations && def.translations[langCode]) {
              processedTranslations[langCode] = { 
                ...def.translations[langCode],
                languageCode: langCode // Dil kodunu açıkça belirt
              };
              console.log(`[PAYLOAD DEBUG] Processing translation for lang ${langCode} in definition:`, 
                JSON.stringify(processedTranslations[langCode]));
            } else {
               console.log(`[PAYLOAD DEBUG] WARNING: No translation found for ${langCode} in definition ${def.id || 'new'}`);
               // İsteğe bağlı: Boş çeviri objesi oluşturulabilir mi? API'nin bunu nasıl işlediğine bağlı.
               // processedTranslations[langCode] = { languageCode: langCode }; 
            }
          });
          
          // Orijinal definition'ın diğer alanlarını ve TÜM çevirileri içeren yeni bir nesne döndür
          return {
            ...def, // id, order, number, imageUrl vb. dil bağımsız alanlar
            translations: processedTranslations // TÜM dilleri içerir
          };
        });
      };

      // API'den nasıl bir payload bekleniyor ona göre kontrol et
      console.log('[DEBUG] Checking route.ts file structure to determine expected payload format');
      
      let payload;
      
      try {
        // İki formatta hazırlayalım - düzenli bir yapı (yeni) ve basitleştirilmiş (eski)
        // API hangi formatı bekliyorsa ona göre işlenecek
        
        // Format 1: İç içe bölümler ve çevirilerle (standart Zod validation şeması)
        const detailedPayload = {
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
          
          // İç içe bölüm yapısı (form bileşenindeki yapı)
          basicInfoSection: values.basicInfoSection,
          tocSection: values.tocSection,
          introSection: values.introSection,
          seoSection: values.seoSection,
          overviewSection: values.overviewSection,
          whySection: values.whySection,
          gallerySection: values.gallerySection,
          testimonialsSection: values.testimonialsSection,
          stepsSection: values.stepsSection,
          recoverySection: values.recoverySection,
          ctaSection: values.ctaSection,
          pricingSection: values.pricingSection,
          expertsSection: values.expertsSection,
          faqSection: values.faqSection,
          
          activeLang: activeLang,
        };
        
        // Format 2: Düzleştirilmiş, doğrudan API'ye gönderilen (eski stil) 
        const flattenedPayload = {
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
          
          // Düzleştirilmiş, API'nin beklediği yapılar
          translations: allTranslations, 
          overviewTabDefinitions: processDefinitionsForPayload(values.overviewSection.definition?.tabs),
          whyItemDefinitions: processDefinitionsForPayload(values.whySection.definition?.items),
          testimonialDefinitions: processDefinitionsForPayload(values.testimonialsSection.definition?.items),
          recoveryItemDefinitions: processDefinitionsForPayload(values.recoverySection.definition?.items),
          expertItemDefinitions: processDefinitionsForPayload(values.expertsSection.definition?.items),
          pricingPackageDefinitions: processDefinitionsForPayload(values.pricingSection.definition?.packages),
          
          activeLang: activeLang,
        };
        
        // Güvenlik için, route.ts dosyasında flattenedPayload formatında çalışacağını varsaydık
        // Bu API'nin daha sonraki geliştirmelerinde değişebilir
        payload = flattenedPayload;
        
        console.log("[DEBUG] Using flattened payload structure for API compatibility");
        
      } catch (formatError) {
        console.error("Error preparing payload format:", formatError);
        // Hata durumunda, orijinal flattenedPayload yapısına dönelim
        payload = {
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
          translations: allTranslations,
          overviewTabDefinitions: processDefinitionsForPayload(values.overviewSection.definition?.tabs),
          whyItemDefinitions: processDefinitionsForPayload(values.whySection.definition?.items),
          testimonialDefinitions: processDefinitionsForPayload(values.testimonialsSection.definition?.items),
          recoveryItemDefinitions: processDefinitionsForPayload(values.recoverySection.definition?.items),
          expertItemDefinitions: processDefinitionsForPayload(values.expertsSection.definition?.items),
          pricingPackageDefinitions: processDefinitionsForPayload(values.pricingSection.definition?.packages),
          activeLang: activeLang,
        };
      }

      const url = isEditing && initialData?.id
        ? `/api/admin/hizmetler/${initialData.id}`
        : '/api/admin/hizmetler';
      const method = isEditing ? 'PATCH' : 'POST';

      // Göndermeden hemen önce payload içindeki definition dizilerini logla
      console.log("[DEBUG PAYLOAD] overviewTabDefinitions:", JSON.stringify(payload.overviewTabDefinitions, null, 2));
      console.log("[DEBUG PAYLOAD] whyItemDefinitions:", JSON.stringify(payload.whyItemDefinitions, null, 2));
      // Gerekirse diğer definition tipleri için de log ekleyebilirsiniz
      console.log("[DEBUG PAYLOAD] testimonialDefinitions:", JSON.stringify(payload.testimonialDefinitions, null, 2));
      console.log("[DEBUG PAYLOAD] recoveryItemDefinitions:", JSON.stringify(payload.recoveryItemDefinitions, null, 2));
      console.log("[DEBUG PAYLOAD] expertItemDefinitions:", JSON.stringify(payload.expertItemDefinitions, null, 2));
      console.log("[DEBUG PAYLOAD] pricingPackageDefinitions:", JSON.stringify(payload.pricingPackageDefinitions, null, 2));
      console.log("[DEBUG PAYLOAD] Top-level translations:", JSON.stringify(payload.translations, null, 2));

      console.log("API Payload:", JSON.stringify(payload, null, 2)); // Bu genel log kalabilir

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

      // API yanıtını parse et - hata yakalamak için try/catch bloğu ekleyelim
      let resultData;
      try {
        resultData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Raw response text:", responseText);
        throw new Error("JSON yanıtı parse edilemedi. Sunucu yanıtı geçersiz.");
      }
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
