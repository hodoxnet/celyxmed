"use client"; // Dinamik veri çekme ve state kullanımı için

import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton"; // Yükleme durumu için
import { useLocale } from 'next-intl'; // Aktif dili almak için

interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
}

interface FaqSectionData {
  title: string;
  description: string | null;
  items: FaqItemData[];
}

const FaqSection = () => {
  const [sectionData, setSectionData] = useState<FaqSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale(); // Aktif dil kodunu al (örn: 'tr', 'en')

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/home/faqs?lang=${locale}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch FAQs: ${response.statusText}`);
        }
        const data: FaqSectionData = await response.json();
        setSectionData(data);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [locale]); // locale değiştiğinde veriyi yeniden çek

  // Yükleme durumu için iskelet (skeleton) gösterimi
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            {/* <Skeleton className="h-6 w-1/2 mx-auto" /> */}
          </div>
          <div className="w-full space-y-4">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hata durumu gösterimi
  if (error) {
    return (
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">
            Sıkça Sorulan Sorular yüklenirken bir hata oluştu.
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </section>
    );
  }

  // Veri yoksa veya boşsa gösterilecek mesaj
  if (!sectionData || !sectionData.items || sectionData.items.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Sıkça Sorulan Soru bulunamadı.
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {sectionData.title}
          </h2>
          {sectionData.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {sectionData.description}
            </p>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {sectionData.items.map((item) => (
            <React.Fragment key={item.id}>
              <AccordionItem value={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-none overflow-hidden">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline px-6 py-5 text-gray-900 dark:text-white">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                   <div
                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: item.answer }} // Cevaplar HTML içerebilir
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
