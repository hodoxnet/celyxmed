// src/app/[locale]/hizmetler/[slug]/page.tsx
// Server Component olarak kalmalı

import type { Metadata, ResolvingMetadata } from 'next';
import { normalizeModuleStates } from './page.tsx.normalize';
// Navbar, Footer ve FloatingButtons RootLayoutClient'tan geleceği için kaldırıldı.
import HeroSection from '@/components/hizmet-detay/HeroSection';
// TableOfContents importu kaldırıldı, yerine TocAndCtaSection gelecek
import TocAndCtaSection from '@/components/hizmet-detay/TocAndCtaSection'; // Yeni bileşeni import et
import TreatmentOverview from '@/components/hizmet-detay/TreatmentOverview';
import WhyCelyxmed from '@/components/hizmet-detay/WhyCelyxmed';
import GallerySection from '@/components/hizmet-detay/GallerySection';
import ProcedureSteps from '@/components/hizmet-detay/ProcedureSteps';
import RecoveryInfo from '@/components/hizmet-detay/RecoveryInfo';
import PricingSection from '@/components/hizmet-detay/PricingSection';
import MeetExperts from '@/components/hizmet-detay/MeetExperts';
import FaqSection from '@/components/hizmet-detay/FaqSection';
// CtaSection importu zaten vardı, tekrar eklemeye gerek yok
import ImageMarquee from '@/components/hizmet-detay/ImageMarquee'; // Yeni marquee bileşenini import et
import TreatmentIntroSection from '@/components/hizmet-detay/TreatmentIntroSection'; // Yeni intro bölümünü import et
import TestimonialsSection from '@/components/hizmet-detay/TestimonialsSection'; // Yeni yorum bölümünü import et
import CtaSection from '@/components/hizmet-detay/CtaSection'; // CTA bölümünü import et (yeniden adlandırıldıysa düzelt)
import BlogPreview from '@/components/home/BlogPreview'; // Blog önizleme bölümünü import et
// Gerekirse diğer UI bileşenlerini import edeceğiz
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// İçerik öğesi tipi (TableOfContents bileşeninden kopyalandı, idealde paylaşılan bir types dosyasında olmalı)
interface ContentItem {
  id: string;
  text: string;
  isBold?: boolean;
  level?: number;
}

// Sayfa verisi tipi (Temsili)
interface ServiceData {
  breadcrumb: string;
  title: string;
  description: string;
  heroImageUrl: string; // HeroSection için resim URL'si
  heroImageAlt: string;
  // toc ile başlayan alanlar TocAndCtaSection'a taşındı
  tocAndCta_tocTitle: string; // Yeni prop isimleri
  tocAndCta_tocAuthorInfo?: string;
  tocAndCta_tocItems: ContentItem[];
  tocAndCta_ctaDescription: string; // Sağ sütun açıklaması
  marqueeImages?: { src: string; alt: string }[]; // Yeni marquee resimleri (opsiyonel)
  treatmentIntro_videoId?: string; // Intro bölümü video ID (opsiyonel)
  treatmentIntro_title: string;
  treatmentIntro_description: string;
  treatmentIntro_primaryButtonText: string;
  treatmentIntro_primaryButtonLink: string;
  treatmentIntro_secondaryButtonText: string;
  treatmentIntro_secondaryButtonLink: string;
  treatmentIntro_links: { id: string; number: string; text: string }[];
  overviewSectionTitle: string;
  overviewSectionDescription: string;
  overviewTabsData: any[];
  whySectionTitle: string;
  whyItems: any[];
  whySectionBackgroundImageUrl?: string; // WhyCelyxmed bölümü için opsiyonel arka plan resmi
  gallerySectionTitle: string;
  gallerySectionDescription: string;
  galleryImages: any[];
  stepsSectionTitle: string;
  stepsSectionDescription?: string;
  stepsData: any[];
  testimonialsSectionTitle?: string; // Yorum bölümü başlığı (opsiyonel)
  testimonialsData: any[]; // Yorum verileri
  recoverySectionTitle: string;
  recoverySectionDescription?: string;
  recoveryItems: any[];
  pricingSectionTitle: string;
  pricingSectionDescription?: string;
  pricingPackages: any[];
  expertsSectionTitle: string;
  expertsTagline?: string;
  expertsData: any[];
  faqSectionTitle: string;
  faqSectionDescription?: string;
  faqItems: any[];
  ctaTagline?: string; // CtaSection için etiket (opsiyonel)
  ctaTitle: string; // CtaSection için başlık
  ctaDescription: string; // CtaSection için açıklama
  ctaButtonText: string; // CtaSection için buton metni
  ctaButtonLink?: string; // CtaSection için buton linki (opsiyonel)
  ctaAvatars?: any[]; // CtaSection için avatarlar (tipi Avatar[] olmalı, opsiyonel)
  ctaAvatarText?: string; // CtaSection için avatar metni (opsiyonel)
  ctaBackgroundImageUrl?: string; // CtaSection için arka plan resmi (opsiyonel)
  ctaMainImageUrl?: string; // CTA için ana görsel (opsiyonel)
  ctaMainImageAlt?: string; // CTA ana görsel alt metni (opsiyonel)
}

