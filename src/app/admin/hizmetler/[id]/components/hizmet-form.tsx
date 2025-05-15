"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { Hizmet, Language } from "@/generated/prisma";
import { ensureArray } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Languages, 
  LanguagesIcon,
  Settings,
  ArrowRight,
  Eye,
  EyeOff,
  Grip,
  Edit,
  ChevronRight
} from "lucide-react";

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
import { MediaManager } from "./MediaManager";

import {
  HizmetTranslation,
  HizmetTocItem,
  HizmetIntroLink,
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

// Şema tanımlarını dahil etmek gerekiyor, orijinal dosyadan bunları kopyalıyoruz
// Temel Bilgiler
const HizmetBasicInfoSectionTranslationSchema = z.object({
  languageCode: z.string(),
  slug: z.string().min(1, "Slug gerekli."),
  title: z.string().min(1, "Başlık gerekli."),
  description: z.string().min(1, "Açıklama gerekli."),
});

// TOC
const hizmetTocItemSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Metin gerekli"),
  isBold: z.boolean().default(false),
  level: z.number().int().min(1).max(3).optional().nullable(),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(),
});

const HizmetTocSectionTranslationSchema = z.object({
  languageCode: z.string(),
  tocTitle: z.string().default("İçindekiler"),
  tocAuthorInfo: z.string().optional().default(""),
  tocCtaDescription: z.string().optional().default(""),
  tocItems: z.array(hizmetTocItemSchema).default([]),
});

// Intro
const hizmetIntroLinkSchema = z.object({
  id: z.string().optional(),
  targetId: z.string().min(1, "Hedef ID/URL gerekli"),
  number: z.string().min(1, "Numara metni gerekli"),
  text: z.string().min(1, "Link metni gerekli"),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(),
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

// SEO
const HizmetSeoSectionTranslationSchema = z.object({
  languageCode: z.string(),
  metaTitle: z.string().optional().nullable().default(null),
  metaDescription: z.string().optional().nullable().default(null),
  metaKeywords: z.string().optional().nullable().default(null),
});

// Overview
const HizmetOverviewTabTranslationSchema = z.object({
  languageCode: z.string(),
  triggerText: z.string().default(""),
  title: z.string().default(""),
  content: z.string().default(""),
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
  title: z.string().default(""),
  description: z.string().default(""),
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

// Gallery
const HizmetGallerySectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Galeri"),
  description: z.string().optional().default(""),
});

// Testimonials
const HizmetTestimonialTranslationSchema = z.object({
  languageCode: z.string(),
  text: z.string().default(""),
  author: z.string().default(""),
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

// Steps
const hizmetStepSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
  linkText: z.string().optional().nullable().default(null),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(),
});

const HizmetStepsSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Adımlar"),
  description: z.string().optional().default(""),
  steps: z.array(hizmetStepSchema).default([]),
});

// Recovery
const HizmetRecoveryItemTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default(""),
  description: z.string().default(""),
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

// CTA
const HizmetCtaSectionTranslationSchema = z.object({
  languageCode: z.string(),
  tagline: z.string().optional().nullable().default(null),
  title: z.string().default("Bize Ulaşın"),
  description: z.string().default(""),
  buttonText: z.string().default("Randevu Al"),
  buttonLink: z.string().optional().nullable().default(null),
  avatarText: z.string().optional().nullable().default(null),
});

// Pricing
const HizmetPricingPackageTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default(""),
  price: z.string().default(""),
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

// Experts
const HizmetExpertItemTranslationSchema = z.object({
  languageCode: z.string(),
  name: z.string().default(""),
  title: z.string().default(""),
  description: z.string().default(""),
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

// FAQ
const hizmetFaqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Soru gerekli"),
  answer: z.string().min(1, "Cevap gerekli"),
  order: z.number().default(0),
  hizmetTranslationId: z.string().optional(),
});

const HizmetFaqSectionTranslationSchema = z.object({
  languageCode: z.string(),
  title: z.string().default("Sıkça Sorulan Sorular"),
  description: z.string().optional().default(""),
  faqs: z.array(hizmetFaqItemSchema).default([]),
});

// Modül tipleri için Enum tanımı
enum ModuleType {
  BASIC_INFO = "basic_info",
  HERO = "hero",
  TOC = "toc",
  INTRO = "intro",
  OVERVIEW = "overview",
  WHY = "why",
  GALLERY = "gallery",
  TESTIMONIALS = "testimonials",
  STEPS = "steps",
  RECOVERY = "recovery",
  CTA = "cta",
  PRICING = "pricing",
  EXPERTS = "experts",
  FAQ = "faq",
  SEO = "seo"
}

