"use client";

import React from 'react';
import { use } from 'react';
import HeroSection from '@/components/about/HeroSection';
import JciSection from '@/components/about/JciSection';
import ClinicGallery from '@/components/about/ClinicGallery';
import ComprehensiveCareSection from '@/components/about/ComprehensiveCareSection';
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
        
        {/* Success Stories Section - Ana sayfadan eklendi */}
        <SuccessStories locale={locale} />

        {/* FAQ Section - Ana sayfadan eklendi */}
        <FaqSection />

        {/* Vizyonumuz ve Misyonumuz Bölümü */}
        <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
          {/* Arka plan dekoratif elementleri */}
          <div className="absolute left-0 top-24 w-32 h-32 rounded-full bg-blue-100 opacity-30 -z-10"></div>
          <div className="absolute right-24 bottom-24 w-64 h-64 rounded-full bg-blue-50 opacity-20 -z-10"></div>
          
          <h2 className="text-3xl font-bold mb-16 text-center relative">
            <span className="inline-block relative z-10">
              Vizyonumuz ve Misyonumuz
              <span className="absolute -bottom-3 left-0 right-0 h-2 bg-[#4a8f9c]/30 rounded-full"></span>
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div className="bg-white p-8 rounded-2xl shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#4a8f9c] rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-[#4a8f9c]">Vizyonumuz</h3>
              </div>
              <p className="text-gray-700">
                Celyxmed olarak vizyonumuz, sağlık ve estetik alanında küresel bir marka olmak ve 
                uluslararası standartlarda yenilikçi, güvenilir ve kişiselleştirilmiş sağlık hizmetleri 
                sunarak tüm hastalarımızın yaşam kalitesini artırmaktır.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#4a8f9c] rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-[#4a8f9c]">Misyonumuz</h3>
              </div>
              <p className="text-gray-700">
                Misyonumuz, her hastamızın ihtiyaçlarını ön planda tutarak, en son teknoloji ve 
                bilimsel yöntemlerle, alanında uzman ekibimizle güvenli ve etkili tedavi çözümleri 
                sunmaktır. Hastalarımızın beklentilerini aşan sonuçlar elde etmelerini sağlarken 
                etik değerlerimizden asla ödün vermiyoruz.
              </p>
            </div>
          </div>
        </div>
        
        {/* Değerlerimiz Bölümü */}
        <div className="py-24 bg-gray-50 relative overflow-hidden">
          {/* Arka plan dekoratif elementleri */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-bl-full -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-tr-full -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center relative">
              <span className="inline-block relative z-10">
                Değerlerimiz
                <span className="absolute -bottom-3 left-0 right-0 h-2 bg-[#4a8f9c]/30 rounded-full"></span>
              </span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#4a8f9c] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#4a8f9c]">Hasta Önceliği</h3>
                <p className="text-gray-600">Tüm kararlarımızda hasta sağlığı ve memnuniyetini ön planda tutuyoruz.</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#4a8f9c] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#4a8f9c]">Mükemmellik</h3>
                <p className="text-gray-600">Her aşamada en yüksek kalite standartlarını uyguluyoruz.</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#4a8f9c] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#4a8f9c]">Güven</h3>
                <p className="text-gray-600">Şeffaf iletişim ve dürüst yaklaşımla hastalarımızla güven ilişkisi kuruyoruz.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}