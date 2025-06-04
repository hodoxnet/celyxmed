// src/components/hizmet-detay/TreatmentOverview.tsx
"use client";

import React from 'react'; // Duplicate import removed
import Image from 'next/image'; // Resimler için Next.js Image bileşeni
import Link from 'next/link'; // Link bileşenini import et
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; // Butonları da ekleyelim
import { ArrowRight } from 'lucide-react'; // İkonu import et

// Sekme verisi tipi
interface TabData {
  value: string; // Sekme anahtarı (örn: "nedir")
  trigger: string; // Sekme başlığı (örn: "Bu Tedavi Nedir?")
  title: string; // İçerik başlığı
  content: string; // İçerik metni
  imagePath?: string | null; // Sekmeye ait resim dosya yolu (opsiyonel)
  imageUrl?: string | null; // Sekmeye ait resim URL'si (API'den gelen veri) (opsiyonel)
  imageAlt?: string | null; // Resim alt metni (opsiyonel)
  buttonText: string; // Buton metni
  buttonLink?: string; // Buton linki (opsiyonel)
}

interface TreatmentOverviewProps {
  sectionTitle: string; // Bölüm başlığı (örn: "Türkiye'de Anne Estetiği Tedavisine Genel Bakış")
  sectionDescription: string; // Bölüm açıklaması
  tabsData: TabData[]; // Sekme verileri dizisi
}

const TreatmentOverview: React.FC<TreatmentOverviewProps> = ({ sectionTitle, sectionDescription, tabsData }) => {
  if (!tabsData || tabsData.length === 0) {
    return null; // Veri yoksa bileşeni render etme
  }

  // Başlığı iki satıra bölmek için (varsa) ilk boşluktan ayır
  const titleParts = sectionTitle.split(' ');
  const titleLine1 = titleParts.slice(0, titleParts.length - 2).join(' '); // Son iki kelime hariç
  const titleLine2 = titleParts.slice(-2).join(' '); // Son iki kelime

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Başlık/Açıklama alanı ortalandı */}
        <div className="text-center mb-12 md:mb-16">
          {/* Başlık eski site stilinde - Text wrapping iyileştirildi */}
          <h2 
            className="text-4xl md:text-5xl lg:text-5xl font-medium mb-6 leading-tight max-w-5xl mx-auto"
            style={{
              color: '#283849',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              hyphens: 'none',
              textWrap: 'balance'
            }}
          >
            {sectionTitle}
          </h2>
          {/* Açıklama eski site stilinde - Text wrapping iyileştirildi */}
          <p 
            className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed"
            style={{
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              hyphens: 'none',
              textWrap: 'balance'
            }}
          >
            {sectionDescription}
          </p>
        </div>

        {/* Tabs bileşeni container içinde, w-full */}
        <Tabs defaultValue={tabsData[0].value} className="w-full">
          {/* Sekme Listesi eski site stilinde */}
          <div className="flex justify-center mb-12">
            <TabsList className="inline-flex h-auto rounded-xl p-2 gap-2 border border-gray-200 dark:border-gray-700" style={{backgroundColor: '#f6f9fc'}}>
              {tabsData.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {tab.trigger}
                </TabsTrigger>
            ))}
            </TabsList>
          </div>

          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {/* İçerik alanı eski site stilinde */}
              <div className="dark:bg-gray-800/50 rounded-2xl p-12 md:p-16 border border-gray-100 dark:border-gray-700" style={{backgroundColor: '#f6f9fc'}}>
                <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-center">
                  {/* Metin İçeriği */}
                  <div className="space-y-8">
                    <h3 className="text-2xl md:text-3xl font-medium leading-tight" style={{ color: '#4c6d8f' }}>{tab.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{tab.content}</p>
                    {/* Buton TOC & CTA stilinde */}
                    <Link href={tab.buttonLink || '/iletisim'} className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-2xl transition-all duration-300">
                      <div className="bg-[#D4AF37] rounded-lg p-1.5 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold">{tab.buttonText}</span>
                    </Link>
                  </div>
                  {/* Resim eski site stilinde */}
                  {(tab.imagePath || tab.imageUrl) && (
                    <div className="relative h-96 md:h-[32rem] rounded-2xl overflow-hidden">
                      <Image
                        src={tab.imagePath || tab.imageUrl || ""}
                        alt={tab.imageAlt || tab.title}
                        layout="fill"
                        objectFit="cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div> {/* Kapatılan container div */}
    </section>
  );
};

export default TreatmentOverview;
