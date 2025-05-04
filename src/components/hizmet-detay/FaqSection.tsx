// src/components/hizmet-detay/FaqSection.tsx
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// SSS öğesi tipi
interface FaqItem {
  id: string; // Benzersiz kimlik (örn: "faq-1")
  question: string;
  answer: string; // Cevap HTML içerebilir, dikkatli kullanılmalı
}

interface FaqSectionProps {
  sectionTitle: string;
  sectionDescription?: string;
  faqItems: FaqItem[];
}

const FaqSection: React.FC<FaqSectionProps> = ({ sectionTitle, sectionDescription, faqItems }) => {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16"> {/* Arka plan rengi kaldırıldı, ana sayfadaki gibi */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
          {sectionDescription && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{sectionDescription}</p>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto"> {/* Ortalamak için max-w ve mx-auto */}
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-b dark:border-gray-700">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0">
                 {/* Cevap HTML içerebileceği için dangerouslySetInnerHTML kullanılabilir,
                     ancak güvenlik riski taşır. Güvenli bir kaynaktan gelmiyorsa
                     sanitize edilmeli veya markdown gibi bir format kullanılmalı.
                     Şimdilik basit metin olarak ekliyoruz. */}
                <div
                  className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: item.answer }} // HTML içeriği için
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
