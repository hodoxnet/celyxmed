import React from 'react';
import { Button } from '@/components/ui/button'; // Buton için
import Link from 'next/link'; // Linkler için
import Image from 'next/image'; // Arka plan görseli için

const HeroSection = () => {
  return (
    // Yüksekliği tam ekran yapalım (h-screen)
    <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
      {/* Arka Plan Görseli (şimdilik statik) */}
      <Image
        src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b76225b3622d69b5b3ef61_hair-transplant-clinic-in-turkey-celyxmed%20(2).avif"
        alt="Celyxmed Clinic"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="absolute inset-0 z-0"
        priority // İlk yüklenen büyük görsel olduğu için öncelik verelim
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* İçerik */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-3xl">
          Your Journey to Health and Beauty Begins Here
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Thousands of international patients trust Celyxmed for premium{' '}
          <strong>Bariatric Surgery</strong>, <strong>Plastic Surgery</strong>,{' '}
          <strong>Dental Aesthetics</strong>, <strong>Hair Transplant</strong>, and{' '}
          <strong>Medical Aesthetics</strong>. Discover personalized care at our clinic in Ataşehir, Istanbul, Turkey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            {/* index.html'deki gibi #tedavilerimiz ID'sine gitmek yerine ilgili sayfaya yönlendirme daha uygun olabilir */}
            <Link href="/#treatments"> {/* Örnek link, ID'ye scroll için farklı bir yapı gerekir */}
              Learn More About Our Treatments
              {/* İkon eklenebilir */}
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black" asChild>
            <Link href="/contact">
              Book Your Free Consultation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
