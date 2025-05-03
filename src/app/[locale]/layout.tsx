import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server'; // getMessages'ı import et
import "../globals.css"; // globals.css yolunu güncelle

export const metadata: Metadata = {
  title: "Celyxmed Kurumsal",
  description: "Celyxmed Kurumsal Web Sitesi",
};

// RootLayout props'una locale parametresini ekle ve fonksiyonu async yap
export default async function RootLayout({
  children,
  params // params nesnesini doğrudan al
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string}; // locale parametresinin tipini belirt
}>) {
  const locale = params.locale; // locale'i fonksiyon içinde al
  // Sunucu tarafında çeviri mesajlarını al
  const messages = await getMessages();

  return (
    // html etiketinin lang özelliğini dinamik olarak ayarla
    <html lang={locale}>
      <body className={`antialiased`}>
        {/* Çocuk bileşenleri NextIntlClientProvider ile sarmala */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
