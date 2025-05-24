"use client";

import React from 'react';
import { use } from 'react';
import ContactForm from '@/components/contact/ContactForm';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export default function ContactPage({ params }: ContactPageProps) {
  const resolvedParams = use(params);
  const { locale } = resolvedParams;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* İletişim Formu ve Bilgi Bölümü */}
        <section className="pt-32 md:pt-40 lg:pt-48 pb-16 md:pb-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[480px_1fr] gap-8 lg:gap-12 items-start">
              {/* Sol taraf - Resim */}
              <div className="order-2 lg:order-1 max-w-lg">
                <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#d4b978] to-[#c9a96e]" style={{ aspectRatio: '1.2/1' }}>
                  <img
                    src="https://cdn.prod.website-files.com/67deade75b02537eadc0bc9f/67deade75b02537eadc0c155_book-your-free-consultation%20(1).avif"
                    alt="Ücretsiz konsültasyon"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Sol alttaki bilgi bölümü */}
                <div className="mt-8 bg-[#f6f9fc] rounded-2xl p-8">
                  {/* Online Indicator */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="relative">
                      <div className="w-3 h-3 bg-[#4a8f9c] rounded-full"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-[#4a8f9c] rounded-full animate-ping opacity-60"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Sağlık Danışmanlarımız Çevrimiçi
                    </span>
                  </div>

                  {/* Başlık */}
                  <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                    Sağlık Danışmanlarımız Çevrimiçi ve Size Yardımcı Olmaya Hazır
                  </h2>

                  {/* Açıklama */}
                  <p className="text-gray-600 leading-relaxed">
                    Tedavilerimiz hakkında sorularınız mı var? Deneyimli sağlık danışmanlarımız, 
                    size kişiselleştirilmiş tavsiyeler sunmak ve daha iyi bir sağlık yolculuğunuzda 
                    size rehberlik etmek için sadece bir mesaj uzağınızda.
                  </p>
                </div>
              </div>

              {/* Sağ taraf - Form */}
              <div className="order-1 lg:order-2">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* Harita ve İletişim Bilgileri */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <div className="bg-gray-50 rounded-2xl p-8">
              {/* Google Maps */}
              <div className="mb-8">
                <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.783599438253!2d29.13124327600273!3d40.98621917135361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab80f8174c7a9%3A0x87045266437b17aa!2sCelyxmed!5e0!3m2!1str!2str!4v1736516090096!5m2!1str!2str"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* İletişim Bilgileri Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {/* E-posta */}
                <div className="text-center md:text-left">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    E-posta Adresi
                  </h3>
                  <a 
                    href="mailto:contact@celyxmed.com?subject=Hello%2C%20I%20Want%20to%20Get%20Information"
                    className="text-2xl lg:text-3xl font-light text-gray-900 hover:text-teal-600 transition-colors"
                  >
                    contact@celyxmed.com
                  </a>
                </div>

                {/* Telefon */}
                <div className="text-center md:text-left">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Telefon
                  </h3>
                  <a 
                    href="tel:+902167064780"
                    className="text-2xl lg:text-3xl font-light text-gray-900 hover:text-teal-600 transition-colors"
                  >
                    +90 216 706 47 80
                  </a>
                </div>

                {/* Adres */}
                <div className="text-center md:text-left">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Adres
                  </h3>
                  <div className="space-y-1">
                    <div className="text-2xl lg:text-3xl font-light text-gray-900">
                      Atatürk, Girne Caddesi
                    </div>
                    <div className="text-2xl lg:text-3xl font-light text-gray-900">
                      No:31, 34758
                    </div>
                    <div className="text-2xl lg:text-3xl font-light text-gray-900">
                      Ataşehir/İstanbul
                    </div>
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