// Sayfa parametrelerinin tipini tanımla
interface ServiceDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Dinamik metadata oluşturma
export async function generateMetadata(
  { params }: ServiceDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale, slug } = await params;

  // Varsayılan meta değerlerini belirle
  let title = 'Hizmetler';
  let description = '';
  let siteName = 'Celyxmed';

  try {
    // Ana site adını parent'dan al
    const parentMetadata = await parent;
    siteName = parentMetadata.title?.absolute || 'Celyxmed';

    // Hizmet verisini API'den çek
    const serviceData = await getServiceData(slug, locale);

    // Hizmet verisi varsa metadata'yı ayarla
    if (serviceData) {
      title = serviceData.title;
      description = serviceData.description;
    }
  } catch (error) {
    console.error("Error fetching service metadata:", error);
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      siteName: siteName,
      locale: locale,
      type: 'website',
    },
  };
}

// API'den dönecek veri tipi (Genişletildi - tüm alanlar opsiyonel)
// Not: Bu tipin Prisma'dan veya paylaşılan bir tipten türetilmesi daha iyi olur.
interface FetchedServiceData {
  // Hero
  heroImageUrl: string;
  heroImageAlt: string;
  breadcrumb: string;
  title: string;
  description: string;

  // TOC & CTA
  tocTitle?: string;
  tocAuthorInfo?: string;
  tocItems?: { id: string; text: string; isBold?: boolean; level?: number; order: number }[];
  tocCtaDescription?: string;

  // Marquee
  marqueeImages?: { id: string; src: string; alt: string; order: number }[];

  // Intro
  introVideoId?: string;
  introTitle?: string;
  introDescription?: string;
  introPrimaryButtonText?: string;
  introPrimaryButtonLink?: string;
  introSecondaryButtonText?: string;
  introSecondaryButtonLink?: string;
  introLinks?: { id: string; targetId: string; number: string; text: string; order: number }[];

  // Overview
  overviewTitle?: string;
  overviewDescription?: string;
  overviewTabs?: { id: string; value: string; triggerText: string; title: string; content: string; imageUrl: string; imageAlt: string; buttonText: string; order: number }[];

  // Why Celyxmed
  whyTitle?: string;
  whyBackgroundImageUrl?: string;
  whyItems?: { id: string; number: string; title: string; description: string; order: number }[];

  // Gallery
  galleryTitle?: string;
  galleryDescription?: string;
  galleryImages?: { id: string; src: string; alt: string; order: number }[];

  // Testimonials
  testimonialsSectionTitle?: string;
  testimonials?: { id: string; stars?: number; text: string; author: string; treatment?: string; imageUrl?: string; order: number }[];

  // Steps
  stepsTitle?: string;
  stepsDescription?: string;
  steps?: { id: string; title: string; description: string; linkText?: string; order: number }[];

  // Recovery
  recoveryTitle?: string;
  recoveryDescription?: string;
  recoveryItems?: { id: string; title: string; description: string; imageUrl: string; imageAlt: string; order: number }[];

  // Main CTA
  ctaTagline?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  ctaAvatars?: { id: string; src: string; alt: string; order: number }[];
  ctaAvatarText?: string;
  ctaBackgroundImageUrl?: string;
  ctaMainImageUrl?: string;
  ctaMainImageAlt?: string;

  // Pricing
  pricingTitle?: string;
  pricingDescription?: string;
  pricingPackages?: { id: string; title: string; price: string; features: string[]; isFeatured?: boolean; order: number }[];

  // Experts
  expertsSectionTitle?: string;
  expertsTagline?: string;
  expertItems?: { id: string; name: string; title: string; description: string; imageUrl: string; imageAlt: string; ctaText?: string; order: number }[];

  // FAQs
  faqSectionTitle?: string;
  faqSectionDescription?: string;
  faqs?: { id: string; question: string; answer: string; order: number }[];

