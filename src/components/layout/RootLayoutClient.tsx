"use client";

import React, { useState, useEffect } from 'react';
import NavbarWrapper from './NavbarWrapper';
import FooterWrapper from './FooterWrapper';
import FloatingButtons from './FloatingButtons';
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { GeneralSettingWithTranslation } from '@/types/form-types'; // Tip tanımını import ediyoruz
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const pathname = usePathname();

  // Page transition loading effect
  useEffect(() => {
    setIsPageTransitioning(true);
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 350); // Optimize edilmiş süre

    return () => clearTimeout(timer);
  }, [pathname]);

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
          <main className="flex-grow relative">
            <div className={`transition-all duration-300 ease-out transform ${
              isPageTransitioning 
                ? 'opacity-0 scale-[0.99]' 
                : 'opacity-100 scale-100'
            }`}>
              {children}
            </div>
            
            {/* Quick loading overlay during page transitions */}
            {isPageTransitioning && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3 p-6 bg-white/80 rounded-xl shadow-lg backdrop-blur-sm border border-white/30">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">Yükleniyor...</span>
                </div>
              </div>
            )}
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