// Modül durumu için tip
interface ModuleState {
  id: ModuleType;
  title: string;
  isActive: boolean;
  isVisible: boolean;
  isEditing: boolean;
  icon?: React.ReactNode;
}

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

  // Modül aktivasyon durumları
  moduleStates: z.record(z.string(), z.object({
    isActive: z.boolean().default(true),
    isVisible: z.boolean().default(true)
  })).default({}),

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

  gallerySection: z.object({
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

  ctaSection: z.object({
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
  
  // Dil değişikliği kontrolü için bayrak (işlem sırasında kullanılır, API'ye gönderilmez)
  _isLanguageSwitch: z.boolean().optional(),
});

export type HizmetFormValues = z.infer<typeof hizmetFormSchema>;

// API'den gelen veri tipi
export type FullHizmetData = Hizmet & {
  translations: Array<
    HizmetTranslation & {
      language: Language;
      tocItems?: HizmetTocItem[];
      introLinks?: HizmetIntroLink[];
      steps?: HizmetStep[];
      faqs?: HizmetFaqItem[];
    }
  >;
  marqueeImages?: HizmetMarqueeImage[];
  galleryImages?: HizmetGalleryImage[];
  ctaAvatars?: HizmetCtaAvatar[];
  introVideoId?: string | null;
  
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

// Form bileşeni props
interface HizmetFormProps {
  initialData: FullHizmetData | null;
  diller: Language[];
}

export function HizmetForm({ initialData, diller }: HizmetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultLangCode = diller.find(d => d.isDefault)?.code || diller[0]?.code || "tr";
  const [activeLang, setActiveLang] = useState<string>(defaultLangCode);
  
  // Yeni UI için durum değişkenleri
  const [activeContentTab, setActiveContentTab] = useState<string>("basic");
  const [activeMainTab, setActiveMainTab] = useState<string>("content");
  const [progress, setProgress] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<string[]>(["basic_info"]);
  
  // Modüller için state
  const [availableModules, setAvailableModules] = useState<ModuleState[]>([
    { id: ModuleType.BASIC_INFO, title: "Temel Bilgiler", isActive: true, isVisible: true, isEditing: false, icon: <Globe size={16} /> },
    { id: ModuleType.HERO, title: "Hero Bölümü", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.TOC, title: "İçindekiler", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.INTRO, title: "Giriş Bölümü", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.OVERVIEW, title: "Genel Bakış", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.WHY, title: "Neden Biz", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.GALLERY, title: "Galeri", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.TESTIMONIALS, title: "Yorumlar", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.STEPS, title: "Prosedür Adımları", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.RECOVERY, title: "İyileşme Süreci", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.CTA, title: "CTA Bölümü", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.PRICING, title: "Fiyatlandırma", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.EXPERTS, title: "Uzmanlar", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.FAQ, title: "SSS", isActive: true, isVisible: true, isEditing: false },
    { id: ModuleType.SEO, title: "SEO", isActive: true, isVisible: true, isEditing: false }
  ]);
  
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);

  const isEditing = !!initialData?.id;
  const actionButtonText = isEditing ? "Değişiklikleri Kaydet" : "Hizmeti Oluştur";
  const toastMessageSuccess = isEditing ? "Hizmet güncellendi." : "Hizmet oluşturuldu.";
  const toastMessageError = isEditing ? "Hizmet güncellenirken bir hata oluştu." : "Hizmet oluşturulurken bir hata oluştu.";

  // Orijinal dosyadan getInitialFormValues işlevini alıyoruz
  const getInitialFormValues = (): HizmetFormValues => {
    try {
      // Kullanılan metin şablonları - başlangıç değerleri
      const initialEmptyText = {
        slug: "hizmet-slug", // Benzersiz bir slug başlangıç değeri olmalı
        title: "Başlık",
        description: "Açıklama"
      };
      
      // ModuleStates varsa konsola yazdır
      if (initialData && initialData.moduleStates) {
        console.log("Veritabanından gelen moduleStates:", initialData.moduleStates);
      } else {
        console.log("Veritabanından gelen moduleStates bulunamadı - yeni kayıt oluşturulacak");
      }
      
      const baseValues: Partial<HizmetFormValues> = {
        id: initialData?.id,
        published: initialData?.published ?? false,
        moduleStates: initialData?.moduleStates || {}, // Veritabanından gelen modül durumlarını kullan
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
          // Hata durumunda, orijinal veriyi (boş olsa bile) korumaya çalış veya daha anlamlı varsayılan ata
          baseValues.basicInfoSection!.translations[lang.code] = {
            languageCode: lang.code,
            slug: tr?.slug || `hizmet-${initialData?.id || 'error'}-${lang.code}`,
            title: tr?.title || `[${lang.code.toUpperCase()} Başlık Girilmemiş]`,
            description: tr?.description || `[${lang.code.toUpperCase()} Açıklama Girilmemiş]`,
          };
        }

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
          const parsedTranslation = transSchema.parse({
            languageCode: lang.code,
            ...(existingTrans || {}), // Prisma'dan gelen çeviriyi veya boş obje
          });
          (parsedDef as any).translations[lang.code] = parsedTranslation;
        });
        
        return parsedDef;
      });
    };
    
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

  // Form oluşturma, doğrulama ve varsayılan değerler
  const form = useForm<HizmetFormValues>({
    resolver: zodResolver(hizmetFormSchema) as any,
    defaultValues: getInitialFormValues(),
    // Form değişimi anında typescript hatalarını önlemek için mode: 'onChange' devre dışı
    mode: 'onSubmit'
  }) as UseFormReturn<HizmetFormValues>;
  
  // İlk yükleme veya initialData/diller değiştiğinde form değerlerini sıfırla
  useEffect(() => {
     try {
       // Tam temiz bir durumla başla
       const initialValues = getInitialFormValues();
       
       // Form değerlerini hatasız bir şekilde sıfırla
       form.reset(initialValues, {
         keepDirty: false,
         keepTouched: false,
         keepErrors: false,
         keepIsSubmitted: false,
         keepIsValid: false,
         keepSubmitCount: false,
       });
       
       console.log("[RESET] Form başarıyla sıfırlandı.");
     } catch (error) {
       console.error("[RESET] Form sıfırlama hatası:", error);
     }
  }, [initialData, diller, form]);
  
  // Başlangıç değerlerinden modül durumlarını ayarla
  useEffect(() => {
    if (initialData?.id) {
      console.log("Form değerleri yükleniyor:", form.getValues());
      
      const formValues = form.getValues();
      if (formValues.moduleStates) {
        console.log("Mevcut moduleStates:", formValues.moduleStates);
        
        // Mevcut verilere göre moduleStates güncelleyerek UI'ı ayarla
        const updatedAvailableModules = availableModules.map(module => ({
          ...module,
          isVisible: formValues.moduleStates[module.id]?.isVisible ?? true
        }));
        
        console.log("Güncellenen modüller:", updatedAvailableModules);
        setAvailableModules(updatedAvailableModules);
      }
    }
  }, [initialData, form]);
  
  // Modül durumlarını form değişikliğinde güncelle
  useEffect(() => {
    // ModuleStates değişikliklerini izle
    const subscription = form.watch((value, { name }) => {
      if (name && name.startsWith('moduleStates')) {
        // Form değerlerini al
        const formValues = form.getValues();
        if (formValues.moduleStates) {
          // Modülleri güncelle
          const updatedAvailableModules = availableModules.map(module => ({
            ...module,
            isVisible: formValues.moduleStates[module.id]?.isVisible ?? true
          }));
          
          setAvailableModules(updatedAvailableModules);
          
          // Eğer seçili bir modül yoksa ilk modülü seç
          if (selectedModule === null && updatedAvailableModules.length > 0) {
            setSelectedModule(updatedAvailableModules[0].id);
          }
        }
      }
    });
    
    // Temizlik fonksiyonu
    return () => subscription.unsubscribe();
  }, [form, selectedModule]);

  // İlerleme yüzdesini hesapla
  useEffect(() => {
    const formValues = form.getValues();
    let totalFields = 0;
    let filledFields = 0;

    // Basit bir ilerleme hesaplama - gerçek uygulamada daha detaylı olabilir
    // Temel alanları kontrol et
    const checkFields = [
      formValues.heroImageUrl,
      formValues.basicInfoSection?.translations?.[activeLang]?.title,
      formValues.basicInfoSection?.translations?.[activeLang]?.description,
      formValues.basicInfoSection?.translations?.[activeLang]?.slug,
      // Diğer önemli alanlar buraya eklenebilir
    ];

    totalFields = checkFields.length;
    filledFields = checkFields.filter(field => field).length;

    // Koleksiyon alanlarını kontrol et
    if (formValues.marqueeImages?.length) filledFields++;
    totalFields++;
    
    if (formValues.galleryImages?.length) filledFields++;
    totalFields++;

    const percent = Math.round((filledFields / totalFields) * 100);
    setProgress(percent);
  }, [form.watch(), activeLang]);

  // Akordeon bölümünü aç/kapat
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  // Sürükle-bırak işlemleri
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const source = result.source.droppableId;
    const destination = result.destination.droppableId;
    
    // Soldan sağa (aktifleştirme) taşıma
    if (source === 'available-modules' && destination === 'active-modules') {
      const moduleId = result.draggableId as ModuleType;
      const module = availableModules.find(m => m.id === moduleId);
      
      if (module) {
        // Modülü aktif modüller listesine ekle
        setActiveModules(prev => [...prev, {...module, isActive: true, isEditing: true}]);
        setSelectedModule(moduleId);
        
        // Form verisini güncelle - modülü aktifleştir
        form.setValue(`moduleStates.${moduleId}.isActive`, true);
      }
    }
    
    // Sağdan sola (deaktifleştirme) taşıma
    if (source === 'active-modules' && destination === 'available-modules') {
      const moduleId = result.draggableId as ModuleType;
      
      // Modülü aktif listeden kaldır
      setActiveModules(prev => prev.filter(m => m.id !== moduleId));
      
      // Eğer seçili modül deaktif edildiyse, seçimi temizle
      if (selectedModule === moduleId) {
        setSelectedModule(null);
      }
      
      // Form verisini güncelle - modülü deaktifleştir
      form.setValue(`moduleStates.${moduleId}.isActive`, false);
    }
    
    // Aynı tarafta sıralama değişikliği
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'active-modules') {
        const items = Array.from(activeModules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setActiveModules(items);
      }
    }
  };
  
  // Modül görünürlük değiştirme
  const toggleModuleVisibility = (moduleId: ModuleType) => {
    try {
      // Güncel form değerlerini al
      const formValues = form.getValues();
      
      // Mevcut görünürlük değerini kontrol et
      const currentVisibility = formValues.moduleStates?.[moduleId]?.isVisible ?? true;
      
      // moduleStates objesi henüz yoksa oluştur
      if (!formValues.moduleStates) {
        form.setValue('moduleStates', {}, { shouldDirty: true });
      }

      // Her modül için boş bir obje oluştur
      if (!formValues.moduleStates?.[moduleId]) {
        form.setValue(`moduleStates.${moduleId}`, {}, { shouldDirty: true });
      }
      
      // Değeri güncelle ve formu kirli (dirty) olarak işaretle
      // Hem kısa anahtar (moduleId) hem de uzun anahtar (moduleId + "Section") için değer ayarla
      const newVisibility = !currentVisibility;
      
      // Orijinal module ID için değeri güncelle
      form.setValue(`moduleStates.${moduleId}`, { 
        ...formValues.moduleStates?.[moduleId],
        isVisible: newVisibility,
        isActive: newVisibility // isActive değerini de aynı değere ayarla
      }, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
      
      // "[moduleId]Section" versiyonu için de güncelle (eğer farklıysa)
      const sectionKey = `${moduleId}Section`;
      if (moduleId !== sectionKey) {
        form.setValue(`moduleStates.${sectionKey}`, { 
          ...formValues.moduleStates?.[sectionKey],
          isVisible: newVisibility,
          isActive: newVisibility
        }, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        });
      }
      
      // Özel durumlar - bazı modüller için isimlendirmeler farklı
      if (moduleId === 'basic_info') {
        // "basic_info" modülü için "basicInfoSection" şeklinde de olabilir
        form.setValue('moduleStates.basicInfoSection', { 
          ...formValues.moduleStates?.basicInfoSection,
          isVisible: newVisibility,
          isActive: newVisibility
        }, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        });
      }
      
      if (moduleId === 'hero') {
        // "hero" modülü için "heroSection" şeklinde de olabilir
        form.setValue('moduleStates.heroSection', { 
          ...formValues.moduleStates?.heroSection,
          isVisible: newVisibility,
          isActive: newVisibility
        }, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        });
      }
      
      console.log(`Modül ${moduleId} ve ${sectionKey} görünürlüğü: ${newVisibility}`);
      
      // UI'ı uyarı verebilmek için state güncellemesi yap
      setAvailableModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { ...module, isVisible: !currentVisibility, isActive: !currentVisibility } 
          : module
      ));
      
      console.log(`Modül ${moduleId} görünürlüğü: ${!currentVisibility}`);
    } catch (error) {
      console.error("Görünürlük değiştirme hatası:", error);
    }
  };
  
  // Modül düzenleme
  const selectModuleForEditing = (moduleId: ModuleType) => {
    setSelectedModule(moduleId);
  };
  
  // Modül paneli render işlevi
  const renderModuleEditPane = () => {
    if (!selectedModule) return <div className="p-8 text-center text-muted-foreground">Düzenlemek için modül seçin veya sürükleyin</div>;
    
    // Her modül tipine göre uygun bileşeni render et
    switch (selectedModule) {
      case ModuleType.BASIC_INFO:
        return (
          <BasicInfoSection 
            form={form}
            loading={loading}
            isEditing={isEditing}
            activeLang={activeLang}
          />
        );
      case ModuleType.HERO:
        return (
          <HeroSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      case ModuleType.TOC:
        return (
          <TocSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      case ModuleType.INTRO:
        return (
          <IntroSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      case ModuleType.OVERVIEW:
        return (
          <OverviewSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
            diller={diller}
          />
        );
      case ModuleType.WHY:
        return (
          <WhySectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
            diller={diller}
          />
        );
      case ModuleType.GALLERY:
        return (
          <GallerySectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      case ModuleType.TESTIMONIALS:
        return (
          <TestimonialsSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
            diller={diller}
          />
        );
      case ModuleType.STEPS:
        return (
          <StepsSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      case ModuleType.RECOVERY:
        return (
          <RecoverySectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
            diller={diller}
          />
        );
      case ModuleType.CTA:
        return (
          <CtaSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      case ModuleType.PRICING:
        return (
          <PricingSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
            diller={diller}
          />
        );
      case ModuleType.EXPERTS:
        return (
          <ExpertsSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
            diller={diller}
          />
        );
      case ModuleType.FAQ:
        return (
          <FaqSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      case ModuleType.SEO:
        return (
          <SeoSectionForm 
            form={form}
            loading={loading}
            activeLang={activeLang}
          />
        );
      default:
        return <div>Seçilen modül için düzenleme paneli bulunamadı.</div>;
    }
  };

  // Form gönderimi ve API iletişimi - typescript güvenlik iyileştirmeleriyle
  const onSubmit = async (values: HizmetFormValues) => {
    // Dil değişikliği bayrağı kontrol et - eğer sadece dil değişikliği yapıyorsak formu submit etme
    if (values._isLanguageSwitch) {
      // Bayrağı temizle ve log ekle
      console.log("[SUBMIT] Dil değişimi tespit edildi, form gönderimi iptal edildi");
      form.setValue("_isLanguageSwitch", false, { shouldDirty: false });
      return; // Form gönderimini iptal et
    }
    
    // Form değerlerini doğrula ve temizle (tip hataları için)
    try {
      // Submit öncesi değerleri bir kez daha doğrula
      const validatedValues = hizmetFormSchema.parse(values);
      console.log("[SUBMIT] Form verileri başarıyla doğrulandı, API'ye gönderiliyor...");
    } catch (validationError) {
      console.error("[SUBMIT] Form doğrulama hatası:", validationError);
      toast.error("Form verilerinde hatalar var. Lütfen form alanlarını kontrol ediniz.");
      return; // Hatalı formun gönderilmesini engelle
    }
    
    setLoading(true);
    try {
      // API'nin beklediği yapıya dönüştürme
      // TÜM DİLLER için translations objesi oluştur
      const allTranslations: Record<string, any> = {};
      
      // TÜM DİLLER için işlem yap
      diller.forEach(lang => {
        const langCode = lang.code;
        
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
            }
          });
          
          // Orijinal definition'ın diğer alanlarını ve TÜM çevirileri içeren yeni bir nesne döndür
          return {
            ...def, // id, order, number, imageUrl vb. dil bağımsız alanlar
            translations: processedTranslations // TÜM dilleri içerir
          };
        });
      };

      // API payload'ını oluştur
      const { _isLanguageSwitch, ...formValues } = values;
      
      const payload = {
        id: formValues.id,
        published: formValues.published,
        moduleStates: formValues.moduleStates, // Modül durumları gönder
        heroImageUrl: formValues.heroImageUrl,
        heroImageAlt: formValues.heroImageAlt,
        whyBackgroundImageUrl: formValues.whyBackgroundImageUrl,
        ctaBackgroundImageUrl: formValues.ctaBackgroundImageUrl,
        ctaMainImageUrl: formValues.ctaMainImageUrl,
        ctaMainImageAlt: formValues.ctaMainImageAlt,
        introVideoId: formValues.introSection.definition?.videoId === "" ? null : formValues.introSection.definition?.videoId,
        marqueeImages: formValues.marqueeImages,
        galleryImages: formValues.galleryImages,
        ctaAvatars: formValues.ctaAvatars,
        translations: allTranslations,
        overviewTabDefinitions: processDefinitionsForPayload(formValues.overviewSection.definition?.tabs),
        whyItemDefinitions: processDefinitionsForPayload(formValues.whySection.definition?.items),
        testimonialDefinitions: processDefinitionsForPayload(formValues.testimonialsSection.definition?.items),
        recoveryItemDefinitions: processDefinitionsForPayload(formValues.recoverySection.definition?.items),
        expertItemDefinitions: processDefinitionsForPayload(formValues.expertsSection.definition?.items),
        pricingPackageDefinitions: processDefinitionsForPayload(formValues.pricingSection.definition?.packages),
        activeLang: activeLang,
      };

      const url = isEditing && initialData?.id
        ? `/api/admin/hizmetler/${initialData.id}`
        : '/api/admin/hizmetler';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: `Sunucu hatası (${response.status}) veya geçersiz JSON yanıtı.` };
        }
        throw new Error(errorData.message || `İşlem sırasında bir hata oluştu (${response.status})`);
      }

      toast.success(toastMessageSuccess);

      // Sadece yeni hizmet oluşturulduğunda listeye geri dön
      // Düzenleme modunda kalıp, dil değişikliği yapabilelim
      if (!isEditing) {
        router.push('/admin/hizmetler');
      } else {
        // Düzenleme modunda form durumunu sıfırla
        form.reset(await response.json());
        // Sayfayı yeniden oluştur ama yönlendirme yapma
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Form submit error:", error);
      const message = error instanceof Error ? error.message : toastMessageError;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Formun yükleme durumunu kontrol et
  const isFormReady = form.formState.isDirty || isEditing;
  
  // Derin obje klonlama fonksiyonu - form değerlerini izole etmek için
  const deepClone = <T extends object>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  // Dil geçişini işleyen fonksiyon - tamamen izole ederek
  const handleLanguageChange = (langCode: string) => {
    // Eğer zaten seçili dil ise hiçbir şey yapma
    if (langCode === activeLang) return;
    
    // Önce form durumu kontrolü yap
    if (form.formState.isDirty && !confirm("Kaydedilmemiş değişiklikleriniz var. Dil değiştirirseniz kaybolabilir. Devam etmek istiyor musunuz?")) {
      return; // Kullanıcı vazgeçti
    }
    
    try {
      // 1. Mevcut formun tam durumunu kaydet
      const currentFormValues = deepClone(form.getValues());
      
      // 2. Mevcut dildeki tüm TOC öğelerini ve diğer listeleri loglama
      console.log(`[DİL DEĞİŞİMİ] ${activeLang} -> ${langCode}`);
      console.log(`[MEVCUT DİL] ${activeLang} TOC öğeleri: `, 
        currentFormValues?.tocSection?.translations?.[activeLang]?.tocItems?.length || 0);
      console.log(`[HEDEF DİL] ${langCode} TOC öğeleri: `, 
        currentFormValues?.tocSection?.translations?.[langCode]?.tocItems?.length || 0);
      
      // 3. Mevcut dile özgü listeleri özel cache'leyelim
      const prevTocItems = deepClone(currentFormValues?.tocSection?.translations?.[activeLang]?.tocItems || []);
      const prevIntroLinks = deepClone(currentFormValues?.introSection?.translations?.[activeLang]?.introLinks || []);
      const prevSteps = deepClone(currentFormValues?.stepsSection?.translations?.[activeLang]?.steps || []);
      const prevFaqs = deepClone(currentFormValues?.faqSection?.translations?.[activeLang]?.faqs || []);
      
      // 4. Eğer yeni dilde henüz bu listeler oluşturulmadıysa (yeni form), boş diziler ekleme
      if (!currentFormValues?.tocSection?.translations?.[langCode]?.tocItems) {
        if (!currentFormValues.tocSection) currentFormValues.tocSection = { translations: {} };
        if (!currentFormValues.tocSection.translations) currentFormValues.tocSection.translations = {};
        if (!currentFormValues.tocSection.translations[langCode]) {
          currentFormValues.tocSection.translations[langCode] = {
            languageCode: langCode,
            tocTitle: "İçindekiler",
            tocAuthorInfo: "",
            tocCtaDescription: "",
            tocItems: []
          };
        }
      }
      
      // 5. Aynı kontrolü diğer listeler için de yapalım - bu dil bazlı tam izolasyon sağlar
      // IntroLinks için
      if (!currentFormValues?.introSection?.translations?.[langCode]?.introLinks) {
        if (!currentFormValues.introSection) currentFormValues.introSection = { definition: { videoId: null }, translations: {} };
        if (!currentFormValues.introSection.translations) currentFormValues.introSection.translations = {};
        if (!currentFormValues.introSection.translations[langCode]) {
          currentFormValues.introSection.translations[langCode] = {
            languageCode: langCode,
            title: "",
            description: "",
            primaryButtonText: "",
            primaryButtonLink: "",
            secondaryButtonText: "",
            secondaryButtonLink: "",
            introLinks: []
          };
        }
      }
      
      // Steps için
      if (!currentFormValues?.stepsSection?.translations?.[langCode]?.steps) {
        if (!currentFormValues.stepsSection) currentFormValues.stepsSection = { translations: {} };
        if (!currentFormValues.stepsSection.translations) currentFormValues.stepsSection.translations = {};
        if (!currentFormValues.stepsSection.translations[langCode]) {
          currentFormValues.stepsSection.translations[langCode] = {
            languageCode: langCode,
            title: "Adımlar",
            description: "",
            steps: []
          };
        }
      }
      
      // Faqs için
      if (!currentFormValues?.faqSection?.translations?.[langCode]?.faqs) {
        if (!currentFormValues.faqSection) currentFormValues.faqSection = { translations: {} };
        if (!currentFormValues.faqSection.translations) currentFormValues.faqSection.translations = {};
        if (!currentFormValues.faqSection.translations[langCode]) {
          currentFormValues.faqSection.translations[langCode] = {
            languageCode: langCode,
            title: "Sıkça Sorulan Sorular",
            description: "",
            faqs: []
          };
        }
      }
      
      // 6. Mevcut dile ait öğeleri saklayalım - bunlar değişimden SONRA tekrar kullanılabilir
      const languageDataCache = {
        [activeLang]: {
          tocItems: prevTocItems,
          introLinks: prevIntroLinks,
          steps: prevSteps,
          faqs: prevFaqs
        }
      };
      console.log(`[CACHE] ${activeLang} dili için cache oluşturuldu:`, languageDataCache);
      
      // moduleStates'in değişmediğini kontrol etmek için
      console.log('[DİL DEĞİŞİMİ] moduleStates kontrol:', currentFormValues.moduleStates);
      
      // 7. Formu sıfırlayıp yeni form değerlerini yerleştir
      form.reset(currentFormValues, { 
        keepDirty: false, 
        keepTouched: false,
        keepErrors: false,
        keepIsSubmitted: false,
        keepIsValid: false,
        keepSubmitCount: false
      });
      
      // 8. Dili değiştir
      setActiveLang(langCode);
      
      // 9. İçerik sekme görünümünde olduğundan emin olalım
      setActiveMainTab("content");
      
      // Seçili modülü koru (eğer varsa)
      console.log('[DİL DEĞİŞİMİ] Dil değişiminden önce seçili modül:', selectedModule);
      // selectedModule'ü korumak için özel bir işlem yapmaya gerek yok,
      // çünkü React state'i dil değişiminde sıfırlanmıyor
      
      // 10. Forma özel bir bayrak ekle - dil değişikliği olduğunu belirt
      form.setValue("_isLanguageSwitch", true, { shouldDirty: false });
      
      // 11. Yeni dilde form yüklendiğinde listeler boşsa, önceki dilden içe aktarma seçeneği sunabilirsiniz
      
      console.log(`[DİL DEĞİŞİMİ TAMAMLANDI] Aktif dil: ${langCode}`);
    } catch (error) {
      console.error("[DİL DEĞİŞİMİ HATASI]", error);
      toast.error("Dil değişimi sırasında bir hata oluştu. Lütfen kaydetmeden önce bilgileri kontrol edin.");
      
      // Yine de dili değiştir, ancak sıfırlama hatası olabilir
      setActiveLang(langCode);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Üst Bölüm: Başlık, Durum ve Dil Seçimi */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{isEditing ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}</CardTitle>
                <CardDescription>
                  {isEditing ? "Mevcut hizmeti ve tüm çevirilerini düzenleyin" : "Yeni bir hizmet ve çevirilerini oluşturun"}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground mr-2">
                  {isEditing ? "Yayında" : "Yayınla"}
                </span>
                <Switch
                  checked={form.watch("published")}
                  onCheckedChange={(checked) => form.setValue("published", checked)}
                  disabled={loading}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <Progress value={progress} className="w-full" />
                <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
                  %{progress}
                </span>
              </div>
              
              {/* Dil Seçimi Tablar */}
              <div className="flex items-center border-b">
                <div className="flex items-center space-x-2 mr-4">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Dil:</span>
                </div>
                <div className="flex space-x-1 overflow-x-auto">
                  {diller.map(lang => (
                    <Button
                      key={lang.code}
                      variant={activeLang === lang.code ? "default" : "ghost"}
                      size="sm"
                      className={`rounded-t-md rounded-b-none ${activeLang === lang.code ? 'bg-primary text-primary-foreground border-b-2 border-primary' : 'border-b border-transparent hover:bg-accent hover:text-accent-foreground'}`}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <div className="flex items-center">
                        <span>{lang.name}</span>
                        {lang.isDefault && (
                          <Badge 
                            variant={activeLang === lang.code ? "secondary" : "outline"} 
                            className={`ml-2 ${activeLang === lang.code ? 'bg-white text-primary' : ''} text-[10px] px-1 py-0`}
                          >
                            Varsayılan
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Modül Düzenleme Grid */}
        <div className="grid grid-cols-12 gap-6">
            {/* Sol Panel - Aktif Modüller */}
            <div className="col-span-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Modüller</CardTitle>
                  <CardDescription>
                    Düzenlemek için modül seçin, görmek için göz simgesine tıklayın
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-2 min-h-[300px]">
                    {availableModules.map((module, index) => (
                      <div
                        key={module.id}
                        onClick={() => selectModuleForEditing(module.id)}
                        className={`flex items-center border rounded-lg p-4 transition-colors cursor-pointer shadow-sm hover:shadow-md ${
                          selectedModule === module.id 
                            ? 'bg-primary/10 border-primary shadow-md' 
                            : 'bg-card hover:bg-accent/30'
                        }`}
                      >
                        <div className="flex-1 flex items-center">
                          {/* Modül ikon alanı - eğer ikon varsa göster, yoksa varsayılan ikon kullan */}
                          <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                            selectedModule === module.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                          }`}>
                            {module.icon || <Settings size={16} />}
                          </div>
                          
                          {/* Modül başlığı */}
                          <span className={`font-medium ${
                            selectedModule === module.id ? 'text-primary' : ''
                          }`}>
                            {module.title}
                          </span>
                        </div>
                        
                        {/* Sağdaki butonlar */}
                        <div className="flex items-center space-x-2">
                          {/* Görünürlük düğmesi */}
                          <Button 
                            variant={module.isVisible ? "outline" : "ghost"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Modül seçimini engellemek için olay yayılımını durdur
                              toggleModuleVisibility(module.id);
                            }}
                            title={(module.isVisible) ? "Gizle" : "Göster"}
                            className={`transition-colors ${
                              module.isVisible 
                                ? 'border-blue-500 text-blue-500 hover:bg-blue-50' 
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            {(module.isVisible)
                              ? <Eye size={16} /> 
                              : <EyeOff size={16} />}
                          </Button>
                          
                          {/* Düzenleme düğmesi - sadece seçili olmadığında göster */}
                          {selectedModule !== module.id && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectModuleForEditing(module.id);
                              }}
                              title="Düzenle"
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit size={16} className="mr-1" />
                              <span className="hidden sm:inline">Düzenle</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sağ Panel - Seçilen Modülün Düzenleme Alanı */}
            <div className="col-span-8">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {selectedModule 
                        ? availableModules.find(m => m.id === selectedModule)?.title + " Düzenleme" 
                        : "Modül Düzenleme"}
                    </CardTitle>
                    {selectedModule && (
                      <div className="flex space-x-2">
                        <Switch 
                          checked={availableModules.find(m => m.id === selectedModule)?.isVisible ?? true}
                          onCheckedChange={(checked) => {
                            // moduleStates objesi henüz yoksa oluştur
                            const hasModuleStates = form.getValues().moduleStates !== undefined;
                            if (!hasModuleStates) {
                              form.setValue('moduleStates', {});
                            }
                            
                            // Form değerini güncelle - hem kısa hem de uzun anahtarlar için
                            // Kısa modül anahtarı
                            form.setValue(`moduleStates.${selectedModule}`, {
                              ...form.getValues().moduleStates?.[selectedModule],
                              isVisible: checked,
                              isActive: checked // isActive de güncellenmeli
                            }, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true
                            });
                            
                            // "[moduleId]Section" versiyonu için de güncelle (eğer farklıysa)
                            const sectionKey = `${selectedModule}Section`;
                            if (selectedModule !== sectionKey) {
                              form.setValue(`moduleStates.${sectionKey}`, {
                                ...form.getValues().moduleStates?.[sectionKey],
                                isVisible: checked,
                                isActive: checked
                              }, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true
                              });
                              
                              console.log(`Switch: Modül ${selectedModule} ve ${sectionKey} görünürlüğü: ${checked}`);
                            }
                            
                            // Özel durumlar - bazı modüller için isimlendirmeler farklı
                            if (selectedModule === 'basic_info') {
                              // "basic_info" modülü için "basicInfoSection" şeklinde de olabilir
                              form.setValue('moduleStates.basicInfoSection', { 
                                ...form.getValues().moduleStates?.basicInfoSection,
                                isVisible: checked,
                                isActive: checked
                              }, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true
                              });
                            }
                            
                            if (selectedModule === 'hero') {
                              // "hero" modülü için "heroSection" şeklinde de olabilir
                              form.setValue('moduleStates.heroSection', { 
                                ...form.getValues().moduleStates?.heroSection,
                                isVisible: checked,
                                isActive: checked
                              }, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true
                              });
                            }
                            
                            // UI state'i güncelle
                            setAvailableModules(prev => prev.map(module => 
                              module.id === selectedModule 
                                ? { ...module, isVisible: checked } 
                                : module
                            ));
                            
                            console.log(`Switch: Modül ${selectedModule} görünürlüğü: ${checked}`);
                          }}
                          disabled={loading}
                        />
                        <span className="text-sm">
                          {(availableModules.find(m => m.id === selectedModule)?.isVisible ?? true) ? "Görünür" : "Gizli"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {renderModuleEditPane()}
                </CardContent>
              </Card>
            </div>
          </div>

        {/* Sayfanın en altında her zaman görünen genel kaydet butonu */}
        <div className="sticky bottom-0 bg-background pb-4 pt-2 border-t">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {actionButtonText}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}