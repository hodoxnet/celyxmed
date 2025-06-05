"use client";

// src/components/hizmet-detay/TocAndCtaSection.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SecondaryAnimatedButton, LinkAnimatedButton } from '@/components/ui/animated-button';
import TableOfContentsAccordion from './TableOfContents';

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
            <p 
              className="text-3xl font-normal text-gray-700 dark:text-gray-300 leading-none my-4 block" 
              style={{ 
                fontSize: '2rem', 
                lineHeight: '1',
                marginBlockStart: '1em',
                marginBlockEnd: '1em', 
                marginInlineStart: '0px',
                marginInlineEnd: '0px',
                unicodeBidi: 'isolate'
              }}
            >
              {ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              {/* Ana Buton - Teal arkaplan + altın ikon */}
              <SecondaryAnimatedButton 
                href={primaryButtonLink}
                icon={ArrowRight}
                iconPosition="left"
                className="[&>div]:bg-[#D4AF37]"
              >
                {primaryButtonText}
              </SecondaryAnimatedButton>
              
              {/* İkincil Buton - Sade text link */}
              <LinkAnimatedButton 
                href={secondaryButtonLink}
                showIcon={false}
                className="text-gray-800 hover:text-gray-600"
              >
                {secondaryButtonText}
              </LinkAnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TocAndCtaSection;
