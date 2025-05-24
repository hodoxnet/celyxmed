"use client";

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import ClinicShowcaseCarousel from '@/components/home/ClinicShowcaseCarousel';
import DoctorsSection from '@/components/about/DoctorsSection';
import WhyTrustSection from '@/components/home/WhyTrustSection';
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

export default function ClinicPage({ params }: ClinicPageProps) {
  const resolvedParams = use(params);
  const { locale } = resolvedParams;
  
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        const response = await fetch(`/api/about-page?lang=${locale}`);

        if (response.ok) {
          const data = await response.json();
          const doctorsData = data.doctors ? data.doctors.map((doctor: any) => ({
            id: doctor.id,
            name: doctor.name || "",
            title: doctor.title || "",
            imageUrl: doctor.imageUrl || "",
            profileUrl: doctor.profileUrl || "#",
          })) : [];
          setDoctors(doctorsData);
        }
      } catch (error) {
        console.error("Doktor verileri alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, [locale]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Bölümü */}
        <section className="pt-40 md:pt-48 pb-16 md:pb-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
                Son Teknoloji Kliniğimizde Birinci Sınıf Bakımı Deneyimleyin
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                İstanbul Ataşehir'deki JCI akreditasyonlu kliniğimiz, en son teknolojiyi ve hasta öncelikli bir yaklaşımı sunmaktadır. İlk konsültasyonunuzdan tedavi sonrası bakıma kadar güvenli, konforlu ve kişiselleştirilmiş bir sağlık hizmeti yolculuğu sağlıyoruz.
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
          title="Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz"
          description="Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır - kendilerini kişiselleştirilmiş bakım sağlamaya ve hayat değiştiren sonuçlar elde etmeye adamış, alanlarında lider kişilerdir. Yılların deneyimiyle, sağlık yolculuğunuzun en iyi ellerde olmasını sağlarlar."
          doctors={doctors}
        />
        
        {/* 10.000'den Fazla Başarılı Tedavi - Sağlığınız Güvenilir Ellerde */}
        <WhyTrustSection locale={locale} />
        
        {/* Yorumlar Alanı */}
        <SuccessStories locale={locale} />
        
        {/* Doktorlarımıza Online Danışın */}
        <ConsultOnlineSection locale={locale} />
      </main>
    </div>
  );
}