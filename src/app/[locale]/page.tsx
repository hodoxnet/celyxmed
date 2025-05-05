"use client"; // İstemci Bileşeni olarak işaretlemeye devam edelim, alt bileşenler gerektirebilir

// Layout bileşenlerini import et
import Footer from '@/components/layout/Footer';
import FloatingButtons from '@/components/layout/FloatingButtons';

// Ana sayfa bölüm bileşenlerini import et
import HeroSection from '@/components/home/HeroSection';
import TreatmentsSection from '@/components/home/TreatmentsSection';
import ClinicShowcase from '@/components/home/ClinicShowcase';
import WhyTrustSection from '@/components/home/WhyTrustSection';
import SuccessStories from '@/components/home/SuccessStories';
import FeaturesTabs from '@/components/home/FeaturesTabs';
import BlogPreview from '@/components/home/BlogPreview';
import FaqSection from '@/components/home/FaqSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import ConsultOnlineSection from '@/components/home/ConsultOnlineSection'; // Yeni bileşeni import et

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-0"> {/* Padding kaldırıldı */}
        <HeroSection />
        <WhyChooseSection /> {/* index.html'deki video ve açıklama bölümü */}
        <TreatmentsSection />
        <ClinicShowcase />
        <WhyTrustSection />
        <SuccessStories />
        <FeaturesTabs />
        <ConsultOnlineSection /> {/* index.html'deki doktor fotoğraflı bölüm */}
        <BlogPreview />
        <FaqSection />
      </main>
      <Footer />
      <FloatingButtons /> {/* Bu bileşenin içinde sabit konumlandırma (fixed positioning) yapılması gerekecek */}
    </div>
  );
}
