"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from 'lucide-react';

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
  NavigationMenuViewport, // Viewport import edildi
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"; // Shadcn UI NavigationMenu importları

// ListItem helper component (Shadcn UI dökümantasyonundan alınmıştır)
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
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
          {/* İsteğe bağlı: Açıklama eklenebilir */}
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
}

const Navbar: React.FC<NavbarProps> = ({ 
  logoUrl, 
  headerButtonText, 
  headerButtonLink 
}) => {
  // Mobil menü için state (ayrı yönetilecek)
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState<string | null>(null);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]); // Dinamik diller için state
  const [isLanguageLoading, setIsLanguageLoading] = useState(true); // Yüklenme durumu için state

  // API'den dilleri çekmek için useEffect
  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLanguageLoading(true);
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }
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

  // Statik menü öğeleri (Dil hariç) - Yapı NavigationMenu için uyarlandı
  const staticMenuItems = [
    {
      id: "plastic-surgery",
      label: "Plastic Surgery",
      items: [ // NavigationMenuContent içindeki linkler
        { title: "Mommy Makeover", href: "/mommy-makeover-turkey" },
        { title: "Nose Aesthetics (Rhinoplasty)", href: "/rhinoplasty-turkey" },
        { title: "Tummy Tuck (Abdominoplasty)", href: "/tummy-tuck-turkey" },
        { title: "Liposuction", href: "/liposuction-turkey" },
        { title: "Breast Augmentation", href: "/breast-augmentation-turkey" },
        { title: "Breast Reduction", href: "/breast-reduction-turkey" },
        { title: "Breast Lift", href: "/breast-lift-turkey" },
        { title: "Gynecomastia", href: "/gynecomastia-turkey" },
        { title: "Arm Lift Aesthetics", href: "/arm-lift-turkey" },
        { title: "Brazilian Butt Lift (BBL)", href: "/bbl-turkey" },
        { title: "Thigh Lift", href: "/thigh-lift-turkey" },
        { title: "Eyelid (Blepharoplasty)", href: "/blepharoplasty-turkey" },
        { title: "Otoplasty Surgery", href: "/otoplasty-turkey" },
        { title: "Face Lift", href: "/face-lift-turkey" },
        { title: "Neck Lift", href: "/neck-lift-turkey" },
        { title: "Buccal Fat Removal", href: "/buccal-fat-removal-turkey" }
      ]
    },
    {
      id: "dental-aesthetic",
      label: "Dental Aesthetic",
      items: [
        { title: "Hollywood Smile", href: "/hollywood-smile-turkey" },
        { title: "Dental Implant", href: "/dental-implant-turkey" },
        { title: "Dental Veneers", href: "/dental-veneers-turkey" },
        { title: "Dental Crowns", href: "/dental-crowns-turkey" },
        { title: "Dental Bridges", href: "/dental-bridges-turkey" },
        { title: "Teeth Whitening", href: "/teeth-whitening-turkey" }
      ]
    },
    {
      id: "hair-transplant",
      label: "Hair Transplant",
      items: [
        { title: "Hair Transplant", href: "/hair-transplant-turkey" },
        { title: "FUE Hair Transplant", href: "/fue-hair-transplant-turkey" },
        { title: "DHI Hair Transplant", href: "/dhi-hair-transplant-turkey" },
        { title: "Sapphire Hair Transplant", href: "/sapphire-hair-transplant-turkey" },
        { title: "Beard Transplant", href: "/beard-transplant-turkey" },
        { title: "Eyebrow Transplant", href: "/eyebrow-transplant-turkey" }
      ]
    },
    {
      id: "about-celyxmed",
      label: "About Celyxmed",
      items: [
        { title: "About Us", href: "/about" },
        { title: "Our Clinic", href: "/our-clinic" },
        { title: "Our Doctors", href: "/our-doctors" },
        { title: "Patient Reviews", href: "/reviews" },
        { title: "Blog", href: "/blog" },
        { title: "FAQ", href: "/faq" }
      ]
    }
  ];

  return (
    <>
      {/* Overlay kaldırıldı, NavigationMenu kendi focus/blur yönetimini yapabilir */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full pt-6">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-5 rounded-3xl shadow-lg w-full max-w-[1360px]">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                {/* Yıldız ikonu kaldırıldı */}
                {/* <div className="relative mr-2">
                  <div className="text-amber-400 text-3xl absolute -top-1 -left-1">✦</div>
                </div> */}
                <Image
                  src={logoUrl || "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"} // Dinamik logoUrl veya varsayılan
                  alt="Celyxmed Logo"
                  width={180}
                  height={40}
                  className="relative"
                />
              </Link>
            </div>

            {/* Desktop Navigation (Shadcn UI NavigationMenu) */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* viewport={false} kullanarak, Radix UI'nin varsayılan viewport davranışını devre dışı bırakıyoruz */}
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {/* Statik Menü Öğeleri */}
                  {staticMenuItems.map((item) => (
                    <NavigationMenuItem key={item.id}>
                      <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent py-2 px-3 text-base font-normal">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4 md:w-[250px] lg:w-[300px]">
                          {item.items.map((subItem) => (
                            <ListItem
                              key={subItem.title}
                              title={subItem.title}
                              href={subItem.href}
                            />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}

                  {/* Dinamik Dil Menüsü */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-gray-900 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent py-2 px-3 text-base font-normal">
                      Language
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[150px] gap-3 p-4">
                        {isLanguageLoading ? (
                          <li className="text-sm text-gray-500">Loading...</li>
                        ) : languages.length > 0 ? (
                          languages.map((lang) => (
                            <ListItem
                              key={lang.code}
                              title={lang.name}
                              href={`/${lang.code}`}
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

            {/* Mobile Menu Button (Sheet yapısı korunuyor) */}
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
                      {/* Yıldız ikonu kaldırıldı */}
                      {/* <div className="relative mr-2">
                        <div className="text-amber-400 text-3xl absolute -top-1 -left-1">✦</div>
                      </div> */}
                      <Image
                        src={logoUrl || "https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"} // Dinamik logoUrl veya varsayılan
                        alt="Celyxmed Logo"
                        width={150}
                        height={40}
                        className="relative"
                      />
                    </Link>
                  </div>
                  <div className="flex-1 overflow-auto py-6 px-4">
                    {/* Mobil Navigasyon (Mevcut accordion stili korunuyor) */}
                    <nav className="flex flex-col space-y-6">
                      {staticMenuItems.map((item) => (
                        <div key={item.id} className="border-b pb-4">
                          <button
                            className="flex items-center justify-between w-full text-left text-lg font-medium mb-2"
                            onClick={() => setMobileActiveDropdown(mobileActiveDropdown === item.id ? null : item.id)}
                          >
                            <span>{item.label}</span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${mobileActiveDropdown === item.id ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileActiveDropdown === item.id && (
                            <div className="pl-4 space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                              {item.items.map((dropdownItem) => (
                                <Link
                                  key={dropdownItem.title}
                                  href={dropdownItem.href}
                                  className="block py-2 text-gray-600 hover:text-gray-900"
                                >
                                  {dropdownItem.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Dinamik Dil Menüsü (Mobil) */}
                      <div className="border-b pb-4">
                        <button
                          className="flex items-center justify-between w-full text-left text-lg font-medium mb-2"
                          onClick={() => setMobileActiveDropdown(mobileActiveDropdown === "language" ? null : "language")}
                        >
                          <span>Language</span>
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
                                  href={`/${lang.code}`}
                                  className="block py-2 text-gray-600 hover:text-gray-900"
                                >
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
