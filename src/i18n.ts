import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import { locales as importedLocales, defaultLocale as importedDefaultLocale } from '@/generated/locales-config'; // Path alias kullanıldı

export const locales = importedLocales;
export const defaultLocale = importedDefaultLocale;

// Mesajları dinamik olarak import et
async function getMessagesForLocale(locale: string) {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`[i18n] Could not load messages for locale ${locale}:`, error);
    notFound(); // Mesaj dosyası bulunamazsa 404
  }
}

export default getRequestConfig(async ({ locale }) => {
  // Gelen locale geçerli mi kontrol et
  // locale undefined olabilir, bu yüzden kontrol ekleyelim
  const validatedLocale = locales.includes(locale as string) ? locale : defaultLocale;

  if (!locales.includes(validatedLocale as string)) {
     // Bu durum aslında olmamalı ama yine de kontrol edelim
     console.error(`[i18n] Invalid locale determined: ${validatedLocale}`);
     notFound();
  }

  console.log(`[i18n] Using locale: ${validatedLocale}`);

  // validatedLocale artık kesinlikle string
  return {
    locale: validatedLocale as string, 
    messages: await getMessagesForLocale(validatedLocale as string)
  };
});

// getLocaleConfig fonksiyonu artık kullanılmıyor, kaldırılabilir veya yorum satırı yapılabilir.
// export const getLocaleConfig = getActiveLocales;
