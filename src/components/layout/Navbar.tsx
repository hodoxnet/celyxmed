"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { routeTranslations } from "@/generated/route-translations";

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
  React.ComponentPropsWithoutRef<"a"> & { 
    title: React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
  }
>(({ className, title, children, onClick, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
            className
          )}
          onClick={onClick}
          {...props}
        >
          <div className="text-sm font-medium leading-none">
            {title}
          </div>
          {children && (
            <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </div>
          )}
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
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);
  const pathname = usePathname(); // Next.js hook ile mevcut sayfa yolunu al
  const router = useRouter();
  
  // Aktif dili pathname'den al
  const currentLocale = pathname.split('/')[1] || 'tr';

  // Dil değiştirme linki oluşturan fonksiyon - Her zaman ana sayfaya yönlendir
  const getLanguageLink = (langCode: string) => {
    return `/${langCode}`;
  };

  // Menü linklerini aktif dile göre çeviren fonksiyon
  const translateMenuLink = (href: string, targetLocale: string) => {
    // Eğer href zaten '/' ile başlamıyorsa, başına ekle
    const normalizedHref = href.startsWith('/') ? href : `/${href}`;
    
    // URL'i parçalara ayır 
    const pathParts = normalizedHref.split('/').filter(Boolean);
    
    if (pathParts.length === 0) {
      // Ana sayfa linki ise
      return `/${targetLocale}`;
    }
    
    // Eğer URL zaten dil kodu ile başlıyorsa, onu çıkar
    let actualPathParts = pathParts;
    if (pathParts.length > 0 && pathParts[0].length === 2 && /^[a-z]{2}$/.test(pathParts[0])) {
      // İlk parça dil koduna benziyor, onu çıkar
      actualPathParts = pathParts.slice(1);
    }
    
    if (actualPathParts.length === 0) {
      // Sadece dil kodu vardı, ana sayfaya yönlendir
      return `/${targetLocale}`;
    }
    
    // İlk parçayı (ana route) kontrol et
    const mainRoute = actualPathParts[0];
    
    // routeTranslations'da çevirisi var mı?
    const routeEntry = routeTranslations[mainRoute as keyof typeof routeTranslations];
    if (routeEntry && routeEntry[targetLocale as keyof typeof routeEntry]) {
      const translatedRoute = routeEntry[targetLocale as keyof typeof routeEntry];
      
      // Çevrilmiş route ile yeni URL oluştur
      const otherParts = actualPathParts.slice(1); // Diğer path parçaları (varsa)
      const translatedPath = [translatedRoute, ...otherParts].join('/');
      
      return `/${targetLocale}/${translatedPath}`;
    }
    
    // Çeviri yoksa orijinal path'i kullan (ama dil kodunu güncelle)
    const finalPath = actualPathParts.join('/');
    return `/${targetLocale}/${finalPath}`;
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

  // Smooth dil değiştirme fonksiyonu
  const handleLanguageChange = async (langCode: string, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (langCode === currentLocale || isLanguageChanging) return;
    
    setIsLanguageChanging(true);
    
    // Hızlı smooth fade efekti
    document.body.style.opacity = '0.8';
    document.body.style.transition = 'opacity 0.25s ease-out';
    document.body.style.filter = 'blur(0.5px)';
    
    // Kısa loading animation
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Programmatic navigation
    const newUrl = getLanguageLink(langCode);
    router.push(newUrl);
    
    // Cleanup - reset after navigation
    setTimeout(() => {
      setIsLanguageChanging(false);
      document.body.style.opacity = '1';
      document.body.style.filter = 'none';
      document.body.style.transition = 'opacity 0.2s ease-out, filter 0.2s ease-out';
    }, 100);
  };

  // Mobil menü için tüm menü öğelerini düzenle
  const mobileMenuFormats = menus.map(menu => {
    const mobileItems = menu.items.map(item => ({
      id: item.id,
      label: item.title,
      href: (!item.children || item.children.length === 0) ? translateMenuLink(item.href, currentLocale) : undefined,
      openInNewTab: item.openInNewTab,
      items: item.children?.map(child => ({
        id: child.id,
        title: child.title,
        href: translateMenuLink(child.href, currentLocale),
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
          <div className="flex items-center justify-between bg-white backdrop-blur-md px-6 py-3 rounded-3xl shadow-lg w-full max-w-[1360px]">
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
                      <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent py-2 px-3 text-base font-normal">
                        {menu.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4 md:w-[250px] lg:w-[300px]">
                          {menu.items.map((item) => (
                            <ListItem
                              key={item.id}
                              title={item.title}
                              href={translateMenuLink(item.href, currentLocale)}
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
                    <NavigationMenuTrigger className={cn(
                      "bg-transparent text-gray-700 hover:text-gray-900 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent py-2 px-3 text-base font-normal flex items-center gap-2 transition-all duration-300",
                      isLanguageChanging && "opacity-70 scale-95"
                    )}>
                      <div className={cn(
                        "transition-all duration-200 transform",
                        isLanguageChanging ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0"
                      )}>
                        <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                      </div>
                      <span className={cn(
                        "transition-all duration-200",
                        isLanguageChanging && "text-teal-700"
                      )}>
                        {languageMenuLabel}
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[150px] gap-3 p-4">
                        {isLanguageLoading ? (
                          <li className="text-sm text-gray-500">Loading...</li>
                        ) : languages.length > 0 ? (
                          languages.map((lang) => (
                            <li key={lang.code}>
                              <NavigationMenuLink asChild>
                                <button
                                  onClick={(e) => handleLanguageChange(lang.code, e)}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer w-full text-left transition-all duration-300 hover:scale-[1.02]",
                                    isLanguageChanging && "pointer-events-none scale-95 opacity-50",
                                    lang.code === currentLocale && "bg-teal-50 border-teal-200 scale-[1.02]"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">
                                    <div className="flex items-center gap-2">
                                      {isLanguageChanging && lang.code === currentLocale ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        lang.flagCode && <span className="text-lg">{getFlagEmoji(lang.flagCode)}</span>
                                      )}
                                      <span className={cn(
                                        lang.code === currentLocale && "font-semibold text-teal-700",
                                        isLanguageChanging && "opacity-50"
                                      )}>
                                        {lang.name}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              </NavigationMenuLink>
                            </li>
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
                            className="flex items-center justify-between w-full text-left text-lg font-normal mb-2"
                            onClick={() => setMobileActiveDropdown(mobileActiveDropdown === menu.menuId ? null : menu.menuId)}
                          >
                            <span className="font-normal">{menu.menuName}</span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${mobileActiveDropdown === menu.menuId ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileActiveDropdown === menu.menuId && (
                            <div className="pl-4 space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                              {menu.items.map((item) => (
                                <SheetClose asChild key={item.id}>
                                  <Link
                                    href={item.href || '#'}
                                    className="block py-2 text-gray-600 hover:text-gray-900"
                                    target={item.openInNewTab ? "_blank" : undefined}
                                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                                  >
                                    {item.label}
                                  </Link>
                                </SheetClose>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Dil Menüsü (Mobil - Korunuyor) */}
                      <div className="border-b pb-4">
                        <button
                          className={cn(
                            "flex items-center justify-between w-full text-left text-lg font-normal mb-2 transition-all duration-300",
                            isLanguageChanging && "opacity-70 scale-95"
                          )}
                          onClick={() => setMobileActiveDropdown(mobileActiveDropdown === "language" ? null : "language")}
                        >
                          <span className="flex items-center gap-2">
                            <div className={cn(
                              "transition-all duration-200 transform",
                              isLanguageChanging ? "opacity-100 scale-100" : "opacity-0 scale-0 w-0"
                            )}>
                              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                            </div>
                            <span className={cn(
                              "transition-all duration-200",
                              isLanguageChanging && "text-teal-700"
                            )}>
                              {languageMenuLabel}
                            </span>
                          </span>
                          <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${mobileActiveDropdown === "language" ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileActiveDropdown === "language" && (
                          <div className="pl-4 space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                            {isLanguageLoading ? (
                              <div className="py-2 text-gray-500">Loading...</div>
                            ) : languages.length > 0 ? (
                              languages.map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={(e) => handleLanguageChange(lang.code, e)}
                                  className={cn(
                                    "w-full text-left py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50 rounded-md px-2 -mx-2",
                                    lang.code === currentLocale && "font-semibold text-teal-700 bg-teal-50 scale-[1.02]",
                                    isLanguageChanging && "opacity-50 pointer-events-none scale-95"
                                  )}
                                  disabled={isLanguageChanging}
                                >
                                  {isLanguageChanging && lang.code === currentLocale ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    lang.flagCode && <span className="text-lg">{getFlagEmoji(lang.flagCode)}</span>
                                  )}
                                  {lang.name}
                                </button>
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
                      <SheetClose asChild>
                        <Link href={headerButtonLink}>
                          <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3">
                           {headerButtonText || "Consultation"}
                          </Button>
                        </Link>
                      </SheetClose>
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
