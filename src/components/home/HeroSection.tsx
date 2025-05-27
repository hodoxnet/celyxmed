"use client"; 

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react'; // Default import kullanılıyor
import Autoplay from 'embla-carousel-autoplay'; // Autoplay tekrar eklendi
import { useParams } from 'next/navigation'; 

// API'den gelen veri tipleri
interface HeroTranslation {
  title?: string | null;
  description?: string | null;
  button1Text?: string | null;
  button1Link?: string | null;
  button2Text?: string | null;
  button2Link?: string | null;
}

interface HeroImage {
  id: string;
  imageUrl: string;
}

interface HeroData {
  translation: HeroTranslation | null;
  images: HeroImage[];
}

const HeroSection = () => {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'tr'; 
  const [heroData, setHeroData] = useState<HeroData>({ translation: null, images: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Embla Carousel (Autoplay ile)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchHeroData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/hero-content?lang=${locale}`);
        if (!response.ok) {
          throw new Error('Hero verileri getirilemedi');
        }
        const data: HeroData = await response.json();
        setHeroData(data);
      } catch (error) {
        console.error("Error fetching hero content:", error);
        setHeroData({ translation: null, images: [] }); // Hata durumunda boş veri
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, [locale]);

  // Yükleme durumu
  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center text-center text-white bg-gray-700">
        <p>Yükleniyor...</p>
      </section>
    );
  }

  // Veri yoksa veya resim yoksa gösterilecek varsayılan içerik
  const defaultContent = {
      title: "Your Journey to Health and Beauty Begins Here",
      description: "Thousands of international patients trust Celyxmed...",
      button1Text: "Learn More About Our Treatments",
      button1Link: "/#treatments",
      button2Text: "Book Your Free Consultation",
      button2Link: "/contact",
  };

  const translation = heroData.translation ?? defaultContent; // Gelen çeviri yoksa varsayılanı kullan
  const images = heroData.images;

  // Eğer hiç resim yoksa, belki statik bir resim veya farklı bir fallback gösterilebilir
  if (images.length === 0) {
     return (
      <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
        {/* Statik Fallback Resmi */}
        <Image
          src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b76225b3622d69b5b3ef61_hair-transplant-clinic-in-turkey-celyxmed%20(2).avif" 
          alt="Celyxmed Clinic"
          fill style={{ objectFit: 'cover' }} quality={90} className="absolute inset-0 z-0" priority
        />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        {/* İçerik (varsayılan veya gelen çeviri) */}
         <div className="relative z-20 container mx-auto px-4 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 max-w-4xl leading-tight">
              {translation.title}
            </h1>
            {translation.description && (
              <p className="text-lg md:text-xl mb-10 max-w-3xl">
                {translation.description}
              </p>
            )}
             <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {translation.button1Text && translation.button1Link && (
                <Link href={translation.button1Link} className="flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-full shadow-lg transition-all duration-300">
                  <div className="bg-[#4a8f9c] rounded-full p-2 flex items-center justify-center"><ArrowRight className="h-5 w-5 text-white" /></div>
                  <span className="text-base font-medium">{translation.button1Text}</span>
                </Link>
              )}
              {translation.button2Text && translation.button2Link && (
                 <Link href={translation.button2Link} className="flex items-center justify-center bg-transparent text-white hover:bg-white/10 px-8 py-4 rounded-full shadow-lg transition-all duration-300 text-base font-bold">
                  {translation.button2Text}
                </Link>
              )}
            </div>
          </div>
      </section>
    );
  }

  // Resimler varsa slider'ı göster
  return (
    <section className="relative h-screen overflow-hidden text-white">
      {/* Arka Plan Resim Slider'ı */}
      <div className="absolute inset-0 z-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div key={image.id} className="relative flex-[0_0_100%] h-full">
              <Image
                src={image.imageUrl}
                alt={translation.title || `Arka plan ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                quality={90}
                priority={index === 0} // İlk resim için priority
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Sabit İçerik */}
      <div className="relative z-20 h-full flex items-center justify-center text-center">
          <div className="container mx-auto px-4 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 max-w-4xl leading-tight">
              {translation.title}
            </h1>
            {translation.description && (
              <p className="text-lg md:text-xl mb-10 max-w-3xl">
                {translation.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {translation.button1Text && translation.button1Link && (
                <Link href={translation.button1Link} className="flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-full shadow-lg transition-all duration-300">
                  <div className="bg-[#4a8f9c] rounded-full p-2 flex items-center justify-center"><ArrowRight className="h-5 w-5 text-white" /></div>
                  <span className="text-base font-medium">{translation.button1Text}</span>
                </Link>
              )}
              {translation.button2Text && translation.button2Link && (
                 <Link href={translation.button2Link} className="flex items-center justify-center bg-transparent text-white hover:bg-white/10 px-8 py-4 rounded-full shadow-lg transition-all duration-300 text-base font-bold">
                  {translation.button2Text}
                </Link>
              )}
            </div>
          </div>
      </div>

       {/* Slider Navigasyon Butonları Kaldırıldı */}
      {/* {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/30 hover:bg-white/50 text-white"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/30 hover:bg-white/50 text-white"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )} */}
    </section>
  );
};

export default HeroSection;
