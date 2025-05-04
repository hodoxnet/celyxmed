// src/app/[locale]/hizmetler/[slug]/page.tsx
"use client"; // Gerekli olabilecek istemci tarafı etkileşimleri için

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingButtons from '@/components/layout/FloatingButtons';
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
import CtaSection from '@/components/hizmet-detay/CtaSection'; // Yeni bileşeni import et
import ImageMarquee from '@/components/hizmet-detay/ImageMarquee'; // Yeni marquee bileşenini import et
import TreatmentIntroSection from '@/components/hizmet-detay/TreatmentIntroSection'; // Yeni intro bölümünü import et
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
}

// Sayfa parametrelerinin tipini tanımla
interface ServiceDetailPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { locale, slug } = params;

  // --- Temsili Veri Getirme Mantığı ---
  // Gerçek uygulamada bu kısım async olacak ve API/CMS/DB'den veri çekecek
  const getServiceData = (serviceSlug: string): ServiceData | null => {
    if (serviceSlug === 'anne-estetigi') {
      // index.html'den alınan İçindekiler verisi
      const tocItems: ContentItem[] = [
        { id: 'toc-1', text: 'Anne Estetiği Nedir?', isBold: true },
        { id: 'toc-1.1', text: '1.1 Anne Estetiği Prosedürlerine Genel Bakış' },
        { id: 'toc-1.2', text: '1.2 Birden Fazla Ameliyatı Birleştirmenin Faydaları' },
        { id: 'toc-1.3', text: '1.3 Anne Estetiği Vücut Güvenini Geri Kazanmaya Nasıl Yardımcı Olur?' },
        { id: 'toc-2', text: 'Anne Estetiğinde Popüler Prosedürler', isBold: true },
        { id: 'toc-2.1', text: '2.1 Meme Dikleştirme veya Büyütme' },
        { id: 'toc-2.1.1', text: '2.1.1 Lift ve Augmentasyon Arasında Seçim Yapmak' },
        { id: 'toc-2.1.2', text: '2.1.2 Türkiye\'de Meme Cerrahisi Maliyeti' },
        { id: 'toc-2.2', text: '2.2 Karın Germe (Abdominoplasti)' },
        { id: 'toc-2.2.1', text: '2.2.1 Türkiye\'de Karın Germe Maliyeti' },
        { id: 'toc-2.2.2', text: '2.2.2 Abdominoplasti için İyileşme Süresi' },
        { id: 'toc-2.3', text: '2.3 Şekillendirme için Liposuction' },
        { id: 'toc-2.3.1', text: '2.3.1 Vücut Şekillendirme için Liposuction Türleri' },
        { id: 'toc-2.3.2', text: '2.3.2 Hedef Bölgeler: Bel, Uyluk ve Kalçalar' },
        { id: 'toc-2.4', text: '2.4 Ek Prosedürler: Vajinal Gençleştirme ve Cilt Sıkılaştırma' },
        { id: 'toc-3', text: 'Türkiye\'de Anne Estetiği Maliyeti', isBold: true },
        { id: 'toc-3.1', text: '3.1 Maliyet Karşılaştırması: Türkiye ve Diğer Ülkeler' },
        { id: 'toc-3.2', text: '3.2 Anne Estetiği Fiyatını Etkileyen Faktörler' },
        { id: 'toc-3.3', text: '3.3 Uluslararası Hastalar için Ödeme Planları ve Finansman Seçenekleri' },
        { id: 'toc-4', text: 'Anne Estetiği İçin Neden Türkiye\'yi Seçmelisiniz?', isBold: true },
        { id: 'toc-4.1', text: '4.1 Türkiye\'de Estetik Ameliyat Olmanın Faydaları' },
        { id: 'toc-4.2', text: '4.2 Deneyimli Cerrahlar ve Yüksek Kaliteli Bakım' },
        { id: 'toc-4.3', text: '4.3 Uluslararası Hastalar için Kapsamlı Paketler' },
        { id: 'toc-5', text: 'Türkiye\'de Anne Estetiği İçin Doğru Kliniği Seçmek', isBold: true },
        { id: 'toc-5.1', text: '5.1 İstanbul\'da Anne Estetiği İçin En İyi Klinikler' },
        { id: 'toc-5.2', text: '5.2 Antalya ve Diğer Şehirlerde Anne Estetiği Seçenekleri' },
        { id: 'toc-5.3', text: '5.3 Klinik Seçerken Dikkate Alınması Gereken Faktörler' },
        { id: 'toc-6', text: 'Anne Estetiği için Hazırlık', isBold: true },
        { id: 'toc-6.1', text: '6.1 Ameliyat Öncesi Konsültasyon ve Sağlık Değerlendirmeleri' },
        { id: 'toc-6.2', text: '6.2 Yaşam Tarzı ve Diyet Önerileri' },
        { id: 'toc-6.3', text: '6.3 Uluslararası Hastalar için Seyahat ve Konaklama İpuçları' },
        { id: 'toc-7', text: 'Anne Estetiği Sonrası İyileşme ve Bakım', isBold: true },
        { id: 'toc-7.1', text: '7.1 Ameliyat Sonrası Bakım Kılavuzları' },
        { id: 'toc-7.2', text: '7.2 Kombine Ameliyatlar için Beklenen İyileşme Zaman Çizelgesi' },
        { id: 'toc-7.3', text: '7.3 Uzun Vadeli Bakım ve Takip' },
        { id: 'toc-8', text: 'Anne Estetiği için Başarı Hikayeleri ve Hasta Yorumları', isBold: true },
        { id: 'toc-8.1', text: '8.1 Gerçek Hasta Görüşleri ve Deneyimleri' },
        { id: 'toc-8.2', text: '8.2 Anne Estetiği Öncesi ve Sonrası Fotoğraflar' },
        { id: 'toc-8.3', text: '8.3 Sonuçlar ve Kurtarma Hakkında Sıkça Sorulan Sorular' },
        { id: 'toc-9', text: 'Türkiye\'de Anne Estetiği Hakkında Sıkça Sorulan Sorular', isBold: true },
        { id: 'toc-9.1', text: '9.1 Annelik Estetiği İçin İyileşme Süresi Ne Kadardır?' },
        { id: 'toc-9.2', text: '9.2 Genellikle Hangi Prosedürler Dahil Edilir?' },
        { id: 'toc-9.3', text: '9.3 Doğumdan Ne Kadar Sonra Anne Estetiği Yaptırabilirim?' },
      ];

      return {
        breadcrumb: 'Celyxmed > Plastik Cerrahi > Anne Estetiği (Mommy Makeover)',
        title: 'Anne Estetiği (Mommy Makeover)',
        description: 'Doğum sonrası vücudunuzu yeniden şekillendirin! İstanbul’da Celyxmed ile karın germe, meme estetiği, liposuction ve vajinal estetik gibi kombine operasyonlarla kişiye özel “Mommy Makeover” estetik çözümleri sunuyoruz.',
        heroImageUrl: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21c_mommy-makeover-in-turkey.avif',
        heroImageAlt: 'Anne Estetiği (Mommy Makeover) Arka Plan Resmi',
        tocAndCta_tocTitle: 'İçindekiler',
        tocAndCta_tocAuthorInfo: 'İçerik Yazarı: Op. Dr. Kemal Aytuğlu (Plastik Cerrah)\nSon Güncelleme: 10 Ocak 2025', // \n ile yeni satır
        tocAndCta_tocItems: tocItems,
        tocAndCta_ctaDescription: "Uzun araştırmaları atlayın ve yanıtları doğrudan uzmanlarımızdan alın. Tedavi seçeneklerinizi tartışmak, istediğiniz her şeyi sormak ve hızlı, güvenilir ve güvenebileceğiniz uzmanlardan kişiselleştirilmiş rehberlik almak için ücretsiz bir çevrimiçi konsültasyon rezervasyonu yapın.", // index.html'den alındı
        // index.html'deki id="galeri" bölümünden alınan resimler
        marqueeImages: [
          { src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21d_6666e56289b64376560fbf2b_before-after-photos-mommy-makeover-in-turkey%20(1).avif", alt: "Anne Estetiği Öncesi Sonrası Karşılaştırma 1" },
          { src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21e_6666e56471a7665b7b3b6ede_before-after-photos-mommy-makeover-in-turkey%20(1).avif", alt: "Anne Estetiği Öncesi Sonrası Karşılaştırma 2" },
          { src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21f_6666e56740fcd9aa812b7fd6_before-after-photos-mommy-makeover-in-turkey%20(2).avif", alt: "Anne Estetiği Öncesi Sonrası Karşılaştırma 3" },
          { src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c225_6666e569b5a7d5128dd99a9e_before-after-photos-mommy-makeover-in-turkey%20(3)%20(1).avif", alt: "Anne Estetiği Öncesi Sonrası Karşılaştırma 4" },
        ],
        // TreatmentIntroSection verileri (index.html'den alındı)
        treatmentIntro_videoId: '2edpx39Iy8g', // YouTube video ID'si
        treatmentIntro_title: 'Cerrahınızla Tanışın ve Tedaviniz Hakkında Bilgi Edinin',
        treatmentIntro_description: 'Cerrahınızı tanıyın ve tedavi yolculuğunuzun her ayrıntısını keşfedin. İlk konsültasyondan iyileşmeye kadar, sağlık hedeflerinize uygun güvenli, etkili ve kişiselleştirilmiş bakımı nasıl sağladığımızı keşfedin. Dönüşümünüz doğru uzmanın yanınızda olmasıyla başlar.',
        treatmentIntro_primaryButtonText: 'Ücretsiz Konsültasyonunuzu Yaptırın',
        treatmentIntro_primaryButtonLink: '/iletisim', // İletişim sayfasına link
        treatmentIntro_secondaryButtonText: 'Tedaviye Genel Bakış',
        treatmentIntro_secondaryButtonLink: '#1', // Genel Bakış bölümünün ID'si
        treatmentIntro_links: [
          { id: '#1', number: '01', text: 'Tedaviye Genel Bakış' },
          { id: '#2', number: '02', text: 'Anne Estetiği İçin Neden Celyxmed\'i Seçmelisiniz?' },
          { id: '#galeri', number: '03', text: 'Başarı Hikayeleri, Öncesi & Sonrası Sonuçlar, Yorumlar' }, // Galeri ID'si kullanıldı
          { id: '#4', number: '04', text: 'Prosedür Nasıl İşliyor?' },
          { id: '#5', number: '05', text: 'İyileşme ve Bakım Sonrası' },
          { id: '#fiyat', number: '06', text: 'Fiyatlandırma & Paketler' }, // Fiyatlandırma ID'si varsayıldı
          { id: '#7', number: '07', text: 'Uzmanlarımızla Tanışın' },
          { id: '#8', number: '08', text: 'Sıkça Sorulan Sorular (SSS)' },
          { id: '/iletisim', number: '09', text: 'Ücretsiz Konsültasyonunuzu Yaptırın' }, // Link olarak ayarlandı
        ],
        overviewSectionTitle: "Türkiye'de Anne Estetiği Tedavisine Genel Bakış",
        overviewSectionDescription: "JCI onaylı kliniklerde Türkiye'nin en iyi uzmanlarından kişiselleştirilmiş tedavileri deneyimleyin. Celyxmed, sağlığınız için güvenilir sağlık hizmetlerini uygun fiyatlı çözümlerle birleştirir.",
        overviewTabsData: [
          {
            value: "nedir",
            trigger: "Bu Tedavi Nedir?",
            title: "Anne Estetiği Nedir?",
            content: "Mommy Makeover, doğum sonrası yaygın değişiklikleri ele alarak kadınların hamilelik öncesi vücutlarına kavuşmalarına yardımcı olmak için tasarlanmış dönüştürücü bir kozmetik prosedürdür. Bu kişiselleştirilmiş cerrahi kombinasyon genellikle karın germe, göğüs dikleştirme veya büyütme ve vücut hatlarını eski haline getirmek için liposuction içerir. Gevşek cildi sıkılaştırarak ve vücut şeklini geliştirerek, güveni artırır ve genel refahı destekler.",
            imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c362_what-is-mommy-makeover.avif",
            imageAlt: "Karnındaki deriyi hafifçe çeken, açık renkli iç çamaşırı ve sütyen giyen bir kişi.",
            buttonText: "Dönüşümünüzü Başlatın"
          },
          {
            value: "kimin-icin",
            trigger: "Kimin için?",
            title: "Anne Makyajından Kimler Yararlanabilir?",
            content: "Doğumdan sonra hamilelik öncesi vücutlarına kavuşmak isteyen kadınlar için Mommy Makeover önerilir. Fazla deri, sarkık göğüsler veya diyet ve egzersize yanıt vermeyen inatçı yağlarla mücadele ediyorsanız, bu kişiselleştirilmiş prosedür özgüveninizi yeniden kazanmanıza, görünümünüzü iyileştirmenize ve genel refahınızı artırmanıza yardımcı olabilir.",
            imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c1e4_who-can-benefit-from-gastric-sleeve-surgery.avif", // Placeholder resim
            imageAlt: "Bir kişi, görüntülü görüşme sırasında dizüstü bilgisayar ekranındaki gülümseyen bir kadına el sallıyor.",
            buttonText: "Dönüşümünüzü Başlatın"
          },
          {
            value: "nasil-calisir",
            trigger: "Nasıl Çalışıyor?",
            title: "Anne Estetiği Nasıl Yapılır?",
            content: "Mommy Makeover, ilk konsültasyondan tam iyileşmeye kadar çok adımlı bir süreçtir. Prosedür genellikle hamilelik öncesi vücudunuzu eski haline getirmek için karın germe, göğüs büyütme ve liposuction işlemlerini birleştirir. Kişiselleştirilmiş tedavi sonrası bakım, optimum iyileşme ve uzun vadeli sonuçlar sağlayarak minimum iyileşme süresiyle yenilenmiş, kendine güvenen bir görünüm elde etmenize yardımcı olur.",
            imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c1e5_how-does-gastric-sleeve-surgery-work.avif", // Placeholder resim
            imageAlt: "Ameliyat sırasında cerrahi aletleri değiştiren mavi önlüklü ve eldivenli cerrahlar.",
            buttonText: "Dönüşümünüzü Başlatın"
          },
          {
            value: "sonuclar",
            trigger: "Beklenen Sonuçlar ve Faydalar",
            title: "Anne Makyajının Beklenen Sonuçları ve Faydaları",
            content: "Anne Makyajı, fiziksel dönüşümden daha fazlasını sağlar - vücut güvenini geri kazandırır, öz saygıyı artırır ve genel görünümünüzü gençleştirir. Uzun süreli sonuçlar, gelişmiş vücut konturu ve kendinizi nasıl hissettiğinizde önemli bir artış bekleyin, kendinizin daha sağlıklı, daha mutlu bir versiyonunu kucaklamanıza yardımcı olun.",
            imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c1e6_expected-results-and-benefits-of-gastric-sleeve-surgery.avif", // Placeholder resim
            imageAlt: "Beyaz iç çamaşırı giyen bir kadının kilo vermeden önceki ve sonraki vücudunun yan yana iki görüntüsü.",
            buttonText: "Dönüşümünüzü Başlatın"
          }
        ],
        whySectionTitle: "Anne Estetiği İçin Neden Celyxmed'e Güvenmelisiniz?",
        whySectionBackgroundImageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21c_mommy-makeover-in-turkey.avif", // Sağlanan URL eklendi
        whyItems: [
          { id: 'why-1', number: '01', title: 'Modern Klinik', description: 'İstanbul\'daki modern, JCI akreditasyonlu kliniğimizde en üst düzey bakımı deneyimleyin. Mommy Makeover yolculuğunuz boyunca güvenliğinizi, rahatınızı ve huzurunuzu garanti etmek için uluslararası sağlık standartlarını koruyoruz.' },
          { id: 'why-2', number: '02', title: 'Deneyimli Plastik Cerrahlar', description: 'Op. Dr. Kemal Aytuğlu liderliğindeki yetenekli plastik cerrahlarımız, dönüştürücü kozmetik prosedürlerde 25 yılı aşkın uzmanlığa sahiptir. Binlerce kadının özgüvenlerini yeniden kazanmalarına ve estetik hedeflerine ulaşmalarına başarıyla yardımcı olan ellere güvenin.' },
          { id: 'why-3', number: '03', title: 'Kişiselleştirilmiş Tedavi Planları', description: 'Her hastanın yolculuğu benzersizdir. Özel vücut hedeflerinize ve ihtiyaçlarınıza göre kişiselleştirilmiş Mommy Makeover tedavi planları oluşturarak optimum sonuçlar ve uzun vadeli memnuniyet sağlıyoruz.' },
          { id: 'why-4', number: '04', title: 'Yüksek Hasta Memnuniyeti', description: '10.000\'den fazla başarılı prosedürle Celyxmed, dünya çapındaki hastalar için güvenilir bir seçimdir. Kendine güvenen, gençleşmiş bireylerden oluşan büyüyen topluluğumuzun bir parçası olun.' }
        ],
        gallerySectionTitle: "Hayat Değiştiren Anne Estetiği Dönüşümleri",
        gallerySectionDescription: "Mommy Makeover prosedürlerinin hastalarımızın çarpıcı vücut dönüşümleri elde etmelerine nasıl yardımcı olduğunu görün. Bu hayat değiştiren kozmetik yolculuğun etkisini anlamak için öncesi ve sonrası fotoğraflarını ve kişisel hikayelerini keşfedin.",
        galleryImages: [
           { id: 'gal-1', src: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21d_6666e56289b64376560fbf2b_before-after-photos-mommy-makeover-in-turkey%20(1).avif', alt: 'Anne Estetiği Öncesi Sonrası 1' },
           { id: 'gal-2', src: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21e_6666e56471a7665b7b3b6ede_before-after-photos-mommy-makeover-in-turkey%20(1).avif', alt: 'Anne Estetiği Öncesi Sonrası 2' },
           { id: 'gal-3', src: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c21f_6666e56740fcd9aa812b7fd6_before-after-photos-mommy-makeover-in-turkey%20(2).avif', alt: 'Anne Estetiği Öncesi Sonrası 3' },
           { id: 'gal-4', src: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c225_6666e569b5a7d5128dd99a9e_before-after-photos-mommy-makeover-in-turkey%20(3)%20(1).avif', alt: 'Anne Estetiği Öncesi Sonrası 4' }
           // Daha fazla resim eklenebilir
        ],
        stepsSectionTitle: "Anne Estetiği Nasıl Yapılır?",
        stepsSectionDescription: "Mommy Makeover, hamilelik sonrası vücudunuzu restore etmek ve geliştirmek için birden fazla ameliyatı birleştiren kişiselleştirilmiş bir kozmetik prosedürdür. Gelişmiş cerrahi teknikler kullanılarak tipik olarak karın germe, göğüs dikleştirme veya büyütme ve liposuction içerir. Bu kapsamlı yaklaşım gevşek cildi sıkılaştırır, vücudu yeniden şekillendirir ve özgüveninizi yeniden kazanmanıza yardımcı olarak görünümünüzden uzun süreli memnuniyet duymanızı sağlar.",
        stepsData: [
          { id: 'step-1', title: 'Ameliyat Öncesi Konsültasyon', description: 'Mommy Makeover yolculuğunuz kapsamlı bir konsültasyonla başlar. Bu seans sırasında cerrahınız hedeflerinizi tartışacak, vücudunuzu değerlendirecek ve ihtiyaçlarınıza göre kişiselleştirilmiş bir tedavi planı tasarlayacaktır.', linkText: 'Op. Dr. Kemal Aytuğlu\'ndan Online Randevu Alın' },
          { id: 'step-2', title: 'Anestezi ve Hazırlık', description: 'İşlem günü, rahat ve ağrısız bir deneyim sağlamak için genel anestezi altına alınacaksınız. Cerrahi ekip tedavi alanlarını hazırlayacak ve süreç boyunca hassasiyet ve güvenlik sağlayacaktır.', linkText: 'Op. Dr. Kemal Aytuğlu\'ndan Online Randevu Alın' },
          { id: 'step-3', title: 'Kombine Cerrahi Prosedürler', description: 'Mommy Makeover tipik olarak karın germe, göğüs dikleştirme veya büyütme ve liposuction gibi prosedürlerin bir kombinasyonunu içerir. Bu ameliyatlar, vücudunuzun hatlarını eski haline getirmek, fazla deriyi almak ve genel figürünüzü geliştirmek için tek seansta gerçekleştirilir.', linkText: 'Op. Dr. Kemal Aytuğlu\'ndan Online Randevu Alın' },
          { id: 'step-4', title: 'Kapanış ve İyileşme', description: 'Prosedürler tamamlandıktan sonra, yara izini en aza indirmek için kesiler gelişmiş dikiş teknikleri kullanılarak dikkatlice kapatılır. İlk iyileşme döneminde yakından izlenecek ve ardından optimum iyileşme ve uzun vadeli sonuçlar sağlamak için kişiselleştirilmiş bir bakım sonrası planı uygulanacaktır.', linkText: 'Op. Dr. Kemal Aytuğlu\'ndan Online Randevu Alın' },
          // Beşinci adım eklendi
          { id: 'step-5', title: 'Takip ve Sonuçlar', description: 'Ameliyat sonrası düzenli takip randevuları ile iyileşme süreciniz yakından izlenir. Nihai sonuçlar genellikle birkaç ay içinde ortaya çıkar ve uzun süreli memnuniyet hedeflenir.', linkText: 'Sonuçları Görün' }
        ],
        recoverySectionTitle: "Anne Estetiğinden Sonra Sizi Neler Bekler?",
        recoverySectionDescription: "İyileşme süreciniz en az ameliyatın kendisi kadar önemlidir. Celyxmed'de, sorunsuz, güvenli ve rahat bir iyileşme süreci sağlamak için ayrıntılı bir bakım sonrası planı sunuyoruz. Kişiselleştirilmiş diyet rehberliğinden 7/24 tıbbi desteğe kadar, yolun her adımında size yardımcı olmak için buradayız.",
        recoveryItems: [
          {
            id: 'rec-1',
            title: 'Ameliyat Sonrası Yolculuğunuz',
            description: 'Çoğu hasta, Mommy Makeover prosedüründen sonraki saatler içinde hafifçe hareket etmeye teşvik edilir ve genellikle 1-2 gün içinde taburcu edilir. İlk birkaç hafta, kompresyon giysileri giymek ve yorucu aktivitelerden kaçınmak da dahil olmak üzere ameliyat sonrası özel bakım talimatlarına uymanız gerekecektir. Ekibimiz, sorunsuz, başarılı bir iyileşme ve optimum sonuçlar sağlamak için her aşamada size rehberlik edecektir.',
            imageUrl: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c1fc_your-post-surgery-journey.avif',
            imageAlt: 'Ameliyat sırasında cerrahlar cerrahi aletleri değiştiriyor.'
          },
          {
            id: 'rec-2',
            title: 'Celyxmed\'in Bakım Sonrası Desteği',
            description: 'Bakım sonrası hizmetlerimiz düzenli kontrolleri, ameliyat sonrası bakım uzmanlarına erişimi ve sürekli tıbbi tavsiyeleri içerir. İster iyileşme, ister yara izi bakımı veya fiziksel aktivite hakkında sorularınız olsun, uzmanlarımız Mommy Makeover yolculuğunuz boyunca kendinize güvenmenizi ve desteklenmenizi sağlamak için sadece bir telefon uzağınızda.',
            imageUrl: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c1fd_celyxmeds-aftercare-support.avif',
            imageAlt: 'Hasta ile ilgilenen sağlık personeli.'
          }
        ],
        pricingSectionTitle: "Fiyatlandırma & Paketler",
        // pricingSectionDescription: "Anne estetiği için sunduğumuz paketleri inceleyin.", // Opsiyonel açıklama
        pricingPackages: [
          // Şimdilik boş bırakıyoruz, index.html'de detay yok.
          // Örnek:
          // { id: 'pkg-1', title: 'Standart Paket', price: '$6,000 - $8,000', features: ['Karın Germe', 'Liposuction (Bel)', 'Konaklama (3 Gece)', 'Transferler'], isFeatured: false },
          // { id: 'pkg-2', title: 'Kapsamlı Paket', price: '$8,000 - $10,000', features: ['Karın Germe', 'Meme Dikleştirme/Büyütme', 'Liposuction (Bel + Basen)', 'Konaklama (5 Gece)', 'Transferler', 'Özel Hemşire'], isFeatured: true },
        ],
        expertsSectionTitle: "Celyxmed'de Anne Estetiği Uzmanlarınızla Tanışın",
        expertsTagline: "Doktorumuz Çevrimiçi ve Konsültasyona Hazır",
        expertsData: [
          {
            id: 'exp-1',
            name: 'Op. Dr. Kemal Aytuğlu',
            title: 'Plastik, Rekonstrüktif ve Estetik Cerrahi Uzmanı',
            description: 'Plastik ve rekonstrüktif cerrahi alanında 25 yılı aşkın deneyime sahip Op. Dr. Kemal Aytuğlu liderliğindeki uzman ekibimiz, binlerce kişinin çarpıcı vücut dönüşümleri elde etmesine yardımcı oldu. Gelişmiş cerrahi teknikleri kişiselleştirilmiş bakımla birleştiren uzmanlarımız, Mommy Makeover yolculuğunuzun konsültasyondan iyileşmeye kadar güvenli, konforlu ve başarılı olmasını sağlar.',
            imageUrl: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c5dd_op-dr-kemal-aytuglu-celyxmed.avif',
            imageAlt: 'Op. Dr. Kemal Aytuğlu Celyxmed Kliniği önünde',
            ctaText: 'Çevrimiçi Danışma'
          }
          // Daha fazla uzman eklenebilir
        ],
        faqSectionTitle: "Anne Estetiği Hakkında Sıkça Sorulan Sorular ve Cevapları",
        faqSectionDescription: "Anne Estetiği yaptırmayı düşünen hastaların genellikle prosedür, iyileşme ve uzun vadeli sonuçlar hakkında soruları vardır. Türk klinikleri, hastaların bilinçli kararlar vermelerine ve seçimlerinde kendilerini güvende hissetmelerine yardımcı olmak için açık ve ayrıntılı yanıtlar vermeye kendini adamıştır. Aşağıda, hayat değiştiren bu estetik ameliyat hakkında en sık sorulan soruları ele alıyoruz.",
        faqItems: [
          // index.html'den alınan SSS verileri (answer kısımları HTML olarak bırakıldı)
          {
            id: 'faq-1',
            question: 'Anne Estetiği Nedir?',
            answer: `<p>Anne Estetiği, kadınların hamilelikten sonra yaşadığı fiziksel değişiklikleri ele almak için özel olarak tasarlanmış bir dizi estetik ameliyattır. Bu prosedürler, sonuçları en üst düzeye çıkarırken iyileşme süresini en aza indirmek için birleştirilir ve yoğun yaşamları olan anneler için ideal bir çözüm haline gelir.</p>
                     <h3>Anne Estetiği Prosedürlerine Genel Bakış</h3>
                     <p>Tipik bir Anne Estetiği şunları içerir:</p>
                     <ul><li>Hacmi geri kazandırmak ve sarkmayı düzeltmek için <strong>meme dikleştirme veya büyütme</strong>.</li><li>Gevşek cildi <strong>sıkılaştırmak</strong> ve karın kaslarını onarmak için <strong>karın germe (abdominoplasti).</strong></li><li>Bel, uyluk ve kalça gibi bölgelerdeki inatçı yağları <strong>almak için liposuction</strong>.</li><li>Hamilelik sonrası diğer endişeleri gidermek için <strong>vajinal gençleştirme veya</strong> <strong>cilt sıkılaştırma</strong> gibi isteğe bağlı prosedürler.</li></ul>
                     <h3>Birden Fazla Ameliyatı Birleştirmenin Faydaları</h3>
                     <p>Kombine bir ameliyat paketini tercih ederek anneler şunları yapabilir:</p>
                     <ul><li>Ayrı prosedürlere kıyasla genel maliyetlerden tasarruf edebilir.</li><li>Arıza süresini azaltarak günlük rutinlerine daha hızlı dönebilirler.</li><li>Vücutlarının benzersiz ihtiyaçlarına göre uyarlanmış sonuçlarla uyumlu bir dönüşüm elde edin.</li></ul>
                     <h3>Anne Estetiği Vücut Güvenini Geri Kazanmaya Nasıl Yardımcı Olur?</h3>
                     <p>Birçok kadın, Anne Estetiğinin ardından özgüvenlerinde önemli bir artış olduğunu bildirmektedir. Hamilelik sonrası vücudu eski haline getirmek yalnızca fiziksel görünümü iyileştirmekle kalmaz, aynı zamanda özgüveni de yenileyerek anneleri kendilerinin en iyi versiyonu gibi hissetmeleri için güçlendirir.</p>`
          },
          {
            id: 'faq-2',
            question: 'Anne Estetiği İçin İyileşme Süresi Ne Kadardır?',
            answer: `<p>İyileşme süreleri, uygulanan prosedürlerin kombinasyonuna bağlı olarak değişir, ancak genel bir kılavuzdur:</p>
                     <ol><li><strong>İlk Hafta:</strong> Dinlenme çok önemlidir ve şişlik veya morarma yaygındır. Ağrı yönetimi ve kısa yürüyüşler gibi hafif hareketlilik iyileşmeye yardımcı olur.</li><li><strong>2-4 Hafta:</strong> Çoğu hasta kendini daha rahat hisseder ve hafif aktivitelere devam edebilir. Şişlik azalmaya başlar ve erken sonuçlar ortaya çıkar.</li><li><strong>6 Hafta ve Sonrası:</strong> Egzersiz de dahil olmak üzere normal rutinler tipik olarak devam edebilir. Hastalar tamamen iyileşmiş hisseder ve nihai sonuçlar zamanla daha görünür hale gelir.</li></ol>`
          },
          {
            id: 'faq-3',
            question: 'Tipik Olarak Hangi Prosedürler Dahil Edilir?',
            answer: `<p>Anne Estetiği, genellikle aşağıdakileri içeren <strong>özelleştirilebilir bir pakettir</strong>:</p>
                     <ul><li><strong>Meme Dikleştirme veya Büyütme:</strong> Hacmi geri kazandırmak ve sarkmayı düzeltmek için.</li><li><strong>Karın Germe (Abdominoplasti):</strong> Gevşek cildi sıkılaştırmak ve ayrılmış karın kaslarını onarmak için.</li><li><strong>Liposuction:</strong> Karın, uyluk veya kalça gibi bölgelerdeki inatçı yağları almak için.</li><li><strong>İsteğe Bağlı Eklentiler:</strong> Vajinal gençleştirme, cilt sıkılaştırma veya çatlak tedavileri.</li></ul>
                     <p>Her plan, bireysel hedefleri karşılayacak şekilde uyarlanır ve <strong>hamilelik sonrası</strong> kapsamlı bir <strong>vücut dönüşümü</strong> sağlar.</p>`
          },
           {
            id: 'faq-4',
            question: 'Doğumdan Ne Kadar Sonra Anne Estetiği Yaptırabilirim?',
            answer: `<p>Cerrahlar, anne estetiği yaptırmadan önce doğumdan sonra en az 6-12 ay beklenmesini <strong>önermektedir</strong>. Bu sayede:</p>
                     <ul><li>Vücudun hamilelik ve doğumdan sonra tamamen iyileşmesi.</li><li>Göğüs boyutunu ve cilt elastikiyetini etkileyen hormonların stabilize olması.</li><li>Hastaların emzirmeyi bitirmesi, büyütme veya dikleştirme gibi prosedürler için stabil meme dokusu sağlanması.</li></ul>`
          }
          // Diğer SSS öğeleri eklenebilir
        ],
        ctaTagline: "Be Your Best",
        ctaTitle: "Doktorlarımıza Online Danışın",
        ctaDescription: "Doğrudan uzmanlarımızdan uzman tavsiyesi alın. Ücretsiz online konsültasyonunuzu yaptırın ve size özel en iyi tedavi seçeneklerini keşfedin.",
        ctaButtonText: "Ücretsiz Konsültasyonunuzu Bugün Yaptırın",
        ctaAvatars: [
          { id: 'avatar-1', src: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c151_op-dr-kemal-aytuglu-plastic-surgeons-in-turkey.avif', alt: 'Op. Dr. Kemal Aytuğlu' },
          { id: 'avatar-2', src: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c152_prof-dr-oge-tascilar-bariatric-surgeons-in-turkey.avif', alt: 'Prof. Dr. Öge Taşçılar' },
          { id: 'avatar-3', src: 'https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c153_dr-fikri-can-ayik-dental-doctor-in-turkey.avif', alt: 'Dr. Fikri Can Ayık' }
          // "+50 uzman" göstergesi için ek avatar eklenebilir veya CtaSection içinde yönetilebilir
        ],
        ctaAvatarText: "Doktorunuzu Seçin, Sorularınızı Sorun",
        // ctaBackgroundImageUrl: 'https://...' // İstenirse arka plan resmi URL'si eklenebilir
      };
    }
    // Diğer slug'lar için veri veya null döndür
    return null;
  };

  const serviceData = getServiceData(slug);
  // --- Veri Getirme Mantığı Sonu ---

  // Veri bulunamazsa gösterilecek içerik
  if (!serviceData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p>Hizmet bulunamadı.</p>
        </main>
        <Footer />
        <FloatingButtons />
      </div>
    );
  }

  // Ana render fonksiyonu - Veri varsa içeriği gösterir
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero ve İçindekiler Bölümleri */}
        <HeroSection
          breadcrumb={serviceData.breadcrumb}
          title={serviceData.title}
          description={serviceData.description}
          imageUrl={serviceData.heroImageUrl}
          imageAlt={serviceData.heroImageAlt}
        />
        {/* Yeni TocAndCtaSection bileşeni kullanılıyor */}
        <TocAndCtaSection
          tocTitle={serviceData.tocAndCta_tocTitle}
          tocItems={serviceData.tocAndCta_tocItems}
          tocAuthorInfo={serviceData.tocAndCta_tocAuthorInfo}
          ctaDescription={serviceData.tocAndCta_ctaDescription}
          // Buton metinleri/linkleri bileşenin varsayılan değerlerini kullanacak
        />

        {/* Yeni Image Marquee Bölümü */}
        {serviceData.marqueeImages && serviceData.marqueeImages.length > 0 && (
          <ImageMarquee images={serviceData.marqueeImages} />
        )}

        {/* Yeni Treatment Intro Bölümü */}
        <TreatmentIntroSection
          videoId={serviceData.treatmentIntro_videoId}
          title={serviceData.treatmentIntro_title}
          description={serviceData.treatmentIntro_description}
          primaryButtonText={serviceData.treatmentIntro_primaryButtonText}
          primaryButtonLink={serviceData.treatmentIntro_primaryButtonLink}
          secondaryButtonText={serviceData.treatmentIntro_secondaryButtonText}
          secondaryButtonLink={serviceData.treatmentIntro_secondaryButtonLink}
          links={serviceData.treatmentIntro_links}
        />

        {/* Tedaviye Genel Bakış Bölümü */}
        {/* Bu bölümün ID'sinin '1' olduğunu varsayıyoruz, gerekirse güncellenmeli */}
        <div id="1">
          <TreatmentOverview
            sectionTitle={serviceData.overviewSectionTitle}
            sectionDescription={serviceData.overviewSectionDescription}
            tabsData={serviceData.overviewTabsData}
          />
        </div>

        {/* Neden Celyxmed Bölümü */}
        {/* Bu bölümün ID'sinin '2' olduğunu varsayıyoruz */}
        <div id="2">
          <WhyCelyxmed
            sectionTitle={serviceData.whySectionTitle}
            items={serviceData.whyItems}
            backgroundImageUrl={serviceData.whySectionBackgroundImageUrl} // Arka plan URL'si prop olarak eklendi
          />
        </div>

        {/* Galeri Bölümü */}
        {/* Bu bölümün ID'sinin 'galeri' olduğunu varsayıyoruz */}
        <div id="galeri">
          <GallerySection
            sectionTitle={serviceData.gallerySectionTitle}
            sectionDescription={serviceData.gallerySectionDescription}
            images={serviceData.galleryImages}
            // İsteğe bağlı buton metinleri ve linkleri de eklenebilir
          />
        </div>

        {/* Prosedür Adımları Bölümü */}
        {/* Bu bölümün ID'sinin '4' olduğunu varsayıyoruz */}
        <div id="4">
          <ProcedureSteps
            sectionTitle={serviceData.stepsSectionTitle}
            sectionDescription={serviceData.stepsSectionDescription}
            steps={serviceData.stepsData}
          />
        </div>

        {/* İyileşme Bilgisi Bölümü */}
        {/* Bu bölümün ID'sinin '5' olduğunu varsayıyoruz */}
        <div id="5">
          <RecoveryInfo
            sectionTitle={serviceData.recoverySectionTitle}
            sectionDescription={serviceData.recoverySectionDescription}
            items={serviceData.recoveryItems}
          />
        </div>

        {/* Fiyatlandırma Bölümü */}
        {/* Bu bölümün ID'sinin 'fiyat' olduğunu varsayıyoruz */}
        <div id="fiyat">
          <PricingSection
            sectionTitle={serviceData.pricingSectionTitle}
            sectionDescription={serviceData.pricingSectionDescription}
            packages={serviceData.pricingPackages}
          />
        </div>

        {/* Uzmanlarla Tanışın Bölümü */}
        {/* Bu bölümün ID'sinin '7' olduğunu varsayıyoruz */}
        <div id="7">
          <MeetExperts
            sectionTitle={serviceData.expertsSectionTitle}
            tagline={serviceData.expertsTagline}
            experts={serviceData.expertsData}
          />
        </div>

        {/* SSS Bölümü */}
        {/* Bu bölümün ID'sinin '8' olduğunu varsayıyoruz */}
        <div id="8">
          <FaqSection
            sectionTitle={serviceData.faqSectionTitle}
            sectionDescription={serviceData.faqSectionDescription}
            faqItems={serviceData.faqItems}
          />
        </div>

        {/* CTA Bölümü */}
        <CtaSection
          tagline={serviceData.ctaTagline}
          title={serviceData.ctaTitle}
          description={serviceData.ctaDescription}
          buttonText={serviceData.ctaButtonText}
          buttonLink={serviceData.ctaButtonLink}
          avatars={serviceData.ctaAvatars}
          avatarText={serviceData.ctaAvatarText}
          backgroundImageUrl={serviceData.ctaBackgroundImageUrl}
        />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
