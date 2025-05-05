import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n'; // Statik listeyi import et
import { withAdminMiddleware } from './middleware/withAdmin';

// Middleware fonksiyonu
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log(`[Middleware] Processing path: ${pathname}`);

  // Admin yollarını ayrı ele al
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Processing admin path: ${pathname}`);
    // Admin yetkilendirme kontrolü
    return await withAdminMiddleware(request); 
    // withAdminMiddleware başarılıysa NextResponse.next() dönecek ve intlMiddleware atlanacak.
    // Başarısızsa yönlendirme yapacak.
  }

  // Admin olmayan yollar için next-intl middleware'ini çağır.
  // Yapılandırmayı (locales, defaultLocale) i18n.ts'den alacak.
  
  // Dinamik config alma kaldırıldı.
  // const { locales, defaultLocale } = await getLocaleConfig(); 
  // console.log(`[Middleware] Fetched config - Locales: [${locales.join(', ')}], Default: ${defaultLocale}`); 

  console.log(`[Middleware] Processing non-admin path with next-intl: ${pathname}`);
  
  // createMiddleware'e statik config'i ver
  const handle = createMiddleware({
     locales, // Statik olarak import edilen locales
     defaultLocale, // Statik olarak import edilen defaultLocale
     localePrefix: 'always', 
     localeDetection: false 
  });

  return handle(request);
}

export const config = {
  // Middleware'in hangi rotalarda çalışacağını belirtir
  // '/((?!api|_next/static|_next/image|favicon.ico).*)' ifadesi:
  // - api rotaları hariç
  // - _next/static dosyaları hariç
  // - _next/image optimizasyonları hariç
  // - favicon.ico hariç
  // - uploads klasörü hariç (eklendi)
  // tüm rotalarda çalışmasını sağlar.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)']
};
