'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Görüntülenecek tüm resimler (API yanıt vermediğinde örnek olarak kullanılacak)
const sampleImages = [
  {
    id: "1",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c396_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
    altText: "Celyxmed building entrance"
  },
  {
    id: "2",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c398_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-2.avif",
    altText: "Reception area with modern design"
  },
  {
    id: "3",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c39b_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-3.avif",
    altText: "Curved screen display with fish"
  },
  {
    id: "4",
    imageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c3a5_celyxmed-aesthetic-hair-transplantation-dental-clinic-turkey-1.avif",
    altText: "Celyxmed reception desk"
  }
];

// Örnek içerik (API yanıt vermediğinde kullanılacak)
const sampleContent = {
  title: "İstanbul'da Son Teknoloji Klinik",
  description: "İstanbul Ataşehir'deki modern kliniğimiz en yüksek güvenlik, hijyen ve konfor standartlarını sağlamak üzere tasarlanmıştır. Estetik ameliyatlarımız JCI tarafından akredite edilmiş ortak hastanelerde gerçekleştirilirken, her adımda sağlığınıza öncelik vererek konsültasyondan iyileşmeye kadar sorunsuz bir deneyim sağlıyoruz.",
  buttonText: "Kliniğimizi Keşfedin",
  buttonLink: "/klinigimiz"
};

// Veri tipleri
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

const ClinicShowcaseCarousel = () => {
  const [data, setData] = useState<ClinicShowcaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { locale = 'tr' } = useParams() as { locale?: string };

  const trackRef = useRef<HTMLDivElement>(null);
  const imageItemRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  // API'den veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/home/clinic-showcase?lang=${locale}`);
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

  // Kesintisiz kaydırma animasyonu
  useEffect(() => {
    if (isLoading || !data?.images || data.images.length <= 1 || !trackRef.current || !imageItemRef.current) {
      // Animasyon zaten çalışıyorsa durdur
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (trackRef.current) { // Eğer track varsa ve animasyon durduruluyorsa pozisyonu sıfırla
        trackRef.current.style.transform = 'translateX(0px)';
        scrollPositionRef.current = 0;
      }
      return;
    }

    const track = trackRef.current;
    const imageItemWidth = imageItemRef.current.offsetWidth;
    const totalScrollWidth = imageItemWidth * data.images.length; // Orijinal setin toplam genişliği

    let lastTime = 0;
    const speed = 0.03; // Piksel/milisaniye cinsinden hız (düşük değer = yavaş kayma)

    const animateScroll = (timestamp: number) => {
      if (!lastTime) {
        lastTime = timestamp;
      }
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      scrollPositionRef.current -= speed * deltaTime;

      if (scrollPositionRef.current <= -totalScrollWidth) {
        scrollPositionRef.current += totalScrollWidth; 
        // Bu anlık sıçramayı yumuşatmak için, tam olarak totalScrollWidth kadar eklemek yerine
        // scrollPositionRef.current = scrollPositionRef.current % totalScrollWidth; (negatif değerlerle çalışır)
        // veya daha basitçe: scrollPositionRef.current = 0; (eğer tam başa dönmesi isteniyorsa ve görseller tam sığıyorsa)
        // Ancak mevcut mantık, bir sonraki "aynı" resme geçişi sağlar.
      }
      if (track) {
        track.style.transform = `translateX(${scrollPositionRef.current}px)`;
      }
      animationFrameRef.current = requestAnimationFrame(animateScroll);
    };

    // Animasyonu başlatmadan önce pozisyonu sıfırla
    scrollPositionRef.current = 0;
    if (track) {
      track.style.transform = `translateX(0px)`;
    }
    
    animationFrameRef.current = requestAnimationFrame(animateScroll);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTime = 0; // lastTime'ı sıfırla ki bir sonraki animasyon başlangıcında doğru deltaTime hesaplansın
    };
  }, [isLoading, data?.images, imageItemRef, trackRef]);


  // Yükleniyor durumu
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

  // Veri yoksa gösterme
  if (!data || !data.content || data.images.length === 0) {
    return null;
  }

  // İki resim yoksa bir resim göster
  if (data.images.length === 1) {
    return (
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
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
                  href={data.content.buttonLink}
                  className="group inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <span className="mr-3 font-medium">{data.content.buttonText}</span>
                  <div className="h-px w-10 bg-gray-300 relative overflow-hidden">
                    <div className="h-px w-10 bg-teal-600 absolute left-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Sağ Sütun: Tek Resim */}
            <div className="h-[350px] rounded-xl overflow-hidden relative">
              <Image
                src={data.images[0].imageUrl}
                alt={data.images[0].altText || "Clinic image"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
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
          
          {/* Sağ Sütun: Kayan Resimler */}
          <div className="h-[350px] rounded-xl overflow-hidden relative">
            <div
              ref={trackRef}
              className="flex h-full" // Resimlerin içinde kayacağı iz (track)
            >
              {(data.images || []).concat(data.images || []).map((image, index) => (
                <div
                  key={`${image.id}-${index}`} // Benzersiz key
                  ref={index === 0 ? imageItemRef : null} // Genişliği ölçmek için ilk öğeye ref ata
                  className="flex-shrink-0 h-full"
                  style={{ 
                    width: `calc(50% - 8px)`, // Her resim viewport'un yarısı kadar yer kaplar (eksi boşluk)
                    margin: '0 4px' // Resimler arası 8px boşluk oluşturur
                  }}
                >
                  <div className="w-full h-full rounded-lg overflow-hidden relative">
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || "Clinic image"}
                      fill
                      priority={index < Math.min(data.images.length, 4)} // İlk birkaç resmi öncelikli yükle
                      sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw" // Boyutları ayarla
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicShowcaseCarousel;
