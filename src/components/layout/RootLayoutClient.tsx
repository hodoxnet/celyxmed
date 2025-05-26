"use client";

import React from 'react';
import NavbarWrapper from './NavbarWrapper';
import FooterWrapper from './FooterWrapper';
import FloatingButtons from './FloatingButtons';
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { GeneralSettingWithTranslation } from '@/types/form-types';

// Menü veri tipleri (layout.tsx'den veya ortak tiplerden)
interface MenuItem {
  id: string;
  title: string;
  href: string;
  openInNewTab: boolean;
  children: MenuItem[];
}
interface HeaderMenu {
  id: string;
  name: string;
  items: MenuItem[];
}
interface FooterMenu {
  id: string;
  name: string;
  items: Omit<MenuItem, 'children'>[];
}

interface RootLayoutClientProps {
  children: React.ReactNode;
  locale: string;
  messages: any; // Veya daha spesifik bir tip kullanabilirsiniz: AbstractIntlMessages
  generalSettings: GeneralSettingWithTranslation | null;
  headerMenu: HeaderMenu[] | null; // Header menü prop'u eklendi
  footerMenus: FooterMenu[] | null; // Footer menüleri prop'u eklendi
}

export default function RootLayoutClient({ children, locale, messages, generalSettings, headerMenu, footerMenus }: RootLayoutClientProps) {
  // Page transition state kaldırıldı - sadece Navbar'daki dil değişikliği animasyonu kullanılacak

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="flex flex-col min-h-screen">
          {/* NavbarWrapper kullanımını düzelt */}
          <NavbarWrapper
            logoUrl={generalSettings?.logoUrl}
            headerButtonText={generalSettings?.translation?.headerButtonText}
            headerButtonLink={generalSettings?.translation?.headerButtonLink}
            menuData={headerMenu} // Geçiş yapılıyor
          />
          <main className="flex-grow">
            {children}
          </main>
          {/* Footer'a footerMenus prop'unu ekle */}
          <FooterWrapper 
            menuData={footerMenus} // Yeni prop
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
