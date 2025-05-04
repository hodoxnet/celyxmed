// src/components/hizmet-detay/WhyCelyxmed.tsx
import React from 'react';

// Neden Celyxmed öğesi tipi
interface WhyItem {
  id: string;
  number: string; // "01", "02" etc.
  title: string;
  description: string;
}

interface WhyCelyxmedProps {
  sectionTitle: string;
  items: WhyItem[];
}

const WhyCelyxmed: React.FC<WhyCelyxmedProps> = ({ sectionTitle, items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    // index.html'deki gibi bir arka plan resmi veya rengi eklenebilir
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3">{item.number}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 flex-grow">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCelyxmed;
