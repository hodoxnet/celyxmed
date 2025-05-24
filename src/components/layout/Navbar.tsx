"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { slugTranslations } from "@/generated/route-translations";

// Menü veri tipleri (RootLayoutClient'tan veya ortak tiplerden alınmalı)
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

// ListItem helper component (Shadcn UI dökümantasyonundan alınmıştır)
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: React.ReactNode }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {/* <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p> */}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

interface NavbarProps {
  logoUrl?: string | null;
  headerButtonText?: string | null;
  headerButtonLink?: string | null;
  menuData?: HeaderMenu[] | null; // Dinamik menü verisi (artık dizi)
}

interface LanguageData {
  code: string;
  name: string;
  menuLabel?: string | null;
  flagCode?: string | null;
}

// Bayrak emoji dönüştürücü fonksiyon
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const Navbar: React.FC<NavbarProps> = ({
  logoUrl,
  headerButtonText,
  headerButtonLink,
  menuData
}) => {
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState<string | null>(null);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);
  const pathname = usePathname(); // Next.js hook ile mevcut sayfa yolunu al
  
  // Aktif dili pathname'den al
  const currentLocale = pathname.split('/')[1] || 'tr';

  // Dil değiştirme linki oluşturan fonksiyon
  const getLanguageLink = (langCode: string) => {
    const currentPathParts = pathname.split('/').filter(Boolean);
    if (currentPathParts.length === 0) {
      // Ana sayfadaysa, sadece dil kodunu döndür
      return `/${langCode}`;
    }

    const currentLang = currentPathParts[0];
    const pathWithoutLang = currentPathParts.slice(1).join('/');
    
    // Eğer hizmetler detay sayfasındaysa ve slug varsa
    if (pathWithoutLang.startsWith('hizmetler/') || pathWithoutLang.startsWith('services/')) {
      const segments = pathWithoutLang.split('/');
      const routeType = segments[0]; // 'hizmetler' veya 'services'
      const currentSlug = segments[1];
      
      // Yeni dilin karşılık gelen route'u (hizmetler -> services)
      const newRoute = routeType === 'hizmetler' && langCode === 'en' ? 'services' : 
                       routeType === 'services' && langCode === 'tr' ? 'hizmetler' : routeType;
      
      // Slugın diğer dildeki karşılığını bulmaya çalış
      let translatedSlug = currentSlug;
      if (slugTranslations[currentSlug] && slugTranslations[currentSlug][langCode]) {
        translatedSlug = slugTranslations[currentSlug][langCode];
      }
      
      return `/${langCode}/${newRoute}/${translatedSlug}`;
    }
    
    // Diğer sayfalar için basit dil değiştirme
    return `/${langCode}/${pathWithoutLang}`;
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLanguageLoading(true);
      try {
        const response = await fetch('/api/languages'); // Aktif dilleri çeker
        if (!response.ok) throw new Error('Failed to fetch languages');
        const data = await response.json();
        setLanguages(data);
      } catch (error) {
        console.error("Error fetching languages:", error);
        setLanguages([]);
      } finally {
        setIsLanguageLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  // Menü verilerini diziden al (artık birden çok menü olabilir)
  const menus = menuData || [];
  
  // Aktif dilin menuLabel'ını bul
  const currentLanguage = languages.find(lang => lang.code === currentLocale);
  const languageMenuLabel = currentLanguage?.menuLabel || 'Language';

  // Mobil menü için tüm menü öğelerini düzenle
  const mobileMenuFormats = menus.map(menu => {
    const mobileItems = menu.items.map(item => ({
      id: item.id,
      label: item.title,
      href: (!item.children || item.children.length === 0) ? item.href : undefined,
      openInNewTab: item.openInNewTab,
      items: item.children?.map(child => ({
        id: child.id,
        title: child.title,
        href: child.href,
        openInNewTab: child.openInNewTab
      })) || []
    }));

    return {
      menuId: menu.id,
      menuName: menu.name,
      items: mobileItems
    };
  });

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 w-full pt-6">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-5 rounded-3xl shadow-lg w-full max-w-[1360px]">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src={logoUrl || "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"}
                  alt="Celyxmed Logo"
                  width={180}
                  height={40}
                  className="relative"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {/* Tüm Ana Menüler - Her biri kendi dropdown'una sahip */}
                  {menus.map(menu => (
                    <NavigationMenuItem key={menu.id}>
                      <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent py-2 px-3 text-base font-medium">
                        {menu.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4 md:w-[250px] lg:w-[300px]">
                          {menu.items.map((item) => (
                            <ListItem
                              key={item.id}
                              title={item.title}
                              href={item.href}
                              target={item.openInNewTab ? "_blank" : undefined}
                              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                            />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}

                  {/* Dil Menüsü (Korunuyor) */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent py-2 px-3 text-base font-normal">
                      {languageMenuLabel}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[150px] gap-3 p-4">
                        {isLanguageLoading ? (
                          <li className="text-sm text-gray-500">Loading...</li>
                        ) : languages.length > 0 ? (
                          languages.map((lang) => (
                            <ListItem
                              key={lang.code}
                              title={
                                <span className="flex items-center gap-2">
                                  {lang.flagCode && <span className="text-lg">{getFlagEmoji(lang.flagCode)}</span>}
                                  {lang.name}
                                </span>
                              }
                              href={getLanguageLink(lang.code)} // Akıllı dil değiştirme fonksiyonu
                            />
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No languages found.</li>
                        )}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* Header Butonu (Korunuyor) */}
              {headerButtonLink ? (
                <Link href={headerButtonLink}>
                  <Button className="bg-teal-700 hover:bg-teal-800 text-white rounded-md px-6 py-2">
                    {headerButtonText || "Consultation"}
                  </Button>
                </Link>
              ) : (
                <Button className="bg-teal-700 hover:bg-teal-800 text-white rounded-md px-6 py-2">
                  {headerButtonText || "Consultation"}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" className="p-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <Link href="/" className="flex items-center">
                      <Image
                        src={logoUrl || "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"}
                        alt="Celyxmed Logo"
                        width={150}
                        height={40}
                        className="relative"
                      />
                    </Link>
                  </div>
                  <div className="flex-1 overflow-auto py-6 px-4">
                    {/* Mobil Navigasyon (Dinamik) */}
                    <nav className="flex flex-col space-y-6">
                      {/* Tüm Ana Menüler (Mobil) */}
                      {mobileMenuFormats.map(menu => (
                        <div key={menu.menuId} className="border-b pb-4">
                          <button
                            className="flex items-center justify-between w-full text-left text-lg font-medium mb-2"
                            onClick={() => setMobileActiveDropdown(mobileActiveDropdown === menu.menuId ? null : menu.menuId)}
                          >
                            <span className="font-medium">{menu.menuName}</span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${mobileActiveDropdown === menu.menuId ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileActiveDropdown === menu.menuId && (
                            <div className="pl-4 space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                              {menu.items.map((item) => (
                                <Link
                                  key={item.id}
                                  href={item.href || '#'}
                                  className="block py-2 text-gray-600 hover:text-gray-900"
                                  target={item.openInNewTab ? "_blank" : undefined}
                                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Dil Menüsü (Mobil - Korunuyor) */}
                      <div className="border-b pb-4">
                        <button
                          className="flex items-center justify-between w-full text-left text-lg font-medium mb-2"
                          onClick={() => setMobileActiveDropdown(mobileActiveDropdown === "language" ? null : "language")}
                        >
                          <span>{languageMenuLabel}</span>
                          <ChevronDown className={`h-5 w-5 transition-transform ${mobileActiveDropdown === "language" ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileActiveDropdown === "language" && (
                          <div className="pl-4 space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                            {isLanguageLoading ? (
                              <div className="py-2 text-gray-500">Loading...</div>
                            ) : languages.length > 0 ? (
                              languages.map((lang) => (
                                <Link
                                  key={lang.code}
                                  href={getLanguageLink(lang.code)} // Akıllı dil değiştirme fonksiyonu
                                  className="block py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                >
                                  {lang.flagCode && <span className="text-lg">{getFlagEmoji(lang.flagCode)}</span>}
                                  {lang.name}
                                </Link>
                              ))
                            ) : (
                              <div className="py-2 text-gray-500">No languages found.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </nav>
                  </div>
                  {/* Header Butonu (Mobil - Korunuyor) */}
                  <div className="p-6 border-t">
                    {headerButtonLink ? (
                      <Link href={headerButtonLink}>
                        <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3">
                         {headerButtonText || "Consultation"}
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3">
                        {headerButtonText || "Consultation"}
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
