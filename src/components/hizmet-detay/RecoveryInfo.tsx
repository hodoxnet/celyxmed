// src/components/hizmet-detay/RecoveryInfo.tsx
"use client";

import React from 'react';
import Image from 'next/image';

// İyileşme bilgisi öğesi tipi
interface RecoveryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

interface RecoveryInfoProps {
  sectionTitle: string;
  sectionDescription?: string;
  items: RecoveryItem[];
}

const RecoveryInfo: React.FC<RecoveryInfoProps> = ({ sectionTitle, sectionDescription, items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900"> {/* Arka plan rengi */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 max-w-4xl mx-auto leading-tight">{sectionTitle}</h2>
          {sectionDescription && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{sectionDescription}</p>
          )}
        </div>

        {/* İki sütunlu yapı */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="relative w-full aspect-video"> {/* Resim alanı */}
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  layout="fill"
                  objectFit="cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6"> {/* Metin içeriği */}
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecoveryInfo;
