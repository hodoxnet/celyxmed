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
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            asChild
            className="bg-teal-700 hover:bg-teal-800 text-white rounded-md px-6 py-6 text-base flex items-center gap-2"
          >
            <Link href="/#treatments">
              <ArrowRight className="h-5 w-5" />
              <span>Learn More About Our Treatments</span>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-black rounded-md px-6 py-6 text-base" 
            asChild
          >
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
