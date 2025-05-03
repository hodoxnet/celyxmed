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
import { buttonVariants } from "@/components/ui/button"; // buttonVariants import edildi

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
          {/* Yazı boyutu artırıldı */}
          <div className="text-base font-medium leading-none">{title}</div>
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
        {/* Daha yüksek (py-5), daha az oval (rounded-2xl), justify-between, max-w kaldırıldı */}
        <div className="flex items-center justify-between bg-white px-6 py-5 rounded-2xl shadow-lg w-full">
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
        <div className="flex items-center space-x-6"> {/* Boşluğu artıralım */}
          {/* Navigasyon Menüsü */}
          <NavigationMenu>
             {/* Menü listesi stilini ayarlayalım (arka plan beyaz olduğu için text rengi koyu), yazı boyutu büyütüldü */}
            <NavigationMenuList className="text-base font-medium text-gray-700">
              {/* Plastic Surgery */}
              <NavigationMenuItem>
                 {/* Trigger stilini ayarlayalım (arka plan beyaz), yazı boyutu büyütüldü */}
                <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-4 py-2 rounded-md text-base">Plastic Surgery</NavigationMenuTrigger>
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
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-4 py-2 rounded-md text-base">Dental Aesthetic</NavigationMenuTrigger>
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
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-4 py-2 rounded-md text-base">Hair Transplant</NavigationMenuTrigger>
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
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-4 py-2 rounded-md text-base">Medical Aesthetics</NavigationMenuTrigger>
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
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-4 py-2 rounded-md text-base">About Celyxmed</NavigationMenuTrigger>
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
                 <NavigationMenuTrigger className="bg-transparent hover:bg-gray-100 px-4 py-2 rounded-md text-base">Language</NavigationMenuTrigger>
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
          {/* Button asChild yerine Link'e buttonVariants uygulayalım, boyut ve yazı büyütüldü */}
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "default", size: "default" }), // size: "default" yapıldı
              // rounded-2xl yapıldı, padding ayarlandı, yazı boyutu büyütüldü
              "bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl px-6 py-2.5 text-base"
            )}
          >
            Danışma {/* Türkçe metin */}
          </Link>
        </div> {/* Menü ve Buton Grubu div'i kapanışı */}
       </div> {/* Beyaz Arka Planlı Grup div'i kapanışı */}
      </div>
      {/* Mobil Menü Butonu (şimdilik gizli) */}
      {/* <div className="md:hidden"> ... </div> */}
    </header>
  );
};

export default Navbar;
