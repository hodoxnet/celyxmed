// src/components/hizmet-detay/MeetExperts.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Link bileşenini import et
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; // İkonu import et

// Uzman verisi tipi
interface ExpertData {
  id: string;
  name: string;
  title: string; // Uzmanlık alanı/unvanı
  description: string;
  imageUrl: string;
  imageAlt: string;
  ctaText?: string; // Opsiyonel CTA metni
  ctaLink?: string; // Opsiyonel CTA linki
}

interface MeetExpertsProps {
  sectionTitle: string;
  experts: ExpertData[];
  tagline?: string; // Opsiyonel etiket (örn: "Doktorumuz Çevrimiçi...")
}

const MeetExperts: React.FC<MeetExpertsProps> = ({ sectionTitle, experts, tagline }) => {
  if (!experts || experts.length === 0) {
    return null;
  }

  // Şimdilik sadece ilk uzmanı gösteriyoruz, ileride birden fazla uzman için düzenlenebilir
  const expert = experts[0];

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50"> {/* Section padding azaltıldı: py-12 md:py-16 */}
      <div className="container mx-auto px-4">
        {/* Ana Wrapper - Padding daha da azaltıldı */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 lg:p-10 shadow-lg"> {/* Padding azaltıldı: p-6 md:p-8 lg:p-10 */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center"> {/* Gap daha da azaltıldı: gap-6 lg:gap-10 */}
            {/* Metin İçeriği (Sol Taraf) */}
            <div className="space-y-4"> {/* Dikey boşluk azaltıldı: space-y-4 */}
              {/* Etiket Stili Güncellendi */}
              {tagline && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  {tagline}
                </div>
              )}
              {/* Başlık Stili Güncellendi */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{sectionTitle}</h2>
              {/* Açıklama Stili Güncellendi */}
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{expert.description}</p>
              {/* Buton Stili Güncellendi */}
              <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 rounded-full pl-3 pr-6 py-3 group shadow-md border border-gray-200 dark:border-gray-600">
                 <Link href={expert.ctaLink || '/iletisim'} className="flex items-center gap-3">
                   <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4b978] dark:bg-[#a88d5f]"> {/* İkon arka plan rengi */}
                      <ArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
                   </span>
                   <span className="font-semibold">{expert.ctaText || 'Çevrimiçi Danışma'}</span>
                 </Link>
               </Button>
            </div>
            {/* Uzman Resmi (Sağ Taraf) */}
            {/* max-h-96 kaldırıldı, w-full ve h-auto eklendi */}
            <div className="relative w-full h-auto rounded-xl overflow-hidden shadow-lg">
            <Image
              src={expert.imageUrl}
              alt={expert.imageAlt}
              width={400} // width eklendi
              height={500} // height eklendi (4:5 oranı için)
              objectFit="cover" // objectFit kaldı
              loading="lazy"
              className="rounded-lg w-full h-auto" // layout="fill" kaldırıldı, w-full h-auto eklendi
            />
             {/* İsteğe bağlı olarak isim ve unvan resmin üzerine eklenebilir */}
             {/* <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-4 w-full rounded-b-lg">
               <h3 className="font-semibold">{expert.name}</h3>
               <p className="text-sm">{expert.title}</p>
             </div> */}
          </div>
          </div> {/* Eksik kapanış etiketi eklendi */}
        </div>
      </div>
    </section>
  );
};

export default MeetExperts;
