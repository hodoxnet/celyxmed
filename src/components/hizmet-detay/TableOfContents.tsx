"use client";

// src/components/hizmet-detay/TableOfContents.tsx
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// İçerik öğelerinin tipini tanımlayabiliriz (opsiyonel ama iyi pratik)
interface ContentItem {
  id: string;
  text: string;
  isBold?: boolean; // Kalın yazılacak mı?
  level?: number; // İç içe listeler için seviye (örn: 1.1, 2.1.1)
}

interface TableOfContentsProps {
  title: string; // Akordeon başlığı (örn: "İçindekiler")
  items: ContentItem[]; // İçerik listesi
  authorInfo?: string; // Yazar ve güncelleme bilgisi (opsiyonel)
}

// Bu bileşen artık sadece Accordion'u render edecek
const TableOfContentsAccordion: React.FC<TableOfContentsProps> = ({ title, items, authorInfo }) => {
  // Seviyeye göre içeriği formatlamak için yardımcı fonksiyon
  const renderItems = (items: ContentItem[]) => {
    return (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
            <span className={`text-gray-700 dark:text-gray-300 leading-relaxed ${item.isBold ? 'font-semibold' : 'font-normal'}`}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Yazar bilgisini satırlara ayırmak için
  const authorLines = authorInfo?.split('\n') || [];

  return (
    <Accordion type="single" collapsible className="w-full rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
      <AccordionItem value="toc-item" className="border-none">
        <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group justify-between">
           <div className="flex flex-col items-start mr-4 w-full">
             <span className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</span>
             {/* Yazar ve güncelleme bilgileri - Dinamik */}
             {authorLines.length > 0 && (
               <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-2 w-full">
                 {authorLines.map((line, index) => (
                   <p key={index} className="font-medium">
                     <span className="font-normal">{line}</span>
                   </p>
                 ))}
               </div>
             )}
           </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-5 pt-0">
              <div className="pt-4">
                {renderItems(items)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
  );
};

export default TableOfContentsAccordion; // İsim değiştirildi
