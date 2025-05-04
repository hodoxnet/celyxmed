// src/components/hizmet-detay/ProcedureSteps.tsx
import React from 'react';
import Link from 'next/link';

// Adım verisi tipi
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
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Başlık ve Açıklama Sola Hizalı */}
        <div className="mb-12 md:mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{sectionTitle}</h2>
          {sectionDescription && (
            <p className="text-base text-gray-600 dark:text-gray-400">{sectionDescription}</p>
          )}
        </div>

        {/* Adımlar için Yatay Kaydırılabilir Flex Layout */}
        <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
          {steps.map((step) => (
            <div key={step.id} className="flex-shrink-0 w-full sm:w-[45%] md:w-[30%] lg:w-[23%] p-6 pt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-t-4 border-[#d4b978] dark:border-[#a88d5f] flex flex-col">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">{step.description}</p>
              {/* Link Stili Güncellendi */}
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
