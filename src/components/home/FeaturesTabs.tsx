import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card"; // Card bileşenini import et

// Sekme verileri (index.html'den alınmıştır)
const tabData = [
  {
    value: "modern-care",
    trigger: "Modern Care",
    tag: "Advanced Clinic. Trusted Care.",
    heading: "World-Class Healthcare in State-of-the-Art Clinics",
    description: "Experience top-quality medical care with Celyxmed. Our modern clinic and partnerships with JCI-accredited hospitals ensure safe, effective, and state-of-the-art treatments tailored to your needs.",
    buttonText: "Explore Our Clinic",
    buttonLink: "/our-clinic",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b763f203c0bd6ea9674a7e_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey%20(1).avif"
  },
  {
    value: "affordable-quality",
    trigger: "Affordable Quality",
    tag: "Premium Care. Fair Prices.",
    heading: "Affordable Care Without Compromising Quality",
    description: "Celyxmed provides high-quality treatments at a fraction of the cost compared to other countries, making premium healthcare accessible to everyone.",
    buttonText: "Get Started",
    buttonLink: "/contact",
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/67b7641c7d16e12cf9366c9c_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey%20(3).avif"
  },
  {
    value: "personal-touch",
    trigger: "Personal Touch",
    tag: "Your Journey. Personalized.",
    heading: "Personalized Care from Start to Finish",
    description: "At Celyxmed, we guide you through every step of your healthcare journey, offering personalized treatment plans, transfers, and post-treatment support.",
    buttonText: "Discover Our Success Stories",
    buttonLink: "/success-stories", // Örnek link
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/678380d4781b67ce39154046_personalized-care-from-start-to-finish.avif"
  },
  {
    value: "health-travel",
    trigger: "Health & Travel",
    tag: "Discover. Heal. Explore.",
    heading: "Enjoy a Health Journey with a Tourism Touch",
    description: "Combine your treatment with an unforgettable trip to Istanbul. Discover Turkey’s rich culture, history, and hospitality with Celyxmed by your side.",
    buttonText: "Explore Our Treatments",
    buttonLink: "/#treatments", // Örnek link
    imageUrl: "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/678380c80148c6789ed142bb_enjoy-a-health-journey-with-a-tourism-touch.avif"
  }
];

const FeaturesTabs = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl"> {/* max-w-none yerine max-w-6xl kullanıldı, hizmet detay sayfasındaki gibi sınırlı genişlik */}
        {/* Ana Başlık ve Alt Başlık */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-800">
            Discover World-Class Healthcare with Celyxmed in Turkey
          </h2>
          <p className="text-lg text-gray-600">
            Experience personalized treatments from Turkey's top specialists at JCI-accredited clinics. Celyxmed combines trusted healthcare with affordable solutions for your well-being.
          </p>
        </div>

        {/* Sekmeler */}
        <Tabs defaultValue={tabData[0].value} className="w-full mx-auto"> {/* max-w-none kaldırıldı, container'ın max-w-6xl değeri kullanılacak */}
          {/* Sekme Tetikleyicileri - Stil TreatmentOverview'dan alındı */}
          <TabsList className="inline-flex h-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 mb-10 justify-center w-full"> {/* Stil güncellendi */}
            {tabData.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300 flex-1" // Stil TreatmentOverview'dan alındı
              >
                {tab.trigger}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Sekme İçerikleri */}
          {tabData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg"> {/* rounded-3xl yerine rounded-xl kullanıldı, TreatmentOverview ile uyumlu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Sol Taraf: Metin İçeriği */}
                  <div className="p-8 md:p-12 flex flex-col justify-center"> {/* Padding değerleri TreatmentOverview ile uyumlu hale getirildi */}
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-300 mb-6 self-start">
                      {tab.tag}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-900 dark:text-white leading-tight"> {/* Renk değiştirildi */}
                      {tab.heading}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-base md:text-lg leading-relaxed"> {/* Font boyutu ve satır aralığı ayarlandı */}
                      {tab.description}
                    </p>
                    {/* Buton - TreatmentOverview'daki buton stili */}
                    <div className="self-start">
                      <Link 
                        href={tab.buttonLink}
                        className="inline-flex items-center rounded-full overflow-hidden shadow-md group transition-shadow hover:shadow-lg text-white font-medium text-base"
                      >
                        {/* İkon Bölümü */}
                        <span className="flex h-12 w-12 items-center justify-center bg-[#d4b978] group-hover:bg-[#c5ad6e] transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                            <path d="m5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </span>
                        {/* Metin Bölümü - Renk değiştirildi */}
                        <span className="px-6 py-3 bg-teal-600 group-hover:bg-teal-700 transition-colors">
                          {tab.buttonText}
                        </span>
                      </Link>
                    </div>
                  </div>
                  {/* Sağ Taraf: Görsel */}
                  <div className="relative w-full h-full min-h-[450px]"> {/* Yükseklik artırıldı */}
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
