"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// WhyChooseSection veri tipi
interface WhyChooseSectionData {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  languageCode: string;
}

interface WhyChooseSectionProps {
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideButtons?: boolean;
}

const WhyChooseSection = ({ hideTitle = false, hideDescription = false, hideButtons = false }: WhyChooseSectionProps) => {
  const [sectionData, setSectionData] = useState<WhyChooseSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const locale = params?.locale || 'tr'; // Varsayılan olarak 'tr' kullanılır
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/home/why-choose-section?lang=${locale}`);
        
        if (!response.ok) {
          throw new Error('Veriler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setSectionData(data);
        setError(null);
      } catch (err) {
        console.error('WhyChooseSection verileri yüklenirken bir hata oluştu:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // YouTube iframe URL'sini oluştur
  const getYoutubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Yükleme durumu
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p>Yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  // Hata durumu
  if (error || !sectionData) {
    // Statik yedek verileri kullan
    const fallbackData = {
      youtubeVideoId: "gm_x8mMJ6i0",
      title: "Why Choose Celyxmed for Your Health Journey?",
      description: "Celyxmed is your trusted partner in healthcare, offering treatments in our state-of-the-art clinic and JCI-accredited partner hospitals. Our highly experienced surgeons, with over 10, 15, and even 25 years of expertise, provide world-class care tailored to your needs, ensuring a safe, comfortable, and successful health journey.",
      primaryButtonText: "Learn More About Our Treatments",
      primaryButtonLink: "/#treatments",
      secondaryButtonText: "Book Your Free Consultation",
      secondaryButtonLink: "/contact"
    };
    
    return renderContent(fallbackData);
  }

  // İçeriği render et
  return renderContent(sectionData);
  
  // İçerik render fonksiyonu
  function renderContent(data: any) {
    return (
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Video */}
            <div className="aspect-video mb-8">
              <iframe
                className="w-full h-full rounded-lg shadow-md"
                src={getYoutubeEmbedUrl(data.youtubeVideoId)}
                width="940"
                height="528"
                scrolling="no"
                allowFullScreen
                title="Celyxmed"
                loading="lazy"
              ></iframe>
            </div>

            {/* Başlık */}
            {!hideTitle && (
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-800">
                {data.title}
              </h2>
            )}

            {/* Açıklama */}
            {!hideDescription && (
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                {data.description}
              </p>
            )}

            {/* Butonlar */}
            {!hideButtons && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={data.primaryButtonLink}
                className="flex items-center gap-2 bg-[#4a8f9c] hover:bg-[#3d7a86] text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300"
              >
                <div className="bg-[#d4b978] rounded-lg p-1.5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium">{data.primaryButtonText}</span>
              </Link>
              
              <Link 
                href={data.secondaryButtonLink}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 text-sm font-medium"
              >
                {data.secondaryButtonText}
              </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
};

export default WhyChooseSection;
