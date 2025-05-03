import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Desteklenen dillerin listesi
const locales = ['en', 'tr'];

export default getRequestConfig(async ({locale}) => {
  // Locale parametresinin geçerliliğini kontrol et
  // Geçerli değilse veya desteklenmiyorsa 404 sayfasına yönlendir
  // Locale parametresinin geçerliliğini kontrol et
  const baseLocale = locale as string; // Tipi string olarak belirt
  if (!locales.includes(baseLocale)) notFound();

  return {
    locale: baseLocale, // Kontrol edilmiş ve tipi belirlenmiş locale'i kullan
    messages: (await import(`./messages/${baseLocale}.json`)).default
  };
});
