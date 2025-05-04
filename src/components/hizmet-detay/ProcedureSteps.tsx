// src/components/hizmet-detay/ProcedureSteps.tsx
import React from 'react';
import Link from 'next/link'; // Link bileşenini import et
import { Button } from "@/components/ui/button"; // Adımlardaki linkler için

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

  // Şimdilik basit bir grid yapısı kullanıyoruz
  return (
    <section className="py-16"> {/* Üst ve alt boşluk eklendi */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
          {sectionDescription && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{sectionDescription}</p>
          )}
        </div>

        {/* Adımlar için Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.id} className="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full"> {/* Kart görünümü ve tam yükseklik */}
              <div className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-2">Adım {index + 1}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">{step.description}</p> {/* flex-grow içeriği aşağı iter */}
              {step.linkText && (
                 <Button variant="link" asChild className="mt-auto self-start px-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                   <Link href={step.linkHref || '/iletisim'}>{step.linkText} &rarr;</Link>
                 </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcedureSteps;
