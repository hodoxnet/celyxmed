import type { Metadata } from "next";
import { getMessages } from 'next-intl/server';
import RootLayoutClient from "@/components/layout/RootLayoutClient";
import "../globals.css";

export const metadata: Metadata = {
  title: "Celyxmed Kurumsal",
  description: "Celyxmed Kurumsal Web Sitesi",
};

// RootLayout fonksiyonu
export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  console.log(`[Layout] Received locale: ${locale}`);

  let messages;
  try {
    messages = await getMessages({ locale });
    console.log(`[Layout] Messages loaded for locale ${locale}:`, !!messages);
    if (!messages || typeof messages !== 'object') {
      console.error(`[Layout] Invalid messages received for locale ${locale}:`, messages);
      messages = {};
    }
  } catch (error) {
    console.error(`[Layout] Error fetching messages for locale ${locale}:`, error);
    messages = {};
  }

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className="antialiased">
        <RootLayoutClient locale={locale} messages={messages}>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
