"use client";

import React, { useEffect, useState, use } from 'react';
// Sadece DoctorsSection import edilecek
import DoctorsSection from '@/components/about/DoctorsSection';
// Link ve Button importları kaldırıldı

interface DoktorlarPageProps {
  params: Promise<{ locale: string }>;
}

interface DoctorData {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  profileUrl: string;
}

// Sadece doktorlar bölümü için gerekli verileri tutacak şekilde güncellendi
interface DoktorlarPageData {
  doctorsSectionTitle: string;
  doctorsSectionDescription: string;
  doctors: DoctorData[];
}

// Sadece doktorlar bölümü için varsayılan veriler
const defaultDoktorlarData: DoktorlarPageData = {
  doctorsSectionTitle: "Uzman Doktorlarımız, Güvenilir Bakım Ekibiniz",
  doctorsSectionDescription: "Celyxmed'de doktorlarımız uzmanlardan daha fazlasıdır - kendilerini kişiselleştirilmiş bakım sağlamaya ve hayat değiştiren sonuçlar elde etmeye adamış, alanlarında lider kişilerdir. Yılların deneyimiyle, sağlık yolculuğunuzun en iyi ellerde olmasını sağlarlar.",
  doctors: [],
};

export default function DoktorlarPage({ params }: DoktorlarPageProps) {
  const resolvedParams = use(params);
  const { locale } = resolvedParams;

  const [pageData, setPageData] = useState<DoktorlarPageData>(defaultDoktorlarData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoktorlarPageData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/about-page?lang=${locale}`); 

        if (response.ok) {
          const data = await response.json();
          // Sadece doktorlar bölümü için gerekli alanları alalım
          setPageData({
            doctorsSectionTitle: data.doctorsTitle || defaultDoktorlarData.doctorsSectionTitle,
            doctorsSectionDescription: data.doctorsDescription || defaultDoktorlarData.doctorsSectionDescription,
            doctors: data.doctors || [], 
          });
        } else {
          console.warn(`Doktorlar sayfası için veri /api/about-page adresinden alınamadı (lang: ${locale}). Varsayılan veriler kullanılıyor.`);
          setPageData(defaultDoktorlarData);
        }
      } catch (error) {
        console.error("Doktorlar sayfası verileri alınırken hata oluştu:", error);
        setPageData(defaultDoktorlarData);
      } finally {
        setLoading(false);
      }
    }

    fetchDoktorlarPageData();
  }, [locale]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow"> {/* container, px, py sınıflarını DoctorsSection kendi içinde yönetmeli */}
        {/* Başlık ve açıklama DoctorsSection bileşenine prop olarak geri gönderiliyor */}
        <DoctorsSection
          title={pageData.doctorsSectionTitle}
          description={pageData.doctorsSectionDescription}
          doctors={pageData.doctors.map(doctor => ({
            id: doctor.id,
            name: doctor.name || "",
            title: doctor.title || "",
            imageUrl: doctor.imageUrl || "", 
            profileUrl: doctor.profileUrl || "#",
          }))}
        />
      </main>
    </div>
  );
}
