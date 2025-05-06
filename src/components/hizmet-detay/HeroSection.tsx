// src/components/hizmet-detay/HeroSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react'; // İkonu ArrowLeft olarak değiştirelim (görseldeki gibi)

interface HeroSectionProps {
  breadcrumb: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  breadcrumb,
  title,
  description,
  imageUrl,
  imageAlt,
  primaryButtonText = "Detayları Gör",
  primaryButtonLink = "#detaylar", // Sayfa içi link için
  secondaryButtonText = "Konsültasyon",
  secondaryButtonLink = "/iletisim"
}) => {
  return (
    <section className="relative h-screen flex items-end text-white overflow-hidden"> {/* h-screen ve overflow-hidden */}
      {/* Arka Plan Resmi */}
      <Image
        src={imageUrl}
        alt={imageAlt}
        layout="fill"
        objectFit="cover"
        quality={85}
        priority // İlk yüklenen önemli resim olduğu için priority
        className="z-0" // İçeriğin arkasında kalması için
      />
      {/* Gradient Overlay */}
      {/* Gradient Overlay - Daha belirgin */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>

      {/* İçerik - Konumlandırma ve padding ayarlandı */}
      <div className="relative z-20 container mx-auto px-6 lg:px-8 pb-20 md:pb-28 lg:pb-32 w-full max-w-7xl"> {/* Daha geniş container ve padding */}
        <div className="max-w-xl"> {/* İçerik genişliği */}
          <p className="text-sm text-gray-300 mb-3">{breadcrumb}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">{title}</h1>
          <p className="text-base sm:text-lg text-gray-200 mb-10">{description}</p>

          {/* Butonlar - Görseldeki gibi */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-gray-200 rounded-full px-6 py-3 group">
              <Link href={primaryButtonLink}>
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" /> {/* İkon sola */}
                {primaryButtonText}
              </Link>
            </Button>
            {/* İkinci butonun stili görseldeki gibi link değil, text */}
            <Button size="lg" variant="ghost" asChild className="text-white hover:text-gray-300 hover:bg-white/10 rounded-full px-6 py-3">
              <Link href={secondaryButtonLink}>
                {secondaryButtonText}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
