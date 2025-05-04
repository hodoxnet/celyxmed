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

  // Yazar bilgisini satırlara ayırmak için
  const authorLines = authorInfo?.split('\n') || [];

  return (
    // Stil güncellendi: Daha açık arka plan, daha belirgin border-radius
    <Accordion type="single" collapsible className="w-full rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
      <AccordionItem value="toc-item" className="border-none"> {/* Border kaldırıldı */}
        {/* Trigger içeriği güncellendi: Font boyutları artırıldı, manuel ikon kaldırıldı */}
        <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group justify-between"> {/* justify-between eklendi */}
           <div className="flex flex-col items-start mr-4"> {/* Sağ boşluk eklendi */}
             <span className="text-xl font-semibold text-gray-900 dark:text-white mb-1.5">{title}</span> {/* Boyut ve alt boşluk artırıldı */}
             {/* Yazar bilgisi Trigger'a taşındı */}
             {authorLines.length > 0 && (
               <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1"> {/* Boyut ve satır aralığı artırıldı */}
                 {authorLines.map((line, index) => (
                   <p key={index}>{line}</p>
                 ))}
               </div>
             )}
           </div>
           {/* Manuel SVG ikonu kaldırıldı, AccordionTrigger kendi ikonunu kullanacak */}
        </AccordionTrigger>
        {/* Content içeriği güncellendi: Yazar bilgisi kaldırıldı */}
        <AccordionContent className="px-6 pb-5 pt-0"> {/* Padding ayarlandı */}
              {/* Yazar bilgisi Trigger'a taşındığı için buradan kaldırıldı */}
              <div className="prose dark:prose-invert max-w-none text-sm pt-4 border-t border-gray-200 dark:border-gray-700"> {/* Üst border ve padding eklendi */}
                {renderItems(items)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
    // Dıştaki section ve container kaldırıldı
  );
};

export default TableOfContentsAccordion; // İsim değiştirildi
