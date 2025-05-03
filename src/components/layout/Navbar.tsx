"use client"; // NavigationMenu client bileşeni gerektirir

import * as React from "react";
import Link from "next/link";
import Image from "next/image"; // Logo için

import { cn } from "@/lib/utils"; // Stil birleştirme için yardımcı fonksiyon
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"; // Navigasyon bileşenleri
// Button yerine buttonVariants'ı import edelim
import { buttonVariants } from "@/components/ui/button";

// Açılır menü içindeki linkler için örnek bir bileşen
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
          {/* <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p> */}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const Navbar = () => {
  // index.html'den alınan menü yapısı (örnek olarak)
  const plasticSurgeryLinks = [
    { title: "Mommy Makeover", href: "/mommy-makeover-turkey" },
    { title: "Nose Aesthetics (Rhinoplasty)", href: "/rhinoplasty-turkey" },
    { title: "Tummy Tuck (Abdominoplasty)", href: "/tummy-tuck-turkey" },
    // ... diğer linkler
  ];
  const dentalLinks = [
     { title: "Hollywood Smile", href: "/hollywood-smile-turkey" },
     { title: "Dental Implant", href: "/dental-implant-turkey" },
     // ... diğer linkler
  ];
   const hairLinks = [
     { title: "Hair Transplant", href: "/hair-transplant-turkey" },
     { title: "FUE Hair Transplant", href: "/fue-hair-transplant-turkey" },
     // ... diğer linkler
   ];
    const medicalAestheticsLinks = [
      { title: "Dermal Filler Applications", href: "/dermal-fillers-turkey" },
      { title: "Lip Fillers", href: "/lip-fillers-turkey" },
      // ... diğer linkler
    ];
   const aboutLinks = [
     { title: "About Us", href: "/about" },
     { title: "Our Clinic", href: "/our-clinic" },
     { title: "Our Doctors", href: "/our-doctors" },
   ];
   const languageLinks = [
     { title: "🇬🇧 - English", href: "/" },
     { title: "🇩🇪 - Deutsch", href: "/de" },
     { title: "🇫🇷 - Français", href: "/fr" },
     { title: "🇷🇺 - Русский", href: "/ru" },
     { title: "🇮🇹 - Italiano", href: "/it" },
     { title: "🇪🇸 - Español", href: "/es" },
     { title: "🇹🇷 - Türkçe", href: "/tr" }, // Varsayılan locale'e göre ayarlanmalı
   ];


  return (
    // Konumlandırmayı absolute yap
    <header className="absolute top-0 left-0 right-0 z-50 w-full pt-6"> {/* Üstten boşluğu artıralım */}
      {/* Beyaz container'ı ortalayalım */}
      <div className="container mx-auto px-4 flex justify-center">
        {/* Beyaz Arka Planlı Grup: Logo, Menü, Buton */}
        {/* Daha yüksek (py-4), daha az oval (rounded-2xl), justify-between ile logo sola, menü sağa */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-lg w-full max-w-6xl">
          {/* Sol: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                // Logo URL'sini kontrol et, gerekirse public klasörüne taşı
              src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"
              alt="Celyxmed Logo"
              width={120}
              height={40}
            />
          </Link>
        </div>

        {/* Sağ: Menü ve Buton Grubu */}
        <div className="flex items-center space-x-4">
          {/* Navigasyon Menüsü */}
          <NavigationMenu>
             {/* Menü listesi stilini ayarlayalım (arka plan beyaz olduğu için text rengi koyu) */}
            <NavigationMenuList className="text-sm font-medium text-gray-700">
              {/* Plastic Surgery */}
              <NavigationMenuItem>
                 {/* Trigger stilini ayarlayalım (arka plan beyaz) */}
                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-3 py-2 rounded-md">Plastic Surgery</NavigationMenuTrigger>
                <NavigationMenuContent>
                   {/* Açılır menü içeriği stilleri (arka plan beyaz) */}
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-md shadow-lg border"> {/* Border eklendi */}
                    {plasticSurgeryLinks.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {/* Açıklama eklenebilir */}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Dental Aesthetic */}
               <NavigationMenuItem>
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-3 py-2 rounded-md">Dental Aesthetic</NavigationMenuTrigger>
                 <NavigationMenuContent>
                   <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-md shadow-lg border">
                     {dentalLinks.map((component) => (
                       <ListItem
                         key={component.title}
                         title={component.title}
                         href={component.href}
                       />
                     ))}
                   </ul>
                 </NavigationMenuContent>
               </NavigationMenuItem>

               {/* Hair Transplant */}
               <NavigationMenuItem>
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-3 py-2 rounded-md">Hair Transplant</NavigationMenuTrigger>
                 <NavigationMenuContent>
                   <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-md shadow-lg border">
                     {hairLinks.map((component) => (
                       <ListItem
                         key={component.title}
                         title={component.title}
                         href={component.href}
                       />
                     ))}
                   </ul>
                 </NavigationMenuContent>
               </NavigationMenuItem>

                {/* Medical Aesthetics */}
               <NavigationMenuItem>
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-3 py-2 rounded-md">Medical Aesthetics</NavigationMenuTrigger>
                 <NavigationMenuContent>
                   <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-md shadow-lg border">
                     {medicalAestheticsLinks.map((component) => (
                       <ListItem
                         key={component.title}
                         title={component.title}
                         href={component.href}
                       />
                     ))}
                   </ul>
                 </NavigationMenuContent>
               </NavigationMenuItem>

               {/* About Celyxmed */}
               <NavigationMenuItem>
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-3 py-2 rounded-md">About Celyxmed</NavigationMenuTrigger>
                 <NavigationMenuContent>
                   <ul className="grid w-[200px] gap-3 p-4 md:w-[250px] bg-white rounded-md shadow-lg border">
                     {aboutLinks.map((component) => (
                       <ListItem
                         key={component.title}
                         title={component.title}
                         href={component.href}
                       />
                     ))}
                   </ul>
                 </NavigationMenuContent>
               </NavigationMenuItem>

               {/* Language */}
               <NavigationMenuItem>
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-3 py-2 rounded-md">Language</NavigationMenuTrigger>
                 <NavigationMenuContent>
                   <ul className="grid w-[200px] gap-3 p-4 md:w-[250px] bg-white rounded-md shadow-lg border">
                     {languageLinks.map((component) => (
                       <ListItem
                         key={component.title}
                         title={component.title}
                         href={component.href} // Dil linkleri locale'e göre ayarlanmalı
                       />
                     ))}
                   </ul>
                 </NavigationMenuContent>
               </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>

          {/* Sağdaki Buton */}
          {/* Button asChild yerine Link'e buttonVariants uygulayalım */}
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              // rounded-full kaldırıldı, arka planla aynı yuvarlaklık (rounded-2xl) ve padding ayarı
              "bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-5 py-2 text-sm"
            )}
          >
            Danışma {/* Türkçe metin */}
          </Link>
        </div> {/* Menü ve Buton Grubu div'i kapanışı */}
       </div> {/* Beyaz Arka Planlı Grup div'i kapanışı - EKSİK OLAN BU */}
      </div>
      {/* Mobil Menü Butonu (şimdilik gizli) */}
      {/* <div className="md:hidden"> ... </div> */}
    </header>
  );
};

export default Navbar;
