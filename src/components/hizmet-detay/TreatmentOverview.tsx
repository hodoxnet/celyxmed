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

  // Başlığı iki satıra bölmek için (varsa) ilk boşluktan ayır
  const titleParts = sectionTitle.split(' ');
  const titleLine1 = titleParts.slice(0, titleParts.length - 2).join(' '); // Son iki kelime hariç
  const titleLine2 = titleParts.slice(-2).join(' '); // Son iki kelime

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950"> {/* Arka plan beyaz, padding artırıldı */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16"> {/* Başlık ve açıklama ortalandı, alt boşluk artırıldı */}
          {/* Başlık büyütüldü ve iki satıra ayrıldı */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {titleLine1} <br /> {titleLine2}
          </h2>
          {/* Açıklama fontu küçültüldü ve rengi ayarlandı */}
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{sectionDescription}</p>
        </div>

        <Tabs defaultValue={tabsData[0].value} className="w-full max-w-4xl mx-auto"> {/* Sekme genişliği sınırlandırıldı ve ortalandı */}
          {/* Sekme Listesi Stili Güncellendi */}
          <TabsList className="inline-flex h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 mb-10 justify-center w-full">
            {tabsData.map((tab) => (
              // Sekme Tetikleyici Stili Güncellendi
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300 flex-1" // Yeni stil sınıfları
              >
                {tab.trigger}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {/* İçerik alanı arka planı kaldırıldı, padding ayarlandı */}
              <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center p-4 md:p-6">
                {/* Metin İçeriği */}
                <div className="space-y-5"> {/* Boşluk artırıldı */}
                  <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">{tab.title}</h3> {/* Font boyutu ayarlandı */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{tab.content}</p> {/* Renk ve satır aralığı ayarlandı */}
                  {/* Button'ı Link ile sarmalama (asChild kaldırıldı) */}
                  <Link href={tab.buttonLink || '/iletisim'} passHref legacyBehavior>
                    <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-3"> {/* Buton stili güncellendi */}
                      {tab.buttonText}
                    </Button>
                  </Link>
                </div>
                {/* Resim */}
                <div className="relative h-72 md:h-96 rounded-lg overflow-hidden shadow-md"> {/* Yükseklik ve gölge ayarlandı */}
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