  // SEO (Bunlar sayfada kullanılmıyor ama API'den gelebilir)
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}


// Veri çekme fonksiyonu
async function getServiceData(slug: string, locale: string): Promise<FetchedServiceData | null> {
  try {
    // API endpoint URL'sini doğrula/ayarla - API URL'leri hiçbir zaman çevrilmez
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/hizmetler/${slug}?locale=${locale}`;
    
    console.log(`[Page] API'den veri çekiliyor. URL: ${apiUrl}`);
    
    // Sonsuz döngüyü önlemek için 'force-cache' kullan
    // Bu, aynı URL için tekrar tekrar istek yapmak yerine önbellek kullanacak
    const res = await fetch(apiUrl, { 
      cache: 'force-cache',
      next: { tags: [`hizmet-${slug}-${locale}`] } // İnvalidasyon için tag ekle
    });

    if (!res.ok) {
      console.error(`[Page] API isteği başarısız: ${res.status} ${res.statusText}`);
      
      // Eğer bu locale için içerik yoksa, varsayılan locale'i deneyelim
      if (locale !== 'tr' && res.status === 404) {
        console.log(`[Page] ${locale} dilinde içerik bulunamadı, varsayılan dil (tr) deneniyor.`);
        return await fetchWithDefaultLocale(slug);
      }
      
      console.log('[Page] API dönüşü alınamadı, yedek veri kullanılıyor.');
      // Eğer API çağrısı başarısız olursa, yedek veri kullan
      return getFallbackData(slug, locale);
    }

    const data = await res.json();
    // Debug için - moduleStates'i kontrol et ve düzelt
    console.log(`[Page] API Yanıt moduleStates:`, data.moduleStates);
    
    // Eğer moduleStates yoksa, boş bir object ekle
    if (!data.moduleStates) {
      console.log('[Page] moduleStates bulunamadı, boş bir nesne ekleniyor');
      data.moduleStates = {};
    }
    
    // ModuleStates durumlarını normalize et
    data.moduleStates = normalizeModuleStates(data.moduleStates);
    console.log('[Page] Normalize edilmiş moduleStates:', data.moduleStates);
    
    return data;
  } catch (error) {
    console.error("[Page] Hizmet verisi çekme hatası:", error);
    console.log('[Page] API çağrısında hata oluştu, yedek veri kullanılıyor.');
    // Hata durumunda yedek veri kullan
    return getFallbackData(slug, locale);
  }
}

// Varsayılan dil ile veri çekme fonksiyonu
async function fetchWithDefaultLocale(slug: string): Promise<FetchedServiceData | null> {
  const defaultLocale = 'tr';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/hizmetler/${slug}?locale=${defaultLocale}`;
  
  try {
    console.log(`[Page] Varsayılan dil (${defaultLocale}) için API'den veri çekiliyor. URL: ${apiUrl}`);
    const res = await fetch(apiUrl, { 
      cache: 'force-cache',
      next: { tags: [`hizmet-${slug}-${defaultLocale}`] }
    });
    
    if (!res.ok) {
      console.error(`[Page] Varsayılan dil (${defaultLocale}) için API isteği başarısız: ${res.status} ${res.statusText}`);
      return getFallbackData(slug, defaultLocale);
    }
    
    const data = await res.json();
    // Debug için - moduleStates'i kontrol et ve düzelt
    console.log(`[Page] API Yanıt moduleStates:`, data.moduleStates);
    
    // Eğer moduleStates yoksa, boş bir object ekle
    if (!data.moduleStates) {
      console.log('[Page] moduleStates bulunamadı, boş bir nesne ekleniyor');
      data.moduleStates = {};
    }
    
    // ModuleStates durumlarını normalize et
    data.moduleStates = normalizeModuleStates(data.moduleStates);
    console.log('[Page] Normalize edilmiş moduleStates:', data.moduleStates);
    
    return data;
  } catch (error) {
    console.error(`[Page] Varsayılan dil (${defaultLocale}) için veri çekme hatası:`, error);
    return getFallbackData(slug, defaultLocale);
  }
}

