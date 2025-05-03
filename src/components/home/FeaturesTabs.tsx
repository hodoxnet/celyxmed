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
      <div className="container mx-auto px-4">
        {/* Ana Başlık ve Alt Başlık */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-800">
            Discover World-Class Healthcare with Celyxmed in Turkey
          </h2>
          <p className="text-lg text-gray-600">
            Experience personalized treatments from Turkey’s top specialists at JCI-accredited clinics. Celyxmed combines trusted healthcare with affordable solutions for your well-being.
          </p>
        </div>

        {/* Sekmeler */}
        <Tabs defaultValue={tabData[0].value} className="w-full">
          {/* Sekme Tetikleyicileri */}
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 md:mb-12">
            {tabData.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="py-3 text-base">
                {tab.trigger}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Sekme İçerikleri */}
          {tabData.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Card className="overflow-hidden shadow-lg"> {/* Kart görünümü */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Sol Taraf: Metin İçeriği */}
                  <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center order-2 md:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold mb-4 self-start">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      {tab.tag}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-800">
                      {tab.heading}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {tab.description}
                    </p>
                    <Button asChild className="self-start">
                      <Link href={tab.buttonLink}>
                        {tab.buttonText}
                        {/* İkon eklenebilir */}
                      </Link>
                    </Button>
                  </div>
                  {/* Sağ Taraf: Görsel */}
                  <div className="relative w-full aspect-square md:aspect-auto order-1 md:order-2 min-h-[300px] md:min-h-0">
                    <Image
                      src={tab.imageUrl}
                      alt={tab.heading}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default FeaturesTabs;
