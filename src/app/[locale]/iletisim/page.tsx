"use client";

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import ContactForm from '@/components/contact/ContactForm';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export default function ContactPage({ params }: ContactPageProps) {
  const resolvedParams = use(params);
  const { locale } = resolvedParams;
  
  const [contactData, setContactData] = useState<any>({
    heroImageUrl: "https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c155_book-your-free-consultation%20(1).avif",
    heroImageAlt: "Ücretsiz konsültasyon",
    onlineIndicatorText: "Sağlık Danışmanlarımız Çevrimiçi",
    advisorTitle: "Sağlık Danışmanlarımız Çevrimiçi ve Size Yardımcı Olmaya Hazır",
    advisorDescription: "Uzman ekibimiz, sağlık yolculuğunuzda size rehberlik etmek için burada. Sorularınızı yanıtlamak ve size en uygun tedavi seçeneklerini sunmak için sabırsızlanıyoruz.",
    mapTitle: "Bize Ulaşın",
    addressTitle: "Adres",
    addressText: "Ataşehir, İstanbul",
    phoneTitle: "Telefon",
    phoneText: "+90 XXX XXX XX XX",
    emailTitle: "E-posta",
    emailText: "info@celyxmed.com",
    workingHoursTitle: "Çalışma Saatleri",
    workingHoursText: "Pazartesi - Cumartesi: 09:00 - 18:00"
  });

  // İletişim sayfası verilerini yükle
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch(`/api/contact-page?lang=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setContactData((prev: any) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("İletişim verileri yüklenirken hata:", error);
      }
    };

    fetchContactData();
  }, [locale]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* İletişim Formu ve Bilgi Bölümü */}
        <section className="pt-32 md:pt-40 lg:pt-48 pb-16 md:pb-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[480px_1fr] gap-8 lg:gap-12 items-stretch">
              {/* Sol taraf - Resim */}
              <div className="order-2 lg:order-1 max-w-lg flex flex-col">
                <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#d4b978] to-[#c9a96e]" style={{ aspectRatio: '1.2/1' }}>
                  <img
                    src={contactData.heroImageUrl}
                    alt={contactData.heroImageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Sol alttaki bilgi bölümü */}
                <div className="mt-8 bg-[#f6f9fc] border border-gray-200 rounded-2xl p-8 flex-1 flex flex-col justify-center">
                  {/* Online Indicator */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="relative">
                      <div className="w-3 h-3 bg-[#4a8f9c] rounded-full"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-[#4a8f9c] rounded-full animate-ping opacity-60"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {contactData.onlineIndicatorText}
                    </span>
                  </div>

                  {/* Başlık */}
                  <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                    {contactData.advisorTitle}
                  </h2>

                  {/* Açıklama */}
                  <p className="text-gray-600 leading-relaxed">
                    {contactData.advisorDescription}
                  </p>
                </div>
              </div>

              {/* Sağ taraf - Form */}
              <div className="order-1 lg:order-2">
                <ContactForm locale={locale} />
              </div>
            </div>
          </div>
        </section>

        {/* Harita ve İletişim Bilgileri */}
        <section className="pb-16 md:pb-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
              {/* Sol taraf - Google Maps */}
              <div>
                <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.783599438253!2d29.13124327600273!3d40.98621917135361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab80f8174c7a9%3A0x87045266437b17aa!2sCelyxmed!5e0!3m2!1str!2str!4v1736516090096!5m2!1str!2str"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* Sağ taraf - İletişim Bilgileri */}
              <div className="space-y-8 text-right">
                {/* E-posta */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {contactData.emailTitle}
                  </h3>
                  <a 
                    href={`mailto:${contactData.emailText}?subject=Hello%2C%20I%20Want%20to%20Get%20Information`}
                    className="text-3xl lg:text-4xl font-light text-gray-900 hover:text-teal-600 transition-colors block"
                  >
                    {contactData.emailText}
                  </a>
                </div>

                {/* Telefon */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {contactData.phoneTitle}
                  </h3>
                  <a 
                    href={`tel:${contactData.phoneText.replace(/\s/g, '')}`}
                    className="text-3xl lg:text-4xl font-light text-gray-900 hover:text-teal-600 transition-colors block"
                  >
                    {contactData.phoneText}
                  </a>
                </div>

                {/* Adres */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {contactData.addressTitle}
                  </h3>
                  <div className="text-3xl lg:text-4xl font-light text-gray-900">
                    {contactData.addressText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}