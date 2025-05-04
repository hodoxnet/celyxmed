import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "@/components/theme-provider"; // ThemeProvider'ı import et
import "../globals.css";

export const metadata: Metadata = {
  title: "Celyxmed Kurumsal",
  description: "Celyxmed Kurumsal Web Sitesi",
};

// RootLayout fonksiyonu
export default async function RootLayout({
  children,
  params: { locale } // Parametreleri doğrudan destruct et ve locale'i al
}: {
  children: React.ReactNode;
  params: { locale: string }; // Parametre tipini belirt
}) {
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
    // Tema değişikliğinden kaynaklanan hydration uyarısını bastır
    <html lang={locale} suppressHydrationWarning={true}>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Varsayılan tema "light" olarak değiştirildi
          enableSystem // Sistem tercihini hala etkin bırakabiliriz, ancak başlangıç light olacak
          disableTransitionOnChange
        >
          {/* Çocuk bileşenleri NextIntlClientProvider ile sarmala */}
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
