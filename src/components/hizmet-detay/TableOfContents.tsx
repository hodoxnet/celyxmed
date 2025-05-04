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

const TableOfContents: React.FC<TableOfContentsProps> = ({ title, items, authorInfo }) => {
  // Seviyeye göre içeriği formatlamak için yardımcı fonksiyon (şimdilik basit liste)
  const renderItems = (items: ContentItem[]) => {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item) => (
          <li key={item.id} className={item.isBold ? 'font-semibold' : ''}>
            {item.text}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Accordion type="single" collapsible className="w-full border rounded-lg shadow-sm dark:border-gray-700">
          <AccordionItem value="toc-item">
            <AccordionTrigger className="px-6 py-4 text-xl font-semibold hover:no-underline">
              {title}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-0">
              {authorInfo && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{authorInfo}</p>
              )}
              <div className="prose dark:prose-invert max-w-none">
                {renderItems(items)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default TableOfContents;
