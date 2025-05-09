'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Klinik görselleri (doğrudan eklenmiş sabit resimler)
const clinicImages = [
  {
    id: "1",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c396_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
    altText: "Celyxmed building entrance with a glass door and reflective windows above."
  },
  {
    id: "2",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c398_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-2.avif",
    altText: "A modern office reception area with a curved desk, two sofas, and large windows."
  },
  {
    id: "3",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c39b_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-3.avif",
    altText: "A large, curved screen displays an underwater scene with fish in a hallway near a reception desk."
  },
  {
    id: "4",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c3a5_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
    altText: "Modern reception area with a desk, computer, and the sign 'Celyxmed' on the wall."
  },
  {
    id: "5",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c399_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-5.avif",
    altText: "A modern dental office with open doors, featuring a glass wall with a decorative pattern."
  },
  {
    id: "6",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c397_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-6.avif",
    altText: "A medical examination room with an adjustable chair, a small desk, and a sink with cabinets."
  }
];

const ClinicShowcaseMarquee = () => {
  const marqueeWrapperRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Animasyon için
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const speed = 150; // Daha yüksek değer = daha yavaş animasyon
    
    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      
      if (deltaTime > 16) { // ~60fps
        lastTime = timestamp;
        setScrollPosition(prev => {
          if (!marqueeWrapperRef.current) return prev;
          
          const firstImage = marqueeWrapperRef.current.querySelector('.marquee-image');
          if (!firstImage) return prev;
          
          const imageWidth = firstImage.clientWidth;
          const imageMargin = 16; // mr-4 = 16px
          
          // İlk görsel + margin kadar kaydığında, sıfırla (sonsuz döngü etkisi için)
          if (prev >= imageWidth + imageMargin) {
            return 0;
          }
          
          // Hız ayarı
          return prev + (deltaTime / speed);
        });
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Sol Sütun: Metin İçeriği */}
          <div className="space-y-6 z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-tight">
              İstanbul'da Son Teknoloji Klinik
            </h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg max-w-prose">
              İstanbul Ataşehir'deki modern kliniğimiz en yüksek güvenlik, hijyen ve konfor standartlarını sağlamak üzere tasarlanmıştır. Estetik ameliyatlarımız JCI tarafından akredite edilmiş ortak hastanelerde gerçekleştirilirken, her adımda sağlığınıza öncelik vererek konsültasyondan iyileşmeye kadar sorunsuz bir deneyim sağlıyoruz.
            </div>
            <div className="pt-4">
              <Link 
                href="/klinigimiz" 
                className="group inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors"
              >
                <span className="mr-3 font-medium">Kliniğimizi Keşfedin</span>
                <div className="h-px w-10 bg-gray-300 relative overflow-hidden">
                  <div className="h-px w-10 bg-teal-600 absolute left-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Sağ Sütun: Kayan Resimler (Marquee) */}
          <div className="relative h-[400px] md:h-[450px] overflow-hidden rounded-xl">
            <div ref={marqueeWrapperRef} className="absolute inset-0">
              <div className="flex whitespace-nowrap">
                {/* Resimleri iki kez göster (sonsuz döngü gösterimi için) */}
                {[...clinicImages, ...clinicImages].map((image, index) => (
                  <div 
                    key={`${image.id}-${index}`} 
                    className="marquee-image inline-block w-[400px] h-full overflow-hidden mr-4 rounded-xl"
                    style={{
                      transform: `translateX(-${scrollPosition}px)`,
                    }}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText}
                      fill
                      sizes="400px"
                      className="object-cover rounded-xl"
                      priority={index < 2} // İlk iki resme öncelik ver
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .marquee-image {
          transition: transform 0.1s linear;
        }
      `}</style>
    </section>
  );
};

export default ClinicShowcaseMarquee;