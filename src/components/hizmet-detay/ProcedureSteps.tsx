// src/components/hizmet-detay/ProcedureSteps.tsx
"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Ok ikonları
import { Button } from "@/components/ui/button"; // Ok butonları için

// Adım verisi tipi (Değişiklik yok)
interface StepData {
  id: string;
  title: string;
  description: string;
  linkText?: string; // Opsiyonel link metni
  linkHref?: string; // Opsiyonel link URL'si
}

interface ProcedureStepsProps {
  sectionTitle: string;
  sectionDescription?: string; // Bölüm için opsiyonel açıklama
  steps: StepData[];
}

const ProcedureSteps: React.FC<ProcedureStepsProps> = ({ sectionTitle, sectionDescription, steps }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true); // Başlangıçta sağa kaydırılabilir

  if (!steps || steps.length === 0) {
    return null;
  }

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      // Küçük bir tolerans ekleyerek sona ulaşıp ulaşmadığını kontrol et
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // İlk render ve pencere boyutu değiştiğinde kontrol et
  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [steps]); // steps değiştiğinde de kontrol et

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      // Her seferinde bir kart genişliği kadar kaydır (yaklaşık olarak)
      // Gerçek kart genişliğini almak daha doğru olur ama şimdilik clientWidth kullanalım
      const scrollAmount = container.clientWidth * 0.8; // %80 kaydır
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      // Kaydırma sonrası buton durumlarını hemen güncellemek için timeout
      setTimeout(checkScrollability, 300); // smooth scroll süresi kadar bekle
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Başlık, Açıklama ve Ok Butonları */}
        <div className="flex justify-between items-end mb-12 md:mb-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{sectionTitle}</h2>
            {sectionDescription && (
              <p className="text-base text-gray-600 dark:text-gray-400">{sectionDescription}</p>
            )}
          </div>
          {/* Ok Butonları */}
          <div className="hidden md:flex space-x-2"> {/* Mobilde gizle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="rounded-full disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="rounded-full disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Adımlar için Yatay Kaydırılabilir Flex Layout */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability} // Kaydırma sırasında da kontrol et
          className="flex space-x-6 overflow-x-auto pb-4 -mb-4 scrollbar-hide" // scrollbar-thin ve diğerleri kaldırıldı, scrollbar-hide eklendi
        >
          {steps.map((step) => (
            <div key={step.id} className="flex-shrink-0 w-full sm:w-[45%] md:w-[30%] lg:w-[23%] p-6 pt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-t-4 border-[#d4b978] dark:border-[#a88d5f] flex flex-col">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">{step.description}</p>
              {step.linkText && (
                 <Link href={step.linkHref || '/iletisim'} className="mt-auto self-start inline-flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group">
                   {step.linkText}
                   <span className="ml-1 transition-transform group-hover:translate-x-1">{'>'}</span>
                 </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcedureSteps;
