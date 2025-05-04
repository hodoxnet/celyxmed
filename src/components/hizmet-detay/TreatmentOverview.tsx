// src/components/hizmet-detay/TreatmentOverview.tsx
import React from 'react';
import Image from 'next/image'; // Resimler için Next.js Image bileşeni
import Link from 'next/link'; // Link bileşenini import et
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; // Butonları da ekleyelim

// Sekme verisi tipi
interface TabData {
  value: string; // Sekme anahtarı (örn: "nedir")
  trigger: string; // Sekme başlığı (örn: "Bu Tedavi Nedir?")
  title: string; // İçerik başlığı
  content: string; // İçerik metni
  imageUrl: string; // Sekmeye ait resim URL'si
  imageAlt: string; // Resim alt metni
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

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900"> {/* Arka plan rengi eklendi */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12"> {/* Başlık ve açıklama ortalandı */}
          <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{sectionDescription}</p>
        </div>

        <Tabs defaultValue={tabsData[0].value} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8"> {/* Mobil uyumlu grid */}
            {tabsData.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.trigger}</TabsTrigger>
            ))}
          </TabsList>

          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow"> {/* Kart benzeri görünüm */}
                {/* Metin İçeriği */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">{tab.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{tab.content}</p>
                  <Button asChild>
                    <Link href={tab.buttonLink || '/iletisim'}>{tab.buttonText}</Link>
                  </Button>
                </div>
                {/* Resim */}
                <div className="relative h-64 md:h-80 rounded-md overflow-hidden"> {/* Resim alanı */}
                  <Image
                    src={tab.imageUrl}
                    alt={tab.imageAlt}
                    layout="fill"
                    objectFit="cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default TreatmentOverview;
