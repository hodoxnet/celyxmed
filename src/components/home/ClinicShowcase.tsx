import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Buton için
import { ArrowRight } from 'lucide-react'; // İkon için

// Sağ sütunda gösterilecek resim URL'si
const clinicImageUrl = "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b6e872d3351a073b074f22_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif";
// Ana sayfa için başlık, açıklama ve buton metinleri
const sectionTitle = "World-Class Healthcare in State-of-the-Art Clinics2";
const sectionDescription = "Experience top-quality medical care with Celyxmed. Our modern clinic and partnerships with JCI-accredited hospitals ensure safe, effective, and state-of-the-art treatments tailored to your needs.";
const buttonText = "Explore Our Clinic";
const buttonLink = "/klinigimiz"; // Hedef link güncellendi

const ClinicShowcase = () => {
  // TreatmentOverview içindeki TabsContent yapısı ve stilleri temel alındı
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Üstteki sekme yapısı - Burada FeaturesTabs bileşeni kullanılıyor olabilir */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 overflow-x-auto">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white text-gray-600 dark:text-gray-300 flex-1">
              Modern Care
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-600 dark:text-gray-300 flex-1">
              Affordable Quality
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-600 dark:text-gray-300 flex-1">
              Personal Touch
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-600 dark:text-gray-300 flex-1">
              Health & Travel
            </button>
          </div>
        </div>
        
        {/* Kart yapısı - TreatmentOverview'daki gibi stil uygulandı */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
          {/* İki sütunlu grid */}
          <div className="grid md:grid-cols-2 items-center">
            {/* Sol Sütun: Metin İçeriği */}
            <div className="p-8 md:p-12 space-y-6">
              {/* Üstteki küçük etiket/badge */}
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                Advanced Clinic. Trusted Care.
              </span>
              {/* Başlık */}
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">{sectionTitle}</h3>
              {/* Açıklama */}
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base md:text-lg">{sectionDescription}</p>
              {/* Buton - TreatmentOverview'daki buton stili */}
              <div>
                <Link href={buttonLink} className="inline-flex items-center rounded-full overflow-hidden shadow-md group transition-shadow hover:shadow-lg text-white font-medium text-base">
                  {/* İkon Bölümü */}
                  <span className="flex h-12 w-12 items-center justify-center bg-[#d4b978] group-hover:bg-[#c5ad6e] transition-colors">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </span>
                  {/* Metin Bölümü */}
                  <span className="px-6 py-3 bg-teal-600 group-hover:bg-teal-700 transition-colors">
                    {buttonText}
                  </span>
                </Link>
              </div>
            </div>
            {/* Sağ Sütun: Resim - Padding kaldırıldı, yükseklik ayarlandı */}
            <div className="relative h-80 md:h-[450px]">
              <Image
                src={clinicImageUrl}
                alt="Celyxmed Clinic Interior"
                fill
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Düzeltilmiş Image kullanımı:
const ClinicShowcaseCorrected = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Kart yapısı - Daha geniş ve daha dengeli bir görünüm için padding ve margin değerleri ayarlandı */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 md:p-12 max-w-none mx-auto">
          {/* İki sütunlu grid - Gap değeri artırıldı ve hizalama ayarlandı */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Sol Sütun: Metin İçeriği - Boşluk değeri artırıldı */}
            <div className="space-y-6">
              {/* Üstteki küçük etiket/badge - TreatmentOverview'daki gibi stil uygulandı */}
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                Advanced Clinic. Trusted Care.
              </span>
              {/* Başlık - Font boyutu ve ağırlığı ayarlandı */}
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">{sectionTitle}</h3>
              {/* Açıklama - Satır aralığı ve font boyutu ayarlandı */}
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base md:text-lg">{sectionDescription}</p>
              {/* Buton - TreatmentOverview'daki buton stili uygulandı */}
              <Link href={buttonLink} className="inline-flex items-center rounded-full overflow-hidden shadow-md group transition-shadow hover:shadow-lg text-white font-medium text-base">
                {/* İkon Bölümü */}
                <span className="flex h-12 w-12 items-center justify-center bg-[#d4b978] group-hover:bg-[#c5ad6e] transition-colors">
                  <ArrowRight className="h-5 w-5 text-white" />
                </span>
                {/* Metin Bölümü */}
                <span className="px-6 py-3 bg-teal-600 group-hover:bg-teal-700 transition-colors">
                  {buttonText}
                </span>
              </Link>
            </div>
            {/* Sağ Sütun: Resim - Yükseklik değeri artırıldı ve gölge efekti güçlendirildi */}
            <div className="relative h-80 md:h-[450px] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={clinicImageUrl}
                alt="Celyxmed Clinic Interior"
                fill
                style={{ objectFit: "cover" }}
                loading="lazy"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default ClinicShowcaseCorrected; // Düzeltilmiş versiyonu export et
