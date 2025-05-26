"use client";

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import HeroSection from '@/components/about/HeroSection';
import JciSection from '@/components/about/JciSection';
import ClinicGallery from '@/components/about/ClinicGallery';
import ComprehensiveCareSection from '@/components/about/ComprehensiveCareSection';
import DoctorsSection from '@/components/about/DoctorsSection';
import WhyTrustSection from '@/components/home/WhyTrustSection';
import SuccessStories from '@/components/home/SuccessStories';
import FaqSection from '@/components/home/FaqSection';

// Sayfa parametrelerinin tipini tanımla
interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

interface AboutPageData {
  heroImageUrl: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryButtonText: string;
  heroPrimaryButtonLink: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonLink: string;
  jciTitle: string;
  jciPrimaryButtonText: string;
  jciPrimaryButtonLink: string;
  jciSecondaryButtonText: string;
  jciSecondaryButtonLink: string;
  doctorsTitle: string;
  doctorsDescription: string;
  doctors: Array<{ id: string; name: string; title: string; imageUrl: string; profileUrl: string; description?: string; }>;
  galleryImages: Array<{ imageUrl: string; altText: string; order: number }>;
  careItems: Array<{ title: string; description: string }>;
}

// Varsayılan (fallback) veri
const defaultAboutData: AboutPageData = {
  heroImageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c184_celyxmed-about-us.avif",
  heroTitle: "Sağlık ve Güzellik Alanında Güvenilir Ortağınız",
  heroDescription: "Celyxmed, hasta öncelikli bir yaklaşımla kişiselleştirilmiş sağlık çözümleri sunmaya kendini adamıştır. Deneyimli doktorlarımızın son teknoloji tedavilerimiz kadar, insan yolculuğunuzun güvenli, konforlu ve başarılı olmasını sağlamaya kararlıyız.",
  heroPrimaryButtonText: "Kliniğimizi Keşfedin",
  heroPrimaryButtonLink: "#klinik",
  heroSecondaryButtonText: "Doktorlarımızla Tanışın",
  heroSecondaryButtonLink: "#doktorlar",
  jciTitle: "Celyxmed ile dünya standartlarında sağlık hizmetini deneyimleyin. Estetik ameliyatlarımız JCI tarafından akredite edilmiş ortak hastanelerde gerçekleştirilir ve en yüksek güvenlik ve bakım standartlarını sağlar.",
  jciPrimaryButtonText: "Kliniğimizi Keşfedin",
  jciPrimaryButtonLink: "#klinik",
  jciSecondaryButtonText: "Doktorlarımızla Tanışın",
  jciSecondaryButtonLink: "#doktorlar",
  doctorsTitle: "Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz",
  doctorsDescription: "Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır - kendilerini kişiselleştirilmiş bakım sağlamaya ve hayat değiştiren sonuçlar elde etmeye adamış, alanlarında lider kişilerdir. Yılların deneyimiyle, sağlık yolculuğunuzun en iyi ellerde olmasını sağlarlar.",
  doctors: [],
  galleryImages: [
    {
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a882b66604fbd32f690b_celyxmed-estetik-klinigi-1.avif",
      altText: "Celyxmed Estetik Kliniği 1",
      order: 0
    },
    {
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a882b47bbed49bb6e4c6_celyxmed-estetik-klinigi-2.avif",
      altText: "Celyxmed Estetik Kliniği 2",
      order: 1
    },
    {
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a8826fdd559adff2ee72_celyxmed-estetik-klinigi-4.avif",
      altText: "Celyxmed Estetik Kliniği 4",
      order: 2
    },
    {
      imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a8822b3acd0be8b3e11e_celyxmed-estetik-klinigi-3.avif",
      altText: "Celyxmed Estetik Kliniği 3",
      order: 3
    }
  ],
  careItems: [
    {
      title: "Varıştan İyileşmeye Kadar Kapsamlı Bakım",
      description: "İlk konsültasyonunuzdan tedavi sonrası iyileşme sürecine kadar her adımda yanınızdayız. Kendini işine adamış ekibimiz, havaalanı transferleri, lüks konaklama ve ihtiyaçlarınıza göre uyarlanmış kişiselleştirilmiş bakım ile sorunsuz bir deneyim sağlar."
    },
    {
      title: "Konforunuz ve Güvenliğiniz için Tasarlandı",
      description: "İstanbul Ataşehir'deki kliniğimiz, size en üst düzeyde bakım sağlamak için en son teknoloji ile donatılmıştır. Estetik ameliyatlarımız JCI akreditasyonuna sahip ortak hastanelerde gerçekleştirilirken, kliniğimiz konsültasyondan tedavi sonrası bakıma kadar konforlu ve sorunsuz bir deneyim sağlar."
    }
  ]
};

export default function AboutPage({ params }: AboutPageProps) {
  // props.params Promise'ini React.use ile çözümle
  const resolvedParams = use(params);
  const { locale } = resolvedParams;

  const [aboutData, setAboutData] = useState<AboutPageData>(defaultAboutData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAboutPageData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/about-page?lang=${locale}`);

        if (response.ok) {
          const data = await response.json();

          // API'den gelen veriyi kullan
          setAboutData({
            heroImageUrl: data.heroImageUrl || defaultAboutData.heroImageUrl,
            heroTitle: data.heroTitle || defaultAboutData.heroTitle,
            heroDescription: data.heroDescription || defaultAboutData.heroDescription,
            heroPrimaryButtonText: data.heroPrimaryButtonText || defaultAboutData.heroPrimaryButtonText,
            heroPrimaryButtonLink: data.heroPrimaryButtonLink || defaultAboutData.heroPrimaryButtonLink,
            heroSecondaryButtonText: data.heroSecondaryButtonText || defaultAboutData.heroSecondaryButtonText,
            heroSecondaryButtonLink: data.heroSecondaryButtonLink || defaultAboutData.heroSecondaryButtonLink,
            jciTitle: data.jciTitle || defaultAboutData.jciTitle,
            jciPrimaryButtonText: data.jciPrimaryButtonText || defaultAboutData.jciPrimaryButtonText,
            jciPrimaryButtonLink: data.jciPrimaryButtonLink || defaultAboutData.jciPrimaryButtonLink,
            jciSecondaryButtonText: data.jciSecondaryButtonText || defaultAboutData.jciSecondaryButtonText,
            jciSecondaryButtonLink: data.jciSecondaryButtonLink || defaultAboutData.jciSecondaryButtonLink,
            doctorsTitle: data.doctorsTitle || defaultAboutData.doctorsTitle,
            doctorsDescription: data.doctorsDescription || defaultAboutData.doctorsDescription,
            doctors: data.doctors || [],
            galleryImages: data.galleryImages?.length > 0
              ? data.galleryImages.map((img: any) => ({
                  imageUrl: img.imageUrl,
                  altText: img.altText || "",
                  order: img.order || 0
                }))
              : defaultAboutData.galleryImages,
            careItems: data.careItems?.length > 0
              ? data.careItems.map((item: any) => ({
                  title: item.title,
                  description: item.description
                }))
              : defaultAboutData.careItems
          });
        } else {
          // API'den veri alınamazsa varsayılan verileri kullan
          console.log("Hakkımızda sayfası verileri alınamadı, varsayılan veriler kullanılıyor.");
          setAboutData(defaultAboutData);
        }
      } catch (error) {
        console.error("Veri alınırken hata oluştu:", error);
        setAboutData(defaultAboutData);
      } finally {
        setLoading(false);
      }
    }

    fetchAboutPageData();
  }, [locale]);

  // Galeri resimleri için format dönüşümü
  const galleryImagesParsed = aboutData.galleryImages.map(img => ({
    src: img.imageUrl,
    alt: img.altText
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section - Dinamik veri kullanılarak güncellendi */}
        <HeroSection
          title={aboutData.heroTitle}
          description={aboutData.heroDescription}
          imageUrl={aboutData.heroImageUrl}
          imageAlt="Celyxmed Hakkımızda"
          primaryButtonText={aboutData.heroPrimaryButtonText}
          primaryButtonLink={aboutData.heroPrimaryButtonLink}
          secondaryButtonText={aboutData.heroSecondaryButtonText}
          secondaryButtonLink={aboutData.heroSecondaryButtonLink}
        />

        {/* JCI Akreditasyon Bölümü - Dinamik veri kullanılarak güncellendi */}
        <JciSection
          title={aboutData.jciTitle}
          primaryButtonText={aboutData.jciPrimaryButtonText}
          primaryButtonLink={aboutData.jciPrimaryButtonLink}
          secondaryButtonText={aboutData.jciSecondaryButtonText}
          secondaryButtonLink={aboutData.jciSecondaryButtonLink}
        />

        {/* Klinik Galeri Bölümü - Dinamik veri kullanılarak güncellendi */}
        <ClinicGallery
          speed={3}
          images={galleryImagesParsed}
        />

        {/* Kapsamlı Bakım Bölümü - Dinamik veri kullanılarak güncellendi */}
        <ComprehensiveCareSection
          items={aboutData.careItems}
        />

        {/* Why Trust Section - Ana sayfadan eklendi */}
        <WhyTrustSection locale={locale} />

        {/* Doctors Section - Uzman Doktorlar */}
        <DoctorsSection
          title={aboutData.doctorsTitle}
          description={aboutData.doctorsDescription}
          doctors={aboutData.doctors ? aboutData.doctors.map((doctor: any) => ({
            id: doctor.id,
            name: doctor.name || "",
            title: doctor.title || "",
            imageUrl: doctor.imageUrl || "",
            profileUrl: doctor.profileUrl || "#",
          })) : []}
        />

        {/* Success Stories Section - Ana sayfadan eklendi */}
        <SuccessStories locale={locale} />

        {/* FAQ Section - Ana sayfadan eklendi */}
        <FaqSection />
      </main>
    </div>
  );
}