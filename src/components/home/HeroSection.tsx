import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
      {/* Arka Plan Görseli */}
      <Image
        src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b76225b3622d69b5b3ef61_hair-transplant-clinic-in-turkey-celyxmed%20(2).avif"
        alt="Celyxmed Clinic"
        fill
        style={{ objectFit: 'cover' }}
        quality={90}
        className="absolute inset-0 z-0"
        priority
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* İçerik */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl leading-tight">
          Your Journey to Health and Beauty Begins Here
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-3xl">
          Thousands of international patients trust Celyxmed for premium{' '}
          <span className="font-semibold">Bariatric Surgery</span>, <span className="font-semibold">Plastic Surgery</span>,{' '}
          <span className="font-semibold">Dental Aesthetics</span>, <span className="font-semibold">Hair Transplant</span>, and{' '}
          <span className="font-semibold">Medical Aesthetics</span>. Discover personalized care at our clinic in Ataşehir, Istanbul, Turkey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link 
            href="/#treatments"
            className="flex items-center gap-3 bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-full shadow-lg transition-all duration-300"
          >
            <div className="bg-[#4a8f9c] rounded-full p-2 flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-medium">Learn More About Our Treatments</span>
          </Link>
          
          <Link 
            href="/contact"
            className="flex items-center justify-center bg-transparent text-white hover:bg-white/10 px-8 py-4 rounded-full shadow-lg transition-all duration-300 text-base font-bold"
          >
            Book Your Free Consultation
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
