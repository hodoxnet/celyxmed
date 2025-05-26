"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface JciSectionProps {
  title?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const JciSection: React.FC<JciSectionProps> = ({
  title = "Celyxmed ile dünya standartlarında sağlık hizmetini deneyimleyin. Estetik ameliyatlarımız JCI tarafından akredite edilmiş ortak hastanelerde gerçekleştirilir ve en yüksek güvenlik ve bakım standartlarını sağlar.",
  primaryButtonText = "Kliniğimizi Keşfedin",
  primaryButtonLink = "#klinik",
  secondaryButtonText = "Doktorlarımızla Tanışın",
  secondaryButtonLink = "#doktorlar"
}) => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
        <div className="flex flex-col items-center">
          {/* Başlık */}
          <h2 className="text-3xl md:text-4xl font-medium leading-tight text-gray-800 text-center mb-12 max-w-4xl">
            {title}
          </h2>
          
          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {primaryButtonText && primaryButtonLink && (
              <Link 
                href={primaryButtonLink} 
                className="flex items-center gap-2 bg-[#4a8f9c] text-white hover:bg-[#3e7a85] rounded-md px-6 py-3 transition duration-300 ease-in-out"
              >
                <ArrowRight className="h-5 w-5 text-white" />
                <span className="font-medium">{primaryButtonText}</span>
              </Link>
            )}
            
            {secondaryButtonText && secondaryButtonLink && (
              <Link 
                href={secondaryButtonLink} 
                className="text-gray-700 hover:text-[#4a8f9c] font-medium transition duration-300 ease-in-out px-6 py-3"
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JciSection;