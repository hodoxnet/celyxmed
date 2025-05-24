"use client";

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import ClinicShowcaseCarousel from '@/components/home/ClinicShowcaseCarousel';
import DoctorsSection from '@/components/about/DoctorsSection';
import SuccessStories from '@/components/home/SuccessStories';
import ConsultOnlineSection from '@/components/home/ConsultOnlineSection';

interface ClinicPageProps {
  params: Promise<{ locale: string }>;
}

interface DoctorData {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  profileUrl: string;
}

interface ClinicPageData {
  heroTitle: string;
  heroDescription: string;
}

interface AboutPageData {
  doctorsTitle: string;
  doctorsDescription: string;
}

export default function ClinicPage({ params }: ClinicPageProps) {
  const resolvedParams = use(params);
  const { locale } = resolvedParams;
  
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [clinicData, setClinicData] = useState<ClinicPageData>({
    heroTitle: "Son Teknoloji Kliniğimizde Birinci Sınıf Bakımı Deneyimleyin",
    heroDescription: "İstanbul Ataşehir'deki JCI akreditasyonlu kliniğimiz, en son teknolojiyi ve hasta öncelikli bir yaklaşımı sunmaktadır. İlk konsültasyonunuzdan tedavi sonrası bakıma kadar güvenli, konforlu ve kişiselleştirilmiş bir sağlık hizmeti yolculuğu sağlıyoruz."
  });
  const [aboutData, setAboutData] = useState<AboutPageData>({
    doctorsTitle: "Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz",
    doctorsDescription: "Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır - kendilerini kişiselleştirilmiş bakım sağlamaya ve hayat değiştiren sonuçlar elde etmeye adamış, alanlarında lider kişilerdir. Yılların deneyimiyle, sağlık yolculuğunuzun en iyi ellerde olmasını sağlarlar."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Doktor verilerini çek
        const aboutResponse = await fetch(`/api/about-page?lang=${locale}`);
        if (aboutResponse.ok) {
          const aboutResponseData = await aboutResponse.json();
          const doctorsData = aboutResponseData.doctors ? aboutResponseData.doctors.map((doctor: any) => ({
            id: doctor.id,
            name: doctor.name || "",
            title: doctor.title || "",
            imageUrl: doctor.imageUrl || "",
            profileUrl: doctor.profileUrl || "#",
          })) : [];
          setDoctors(doctorsData);
          
          // About page verilerini de set et
          setAboutData({
            doctorsTitle: aboutResponseData.doctorsTitle || "Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz",
            doctorsDescription: aboutResponseData.doctorsDescription || "Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır - kendilerini kişiselleştirilmiş bakım sağlamaya ve hayat değiştiren sonuçlar elde etmeye adamış, alanlarında lider kişilerdir. Yılların deneyimiyle, sağlık yolculuğunuzun en iyi ellerde olmasını sağlarlar."
          });
        }

        // Klinik sayfası verilerini çek
        const clinicResponse = await fetch(`/api/clinic-page?lang=${locale}`);
        if (clinicResponse.ok) {
          const clinicPageData = await clinicResponse.json();
          setClinicData({
            heroTitle: clinicPageData.heroTitle || "Son Teknoloji Kliniğimizde Birinci Sınıf Bakımı Deneyimleyin",
            heroDescription: clinicPageData.heroDescription || "İstanbul Ataşehir'deki JCI akreditasyonlu kliniğimiz, en son teknolojiyi ve hasta öncelikli bir yaklaşımı sunmaktadır. İlk konsültasyonunuzdan tedavi sonrası bakıma kadar güvenli, konforlu ve kişiselleştirilmiş bir sağlık hizmeti yolculuğu sağlıyoruz."
          });
        }
      } catch (error) {
        console.error("Veriler alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [locale]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Bölümü */}
        <section className="pt-40 md:pt-48 pb-16 md:pb-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
                {clinicData.heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {clinicData.heroDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Video Alanı - WhyChooseSection */}
        <WhyChooseSection hideTitle={true} hideDescription={true} />
        
        {/* İstanbul'da Son Teknoloji Klinik */}
        <ClinicShowcaseCarousel />
        
        {/* Doktorlarımız - Hakkımızda sayfasından */}
        <DoctorsSection
          title={aboutData.doctorsTitle}
          description={aboutData.doctorsDescription}
          doctors={doctors}
        />
        
        {/* Yorumlar Alanı */}
        <SuccessStories locale={locale} />
        
        {/* Doktorlarımıza Online Danışın */}
        <ConsultOnlineSection locale={locale} />
      </main>
    </div>
  );
}