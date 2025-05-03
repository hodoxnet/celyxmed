import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl'; // Yorumu kaldır
import { getMessages } from 'next-intl/server'; // Yorumu kaldır
import "../globals.css"; // globals.css yolunu güncelle

export const metadata: Metadata = {
  title: "Celyxmed Kurumsal",
  description: "Celyxmed Kurumsal Web Sitesi",
};

// Next.js 15 için doğru tipleri import et
import { LayoutProps } from 'next/dist/lib/app-router-context.shared-runtime';

// RootLayout fonksiyonu
export default async function RootLayout({
  children,
  params
}: LayoutProps) {
  // Next.js 15'te params bir Promise olabilir, await ile bekleyelim
  const resolvedParams = await params;
  // locale değerini al veya varsayılanı kullan
  const locale = String(resolvedParams?.locale || 'tr');
  console.log(`[Layout] Received locale: ${locale}`); // Locale'i logla

  let messages;
  try {
    messages = await getMessages({ locale }); // locale parametresi ile mesajları al
    console.log(`[Layout] Messages loaded for locale ${locale}:`, !!messages); // Mesajların yüklenip yüklenmediğini logla
    if (!messages || typeof messages !== 'object') {
       console.error(`[Layout] Invalid messages received for locale ${locale}:`, messages);
       messages = {}; // Hata durumunda boş obje ata
    }
  } catch (error) {
    console.error(`[Layout] Error fetching messages for locale ${locale}:`, error);
    messages = {}; // Hata durumunda boş obje ata
  }

  return (
    // html etiketinin lang özelliğini dinamik olarak ayarla
    <html lang={locale}>
      <body className={`antialiased`}>
        {/* Çocuk bileşenleri NextIntlClientProvider ile sarmala */}
        {/* messages null/undefined değilse provider'ı render et */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
