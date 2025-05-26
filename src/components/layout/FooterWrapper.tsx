"use client";

import React from 'react';
import Footer from './Footer';
import { useTranslations } from 'next-intl';

interface FooterWrapperProps {
  socialLinks?: any;
  contactInfo?: any;
  copyrightText?: string | null;
  menuData?: any;
}

export default function FooterWrapper({
  socialLinks,
  contactInfo,  
  copyrightText,
  menuData
}: FooterWrapperProps) {
  const t = useTranslations('Footer');
  
  const translations = {
    description: t('description'),
    contactButton: t('contactButton')
  };
  
  return (
    <Footer 
      socialLinks={socialLinks}
      contactInfo={contactInfo}
      copyrightText={copyrightText}
      menuData={menuData}
      translations={translations}
    />
  );
}
