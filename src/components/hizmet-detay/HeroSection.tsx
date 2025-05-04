// src/components/hizmet-detay/HeroSection.tsx
import React from 'react';
// Gerekirse Button gibi UI bileşenlerini import edin
// import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  breadcrumb: string;
  title: string;
  description: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ breadcrumb, title, description }) => {
  return (
    <section className="bg-gray-100 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{breadcrumb}</p>
        <h1 className="text-4xl font-bold mt-2 mb-4">{title}</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{description}</p>
        {/* Butonlar eklenecek */}
        {/* <div className="flex space-x-4">
          <Button>Detayları Gör</Button>
          <Button variant="outline">Konsültasyon</Button>
        </div> */}
      </div>
    </section>
  );
};

export default HeroSection;
