"use client";

import React from 'react';
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

export default function AboutPage({ params }: AboutPageProps) {
  // props.params Promise'ini React.use ile çözümle
  const resolvedParams = use(params);
  const { locale } = resolvedParams;
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section - CDN URL kullanılarak eklendi */}
        <HeroSection 
          title="Sağlık ve Güzellik Alanında Güvenilir Ortağınız"
          description="Celyxmed, hasta öncelikli bir yaklaşımla kişiselleştirilmiş sağlık çözümleri sunmaya kendini adamıştır. Deneyimli doktorlarımızın son teknoloji tedavilerimiz kadar, insan yolculuğunuzun güvenli, konforlu ve başarılı olmasını sağlamaya kararlıyız."
          imageUrl="https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c184_celyxmed-about-us.avif"
          imageAlt="Celyxmed Hakkımızda"
          primaryButtonText="Kliniğimizi Keşfedin"
          primaryButtonLink="#klinik"
          secondaryButtonText="Doktorlarımızla Tanışın"
          secondaryButtonLink="#doktorlar"
        />
        
        {/* JCI Akreditasyon Bölümü */}
        <JciSection 
          title="Celyxmed ile dünya standartlarında sağlık hizmetini deneyimleyin. Estetik ameliyatlarımız JCI tarafından akredite edilmiş ortak hastanelerde gerçekleştirilir ve en yüksek güvenlik ve bakım standartlarını sağlar."
          primaryButtonText="Kliniğimizi Keşfedin"
          primaryButtonLink="#klinik"
          secondaryButtonText="Doktorlarımızla Tanışın"
          secondaryButtonLink="#doktorlar"
        />
        
        {/* Klinik Galeri Bölümü - Otomatik kaydırma */}
        <ClinicGallery 
          speed={3}
          images={[
            {
              src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a882b66604fbd32f690b_celyxmed-estetik-klinigi-1.avif",
              alt: "Celyxmed Estetik Kliniği 1"
            },
            {
              src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a882b47bbed49bb6e4c6_celyxmed-estetik-klinigi-2.avif",
              alt: "Celyxmed Estetik Kliniği 2"
            },
            {
              src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a8826fdd559adff2ee72_celyxmed-estetik-klinigi-4.avif",
              alt: "Celyxmed Estetik Kliniği 4"
            },
            {
              src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a8822b3acd0be8b3e11e_celyxmed-estetik-klinigi-3.avif",
              alt: "Celyxmed Estetik Kliniği 3"
            }
          ]}
        />
        
        {/* Kapsamlı Bakım Bölümü */}
        <ComprehensiveCareSection 
          items={[
            {
              title: "Varıştan İyileşmeye Kadar Kapsamlı Bakım",
              description: "İlk konsültasyonunuzdan tedavi sonrası iyileşme sürecine kadar her adımda yanınızdayız. Kendini işine adamış ekibimiz, havaalanı transferleri, lüks konaklama ve ihtiyaçlarınıza göre uyarlanmış kişiselleştirilmiş bakım ile sorunsuz bir deneyim sağlar."
            },
            {
              title: "Konforunuz ve Güvenliğiniz için Tasarlandı",
              description: "İstanbul Ataşehir'deki kliniğimiz, size en üst düzeyde bakım sağlamak için en son teknoloji ile donatılmıştır. Estetik ameliyatlarımız JCI akreditasyonuna sahip ortak hastanelerde gerçekleştirilirken, kliniğimiz konsültasyondan tedavi sonrası bakıma kadar konforlu ve sorunsuz bir deneyim sağlar."
            }
          ]}
        />
        
        {/* Why Trust Section - Ana sayfadan eklendi */}
        <WhyTrustSection locale={locale} />

        {/* Doctors Section - Uzman Doktorlar */}
        <DoctorsSection />

        {/* Success Stories Section - Ana sayfadan eklendi */}
        <SuccessStories locale={locale} />

        {/* FAQ Section - Ana sayfadan eklendi */}
        <FaqSection />
      </main>
    </div>
  );
}