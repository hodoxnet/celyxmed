// src/components/hizmet-detay/MeetExperts.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Link bileşenini import et
import { Button } from '@/components/ui/button';

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
    <section className="py-16 bg-gray-50 dark:bg-gray-900"> {/* Arka plan rengi */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Metin İçeriği */}
          <div className="space-y-4">
            {tagline && (
              <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mb-2">
                {tagline}
              </div>
            )}
            <h2 className="text-3xl font-bold">{sectionTitle}</h2>
            <p className="text-gray-600 dark:text-gray-400">{expert.description}</p>
            <Button asChild size="lg">
              <Link href={expert.ctaLink || '/iletisim'}>{expert.ctaText || 'Online Danışma'}</Link>
            </Button>
          </div>
          {/* Uzman Resmi */}
          <div className="relative aspect-square rounded-lg overflow-hidden mx-auto lg:mx-0 max-w-md w-full"> {/* Resim alanı */}
            <Image
              src={expert.imageUrl}
              alt={expert.imageAlt}
              layout="fill"
              objectFit="cover"
              loading="lazy"
              className="rounded-lg"
            />
             {/* İsteğe bağlı olarak isim ve unvan resmin üzerine eklenebilir */}
             {/* <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-4 w-full rounded-b-lg">
               <h3 className="font-semibold">{expert.name}</h3>
               <p className="text-sm">{expert.title}</p>
             </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetExperts;
