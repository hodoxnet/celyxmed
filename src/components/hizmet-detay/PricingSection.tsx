// src/components/hizmet-detay/PricingSection.tsx
"use client";

import React from 'react';
import Link from 'next/link'; // Link bileşenini import et
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Kart yapısı için

// Fiyatlandırma paketi tipi (Temsili)
interface PricingPackage {
  id: string;
  title: string;
  description?: string;
  price: string; // Fiyat (örn: "$6,000 - $10,000")
  features: string[]; // Dahil olan özellikler listesi
  isFeatured?: boolean; // Öne çıkan paket mi?
}

interface PricingSectionProps {
  sectionTitle: string;
  sectionDescription?: string;
  packages: PricingPackage[];
  contactButtonText?: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  sectionTitle,
  sectionDescription,
  packages,
  contactButtonText = "Detaylı Fiyat ve Paket Bilgisi İçin İletişime Geçin"
}) => {
  if (!packages || packages.length === 0) {
    // Paket yoksa belki genel bir iletişim mesajı gösterilebilir
     return (
        <section className="py-16">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
                 {sectionDescription && <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">{sectionDescription}</p>}
                 <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Size özel tedavi planı ve güncel fiyat bilgisi için lütfen bizimle iletişime geçin.</p>
                 <Button asChild size="lg">
                    <Link href="/iletisim">{contactButtonText}</Link>
                 </Button>
            </div>
        </section>
     );
  }

  return (
    <section className="py-16 md:py-24" style={{backgroundColor: '#f4f5f7'}}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Sol Taraf - İçerik */}
          <div className="space-y-6">
            {/* Mavi Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              Doktorumuz Çevrimiçi ve Konsültasyona Hazır
            </div>

            {/* Başlık */}
            <h2 className="text-4xl md:text-5xl font-medium text-gray-900 dark:text-white leading-tight max-w-2xl">
              {sectionTitle}
            </h2>

            {/* Açıklama */}
            {sectionDescription && (
              <div className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                <div>{sectionDescription}</div>
              </div>
            )}

            {/* Buton */}
            <Link href="/iletisim" className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg">
              <div className="bg-[#D4AF37] rounded-lg p-2 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
              <span className="text-base font-semibold">Çevrimiçi Danışma</span>
            </Link>
          </div>

          {/* Sağ Taraf - Tek Görsel */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c5dd_op-dr-kemal-aytuglu-celyxmed.avif"
                alt="Dr. Kemal Aytuğlu - Celyxmed"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
