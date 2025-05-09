'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

const ClinicShowcaseDynamic = () => {
  const [data, setData] = useState<ClinicShowcaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/home/clinic-showcase?lang=${locale || 'tr'}`);
        if (!response.ok) {
          throw new Error('Failed to fetch clinic showcase data');
        }
        
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error('Error fetching clinic showcase data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locale]);

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
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Sol Sütun: Metin İçeriği */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
              {data.content.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base md:text-lg">
              {data.content.description}
            </p>
            <div>
              <Link href={data.content.buttonLink || '/'} className="inline-flex items-center rounded-full overflow-hidden shadow-md group transition-shadow hover:shadow-lg text-white font-medium text-base">
                {/* İkon Bölümü */}
                <span className="flex h-12 w-12 items-center justify-center bg-[#d4b978] group-hover:bg-[#c5ad6e] transition-colors">
                  <ArrowRight className="h-5 w-5 text-white" />
                </span>
                {/* Metin Bölümü */}
                <span className="px-6 py-3 bg-teal-600 group-hover:bg-teal-700 transition-colors">
                  {data.content.buttonText}
                </span>
              </Link>
            </div>
          </div>
          
          {/* Sağ Sütun: İki Resim Yan Yana */}
          <div className="grid grid-cols-2 gap-4 h-80 md:h-[450px]">
            {data.images.length > 0 && data.images.slice(0, 2).map((image, index) => (
              <div 
                key={image.id} 
                className="rounded-lg overflow-hidden h-full"
              >
                <Image
                  src={image.imageUrl}
                  alt={image.altText || data.content.title}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClinicShowcaseDynamic;