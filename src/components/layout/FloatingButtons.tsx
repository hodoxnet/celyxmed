"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
  }, [whatsappNumber]);

  const finalStickyButtonLink = stickyButtonLink || "/contact";
  const finalStickyButtonText = stickyButtonText || "Consultation";

  return (
    <>
      {/* Sol Alt: WhatsApp ve Telefon Butonları */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-4 sm:flex-row">
        {whatsappLink && (
          <Link 
            href={whatsappLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full flex items-center justify-center shadow-lg"
            aria-label="WhatsApp ile iletişime geçin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </Link>
        )}
        {/* Telefon butonu, eğer whatsappNumber prop'u varsa onu kullanır, yoksa varsayılanı */}
        <Link 
          href={`tel:${(whatsappNumber || defaultPhoneNumber).replace(/\s+/g, '')}`}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full flex items-center justify-center shadow-lg"
          aria-label="Telefonla arayın"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </Link>
      </div>
      
      {/* Sağ Alt: Consultation Butonu */}
      {(finalStickyButtonText && finalStickyButtonLink) && (
        <div className="fixed bottom-8 right-8 z-50">
          <Link 
            href={finalStickyButtonLink}
            className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-md flex items-center gap-2 shadow-lg"
          >
            <ArrowRight className="h-5 w-5" />
            <span>{finalStickyButtonText}</span>
          </Link>
        </div>
      )}
    </>
  );
};

export default FloatingButtons;
