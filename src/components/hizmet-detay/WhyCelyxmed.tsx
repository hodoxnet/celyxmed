"use client";

import React from 'react';

interface WhyItem {
  id: string;
  number: string;
  title: string;
  description: string;
}

interface WhyCelyxmedProps {
  sectionTitle: string;
  items: WhyItem[];
  backgroundImageUrl?: string; // Opsiyonel arka plan resmi
}

// Varsayılan arka plan resmi (WhyTrustSection'dan alındı, değiştirilebilir)
const defaultBackgroundImageUrl = "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b76225b3622d69b5b3ef61_hair-transplant-clinic-in-turkey-celyxmed%20(2).avif";

const WhyCelyxmed: React.FC<WhyCelyxmedProps> = ({
  sectionTitle,
  items,
  backgroundImageUrl = defaultBackgroundImageUrl, // Varsayılan veya prop'tan gelen URL
}) => {
  return (
    <section
      className="pt-8 pb-12 md:pt-12 md:pb-20 bg-cover bg-center bg-no-repeat relative text-white"
      style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Başlık */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
            {sectionTitle}
          </h2>
        </div>

        {/* Maddeler Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-4">
              {/* Numara */}
              <div className="text-4xl font-bold text-cyan-400 flex-shrink-0 mt-1">
                {item.number}
              </div>
              {/* Başlık ve Açıklama */}
              <div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCelyxmed;
