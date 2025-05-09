'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ClinicShowcaseStatic = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Sol Sütun: Metin İçeriği */}
          <div className="space-y-6">
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
          
          {/* Sağ Sütun: Statik Resimler */}
          <div className="grid grid-cols-2 gap-4">
            {/* İlk Resim */}
            <div className="h-[350px] rounded-xl overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src="https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c39b_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-3.avif"
                  alt="A large, curved screen displays an underwater scene with fish in a hallway near a reception desk."
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* İkinci Resim */}
            <div className="h-[350px] rounded-xl overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src="https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c3a5_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif"
                  alt="Modern reception area with a desk, computer, and the sign 'Celyxmed' on the wall."
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicShowcaseStatic;