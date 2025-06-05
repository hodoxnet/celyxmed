// src/components/hizmet-detay/CtaSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PrimaryAnimatedButton } from '@/components/ui/animated-button';

// Avatar verisi tipi
interface Avatar {
  id: string;
  src: string;
  alt: string;
  isBlurred?: boolean; // Bulanık ve +50 uzman metni için
}

interface CtaSectionProps {
  tagline?: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  avatars?: Avatar[];
  avatarText?: string;
  backgroundImageUrl?: string; // Opsiyonel arka plan resmi
  mainImageUrl?: string; // Opsiyonel ana görsel (soldaki)
  mainImageAlt?: string;
}

const CtaSection: React.FC<CtaSectionProps> = ({
  tagline = "Be Your Best",
  title,
  description,
  buttonText,
  buttonLink,
  avatars = [],
  avatarText = "Doktorunuzu Seçin, Sorularınızı Sorun",
  backgroundImageUrl, // Arka plan resmi prop'u
  mainImageUrl = "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c14c_book-your-free-consultation.avif", // Varsayılan ana görsel
  mainImageAlt = "Online danışmanlık için gülen kadın",
}) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Ana Banner Wrapper */}
        <div
          className="rounded-2xl overflow-hidden relative p-8 md:p-12 lg:p-16"
          style={backgroundImageUrl ? { 
            backgroundImage: `url(${backgroundImageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundColor: '#29707a'
          } : { backgroundColor: '#29707a' }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sol Taraf: Ana Görsel */}
            {mainImageUrl && (
              <div className="relative aspect-[6/5] lg:aspect-[5/4] rounded-xl overflow-hidden order-last lg:order-first min-h-[300px] lg:min-h-[400px]">
                <Image
                  src={mainImageUrl}
                  alt={mainImageAlt}
                  fill
                  style={{ objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
            )}

            {/* Sağ Taraf: İçerik */}
            <div className="flex flex-col items-start text-white">
              {/* Etiket */}
              {tagline && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {tagline}
                </div>
              )}

              {/* Başlık */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>

              {/* Açıklama */}
              <p className="text-base text-white/80 mb-8">{description}</p>

              {/* Avatarlar */}
              {avatars.length > 0 && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex -space-x-3">
                    {avatars.map((avatar) => (
                      <div key={avatar.id} className="relative h-10 w-10 rounded-full border-2 border-teal-600 dark:border-teal-700 overflow-hidden">
                        <Image
                          src={avatar.src}
                          alt={avatar.alt}
                          fill
                          style={{ objectFit: 'cover' }}
                          className={avatar.isBlurred ? 'blur-sm' : ''}
                        />
                        {avatar.isBlurred && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white text-[10px] leading-tight font-medium text-center">
                            <span>+50</span>
                            <span>Uzman</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {avatarText && <p className="text-sm text-white/70">{avatarText}</p>}
                </div>
              )}

              {/* Buton - TreatmentOverview stili */}
              <PrimaryAnimatedButton 
                href={buttonLink || "/iletisim"}
                icon={ArrowRight}
                iconPosition="left"
                size="lg"
                className="[&>div]:bg-[#29707a] gap-3"
              >
                {buttonText}
              </PrimaryAnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
