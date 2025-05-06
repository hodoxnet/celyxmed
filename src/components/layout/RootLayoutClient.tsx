"use client";

import React from 'react';
import Navbar from './Navbar';  
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';

interface RootLayoutClientProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

export default function RootLayoutClient({ children, locale, messages }: RootLayoutClientProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <FloatingButtons />
        </div>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
