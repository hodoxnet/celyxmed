"use client"; // Dinamik veri çekme için

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Dil parametresini almak için
// Button ve Card bileşenleri bu dosyada doğrudan kullanılmıyor, kaldırılabilir.
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// API'den gelen veri tipleri (Frontend için)
interface ContentTranslation {
  mainTitle?: string | null;
  mainDescription?: string | null;
  exploreButtonText?: string | null;
  exploreButtonLink?: string | null;
  avatarGroupText?: string | null;
}

interface Avatar {
  id: string;
  imageUrl: string;
  altText?: string | null;
  order: number;
}

interface SectionContentData {
  translation: ContentTranslation | null;
  avatars: Avatar[];
}

interface CardTranslation {
  title?: string | null;
  description?: string | null;
  linkUrl?: string | null;
}

interface TreatmentCardData {
  id: string;
  imageUrl: string;
  order: number;
  translation: CardTranslation | null;
}

const TreatmentsSection = () => {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'tr';

  const [contentData, setContentData] = useState<SectionContentData | null>(null);
  const [treatmentCards, setTreatmentCards] = useState<TreatmentCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [contentRes, cardsRes] = await Promise.all([
          fetch(`/api/home/treatments-section-content?lang=${locale}`),
          fetch(`/api/home/treatment-cards?lang=${locale}`),
        ]);

        if (!contentRes.ok) {
          throw new Error(`Failed to fetch section content: ${contentRes.statusText}`);
        }
        const content: SectionContentData = await contentRes.json();
        setContentData(content);

        if (!cardsRes.ok) {
          throw new Error(`Failed to fetch treatment cards: ${cardsRes.statusText}`);
        }
        const cards: TreatmentCardData[] = await cardsRes.json();
        setTreatmentCards(cards);

      } catch (err: any) {
        setError(err.message || 'Veri yüklenirken bir sorun oluştu.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  if (isLoading) {
    return (
      <section id="treatments" className="py-16 md:py-24 text-center">
        <p>Yükleniyor...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="treatments" className="py-16 md:py-24 text-center text-red-600">
        <p>Hata: {error}</p>
      </section>
    );
  }

  const { translation: contentTranslation, avatars } = contentData || { translation: null, avatars: [] };

  // Varsayılan değerler, API'den veri gelmezse veya eksikse kullanılır
  const defaultMainTitle = "Comprehensive Healthcare Solutions Tailored for You";
  const defaultMainDescription = "From advanced bariatric procedures to expert dental care, hair transplants, medical treatments, and aesthetic surgeries, Celyxmed offers a full spectrum of personalized healthcare solutions. With experienced medical teams and partnerships with accredited hospitals, we ensure world-class care tailored to your needs.";
  const defaultExploreButtonText = "Explore Our Treatments";
  const defaultExploreButtonLink = "/treatments"; // Varsayılan link
  const defaultAvatarGroupText = "10,000+ Successful Treatments, Your Health in Trusted Hands";
  const defaultAvatars = [ // API'den avatar gelmezse kullanılacak varsayılanlar
    { id: "default-1", imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7e1480f552d9dd759881_celyxmed-.avif", altText: "Patient 1", order: 0 },
    { id: "default-2", imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7e7096d77fc5d147a4a6_celyxmed-success-stories.avif", altText: "Patient 2", order: 1 },
    { id: "default-3", imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/677d7f3b6da406686deb4362_celyxmed-success-stories%20(1).avif", altText: "Patient 3", order: 2 },
  ];
  const displayAvatars = avatars && avatars.length > 0 ? avatars : defaultAvatars;


  return (
    <section id="treatments" className="w-full py-16 md:py-24"> {/* w-full eklendi */}
      <div className="container mx-auto px-4">
        {/* Üst Kısım: Başlık, Açıklama, Avatarlar */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center mb-12 md:mb-16">
          {/* Sol Taraf: Başlık, Açıklama, Buton */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-gray-800">
              {contentTranslation?.mainTitle || defaultMainTitle}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {contentTranslation?.mainDescription || defaultMainDescription}
            </p>
            {(contentTranslation?.exploreButtonText || defaultExploreButtonText) && (
              <Link 
                href={contentTranslation?.exploreButtonLink || defaultExploreButtonLink}
                className="inline-flex items-center gap-2 bg-[#486F79] hover:bg-[#406069] text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300"
              >
                <div className="bg-[#d4b978] rounded-lg p-1.5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium">{contentTranslation?.exploreButtonText || defaultExploreButtonText}</span>
              </Link>
            )}
          </div>

          {/* Sağ Taraf: Avatarlar */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-end"> {/* lg:items-end eklendi */}
            <div className="flex -space-x-4 mb-4">
              {displayAvatars.map((avatar, index) => (
                <Image
                  key={avatar.id || index}
                  src={avatar.imageUrl}
                  alt={avatar.altText || `Patient ${index + 1}`}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white shadow-md"
                  style={{ zIndex: displayAvatars.length - index }}
                />
              ))}
              {/* +10.000 Avatarı (Bu kısım dinamik değil, statik kalabilir veya admin panelinden yönetilebilir) */}
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center text-center text-xs font-semibold text-gray-700 relative" style={{ zIndex: 0 }}>
                +10.000
                {displayAvatars.length > 0 && (
                  <Image
                    src={displayAvatars[0].imageUrl} 
                    alt=""
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full opacity-30 blur-sm absolute inset-0"
                  />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 max-w-[21ch] text-center">
              {contentTranslation?.avatarGroupText || defaultAvatarGroupText}
            </p>
          </div>
        </div>

        {/* Alt Kısım: Tedavi Kartları Grid'i */}
        {treatmentCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {treatmentCards.map((card) => (
              <Link key={card.id} href={card.translation?.linkUrl || '#'} className="block group">
                <div className="h-full flex flex-col overflow-hidden rounded-lg bg-white shadow transition-shadow duration-300 hover:shadow-lg">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={card.imageUrl}
                      alt={card.translation?.title || 'Tedavi'}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{card.translation?.title || 'Başlık Yok'}</h3>
                    <p className="text-gray-600 text-sm">
                      {card.translation?.description || 'Açıklama Yok'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TreatmentsSection;
