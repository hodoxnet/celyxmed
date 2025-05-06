import * as z from "zod";

// Yeni yönetici ekleme ve düzenleme için şema
// Düzenlemede şifre opsiyonel olabilir, eklemede zorunlu.
// Bu nedenle iki ayrı şema veya birleşik bir şema kullanabiliriz.
// Şimdilik birleşik yapalım ve düzenlemede şifre boşsa güncellenmeyecek şekilde ayarlayalım.

export const adminFormSchema = z.object({
  name: z.string().min(2, {
    message: "İsim en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
  // Şifre: Eklemede zorunlu, düzenlemede opsiyonel (boş bırakılırsa değişmez)
  // `refine` ile bu kontrolü yapabiliriz veya form içinde yönetebiliriz.
  // Şimdilik form içinde yönetelim, şemada opsiyonel yapalım.
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }).optional().or(z.literal('')), // Boş string'e de izin ver (düzenleme için)
});

export type AdminFormValues = z.infer<typeof adminFormSchema>;

// ----- Hizmet Detay Şemaları -----

// İlişkili Modeller için Şemalar
const HizmetTocItemSchema = z.object({
  id: z.string().optional(), // Düzenleme için ID gerekebilir
  text: z.string().min(1, "Metin boş olamaz"),
  isBold: z.boolean().optional().default(false),
  level: z.number().optional(),
  order: z.number().optional().default(0),
});

const HizmetMarqueeImageSchema = z.object({
  id: z.string().optional(),
  src: z.string().min(1, "Resim gereklidir"), // URL validasyonu kaldırıldı, sadece string kontrolü
  alt: z.string().min(1, "Alt metin boş olamaz"),
  order: z.number().optional().default(0),
});

const HizmetIntroLinkSchema = z.object({
  id: z.string().optional(),
  targetId: z.string().min(1, "Hedef ID boş olamaz"),
  number: z.string().min(1, "Numara boş olamaz"),
  text: z.string().min(1, "Metin boş olamaz"),
  order: z.number().optional().default(0),
});

const HizmetOverviewTabSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Değer boş olamaz"),
  triggerText: z.string().min(1, "Tetikleyici metin boş olamaz"),
  title: z.string().min(1, "Başlık boş olamaz"),
  content: z.string().min(1, "İçerik boş olamaz"),
  imagePath: z.string().optional().or(z.literal('')), // URL'den path'e ve opsiyonel
  imageAlt: z.string().optional().or(z.literal('')), // Resim yoksa alt metin de opsiyonel
  buttonText: z.string().min(1, "Buton metni boş olamaz"),
  buttonLink: z.string().optional().or(z.literal('')), // Buton linki opsiyonel
  order: z.number().optional().default(0),
});

const HizmetWhyItemSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "Numara boş olamaz"),
  title: z.string().min(1, "Başlık boş olamaz"),
  description: z.string().min(1, "Açıklama boş olamaz"),
  order: z.number().optional().default(0),
});

const HizmetGalleryImageSchema = z.object({
  id: z.string().optional(),
  src: z.string().url("Geçerli bir URL girin"),
  alt: z.string().min(1, "Alt metin boş olamaz"),
  order: z.number().optional().default(0),
});

const HizmetTestimonialSchema = z.object({
  id: z.string().optional(),
  stars: z.number().min(1).max(5).optional().default(5),
  text: z.string().min(1, "Yorum metni boş olamaz"),
  author: z.string().min(1, "Yazar boş olamaz"),
  treatment: z.string().optional(),
  imageUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal('')),
  order: z.number().optional().default(0),
});

const HizmetStepSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık boş olamaz"),
  description: z.string().min(1, "Açıklama boş olamaz"),
  linkText: z.string().optional(),
  order: z.number().optional().default(0),
});

const HizmetRecoveryItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık boş olamaz"),
  description: z.string().min(1, "Açıklama boş olamaz"),
  imageUrl: z.string().url("Geçerli bir URL girin"),
  imageAlt: z.string().min(1, "Resim alt metni boş olamaz"),
  order: z.number().optional().default(0),
});

const HizmetCtaAvatarSchema = z.object({
  id: z.string().optional(),
  src: z.string().url("Geçerli bir URL girin"),
  alt: z.string().min(1, "Alt metin boş olamaz"),
  order: z.number().optional().default(0),
});

const HizmetPricingPackageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık boş olamaz"),
  price: z.string().min(1, "Fiyat boş olamaz"),
  features: z.array(z.string().min(1, "Özellik boş olamaz")).min(1, "En az bir özellik ekleyin"),
  isFeatured: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
});

const HizmetExpertItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "İsim boş olamaz"),
  title: z.string().min(1, "Unvan boş olamaz"),
  description: z.string().min(1, "Açıklama boş olamaz"),
  imageUrl: z.string().url("Geçerli bir URL girin"),
  imageAlt: z.string().min(1, "Resim alt metni boş olamaz"),
  ctaText: z.string().optional(),
  order: z.number().optional().default(0),
});

const HizmetFaqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "Soru boş olamaz"),
  answer: z.string().min(1, "Cevap boş olamaz"),
  order: z.number().optional().default(0),
});


// Ana Hizmet Detay Form Şeması
export const hizmetDetayFormSchema = z.object({
  // Temel Bilgiler
  languageCode: z.string().min(2, "Dil kodu seçilmelidir"),
  slug: z.string().min(1, "Slug boş olamaz").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  breadcrumb: z.string().min(1, "Breadcrumb boş olamaz"),
  title: z.string().min(1, "Başlık boş olamaz"),
  description: z.string().min(1, "Kısa açıklama boş olamaz"),
  published: z.boolean().default(false), // .default(false) geri eklendi

  // Hero
  heroImageUrl: z.string().min(1, "Hero resmi gereklidir"), // URL validasyonu kaldırıldı, sadece string kontrolü
  heroImageAlt: z.string().min(1, "Hero resim alt metni boş olamaz"),

  // TOC & CTA
  tocTitle: z.string().min(1, "İçindekiler başlığı boş olamaz"),
  tocAuthorInfo: z.string().optional(),
  tocItems: z.array(HizmetTocItemSchema).optional().default([]), // .optional().default([]) geri eklendi
  tocCtaDescription: z.string().min(1, "İçindekiler CTA açıklaması boş olamaz"),

  // Marquee
  marqueeImages: z.array(HizmetMarqueeImageSchema).optional().default([]), // .optional().default([]) geri eklendi

  // Intro
  introVideoId: z.string().optional(),
  introTitle: z.string().min(1, "Tanıtım başlığı boş olamaz"),
  introDescription: z.string().min(1, "Tanıtım açıklaması boş olamaz"),
  introPrimaryButtonText: z.string().min(1, "Birincil buton metni boş olamaz"),
  introPrimaryButtonLink: z.string().min(1, "Birincil buton linki boş olamaz"),
  introSecondaryButtonText: z.string().min(1, "İkincil buton metni boş olamaz"),
  introSecondaryButtonLink: z.string().min(1, "İkincil buton linki boş olamaz"),
  introLinks: z.array(HizmetIntroLinkSchema).optional().default([]), // .optional().default([]) geri eklendi

  // Overview
  overviewTitle: z.string().min(1, "Genel bakış başlığı boş olamaz"),
  overviewDescription: z.string().min(1, "Genel bakış açıklaması boş olamaz"),
  overviewTabs: z.array(HizmetOverviewTabSchema).min(1, "En az bir genel bakış sekmesi ekleyin"),

  // Why Celyxmed
  whyTitle: z.string().min(1, "Neden Celyxmed başlığı boş olamaz"),
  whyBackgroundImageUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal('')),
  whyItems: z.array(HizmetWhyItemSchema).min(1, "En az bir Neden Celyxmed öğesi ekleyin"),

  // Gallery
  galleryTitle: z.string().min(1, "Galeri başlığı boş olamaz"),
  galleryDescription: z.string().min(1, "Galeri açıklaması boş olamaz"),
  galleryImages: z.array(HizmetGalleryImageSchema).optional().default([]), // .optional().default([]) geri eklendi

  // Testimonials
  testimonialsSectionTitle: z.string().optional(),
  testimonials: z.array(HizmetTestimonialSchema).optional().default([]), // .optional().default([]) geri eklendi

  // Steps
  stepsTitle: z.string().min(1, "Adımlar başlığı boş olamaz"),
  stepsDescription: z.string().optional(),
  steps: z.array(HizmetStepSchema).min(1, "En az bir adım ekleyin"),

  // Recovery
  recoveryTitle: z.string().min(1, "İyileşme başlığı boş olamaz"),
  recoveryDescription: z.string().optional(),
  recoveryItems: z.array(HizmetRecoveryItemSchema).min(1, "En az bir iyileşme öğesi ekleyin"),

  // Main CTA
  ctaTagline: z.string().optional(),
  ctaTitle: z.string().min(1, "CTA başlığı boş olamaz"),
  ctaDescription: z.string().min(1, "CTA açıklaması boş olamaz"),
  ctaButtonText: z.string().min(1, "CTA buton metni boş olamaz"),
  ctaButtonLink: z.string().optional(),
  ctaAvatars: z.array(HizmetCtaAvatarSchema).optional().default([]), // .optional().default([]) geri eklendi
  ctaAvatarText: z.string().optional(),
  ctaBackgroundImageUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal('')),
  ctaMainImageUrl: z.string().url("Geçerli bir URL girin").optional().or(z.literal('')),
  ctaMainImageAlt: z.string().optional(),

  // Pricing
  pricingTitle: z.string().min(1, "Fiyatlandırma başlığı boş olamaz"),
  pricingDescription: z.string().optional(),
  pricingPackages: z.array(HizmetPricingPackageSchema).optional().default([]), // .optional().default([]) geri eklendi

  // Experts
  expertsSectionTitle: z.string().min(1, "Uzmanlar başlığı boş olamaz"),
  expertsTagline: z.string().optional(),
  expertItems: z.array(HizmetExpertItemSchema).optional().default([]), // .optional().default([]) geri eklendi

  // FAQs
  faqSectionTitle: z.string().min(1, "SSS başlığı boş olamaz"),
  faqSectionDescription: z.string().optional(),
  faqs: z.array(HizmetFaqItemSchema).optional().default([]), // .optional().default([]) geri eklendi

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(), // Veya z.array(z.string())
});

export type HizmetDetayFormValues = z.infer<typeof hizmetDetayFormSchema>;
