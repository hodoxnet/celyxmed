"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Lottie from 'lottie-react';

interface FloatingButtonsProps {
  whatsappNumber?: string | null;
  stickyButtonText?: string | null;
  stickyButtonLink?: string | null;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({
  whatsappNumber,
  stickyButtonText,
  stickyButtonLink,
}) => {
  const [whatsappLink, setWhatsappLink] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [whatsappAnimation, setWhatsappAnimation] = useState(null);
  const [phoneAnimation, setPhoneAnimation] = useState(null);
  const defaultPhoneNumber = "902167064780"; // Varsayılan numara, eğer prop gelmezse kullanılır
  
  // Lottie animasyon URL'leri
  const whatsappAnimationUrl = "https://cdn.prod.website-files.com/676bde51384f76011aa96afe/676bde51384f76011aa96f39_139413.json";
  const phoneAnimationUrl = "https://cdn.prod.website-files.com/676bde51384f76011aa96afe/676bde51384f76011aa96f3b_eea59bc0c37846698d67eb2ca41eceef.json";

  useEffect(() => {
    const phoneToUse = whatsappNumber || defaultPhoneNumber;
    const defaultMessage = "Hello, I would like to receive information about your treatments. Your Application Number: 107984338939 (Do not delete).";
    const utmMessage = "Hello, I would like to receive information about your treatments. Your Application Number: 207984338939 (Do not delete).";

    const urlParams = new URLSearchParams(window.location.search);
    const hasUtm = Array.from(urlParams.keys()).some(key => key.startsWith("utm_"));

    const message = hasUtm ? utmMessage : defaultMessage;
    const generatedLink = `https://wa.me/${phoneToUse.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    setWhatsappLink(generatedLink);
    
    // Sayfa yüklendiğinde animasyonlu giriş
    setTimeout(() => {
      setIsVisible(true);
    }, 500);
  }, [whatsappNumber]);

  // Lottie animasyonlarını yükle
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        // WhatsApp animasyonu
        const whatsappResponse = await fetch(whatsappAnimationUrl);
        const whatsappData = await whatsappResponse.json();
        setWhatsappAnimation(whatsappData);

        // Telefon animasyonu
        const phoneResponse = await fetch(phoneAnimationUrl);
        const phoneData = await phoneResponse.json();
        setPhoneAnimation(phoneData);
      } catch (error) {
        console.error('Animasyonlar yüklenemedi:', error);
      }
    };

    fetchAnimations();
  }, []);

  const finalStickyButtonLink = stickyButtonLink || "/contact";
  const finalStickyButtonText = stickyButtonText || "Consultation";

  return (
    <>
      {/* Sol Alt: WhatsApp ve Telefon Butonları */}
      <div className={`fixed bottom-8 left-8 z-50 flex flex-col gap-4 sm:flex-row transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}>
        {whatsappLink && (
          <Link 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative text-white p-2 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300"
            aria-label="WhatsApp ile iletişime geçin"
            style={{ transitionDelay: '100ms' }}
          >
            {/* Lottie WhatsApp animasyonu */}
            <div className="relative z-10 w-12 h-12">
              {whatsappAnimation ? (
                <Lottie 
                  animationData={whatsappAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                // Fallback ikon animasyon yüklenene kadar
                <div className="w-12 h-12 flex items-center justify-center">
                  <span className="text-green-600 text-xl">💬</span>
                </div>
              )}
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              WhatsApp
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </Link>
        )}
        
        {/* Telefon butonu */}
        <Link 
          href={`tel:${(whatsappNumber || defaultPhoneNumber).replace(/\s+/g, '')}`}
          className="group relative text-white p-2 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300"
          aria-label="Telefonla arayın"
          style={{ transitionDelay: '200ms' }}
        >
          {/* Lottie Telefon animasyonu */}
          <div className="relative z-10 w-12 h-12">
            {phoneAnimation ? (
              <Lottie 
                animationData={phoneAnimation}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              // Fallback ikon animasyon yüklenene kadar
              <div className="w-12 h-12 flex items-center justify-center">
                <span className="text-blue-600 text-xl">📞</span>
              </div>
            )}
          </div>
          
          {/* Hover tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Ara
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Sağ Alt: Consultation Butonu */}
      {(finalStickyButtonText && finalStickyButtonLink) && (
        <div className={`fixed bottom-8 right-8 z-50 transition-all duration-700 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
        }`} style={{ transitionDelay: '300ms' }}>
          <Link 
            href={finalStickyButtonLink}
            className="group bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden relative"
          >
            {/* Shimmer efekti */}
            <div className="absolute inset-0 -inset-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-10 group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <span className="relative z-10 font-medium">{finalStickyButtonText}</span>
            <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      )}
      
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingButtons;
