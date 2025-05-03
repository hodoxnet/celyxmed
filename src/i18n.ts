import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Desteklenen dillerin listesi - dışa aktarıyoruz, middleware'de kullanacağız
export const locales = ['en', 'tr'];
export const defaultLocale = 'tr';

// Mesajları statik olarak import et
import enMessages from './messages/en.json';
import trMessages from './messages/tr.json';

// Mesajları bir haritada sakla
const allMessages = {
  en: enMessages,
  tr: trMessages
};

export default getRequestConfig(async ({locale}) => {
  // Locale parametresinin geçerliliğini kontrol et - yoksa varsayılanı kullan
  const baseLocale = (locale || defaultLocale) as string;
  
  // Geçerli locale değilse 404 göster
  if (!locales.includes(baseLocale)) {
    console.error(`Invalid locale: ${baseLocale}`);
    notFound();
  }

  console.log(`[i18n] Using locale: ${baseLocale}`);

  return {
    locale: baseLocale,
    // Doğru mesajları locale'e göre seç
    messages: allMessages[baseLocale as keyof typeof allMessages]
  };
});
