"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Sağlık ve Güzellik Alanında Güvenilir Ortağınız",
  description = "Celyxmed, hasta öncelikli bir yaklaşımla kişiselleştirilmiş sağlık çözümleri sunmaya kendini adamıştır. Deneyimli doktorlarımızın son teknoloği tedavilerimiz kadar, insan yolculuğunuzun güvenli, konforlu ve başarılı olmasını sağlamaya kararlıyız.",
  imageUrl = "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c184_celyxmed-about-us.avif", // CDN URL kullanıldı
  imageAlt = "Celyxmed Hakkımızda",
  primaryButtonText = "Kliniğimizi Keşfedin",
  primaryButtonLink = "#klinik",
  secondaryButtonText = "Doktorlarımızla Tanışın",
  secondaryButtonLink = "#doktorlar"
}) => {
  return (
    <section className="relative h-screen flex items-center text-white overflow-hidden">
      {/* Arka Plan Resmi */}
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        style={{ objectFit: 'cover' }}
        quality={85}
        priority
        className="z-0"
      />
      
      {/* Renk Overlay'i - Sadece hafif karartma */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      {/* İçerik - Sol tarafa hizalandı */}
      <div className="relative z-20 container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">{title}</h1>
          <p className="text-base sm:text-lg text-gray-200 mb-12">{description}</p>

          {/* Butonlar */}
          <div className="flex flex-wrap gap-6">
            {primaryButtonText && primaryButtonLink && (
              <Link 
                href={primaryButtonLink} 
                className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-200 rounded-full px-5 py-2 transition duration-300 ease-in-out"
              >
                <div className="bg-[#4a8f9c] rounded-full p-1.5 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{primaryButtonText}</span>
              </Link>
            )}
            
            {secondaryButtonText && secondaryButtonLink && (
              <Link 
                href={secondaryButtonLink} 
                className="flex items-center justify-center text-white hover:text-gray-300 hover:bg-white/10 rounded-full px-5 py-2 transition duration-300 ease-in-out"
              >
                <span className="font-medium">{secondaryButtonText}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;