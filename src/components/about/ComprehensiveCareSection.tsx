"use client";

import React from 'react';

interface CareSectionItem {
  title: string;
  description: string;
}

interface ComprehensiveCareSectionProps {
  items?: CareSectionItem[];
}

const ComprehensiveCareSection: React.FC<ComprehensiveCareSectionProps> = ({
  items = [
    {
      title: "Varıştan İyileşmeye Kadar Kapsamlı Bakım",
      description: "İlk konsültasyonunuzdan tedavi sonrası iyileşme sürecine kadar her adımda yanınızdayız. Kendini işine adamış ekibimiz, havaalanı transferleri, lüks konaklama ve ihtiyaçlarınıza göre uyarlanmış kişiselleştirilmiş bakım ile sorunsuz bir deneyim sağlar."
    },
    {
      title: "Konforunuz ve Güvenliğiniz için Tasarlandı",
      description: "İstanbul Ataşehir'deki kliniğimiz, size en üst düzeyde bakım sağlamak için en son teknoloji ile donatılmıştır. Estetik ameliyatlarımız JCI akreditasyonuna sahip ortak hastanelerde gerçekleştirilirken, kliniğimiz konsültasyondan tedavi sonrası bakıma kadar konforlu ve sorunsuz bir deneyim sağlar."
    }
  ]
}) => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16">
          {items.map((item, index) => (
            <div key={index} className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">{item.title}</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComprehensiveCareSection;