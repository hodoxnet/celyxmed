import type { Metadata } from "next";
import { getMessages } from 'next-intl/server';
import RootLayoutClient from "@/components/layout/RootLayoutClient";
import "../globals.css";
import { GeneralSettingWithTranslation } from "@/types/form-types"; // Bu tip tanımını kontrol et, menü tipleri de gerekebilir

// Menü veri tipleri (API yanıtlarına uygun) - Ortak bir types dosyasına taşınabilir
interface MenuItem {
  id: string;
  title: string;
  href: string;
  openInNewTab: boolean;
  children: MenuItem[];
}
interface HeaderMenu {
  id: string;
  name: string;
  items: MenuItem[];
}
interface FooterMenu {
  id: string;
  name: string;
  items: Omit<MenuItem, 'children'>[]; // Footer'da children yok varsayımı
}


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

// Header menü verisini çek
async function fetchHeaderMenu(locale: string): Promise<HeaderMenu[] | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;
  try {
    const response = await fetch(`${baseUrl}/api/menus/header?locale=${locale}`, { cache: 'no-store' });
    if (response.ok) return await response.json();
    console.error(`[fetchHeaderMenu] Failed to fetch: ${response.status}`);
    return null;
  } catch (error) {
    console.error('[fetchHeaderMenu] Error fetching header menu:', error);
    return null;
  }
}

// Footer menü verisini çek
async function fetchFooterMenus(locale: string): Promise<FooterMenu[] | null> {
   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;
  try {
    const response = await fetch(`${baseUrl}/api/menus/footer?locale=${locale}`, { cache: 'no-store' });
     if (response.ok) return await response.json();
    console.error(`[fetchFooterMenus] Failed to fetch: ${response.status}`);
    return null;
  } catch (error) {
    console.error('[fetchFooterMenus] Error fetching footer menus:', error);
    return null;
  }
}


export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params; // params'tan locale'i destruct et
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
  const { locale } = params; // params'tan locale'i destruct et
  console.log(`[Layout] Received locale: ${locale}`);

  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`[Layout] Error fetching messages for locale ${locale}:`, error);
    messages = {}; 
  }

  // Verileri paralel olarak çek
  // messages değişkenini dışarıda tanımladığımız için burada tekrar const ile tanımlamıyoruz.
  const [fetchedMessages, generalSettings, headerMenu, footerMenus] = await Promise.all([
    getMessages({ locale }).catch(error => {
      console.error(`[Layout] Error fetching messages for locale ${locale}:`, error);
      return {}; // Hata durumunda boş obje dön
    }),
    fetchGeneralSettings(locale),
    fetchHeaderMenu(locale),
    fetchFooterMenus(locale)
  ]);

  console.log(`[Layout] Fetched data for locale: ${locale}`);
  if (generalSettings) console.log('[Layout] Successfully fetched general settings.'); else console.log('[Layout] Failed to fetch general settings.');
  if (headerMenu) console.log('[Layout] Successfully fetched header menu.'); else console.log('[Layout] Failed to fetch header menu.');
  if (footerMenus) console.log('[Layout] Successfully fetched footer menus.'); else console.log('[Layout] Failed to fetch footer menus.');

  // messages değişkenine atama yap
  messages = fetchedMessages;

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className="antialiased">
        <RootLayoutClient
          locale={locale}
          messages={messages} // Dışarıdaki messages değişkenini kullan
          generalSettings={generalSettings}
          headerMenu={headerMenu} // Prop olarak ekle
          footerMenus={footerMenus} // Prop olarak ekle
        >
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
