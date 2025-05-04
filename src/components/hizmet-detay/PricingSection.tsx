// src/components/hizmet-detay/PricingSection.tsx
import React from 'react';
import Link from 'next/link'; // Link bileşenini import et
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Kart yapısı için

// Fiyatlandırma paketi tipi (Temsili)
interface PricingPackage {
  id: string;
  title: string;
  description?: string;
  price: string; // Fiyat (örn: "$6,000 - $10,000")
  features: string[]; // Dahil olan özellikler listesi
  isFeatured?: boolean; // Öne çıkan paket mi?
}

interface PricingSectionProps {
  sectionTitle: string;
  sectionDescription?: string;
  packages: PricingPackage[];
  contactButtonText?: string;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  sectionTitle,
  sectionDescription,
  packages,
  contactButtonText = "Detaylı Fiyat ve Paket Bilgisi İçin İletişime Geçin"
}) => {
  if (!packages || packages.length === 0) {
    // Paket yoksa belki genel bir iletişim mesajı gösterilebilir
     return (
        <section className="py-16">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
                 {sectionDescription && <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">{sectionDescription}</p>}
                 <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Size özel tedavi planı ve güncel fiyat bilgisi için lütfen bizimle iletişime geçin.</p>
                 <Button asChild size="lg">
                    <Link href="/iletisim">{contactButtonText}</Link>
                 </Button>
            </div>
        </section>
     );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
          {sectionDescription && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{sectionDescription}</p>
          )}
        </div>

        {/* Fiyatlandırma Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"> {/* items-stretch kartları eşitler */}
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`flex flex-col ${pkg.isFeatured ? 'border-blue-500 border-2 shadow-lg dark:border-blue-400' : 'border dark:border-gray-700'}`}>
              <CardHeader>
                <CardTitle>{pkg.title}</CardTitle>
                {pkg.description && <CardDescription>{pkg.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow"> {/* flex-grow içeriği iter */}
                <div className="text-3xl font-bold mb-4">{pkg.price}</div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" variant={pkg.isFeatured ? 'default' : 'outline'}>
                   <Link href="/iletisim">Paketi Seç / Bilgi Al</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
         <div className="text-center mt-12">
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Fiyatlar ve paket içerikleri kişisel ihtiyaçlarınıza göre değişiklik gösterebilir. En doğru bilgi için lütfen ücretsiz konsültasyon talep edin.</p>
             <Button asChild>
                <Link href="/iletisim">{contactButtonText}</Link>
             </Button>
         </div>
      </div>
    </section>
  );
};

export default PricingSection;
