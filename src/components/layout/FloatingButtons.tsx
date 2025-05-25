"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, MessageCircle } from 'lucide-react';

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
  const defaultPhoneNumber = "902167064780"; // Varsayılan numara, eğer prop gelmezse kullanılır

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
            className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            aria-label="WhatsApp ile iletişime geçin"
            style={{ transitionDelay: '100ms' }}
          >
            {/* Pulse animasyonu */}
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
            
            <MessageCircle className="h-6 w-6 relative z-10" />
            
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
          className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          aria-label="Telefonla arayın"
          style={{ transitionDelay: '200ms' }}
        >
          {/* Glow efekti */}
          <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          
          <Phone className="h-6 w-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          
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