// Yedek veri fonksiyonu - API çağrısı başarısız olduğunda kullanılır
function getFallbackData(slug: string, locale: string): FetchedServiceData {
  console.log(`Yedek veri kullanılıyor. Slug: ${slug}, Locale: ${locale}`);
  
  // Örnek veri, bu veriyi gerçek API yanıtınıza göre uyarlayabilirsiniz
  return {
    // ModuleStates ekle (tüm modüller aktif ve görünür)
    moduleStates: {
      tocSection: { isActive: true, isVisible: true },
      marqueeSection: { isActive: true, isVisible: true },
      introSection: { isActive: true, isVisible: true },
      overviewSection: { isActive: true, isVisible: true },
      whySection: { isActive: true, isVisible: true },
      gallerySection: { isActive: true, isVisible: true },
      testimonialsSection: { isActive: true, isVisible: true },
      stepsSection: { isActive: true, isVisible: true },
      recoverySection: { isActive: true, isVisible: true },
      ctaSection: { isActive: true, isVisible: true },
      pricingSection: { isActive: true, isVisible: true },
      expertsSection: { isActive: true, isVisible: true },
      faqSection: { isActive: true, isVisible: true }
    },
    breadcrumb: "Anasayfa > Hizmetler > Anne Estetiği", // breadcrumb eklendi
    title: "Anne Estetiği",
    description: "Anne estetiği, doğum sonrası vücut değişimlerini geri döndürmek için tasarlanmış işlemler bütünüdür.",
    heroImageUrl: "/uploads/hizmetler/hero-anne-estetigi.jpg",
    heroImageAlt: "Anne Estetiği",
    
    // TocAndCtaSection için props
    tocTitle: "İçindekiler", // tocAndCta_ öneki kaldırıldı
    tocItems: [ // tocAndCta_ öneki kaldırıldı, order eklendi
      { id: "toc1", text: "Anne Estetiği Nedir?", isBold: true, order: 0 },
      { id: "toc2", text: "Neden Celyxmed'i Seçmelisiniz?", isBold: false, order: 1 },
      { id: "toc3", text: "Hasta Galerisi", isBold: false, order: 2 },
      { id: "toc4", text: "Hasta Yorumları", isBold: false, order: 3 },
      { id: "toc5", text: "Tedavi Süreci", isBold: false, order: 4 },
      { id: "toc6", text: "İyileşme Süreci", isBold: false, order: 5 },
      { id: "toc7", text: "Fiyatlandırma", isBold: false, order: 6 },
      { id: "toc8", text: "Uzmanlarımız", isBold: false, order: 7 },
      { id: "toc9", text: "Sıkça Sorulan Sorular", isBold: false, order: 8 }
    ],
    tocAuthorInfo: "Dr. Celyxmed Tarafından İncelendi", // tocAndCta_ öneki kaldırıldı
    tocCtaDescription: "Tüm cerrahi işlemler için detaylı bilgi ve kişiye özel tedavi planı için uzman doktorlarımızla görüşün.", // tocAndCta_ öneki kaldırıldı

    // Diğer alanlar (tüm opsiyonel alanlar için örnek değerler)
    overviewTitle: "Anne Estetiği Nedir?",
    overviewDescription: "Anne estetiği, hamilelik ve doğum sonrası vücudun uğradığı değişimleri giderecek cerrahi prosedürleri içerir.",
    overviewTabs: [
      { id: "ot1", value: "genel-bakis", triggerText: "Genel Bakış", title: "Anne Estetiğine Genel Bakış", content: "Anne estetiği, kadınların hamilelik ve doğum sonrası değişen vücutlarını yeniden şekillendirmelerine yardımcı olan bir dizi estetik işlemdir.", imageUrl: "/uploads/hizmetler/overview-1.jpg", imageAlt: "Genel Bakış Resmi", buttonText: "Detaylar", order: 0 },
      { id: "ot2", value: "kimler-icin", triggerText: "Kimler İçin Uygun", title: "Kimler İçin Uygundur?", content: "Anne estetiği doğum yapmış, kilo verme hedefine ulaşmış ve başka çocuk düşünmeyen kadınlar için idealdir.", imageUrl: "/uploads/hizmetler/overview-2.jpg", imageAlt: "Kimler İçin Uygun Resmi", buttonText: "Detaylar", order: 1 },
      { id: "ot3", value: "avantajlar", triggerText: "Avantajlar", title: "Anne Estetiğinin Avantajları", content: "Karmaşık bir işlem olmaması ve kısa sürede iyileşme sağlaması anne estetiğinin en büyük avantajlarındandır.", imageUrl: "/uploads/hizmetler/overview-3.jpg", imageAlt: "Avantajlar Resmi", buttonText: "Detaylar", order: 2 }
    ],
    
    // Diğer bölümler için gerekli alanlar buraya eklenebilir
    whyTitle: "Neden Celyxmed'i Seçmelisiniz?",
    whyItems: [
      { id: "why1", number: "01", title: "Uzman Doktorlar", description: "Alanında uzman ve deneyimli doktorlar", order: 0 },
      { id: "why2", number: "02", title: "Modern Teknoloji", description: "En son teknoloji ile donatılmış klinik", order: 1 },
      { id: "why3", number: "03", title: "Hasta Memnuniyeti", description: "Yüksek hasta memnuniyet oranı", order: 2 }
    ],
    
    galleryTitle: "Hasta Galerisi",
    galleryDescription: "Gerçek hasta sonuçlarını inceleyin",
    galleryImages: [
      { id: "gal1", src: "/uploads/hizmetler/gallery-1.jpg", alt: "Hasta Öncesi Sonrası 1", order: 0 },
      { id: "gal2", src: "/uploads/hizmetler/gallery-2.jpg", alt: "Hasta Öncesi Sonrası 2", order: 1 }
    ],
    
    testimonialsSectionTitle: "Hasta Yorumları",
    testimonials: [
      { id: "test1", stars: 5, text: "Harika sonuçlar elde ettim, çok memnunum.", author: "Ayşe Y.", treatment: "Anne Estetiği", imageUrl: "", order: 0 },
      { id: "test2", stars: 5, text: "Tüm ekip çok ilgiliydi, sonucundan çok memnunum.", author: "Fatma K.", treatment: "Anne Estetiği", imageUrl: "", order: 1 }
    ],
    
    stepsTitle: "Tedavi Süreci",
    stepsDescription: "Anne estetiği tedavi süreci aşamaları",
    steps: [
      { id: "step1", title: "Konsultasyon", description: "Detaylı muayene ve planlama", linkText: "Randevu Al", order: 0 },
      { id: "step2", title: "Operasyon", description: "Genel anestezi altında 2-3 saat süren işlem", linkText: "Detaylar", order: 1 },
      { id: "step3", title: "Takip", description: "Düzenli kontroller ile hızlı iyileşme", linkText: "Bilgi Al", order: 2 }
    ],
    
    recoveryTitle: "İyileşme Süreci",
    recoveryDescription: "Anne estetiği sonrası iyileşme süreci hakkında bilmeniz gerekenler",
    recoveryItems: [
      { id: "rec1", title: "1-2 Gün", description: "Hastanede kalış süresi", imageUrl: "/uploads/hizmetler/recovery-1.jpg", imageAlt: "Hastane Odası", order: 0 },
      { id: "rec2", title: "1 Hafta", description: "Günlük aktivitelere dönüş", imageUrl: "/uploads/hizmetler/recovery-2.jpg", imageAlt: "Evde Dinlenme", order: 1 },
      { id: "rec3", title: "4-6 Hafta", description: "Tam iyileşme ve sonucun görülmesi", imageUrl: "/uploads/hizmetler/recovery-3.jpg", imageAlt: "Tam İyileşme", order: 2 }
    ],
    
    ctaTitle: "Kişisel Konsultasyon Rezervasyonu",
    ctaDescription: "Uzman doktorlarımızla görüşün ve size özel tedavi planınızı alın",
    ctaButtonText: "Randevu Al",
    ctaButtonLink: "/iletisim",
    
    pricingTitle: "Fiyatlandırma",
    pricingDescription: "Anne estetiği fiyatları hakkında bilgi",
    pricingPackages: [
      { id: "pkg1", title: "Standart Paket", price: "50.000 TL", features: ["Ameliyat", "1 gece konaklama", "Kontrol muayeneleri"], isFeatured: false, order: 0 },
      { id: "pkg2", title: "Premium Paket", price: "75.000 TL", features: ["Ameliyat", "2 gece konaklama", "VIP oda", "Kontrol muayeneleri", "Takip hizmetleri"], isFeatured: true, order: 1 }
    ],
    
    expertsSectionTitle: "Uzmanlarımız",
    expertsTagline: "Deneyimli ve uzman ekibimiz",
    expertItems: [
      { id: "exp1", name: "Dr. Ahmet Yılmaz", title: "Plastik Cerrahi Uzmanı", imageUrl: "/uploads/doctors/doctor-1.jpg", imageAlt: "Dr. Ahmet Yılmaz", description: "20 yıllık deneyim", ctaText: "Randevu Al", order: 0 },
      { id: "exp2", name: "Dr. Ayşe Kaya", title: "Estetik Cerrahi Uzmanı", imageUrl: "/uploads/doctors/doctor-2.jpg", imageAlt: "Dr. Ayşe Kaya", description: "15 yıllık deneyim", ctaText: "Randevu Al", order: 1 }
    ],
    
    faqSectionTitle: "Sıkça Sorulan Sorular",
    faqSectionDescription: "Anne estetiği hakkında merak edilenler",
    faqs: [
      { id: "1", question: "Anne estetiği için en uygun zaman nedir?", answer: "Son doğumunuzdan en az 6 ay sonra ve kilo hedeflerinize ulaştıktan sonra yapılması önerilir.", order: 1 },
      { id: "2", question: "Anne estetiği sonrası iz kalır mı?", answer: "Evet, ancak izler genellikle bikini hattı içerisinde kalır ve zamanla soluklaşır.", order: 2 },
      { id: "3", question: "Anne estetiği sonrası tekrar hamile kalabilir miyim?", answer: "Evet, ancak yeni bir hamilelik sonuçları etkileyebileceği için aile planlamanızı tamamladıktan sonra yapılması önerilir.", order: 3 }
    ]
  };
}


