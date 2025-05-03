"use client"; // window.location erişimi için client bileşeni olmalı

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone } from 'lucide-react'; // İkonlar
// WhatsApp ikonu için basit bir SVG veya başka bir ikon kütüphanesi kullanılabilir
// Örnek olarak lucide'dan Smartphone kullanalım
import { Smartphone } from 'lucide-react';

const FloatingButtons = () => {
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    // Bu kod sadece client tarafında çalışır
    const phone = "902167064780"; // index.html'den alınan numara
    // index.html'deki meta etiketlerinden mesajları almak yerine burada tanımlayalım
    const defaultMessage = "Hello, I would like to receive information about your treatments. Your Application Number: 107984338939 (Do not delete).";
    const utmMessage = "Hello, I would like to receive information about your treatments. Your Application Number: 207984338939 (Do not delete).";

    const urlParams = new URLSearchParams(window.location.search);
    const hasUtm = Array.from(urlParams.keys()).some(key => key.startsWith("utm_"));

    const message = hasUtm ? utmMessage : defaultMessage;
    const generatedLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    setWhatsappLink(generatedLink);

  }, []); // Sadece component mount olduğunda çalışır

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-between items-center md:justify-end md:space-x-4">
       {/* Sol Taraf: Konsültasyon Butonu (index.html'deki gibi) */}
       <div className="md:absolute md:left-4">
         <Button asChild className="shadow-lg">
           <Link href="/contact">
             <MessageSquare className="mr-2 h-4 w-4" /> Consultation
           </Link>
         </Button>
       </div>

       {/* Sağ Taraf: WhatsApp ve Telefon Butonları */}
       <div className="flex space-x-3">
         {whatsappLink && ( // Link hazır olduğunda göster
           <Button
             asChild
             size="icon"
             className="rounded-full w-12 h-12 bg-green-500 hover:bg-green-600 text-white shadow-lg"
           >
             <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
               <Smartphone className="h-6 w-6" /> {/* WhatsApp ikonu */}
             </a>
           </Button>
         )}
         <Button
           asChild
           size="icon"
           variant="outline"
           className="rounded-full w-12 h-12 bg-white border-blue-500 text-blue-500 hover:bg-blue-50 shadow-lg"
         >
           <a href="tel:+902167064780" aria-label="Phone">
             <Phone className="h-6 w-6" />
           </a>
         </Button>
       </div>
    </div>
  );
};

export default FloatingButtons;
