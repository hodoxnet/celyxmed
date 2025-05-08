"use client";

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { GeneralSettingWithTranslation } from '@/types/form-types'; // Tip tanımını import ediyoruz

interface RootLayoutClientProps {
  children: React.ReactNode;
  locale: string;
  messages: any; // Veya daha spesifik bir tip kullanabilirsiniz: AbstractIntlMessages
  generalSettings: GeneralSettingWithTranslation | null; // Yeni prop
}

export default function RootLayoutClient({ children, locale, messages, generalSettings }: RootLayoutClientProps) {
  // generalSettings null ise veya bazı temel alanlar eksikse varsayılan değerler kullanılabilir.
  // Örneğin, logoUrl veya diğer kritik bilgiler için.
  // Şimdilik doğrudan prop olarak geçiyoruz.
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="flex flex-col min-h-screen">
          <Navbar logoUrl={generalSettings?.logoUrl} headerButtonText={generalSettings?.translation?.headerButtonText} headerButtonLink={generalSettings?.translation?.headerButtonLink} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer 
            socialLinks={{
              youtube: generalSettings?.translation?.socialYoutubeUrl,
              instagram: generalSettings?.translation?.socialInstagramUrl,
              tiktok: generalSettings?.translation?.socialTiktokUrl,
              facebook: generalSettings?.translation?.socialFacebookUrl,
              linkedin: generalSettings?.translation?.socialLinkedinUrl,
            }}
            contactInfo={{
              whatsapp: generalSettings?.whatsappNumber,
              phone: generalSettings?.phoneNumber,
              email: generalSettings?.emailAddress,
              address: generalSettings?.fullAddress,
            }}
            copyrightText={generalSettings?.translation?.copyrightText}
          />
          <FloatingButtons 
            whatsappNumber={generalSettings?.whatsappNumber}
            stickyButtonText={generalSettings?.translation?.stickyButtonText}
            stickyButtonLink={generalSettings?.translation?.stickyButtonLink}
          />
        </div>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
