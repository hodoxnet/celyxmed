"use client";

// src/components/hizmet-detay/TocAndCtaSection.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; // İkonu ArrowRight olarak güncelleyelim
import TableOfContentsAccordion from './TableOfContents'; // Az önce güncellediğimiz bileşen

// İçerik öğesi tipi (TableOfContents bileşeninden kopyalandı, idealde paylaşılan bir types dosyasında olmalı)
interface ContentItem {
  id: string;
  text: string;
  isBold?: boolean;
  level?: number;
}


interface TocAndCtaSectionProps {
  // Sol Sütun (TOC) Props
  tocTitle: string;
  tocItems: ContentItem[];
  tocAuthorInfo?: string;

  // Sağ Sütun Props
  ctaDescription: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const TocAndCtaSection: React.FC<TocAndCtaSectionProps> = ({
  tocTitle,
  tocItems,
  tocAuthorInfo,
  ctaDescription,
  primaryButtonText = "Konsültasyon", // Görseldeki gibi
  primaryButtonLink = "/iletisim",
  secondaryButtonText = "Detayları Gör", // Görseldeki gibi
  secondaryButtonLink = "#detaylar" // Sayfa içi link
}) => {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-950"> {/* Arka plan rengi ve padding */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Sol Sütun: İçindekiler Akordeonu */}
          <div className="lg:sticky lg:top-24"> {/* Sticky yapışkanlık için */}
             <TableOfContentsAccordion
               title={tocTitle}
               items={tocItems}
               authorInfo={tocAuthorInfo}
             />
          </div>

          {/* Sağ Sütun: Açıklama ve Butonlar */}
          <div className="space-y-6">
            <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
              {ctaDescription}
            </p>
            <div className="flex flex-wrap items-center gap-4"> {/* items-center eklendi */}
               {/* Ana Buton (Görseldeki gibi) - Düzeltilmiş yapı */}
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
               <Button size="lg" variant="link" asChild className="text-gray-800 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 px-0 font-medium">
                 <Link href={secondaryButtonLink}>
                   {secondaryButtonText}
                 </Link>
               </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TocAndCtaSection;
