"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Shadcn Button kullanılıyor
import { ImageOff, ArrowRight } from 'lucide-react'; // ImageOff ve ArrowRight ikonlarını ekle

interface TreatmentLink {
  id: string; // Bölüm ID'si (örn. '#1', '#fiyat')
  number: string; // Sıra numarası (örn. '01', '02')
  text: string;
}

interface TreatmentIntroSectionProps {
  videoId?: string; // YouTube video ID (örn. '2edpx39Iy8g')
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string; // Genel bakış bölümüne link (örn. '#1')
  links: TreatmentLink[];
}

const TreatmentIntroSection: React.FC<TreatmentIntroSectionProps> = ({
  videoId,
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  links,
}) => {
  // videoEmbedUrl kaldırıldı
  // const videoEmbedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <section id="detaylar" className="tedavi-y bg-gray-50 py-16 md:py-24">
      {/* Ana container (ortalanmış ve padding'li) */}
      <div className="container mx-auto px-4">
        {/* Kart yapısı (index.html'deki banner-bg-2'ye benzer) */}
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
          {/* İki sütunlu grid yapısı (index.html'deki integrations-banner-2) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Sol Sütun (index.html: integrations-banner-left) */}
            <div className="flex flex-col space-y-6">
            {/* Video Alanı */}
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md">
              {videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ImageOff className="h-16 w-16 text-gray-400" /> {/* Video yoksa placeholder */}
                </div>
              )}
            </div>
              {/* Başlık ve Açıklama (index.html: integrations-banner-heading-2) */}
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  <strong>{title}</strong>
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">{description}</p>
              </div>
              {/* Butonlar (index.html: double-button) - Güncellenmiş stil */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
                 {/* Ana Buton (Görseldeki gibi) - Yeni stil */}
                 <Button size="lg" asChild className="bg-teal-600 text-white hover:bg-teal-700 rounded-full pl-2 pr-6 py-2 group shadow-md">
                   <Link href={primaryButtonLink} className="flex items-center gap-2"> {/* Link içine flex eklendi */}
                     {/* İkon Alanı */}
                     <span className="bg-amber-400 p-2 rounded-full inline-flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-teal-800 transition-transform duration-300 group-hover:translate-x-1" />
                     </span>
                     {/* Metin Alanı */}
                     <span className="font-semibold">{primaryButtonText}</span> {/* Metni span içine aldık */}
                   </Link>
                 </Button>
                 {/* İkincil Buton (Metin Linki) */}
                 <Button asChild variant="link" size="lg" className="text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 px-0 py-3 font-medium">
                   <Link href={secondaryButtonLink}>{secondaryButtonText}</Link>
                 </Button>
              </div>
            </div>

            {/* Sağ Sütun - Linkler (index.html: integrations-banner-right) */}
            <div className="flex flex-col">
              {links.map((link, index) => (
                // index.html: integrations-row
                <div key={link.id} className={`integrations-row ${index !== links.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  {/* index.html: integrations-row-content - Güncellenmiş hover efekti */}
                  <Link href={link.id} className="flex items-center space-x-4 py-4 rounded-md transition-all duration-150 px-3 -mx-3 group"> {/* hover:bg-gray-100 kaldırıldı, transition-all ve group eklendi */}
                    <div className="opacity-70 flex-shrink-0">
                      <div className="text-lg text-gray-400 font-medium w-8 text-right">{link.number}</div>
                    </div>
                    {/* Yazı rengi hover ve aşağı kayma animasyonu eklendi */}
                    <span className="text-lg text-gray-800 group-hover:text-teal-600 flex-1 transition-all duration-150 group-hover:translate-y-0.5">
                      {link.text}
                    </span>
                  </Link>
                </div>
              ))}
            </div>

          </div> {/* grid kapanışı */}
        </div> {/* Kart (bg-white) kapanışı */}
      </div> {/* container kapanışı */}
    </section> // section kapanışı - Düzeltildi
  );
};

export default TreatmentIntroSection;
