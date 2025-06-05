"use client"; // Veri çekme işlemleri için client component

"use client"; // Veri çekme işlemleri için client component

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SecondaryAnimatedButton } from '@/components/ui/animated-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';
import { Skeleton } from "@/components/ui/skeleton";

interface TabDataItem {
  id: string;
  value: string;
  imageUrl: string;
  order: number;
  isPublished: boolean;
  triggerText: string;
  tagText: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  languageCode: string;
}

interface SectionDetails {
  mainTitle?: string | null;
  mainDescription?: string | null;
}

const FeaturesTabs = () => {
  const locale = useLocale();
  const [tabData, setTabData] = useState<TabDataItem[]>([]);
  const [sectionDetails, setSectionDetails] = useState<SectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/home/feature-tabs?locale=${locale}`);
        if (!response.ok) {
          throw new Error('Özellik sekmeleri verisi yüklenemedi.');
        }
        const data = await response.json();
        setTabData(data.tabItems || []);
        setSectionDetails(data.sectionDetails || { mainTitle: null, mainDescription: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("FeaturesTabs veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturesData();
  }, [locale]);

  const defaultMainTitle = "Discover World-Class Healthcare with Celyxmed in Turkey";
  const defaultMainDescription = "Experience personalized treatments from Turkey's top specialists at JCI-accredited clinics. Celyxmed combines trusted healthcare with affordable solutions for your well-being.";

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-full mx-auto" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg mb-10" /> {/* TabsList skeleton */}
          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Skeleton className="h-6 w-1/4 mb-6" />
                <Skeleton className="h-10 w-3/4 mb-6" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-2/3 mb-8" />
                <Skeleton className="h-12 w-48 rounded-full" />
              </div>
              <div className="relative w-full h-full min-h-[450px]">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return null; 
  }

  if (!sectionDetails && tabData.length === 0) {
    return null; // Eğer hem bölüm detayı hem de sekme verisi yoksa hiçbir şey gösterme
  }
  
  // Eğer sadece sekme verisi yoksa ama bölüm başlıkları varsa, sadece başlıkları göster.
  // Ya da tam tersi. Bu mantık projenin isteğine göre ayarlanabilir.
  // Şimdilik, eğer sekme yoksa tüm bölümü gizliyoruz.
  if (tabData.length === 0) {
    return null;
  }


  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-normal mb-4 text-gray-800">
            {sectionDetails?.mainTitle || defaultMainTitle}
          </h2>
          <p className="text-lg text-gray-600">
            {sectionDetails?.mainDescription || defaultMainDescription}
          </p>
        </div>

        <Tabs defaultValue={tabData[0]?.value} className="w-full mx-auto">
          <TabsList className="inline-flex h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 mb-10 justify-center w-full">
            {tabData.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300 flex-1"
              >
                {tab.triggerText}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-300 mb-6 self-start">
                      {tab.tagText}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-normal mb-6 text-gray-900 dark:text-white leading-tight">
                      {tab.heading}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-base md:text-lg leading-relaxed">
                      {tab.description}
                    </p>
                    <div className="self-start">
                      <SecondaryAnimatedButton 
                        href={tab.buttonLink}
                        icon={ArrowRight}
                        iconPosition="left"
                      >
                        {tab.buttonText}
                      </SecondaryAnimatedButton>
                    </div>
                  </div>
                  <div className="relative w-full h-full min-h-[450px]">
                    <Image
                      src={tab.imageUrl}
                      alt={tab.heading}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default FeaturesTabs;
