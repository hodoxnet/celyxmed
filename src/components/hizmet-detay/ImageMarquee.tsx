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
    <section className="py-8 md:py-12 bg-white w-full"> {/* Arka planı veya padding'i ayarlayabilirsiniz */}
      <div className="overflow-hidden w-full">
        <div className="flex animate-marquee space-x-4 md:space-x-6">
            {duplicatedImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[28rem] h-96 md:w-[40rem] md:h-[30rem] relative rounded-lg overflow-hidden shadow-md" /* Boyutları ayarlayabilirsiniz */
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: "fill" }}
                  className="transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 28rem, 40rem" // Optimize image loading
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default ImageMarquee;
