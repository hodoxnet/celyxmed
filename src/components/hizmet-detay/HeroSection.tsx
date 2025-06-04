// src/components/hizmet-detay/HeroSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react'; // İkonu ArrowLeft olarak değiştirelim (görseldeki gibi)

interface HeroSectionProps {
  // breadcrumb prop'u kaldırıldı, otomatik oluşturulacak
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
  title,
  description,
  imageUrl,
  imageAlt,
  primaryButtonText = "Detayları Gör",
  primaryButtonLink = "#detaylar", // Sayfa içi link için
  secondaryButtonText = "Konsültasyon",
  secondaryButtonLink = "/iletisim"
}) => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // İlk segment genellikle dil kodu olur
  
  // Breadcrumb oluştur
  const homeLabelMap: Record<string, string> = {
    'tr': 'Anasayfa',
    'en': 'Home',
    'de': 'Startseite',
    'ru': 'Главная',
    'fr': 'Accueil',
    'es': 'Inicio',
    'it': 'Home',
    // Diğer diller eklenebilir
  };
  
  const servicesLabelMap: Record<string, string> = {
    'tr': 'Hizmetler',
    'en': 'Services',
    'de': 'Dienste',
    'ru': 'Услуги',
    'fr': 'Services',
    'es': 'Servicios',
    'it': 'Servizi',
    // Diğer diller eklenebilir
  };
  
  const homeLabel = homeLabelMap[locale] || 'Home';
  const servicesLabel = servicesLabelMap[locale] || 'Services';
  const dynamicBreadcrumb = `${homeLabel} > ${servicesLabel} > ${title}`;

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

      {/* İçerik - Eski site layout'ına göre */}
      <div className="relative z-20 w-full h-full flex flex-col justify-end items-center pb-20 md:pb-28 lg:pb-32">
        <div className="container mx-auto px-6 lg:px-8 max-w-7xl w-full">
          {/* Breadcrumb ve Title */}
          <div className="max-w-4xl">
            <p className="text-xs text-gray-300 mb-2">{dynamicBreadcrumb}</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{title}</h1>
          </div>
          
          {/* Description ve Butonlar - Full width container */}
          <div className="relative mb-10 w-full">
            <div className="max-w-3xl">
              <p className="text-sm sm:text-base text-gray-200 leading-normal">{description}</p>
            </div>
            
            {/* Butonlar - Sayfanın sağ kenarına yaslanmış */}
            <div className="absolute top-0 right-0 flex items-start gap-4">
            <Link 
              href={primaryButtonLink}
              className="inline-flex items-center bg-[#D4AF37] hover:bg-[#B8941F] text-[rgb(40,56,73)] font-medium px-6 py-3 rounded-full transition-all duration-300 group"
            >
              <div className="flex items-center">
                <ArrowLeft className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="text-sm font-medium">{primaryButtonText}</span>
              </div>
            </Link>
            <Link 
              href={secondaryButtonLink}
              className="inline-flex items-center text-white hover:text-gray-300 font-medium px-6 py-3 rounded-full transition-all duration-300"
            >
              <span className="text-sm font-medium">{secondaryButtonText}</span>
            </Link>
            </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
