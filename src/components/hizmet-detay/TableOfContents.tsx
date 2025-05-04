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
    // Dıştaki section ve container kaldırıldı
    <Accordion type="single" collapsible className="w-full border rounded-lg shadow-sm dark:border-gray-700 bg-white dark:bg-gray-800"> {/* Arka plan eklendi */}
      <AccordionItem value="toc-item" className="border-b-0"> {/* Alt border kaldırıldı */}
        <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline"> {/* Boyut ayarlandı */}
              {title}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2"> {/* Üst padding azaltıldı */}
              {authorInfo && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 border-t dark:border-gray-600 pt-4">{authorInfo}</p> // Yazar bilgisi için üst border
              )}
              <div className="prose dark:prose-invert max-w-none text-sm"> {/* Yazı boyutu küçültüldü */}
                {renderItems(items)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
    // Dıştaki section ve container kaldırıldı
  );
};

export default TableOfContentsAccordion; // İsim değiştirildi
