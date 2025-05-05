"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from 'lucide-react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  // Menü öğeleri
  const menuItems = [
    {
      id: "plastic-surgery",
      label: "Plastic Surgery",
      href: "#",
      dropdown: [
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
      href: "#",
      dropdown: [
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
      href: "#",
      dropdown: [
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
      href: "#",
      dropdown: [
        { title: "About Us", href: "/about" },
        { title: "Our Clinic", href: "/our-clinic" },
        { title: "Our Doctors", href: "/our-doctors" },
        { title: "Patient Reviews", href: "/reviews" },
        { title: "Blog", href: "/blog" },
        { title: "FAQ", href: "/faq" }
      ]
    },
    {
      id: "language",
      label: "Language",
      href: "#",
      dropdown: [
        { title: "🇬🇧 - English", href: "/" },
        { title: "🇩🇪 - Deutsch", href: "/de" },
        { title: "🇫🇷 - Français", href: "/fr" },
        { title: "🇷🇺 - Русский", href: "/ru" },
        { title: "🇮🇹 - Italiano", href: "/it" },
        { title: "🇪🇸 - Español", href: "/es" },
        { title: "🇹🇷 - Türkçe", href: "/tr" },
      ]
    }
  ];

  // Navbar hover state
  const [isNavHovered, setIsNavHovered] = React.useState(false);
  
  // Menü açma/kapama fonksiyonu
  const handleMouseEnter = (id: string) => {
    setActiveDropdown(id);
    setIsNavHovered(true);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };
  
  // Navbar mouse events
  const handleNavMouseEnter = () => {
    setIsNavHovered(true);
  };
  
  const handleNavMouseLeave = () => {
    setIsNavHovered(false);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Overlay - Menü açıldığında arka planı karartır */}
      <div 
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-500 ${
          isNavHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          setActiveDropdown(null);
          setIsNavHovered(false);
        }}
      />
      
      <header className="absolute top-0 left-0 right-0 z-50 w-full pt-6">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-5 rounded-3xl shadow-lg w-full max-w-[1360px]">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="relative mr-2">
                  <div className="text-amber-400 text-3xl absolute -top-1 -left-1">✦</div>
                </div>
                <Image
                  src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"
                  alt="Celyxmed Logo"
                  width={180}
                  height={40}
                  className="relative"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div 
              className="hidden lg:flex items-center space-x-6"
              onMouseEnter={handleNavMouseEnter}
              onMouseLeave={handleNavMouseLeave}
            >
              <nav className="flex items-center space-x-6">
                {menuItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative group"
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button className="flex items-center text-gray-700 hover:text-gray-900 py-2">
                      <span>{item.label}</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    
                    <div 
                      className={`absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border transition-all duration-300 ease-in-out ${
                        activeDropdown === item.id 
                          ? 'opacity-100 translate-y-0 pointer-events-auto' 
                          : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="py-2 max-h-[70vh] overflow-y-auto">
                        {item.dropdown.map((dropdownItem) => (
                          <Link 
                            key={dropdownItem.title}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {dropdownItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </nav>
              
              <Button className="bg-teal-700 hover:bg-teal-800 text-white rounded-md px-6 py-2">
                Consultation
              </Button>
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
                      <div className="relative mr-2">
                        <div className="text-amber-400 text-3xl absolute -top-1 -left-1">✦</div>
                      </div>
                      <Image
                        src="https://cdn.prod.website-files.com/6766b8d65a3055a5841135b1/676be4d72f148f551550461b_Celyxmed_Logo_88x29.svg"
                        alt="Celyxmed Logo"
                        width={150}
                        height={40}
                        className="relative"
                      />
                    </Link>
                  </div>
                  <div className="flex-1 overflow-auto py-6 px-4">
                    <nav className="flex flex-col space-y-6">
                      {menuItems.map((item) => (
                        <div key={item.id} className="border-b pb-4">
                          <button 
                            className="flex items-center justify-between w-full text-left text-lg font-medium mb-2"
                            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                          >
                            <span>{item.label}</span>
                            <ChevronDown className={`h-5 w-5 transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {activeDropdown === item.id && (
                            <div className="pl-4 space-y-2 mt-2 max-h-[50vh] overflow-y-auto">
                              {item.dropdown.map((dropdownItem) => (
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
                    </nav>
                  </div>
                  <div className="p-6 border-t">
                    <Button className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3">
                      Consultation
                    </Button>
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
