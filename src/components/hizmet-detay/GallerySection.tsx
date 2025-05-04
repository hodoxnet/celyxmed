// src/components/hizmet-detay/GallerySection.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Link bileşenini import et
import { Button } from '@/components/ui/button'; // Butonları ekleyelim

// Galeri öğesi tipi
interface GalleryItem {
  id: string;
  src: string;
  alt: string;
}

interface GallerySectionProps {
  sectionTitle: string;
  sectionDescription: string;
  images: GalleryItem[];
  ctaButtonText?: string; // Opsiyonel CTA butonu metni
  ctaButtonLink?: string; // Opsiyonel CTA butonu linki
  viewMoreButtonText?: string; // Opsiyonel Daha Fazla Gör butonu metni
  viewMoreButtonLink?: string; // Opsiyonel Daha Fazla Gör butonu linki
}

const GallerySection: React.FC<GallerySectionProps> = ({
  sectionTitle,
  sectionDescription,
  images,
  ctaButtonText = "Ücretsiz Konsültasyonunuzu Yaptırın",
  ctaButtonLink = "/iletisim",
  viewMoreButtonText = "Başarı Hikayelerini ve Öncesi, Sonrasını Keşfedin",
  viewMoreButtonLink = "#" // Gerçek link ile değiştirilmeli
}) => {
  if (!images || images.length === 0) {
    return null;
  }

  // Gösterilecek resim sayısı (örneğin ilk 4)
  const displayedImages = images.slice(0, 4);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{sectionDescription}</p>
        </div>

        {/* Basit Grid Galeri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {displayedImages.map((image) => (
            <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden shadow-md">
              <Image
                src={image.src}
                alt={image.alt}
                layout="fill"
                objectFit="cover"
                loading="lazy"
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
           <Button asChild size="lg">
             <Link href={ctaButtonLink}>{ctaButtonText}</Link>
           </Button>
           <Button variant="outline" size="lg" asChild>
             <Link href={viewMoreButtonLink}>{viewMoreButtonText}</Link>
           </Button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
