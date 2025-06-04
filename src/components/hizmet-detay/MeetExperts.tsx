// src/components/hizmet-detay/MeetExperts.tsx
"use client";

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
    <section className="py-8 md:py-10 bg-white dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        {/* Ana Wrapper */}
        <div className="rounded-2xl p-4 md:p-6 lg:p-8 shadow-lg" style={{ backgroundColor: '#f4f5f7' }}>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Metin İçeriği (Sol Taraf) */}
            <div className="space-y-4">
              {/* Mavi Etiket */}
              {tagline && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {tagline}
                </div>
              )}
              {/* Başlık - Koyu Mavi */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white leading-tight">{sectionTitle}</h2>
              {/* Açıklama */}
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{expert.description}</p>
              {/* Altın/Sarı CTA Butonu */}
              <Button size="lg" asChild className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full px-6 py-4 group shadow-lg border-0 transition-all duration-300 hover:shadow-xl">
                 <Link href={expert.ctaLink || '/iletisim'} className="flex items-center gap-3">
                   <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"> 
                      <ArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
                   </span>
                   <span className="font-semibold text-base">{expert.ctaText || 'Çevrimiçi Danışma'}</span>
                 </Link>
               </Button>
            </div>
            {/* Uzman Resmi (Sağ Taraf) */}
            <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden shadow-lg">
            <Image
              src={expert.imageUrl}
              alt={expert.imageAlt}
              fill
              loading="lazy"
              className="rounded-lg object-cover"
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
