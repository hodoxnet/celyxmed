"use client"; // İstemci Bileşeni olarak işaretlemeye devam edelim, alt bileşenler gerektirebilir

// Layout bileşenleri artık RootLayoutClient'da olduğu için burada import etmiyoruz
// FloatingButtons ve Footer importları kaldırıldı (layout'a taşındı)

// Ana sayfa bölüm bileşenlerini import et
import { use } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TreatmentsSection from '@/components/home/TreatmentsSection';
import ClinicShowcaseCarousel from '@/components/home/ClinicShowcaseCarousel'; // Carousel sürümü kullanılıyor
import WhyTrustSection from '@/components/home/WhyTrustSection';
import SuccessStories from '@/components/home/SuccessStories';
import FeaturesTabs from '@/components/home/FeaturesTabs';
import BlogPreview from '@/components/home/BlogPreview';
import FaqSection from '@/components/home/FaqSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import ConsultOnlineSection from '@/components/home/ConsultOnlineSection'; // Yeni bileşeni import et

export default function HomePage(props: { params: Promise<{ locale: string }> }) {
  // props.params Promise'ini React.use ile çözümle
  const params = use(props.params);
  const { locale } = params;
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-0"> {/* Padding kaldırıldı */}
        <HeroSection />
        <WhyChooseSection /> {/* index.html'deki video ve açıklama bölümü */}
        <TreatmentsSection />
        <ClinicShowcaseCarousel />
        <WhyTrustSection locale={locale} />
        <SuccessStories locale={locale} />
        <FeaturesTabs />
        <ConsultOnlineSection locale={locale} /> {/* index.html'deki doktor fotoğraflı bölüm */}
        <BlogPreview />
        <FaqSection />
      </main>
      {/* Footer ve FloatingButtons artık RootLayoutClient içinde olduğu için kaldırıldı */}
    </div>
  );
}
