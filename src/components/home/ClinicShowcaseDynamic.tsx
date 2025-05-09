'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ClinicShowcaseContent {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface ClinicShowcaseImage {
  id: string;
  imageUrl: string;
  altText: string;
}

interface ClinicShowcaseData {
  content: ClinicShowcaseContent | null;
  images: ClinicShowcaseImage[];
}

// Örnek sabit veriler (API yanıt vermezse)
const sampleImages = [
  {
    id: "1",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c396_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
    altText: "Celyxmed building entrance"
  },
  {
    id: "2",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c398_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-2.avif",
    altText: "Celyxmed modern reception area"
  },
  {
    id: "3",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c39b_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-3.avif",
    altText: "Celyxmed clinic interior"
  },
  {
    id: "4",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c3a5_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
    altText: "Celyxmed reception area"
  }
];

const sampleContent = {
  title: "İstanbul'da Son Teknoloji Klinik",
  description: "İstanbul Ataşehir'deki modern kliniğimiz en yüksek güvenlik, hijyen ve konfor standartlarını sağlamak üzere tasarlanmıştır. Estetik ameliyatlarımız JCI tarafından akredite edilmiş ortak hastanelerde gerçekleştirilirken, her adımda sağlığınıza öncelik vererek konsültasyondan iyileşmeye kadar sorunsuz bir deneyim sağlıyoruz.",
  buttonText: "Kliniğimizi Keşfedin",
  buttonLink: "/klinigimiz"
};

const ClinicShowcaseDynamic = () => {
  const [data, setData] = useState<ClinicShowcaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useParams();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const animationSpeed = 0.5; // Daha yavaş animasyon için düşük değer

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/home/clinic-showcase?lang=${locale || 'tr'}`);
        if (!response.ok) {
          throw new Error('Failed to fetch clinic showcase data');
        }
        
        const responseData = await response.json();
        
        // API verileri gelirse onları kullan
        if (responseData && (responseData.images?.length > 0 || responseData.content)) {
          setData(responseData);
        } else {
          // Veritabanından veri gelmezse örnek verileri kullan
          setData({
            content: sampleContent,
            images: sampleImages
          });
        }
      } catch (error) {
        console.error('Error fetching clinic showcase data:', error);
        setError('Veri yüklenirken bir hata oluştu.');
        
        // Hata durumunda örnek verileri kullan
        setData({
          content: sampleContent,
          images: sampleImages
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // Marquee animasyonu için
  useEffect(() => {
    if (!data?.images || data.images.length <= 1) return;

    let animationId: number;
    const animate = () => {
      setScrollPosition(prev => {
        const newPosition = prev + animationSpeed;
        
        // Marquee genişliğini kontrol et
        if (marqueeRef.current) {
          // İlk resim genişliği + margin kadar kaydıktan sonra sıfırla
          // Bu, yeni bir resim göründüğünde pozisyonu sıfırlayarak sonsuz kayma etkisi yaratır
          const imageWidth = marqueeRef.current.querySelector('.marquee-image')?.clientWidth || 0;
          const margin = imageWidth * 0.02; // %2 margin
          
          if (newPosition > (imageWidth + margin)) {
            return 0;
          }
        }
        
        return newPosition;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [data?.images]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="h-80 flex items-center justify-center">
            <p>Yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  // Veriler yok veya uygun formatta değilse bileşeni gösterme
  if (!data || !data.content || data.images.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Sol Sütun: Metin İçeriği */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-tight">
              {data.content.title}
            </h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg max-w-prose">
              {data.content.description}
            </div>
            <div className="pt-4">
              <Link 
                href={data.content.buttonLink || '/'} 
                className="group inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors"
              >
                <span className="mr-3 font-medium">{data.content.buttonText}</span>
                <div className="h-px w-10 bg-gray-300 relative overflow-hidden">
                  <div className="h-px w-10 bg-teal-600 absolute left-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Sağ Sütun: Kayan Resimler (Marquee) */}
          <div className="relative overflow-hidden">
            <div className="marquee-hero-wrapper">
              <div ref={marqueeRef} className="marquee-container whitespace-nowrap">
                {/* Tüm resimleri 3 kere göster (sonsuz efekt için) */}
                {[...data.images, ...data.images, ...data.images].map((image, index) => (
                  <div 
                    key={`${image.id}-${index}`} 
                    className="marquee-image inline-block w-[48%] h-[320px] md:h-[380px] overflow-hidden rounded-lg mr-[2%]"
                    style={{
                      transform: `translateX(-${scrollPosition}px)`,
                      transition: 'transform 0.1s linear'
                    }}
                  >
                    <div className="w-full h-full relative">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText || "Celyxmed Clinic Image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS stilleri */}
      <style jsx>{`
        .marquee-hero-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        
        .marquee-container {
          display: flex;
          width: max-content;
        }
      `}</style>
    </section>
  );
};

export default ClinicShowcaseDynamic;