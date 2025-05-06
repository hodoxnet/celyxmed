"use client";

import React from 'react';
import Image from 'next/image';

interface ImageItem {
  src: string;
  alt: string;
}

interface ImageMarqueeProps {
  images: ImageItem[];
}

const ImageMarquee: React.FC<ImageMarqueeProps> = ({ images }) => {
  // Eğer resim yoksa veya az sayıda varsa (döngü için yetersizse) bileşeni render etme
  if (!images || images.length < 1) {
    return null;
  }

  // Sonsuz döngü için resimleri çoğaltma (en az 4 tane ekleyelim, veya tüm liste kadar)
  const duplicatedImages = [...images, ...images.slice(0, Math.min(images.length, 4))];

  return (
    <section className="py-8 md:py-12 bg-white"> {/* Arka planı veya padding'i ayarlayabilirsiniz */}
      <div className="container mx-auto px-4">
        <div className="overflow-hidden">
          <div className="flex animate-marquee space-x-4 md:space-x-6">
            {duplicatedImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-60 h-80 md:w-72 md:h-96 relative rounded-lg overflow-hidden shadow-md" /* Boyutları ayarlayabilirsiniz */
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 15rem, 18rem" // Optimize image loading
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageMarquee;
