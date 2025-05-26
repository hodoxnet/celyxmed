"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface GalleryImage {
  src: string;
  alt: string;
}

interface ClinicGalleryProps {
  images?: GalleryImage[];
  speed?: number;
}

const ClinicGallery: React.FC<ClinicGalleryProps> = ({
  images = [
    {
      src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a882b66604fbd32f690b_celyxmed-estetik-klinigi-1.avif",
      alt: "Celyxmed Estetik Kliniği 1"
    },
    {
      src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a882b47bbed49bb6e4c6_celyxmed-estetik-klinigi-2.avif",
      alt: "Celyxmed Estetik Kliniği 2"
    },
    {
      src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a8826fdd559adff2ee72_celyxmed-estetik-klinigi-4.avif",
      alt: "Celyxmed Estetik Kliniği 4"
    },
    {
      src: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67e1a8822b3acd0be8b3e11e_celyxmed-estetik-klinigi-3.avif",
      alt: "Celyxmed Estetik Kliniği 3"
    }
  ],
  speed = 3 // Varsayılan hız değeri
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // CSS animation kullanarak daha pürüzsüz sonsuz kaydırma
  const combinedImages = [...images, ...images, ...images, ...images]; // Daha fazla resim ekleyerek kesintisiz akış sağla
  
  return (
    <section className="py-12 sm:py-16 overflow-hidden bg-gray-50">
      <div className="relative max-w-full">
        <div className="overflow-hidden">
          <div 
            className="flex gap-4 whitespace-nowrap animate-marquee"
            style={{
              animationDuration: `${40/speed}s`, // Hıza göre ayarla
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite'
            }}
          >
            {combinedImages.map((image, index) => (
              <div 
                key={index} 
                className="inline-block min-w-[280px] sm:min-w-[320px] md:min-w-[420px] h-[240px] sm:h-[280px] md:h-[320px] rounded-lg overflow-hidden"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={500}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tailwind için özel animasyon tanımlama */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation-name: marquee;
        }
      `}</style>
    </section>
  );
};

export default ClinicGallery;