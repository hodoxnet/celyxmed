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
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              {/* Ana Buton - Teal arkaplan + altın ikon */}
              <Link href={primaryButtonLink} className="flex items-center gap-2 bg-[#486F79] hover:bg-[#3a5a63] text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300">
                <div className="bg-[#D4AF37] rounded-lg p-1.5 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-satoshi-bold">{primaryButtonText}</span>
              </Link>
              {/* İkincil Buton - Sade text link */}
              <Link href={secondaryButtonLink} className="text-gray-800 hover:text-gray-600 transition-colors duration-300 text-sm font-bold flex items-center">
                {secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TocAndCtaSection;
