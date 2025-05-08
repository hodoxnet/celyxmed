import type { Metadata } from "next";
import { getMessages } from 'next-intl/server';
import RootLayoutClient from "@/components/layout/RootLayoutClient";
import "../globals.css";
import { GeneralSettingWithTranslation } from "@/types/form-types";

async function fetchGeneralSettings(locale: string): Promise<GeneralSettingWithTranslation | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  console.log(`[fetchGeneralSettings] NEXT_PUBLIC_BASE_URL: ${baseUrl}`); // Log eklendi

  if (!baseUrl) {
    console.error("[fetchGeneralSettings] Error: NEXT_PUBLIC_BASE_URL is not defined. Please set it in your .env.local file.");
    return null;
  }

  try {
    // locale bilgisini query parametresi olarak gönderiyoruz
    const response = await fetch(`${baseUrl}/api/general-settings?lang=${locale}`, { 
      // Accept-Language header'ını yine de gönderebiliriz, ancak query parametresi daha öncelikli olacak
      headers: {
        'Accept-Language': locale 
      },
      cache: 'no-store' 
    });
    if (response.ok) {
      return await response.json();
    } else {
      console.error(`[fetchGeneralSettings] Failed to fetch: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[fetchGeneralSettings] Error response body: ${errorText}`);
      return null;
    }
  } catch (error) {
    console.error('[fetchGeneralSettings] Error fetching general settings:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale;
  const settings = await fetchGeneralSettings(locale);
  
  let faviconUrl = "/favicon.ico"; 
  if (settings && settings.faviconUrl) {
    faviconUrl = settings.faviconUrl;
  }

  // TODO: Title ve description da ayarlardan gelmeli
  return {
    title: "Celyxmed Kurumsal", 
    description: "Celyxmed Kurumsal Web Sitesi",
    icons: {
      icon: faviconUrl,
    },
  };
}

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
  } catch (error) {
    console.error(`[Layout] Error fetching messages for locale ${locale}:`, error);
    messages = {}; 
  }

  const generalSettings = await fetchGeneralSettings(locale);
  if (generalSettings) {
    console.log('[Layout] Successfully fetched general settings.');
  } else {
    console.log('[Layout] Failed to fetch general settings or no settings found.');
  }
  
  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className="antialiased">
        <RootLayoutClient 
          locale={locale} 
          messages={messages} 
          generalSettings={generalSettings}
        >
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
