"use client";

import React from 'react';
import Navbar from './Navbar';

// Sadece bileşenin wrapper'ı
// Navbar bileşenine geçirilen propları destekleyen tip tanımı
interface NavbarWrapperProps {
  logoUrl?: string | null;
  headerButtonText?: string | null;
  headerButtonLink?: string | null;
  menuData?: {
    id: string;
    name: string;
    items: any[];
  }[] | null;
}

export default function NavbarWrapper({
  logoUrl,
  headerButtonText,
  headerButtonLink,
  menuData
}: NavbarWrapperProps) {
  return (
    <Navbar
      logoUrl={logoUrl}
      headerButtonText={headerButtonText}
      headerButtonLink={headerButtonLink}
      menuData={menuData}
    />
  );
}
