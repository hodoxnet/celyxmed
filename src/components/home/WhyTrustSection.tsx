'use client';

import React, { useState, useEffect } from 'react';

// WhyTrustSection veri tipi
type WhyTrustSectionData = {
  id: string;
  backgroundImage: string | null;
  title: string;
  subtitle: string;
  trustPoints: Array<{
    id: string;
    number: string;
    title: string;
    description: string;
  }>;
  languageCode: string;
};

// Fallback veriler (API verisi yüklenemezse kullanılacak)
const fallbackBackgroundImageUrl = "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b76225b3622d69b5b3ef61_hair-transplant-clinic-in-turkey-celyxmed%20(2).avif";
const fallbackTrustPoints = [
  {
    id: "1",
    number: "01",
    title: "Experienced Specialists",
    description: "Our doctors bring over 10, 15, and even 25 years of experience in their fields, ensuring the best care and successful results."
  },
  {
    id: "2",
    number: "02",
    title: "Trusted Care, Accredited Standards",
    description: "Our state-of-the-art clinic provides high-quality treatments in a safe and hygienic environment. For aesthetic surgeries, we collaborate with JCI-accredited partner hospitals to ensure the highest international healthcare standards."
  },
  {
    id: "3",
    number: "03",
    title: "Personalized Patient Care",
    description: "We provide tailored treatment plans, continuous support, and patient-first care from consultation to recovery."
  },
  {
    id: "4",
    number: "04",
    title: "Global Patient Trust",
    description: "Thousands of patients from the United States, Europe, and the Middle East trust Celyxmed for safe, effective, and affordable treatments in Turkey."
  }
];

const WhyTrustSection = ({ locale }: { locale: string }) => {
  const [data, setData] = useState<WhyTrustSectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/home/why-trust-section?lang=${locale}`);

        if (!response.ok) {
          throw new Error('Failed to fetch why trust section data');
        }

        const sectionData: WhyTrustSectionData = await response.json();
        setData(sectionData);
      } catch (err) {
        console.error('Error fetching why trust section data:', err);
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // API verisi yüklenene kadar veya hata durumunda fallback içeriği göster
  const title = data?.title || "Why Trust Celyxmed?";
  const subtitle = data?.subtitle || "Your Health, Our Priority";
  const backgroundImage = data?.backgroundImage || fallbackBackgroundImageUrl;
  const trustPoints = data?.trustPoints?.length ? data.trustPoints : fallbackTrustPoints;

  return (
    <section
      className="py-20 md:py-32 bg-cover bg-center bg-no-repeat relative text-white"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
            {title}<br />{subtitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {trustPoints.map((point) => (
            <div key={point.id || point.number} className="flex items-start space-x-4">
              <div className="text-4xl font-semibold text-cyan-400 flex-shrink-0 mt-1"> {/* Numara stili */}
                {point.number}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
                <p className="text-gray-300">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTrustSection;
