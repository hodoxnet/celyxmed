// src/components/hizmet-detay/TreatmentOverview.tsx
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
    // Container geri eklendi, section'dan padding kaldırıldı
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4"> {/* Container geri eklendi */}
        {/* Başlık/Açıklama alanı ortalandı, max-width kaldırıldı */}
        <div className="text-center mb-12 md:mb-16">
          {/* Başlık büyütüldü ve iki satıra ayrıldı */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {titleLine1} <br /> {titleLine2}
          </h2>
          {/* Açıklama fontu küçültüldü ve rengi ayarlandı */}
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">{sectionDescription}</p> {/* Açıklama için max-width kaldı */}
        </div>

        {/* Tabs bileşeni container içinde, w-full */}
        <Tabs defaultValue={tabsData[0].value} className="w-full">
          {/* Sekme Listesi ortalandı */}
          <div className="flex justify-center mb-10"> {/* Wrapper div for centering TabsList */}
            <TabsList className="inline-flex h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 overflow-x-auto">
              {tabsData.map((tab) => (
                // Sekme Tetikleyici Stili Güncellendi - Yinelenen prop'lar kaldırıldı
                <TabsTrigger
                  key={tab.value} // Tek key
                  value={tab.value} // Tek value
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300 flex-1" // Tek className
                >
                  {tab.trigger}
                </TabsTrigger>
            ))}
            </TabsList>
          </div> {/* Closing tag for the flex wrapper div */}

          {tabsData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {/* İçerik alanı yeni stil: Arka plan, padding, yuvarlak köşeler */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                  {/* Metin İçeriği */}
                  <div className="space-y-5"> {/* Boşluk ayarlandı */}
                    <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">{tab.title}</h3> {/* Font boyutu ayarlandı */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">{tab.content}</p> {/* Renk, satır aralığı ve font boyutu ayarlandı */}
                    {/* Yeni Buton Stili */}
                    <Button variant="link" asChild className="p-0 h-auto text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 group">
                       <Link href={tab.buttonLink || '/iletisim'} className="inline-flex items-center gap-3">
                         <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 transition-colors group-hover:bg-amber-500">
                           <ArrowRight className="h-5 w-5 text-teal-900" />
                         </span>
                         <span className="font-medium">{tab.buttonText}</span>
                       </Link>
                    </Button>
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
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div> {/* Kapatılan container div */}
    </section>
  );
};

export default TreatmentOverview;