export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  // Burada React.use() kullanmak gerekiyor, ama Next.js 15'te henün zorunlu değil
  // Gelecek versiyonlarda React.use(params) ile kullanılmalı
  const { locale, slug } = await params;

  // Veriyi API'den çek
  const serviceData = await getServiceData(slug, locale);




  // Veri bulunamazsa gösterilecek içerik
  if (!serviceData) {
    return (
      // Navbar, Footer ve FloatingButtons RootLayoutClient'tan gelecek
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center">
          <p>Hizmet bulunamadı.</p>
        </main>
      </div>
    );
  }

  // Ana render fonksiyonu - Veri varsa içeriği gösterir
  return (
    // Navbar RootLayoutClient'tan gelecek
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Bölümü - Gösterim kontrolü eklendi */}
        {(
          (serviceData?.moduleStates?.heroSection?.isActive !== false && serviceData?.moduleStates?.heroSection?.isVisible !== false) ||
          (serviceData?.moduleStates?.hero?.isActive !== false && serviceData?.moduleStates?.hero?.isVisible !== false)
        ) ? (
          <>
            {console.log('[Render] Hero modülü render ediliyor', 
              'heroSection.isActive:', serviceData?.moduleStates?.heroSection?.isActive, 
              'heroSection.isVisible:', serviceData?.moduleStates?.heroSection?.isVisible,
              'hero.isActive:', serviceData?.moduleStates?.hero?.isActive,
              'hero.isVisible:', serviceData?.moduleStates?.hero?.isVisible
            )}
            <HeroSection
              title={serviceData.title}
              description={serviceData.description}
              imageUrl={serviceData.heroImageUrl}
              imageAlt={serviceData.heroImageAlt}
            />
          </>
        ) : (
          console.log('[Render] Hero modülü gizli, sebep:', 
            'heroSection.isActive:', serviceData?.moduleStates?.heroSection?.isActive, 
            'heroSection.isVisible:', serviceData?.moduleStates?.heroSection?.isVisible,
            'hero.isActive:', serviceData?.moduleStates?.hero?.isActive,
            'hero.isVisible:', serviceData?.moduleStates?.hero?.isVisible
          )
        )}

        {/* Diğer bölümler şimdilik statik veya boş kalabilir */}
        {/* Örnek:
        <TocAndCtaSection tocTitle="İçindekiler" tocItems={[]} ctaDescription="Detaylar yakında..." />
        <ImageMarquee images={[]} />
        ... vb.
        */}

        {/* Her bölüm için moduleStates kontrolü yaparak bölümleri göster/gizle */}
        
        {/* TOC & CTA Bölümü */}
        {/* TOC & CTA Bölümü - Hem toc hem de tocSection anahtarlarını kontrol ediyoruz */}
        {(
          // TOC için iki olası anahtarı da kontrol ediyoruz
          (serviceData?.moduleStates?.tocSection?.isActive !== false && serviceData?.moduleStates?.tocSection?.isVisible !== false) ||
          (serviceData?.moduleStates?.toc?.isActive !== false && serviceData?.moduleStates?.toc?.isVisible !== false)
        ) ? (
          <>
            {console.log('[Render] TOC modülü render ediliyor', 
              'tocSection.isActive:', serviceData?.moduleStates?.tocSection?.isActive, 
              'tocSection.isVisible:', serviceData?.moduleStates?.tocSection?.isVisible,
              'toc.isActive:', serviceData?.moduleStates?.toc?.isActive,
              'toc.isVisible:', serviceData?.moduleStates?.toc?.isVisible
            )}
            <TocAndCtaSection
              tocTitle={serviceData?.tocTitle ?? "İçindekiler"}
              tocItems={serviceData?.tocItems ?? []}
              tocAuthorInfo={serviceData?.tocAuthorInfo ?? ""}
              ctaDescription={serviceData?.tocCtaDescription ?? ""}
            />
          </>
        ) : (
          console.log('[Render] TOC modülü gizli, sebep:', 
            'tocSection.isActive:', serviceData?.moduleStates?.tocSection?.isActive, 
            'tocSection.isVisible:', serviceData?.moduleStates?.tocSection?.isVisible,
            'toc.isActive:', serviceData?.moduleStates?.toc?.isActive,
            'toc.isVisible:', serviceData?.moduleStates?.toc?.isVisible
          )
        )}
        
        {/* Marquee Bölümü - Tüm olası anahtarları kontrol ediyoruz */}
        {(
          // Hem 'marqueeSection' hem de 'marquee' anahtarlarını kontrol ediyoruz
          (serviceData?.moduleStates?.marqueeSection?.isActive !== false && serviceData?.moduleStates?.marqueeSection?.isVisible !== false) || 
          (serviceData?.moduleStates?.marquee?.isActive !== false && serviceData?.moduleStates?.marquee?.isVisible !== false)
        ) && serviceData?.marqueeImages && serviceData.marqueeImages.length > 0 ? (
          <>
            {console.log('[Render] Marquee modülü render ediliyor', 
              'marqueeSection.isActive:', serviceData?.moduleStates?.marqueeSection?.isActive, 
              'marqueeSection.isVisible:', serviceData?.moduleStates?.marqueeSection?.isVisible,
              'marquee.isActive:', serviceData?.moduleStates?.marquee?.isActive,
              'marquee.isVisible:', serviceData?.moduleStates?.marquee?.isVisible
            )}
            <ImageMarquee images={serviceData.marqueeImages} />
          </>
        ) : (
          console.log('[Render] Marquee modülü gizli, sebep:', 
                    'marqueeSection.isActive:', serviceData?.moduleStates?.marqueeSection?.isActive, 
                    'marqueeSection.isVisible:', serviceData?.moduleStates?.marqueeSection?.isVisible,
                    'marquee.isActive:', serviceData?.moduleStates?.marquee?.isActive,
                    'marquee.isVisible:', serviceData?.moduleStates?.marquee?.isVisible,
                    'marqueeImages.length:', serviceData?.marqueeImages?.length)
        )}
        
        {/* Tedavi Tanıtım Bölümü - Her iki anahtarı kontrol ediyoruz */}
        {(
          (serviceData?.moduleStates?.introSection?.isActive !== false && serviceData?.moduleStates?.introSection?.isVisible !== false) ||
          (serviceData?.moduleStates?.intro?.isActive !== false && serviceData?.moduleStates?.intro?.isVisible !== false)
        ) && (
          <TreatmentIntroSection
            videoId={serviceData?.introVideoId}
            title={serviceData?.introTitle ?? ""}
            description={serviceData?.introDescription ?? ""}
            primaryButtonText={serviceData?.introPrimaryButtonText ?? ""}
            primaryButtonLink={serviceData?.introPrimaryButtonLink ?? "#"}
            secondaryButtonText={serviceData?.introSecondaryButtonText ?? ""}
            secondaryButtonLink={serviceData?.introSecondaryButtonLink ?? "#"}
            links={serviceData?.introLinks ?? []}
          />
        )}
        
        {/* Genel Bakış Bölümü */}
        {serviceData?.moduleStates?.overviewSection?.isActive !== false && 
         serviceData?.moduleStates?.overviewSection?.isVisible !== false && (
          <div id="1">
            <TreatmentOverview
              sectionTitle={serviceData?.overviewTitle ?? ""}
              sectionDescription={serviceData?.overviewDescription ?? ""}
              tabsData={serviceData?.overviewTabs?.map(tab => ({ ...tab, trigger: tab.triggerText })) ?? []}
            />
          </div>
        )}
        
        {/* Neden Celyxmed Bölümü */}
        {serviceData?.moduleStates?.whySection?.isActive !== false && 
         serviceData?.moduleStates?.whySection?.isVisible !== false && (
          <div id="2">
            <WhyCelyxmed
              sectionTitle={serviceData?.whyTitle ?? ""}
              items={serviceData?.whyItems ?? []}
              backgroundImageUrl={serviceData?.whyBackgroundImageUrl}
            />
          </div>
        )}
        
        {/* Galeri Bölümü */}
        {serviceData?.moduleStates?.gallerySection?.isActive !== false && 
         serviceData?.moduleStates?.gallerySection?.isVisible !== false && (
          <div id="galeri">
            <GallerySection
              sectionTitle={serviceData?.galleryTitle ?? ""}
              sectionDescription={serviceData?.galleryDescription ?? ""}
              images={serviceData?.galleryImages ?? []}
            />
          </div>
        )}
        
        {/* Yorumlar Bölümü */}
        {serviceData?.moduleStates?.testimonialsSection?.isActive !== false && 
         serviceData?.moduleStates?.testimonialsSection?.isVisible !== false && (
          <div id="yorumlar">
            <TestimonialsSection
              title={serviceData?.testimonialsSectionTitle}
              testimonials={serviceData?.testimonials?.map(testimonial => ({
                ...testimonial,
                stars: testimonial.stars ?? 5,
                treatment: testimonial.treatment ?? "",
                imageUrl: testimonial.imageUrl ?? "",
              })) ?? []}
            />
          </div>
        )}
        
        {/* Prosedür Adımları Bölümü */}
        {serviceData?.moduleStates?.stepsSection?.isActive !== false && 
         serviceData?.moduleStates?.stepsSection?.isVisible !== false && (
          <div id="4">
            <ProcedureSteps
              sectionTitle={serviceData?.stepsTitle ?? ""}
              sectionDescription={serviceData?.stepsDescription}
              steps={serviceData?.steps ?? []}
            />
          </div>
        )}
        
        {/* İyileşme Bilgileri Bölümü */}
        {serviceData?.moduleStates?.recoverySection?.isActive !== false && 
         serviceData?.moduleStates?.recoverySection?.isVisible !== false && (
          <div id="5">
            <RecoveryInfo
              sectionTitle={serviceData?.recoveryTitle ?? ""}
              sectionDescription={serviceData?.recoveryDescription}
              items={serviceData?.recoveryItems ?? []}
            />
          </div>
        )}
        
        {/* CTA Bölümü */}
        {serviceData?.moduleStates?.ctaSection?.isActive !== false && 
         serviceData?.moduleStates?.ctaSection?.isVisible !== false && (
          <CtaSection
            tagline={serviceData?.ctaTagline}
            title={serviceData?.ctaTitle ?? ""}
            description={serviceData?.ctaDescription ?? ""}
            buttonText={serviceData?.ctaButtonText ?? ""}
            buttonLink={serviceData?.ctaButtonLink}
            avatars={serviceData?.ctaAvatars ?? []}
            avatarText={serviceData?.ctaAvatarText}
            backgroundImageUrl={serviceData?.ctaBackgroundImageUrl}
            mainImageUrl={serviceData?.ctaMainImageUrl}
            mainImageAlt={serviceData?.ctaMainImageAlt}
          />
        )}
        
        {/* Fiyatlandırma Bölümü */}
        {serviceData?.moduleStates?.pricingSection?.isActive !== false && 
         serviceData?.moduleStates?.pricingSection?.isVisible !== false && (
          <div id="fiyat">
            <PricingSection
              sectionTitle={serviceData?.pricingTitle ?? ""}
              sectionDescription={serviceData?.pricingDescription}
              packages={serviceData?.pricingPackages ?? []}
            />
          </div>
        )}
        
        {/* Uzmanlar Bölümü */}
        {serviceData?.moduleStates?.expertsSection?.isActive !== false && 
         serviceData?.moduleStates?.expertsSection?.isVisible !== false && (
          <div id="7">
            <MeetExperts
              sectionTitle={serviceData?.expertsSectionTitle ?? ""}
              tagline={serviceData?.expertsTagline}
              experts={serviceData?.expertItems ?? []}
            />
          </div>
        )}
        
        {/* SSS Bölümü */}
        {serviceData?.moduleStates?.faqSection?.isActive !== false && 
         serviceData?.moduleStates?.faqSection?.isVisible !== false && (
          <div id="8">
            <FaqSection
              sectionTitle={serviceData?.faqSectionTitle ?? ""}
              sectionDescription={serviceData?.faqSectionDescription}
              faqItems={serviceData?.faqs ?? []}
            />
          </div>
        )}
        
        {/* BlogPreview en alta taşındı - modül kontrolü yapılmıyor çünkü sabit bir bölüm */}
        <BlogPreview />

      </main>
      {/* Footer ve FloatingButtons RootLayoutClient'tan gelecek */}
    </div>
  );
}
