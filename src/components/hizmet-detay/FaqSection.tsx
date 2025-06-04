// src/components/hizmet-detay/FaqSection.tsx
"use client";

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
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">{sectionTitle}</h2>
          {sectionDescription && (
            <p className="text-base text-gray-600 dark:text-gray-400">{sectionDescription}</p>
          )}
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item) => (
            <React.Fragment key={item.id}>
              <AccordionItem value={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-none overflow-hidden">
                <AccordionTrigger className="text-left text-2xl font-semibold hover:no-underline px-6 py-5 text-gray-900 dark:text-white">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div
                    className="prose prose-2xl dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-xl"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            </React.Fragment>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
