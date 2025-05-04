import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';
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

  // Kök yola gelen istekleri varsayılan locale'e yönlendir
  if (pathname === '/' || pathname === '') {
    console.log(`[Middleware] Redirecting / to /${defaultLocale}`);
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Diğer (admin olmayan) rotalar için next-intl middleware'i kullan
  console.log(`[Middleware] Processing non-admin path with next-intl: ${pathname}`);
  const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });
  
  return intlMiddleware(request);
}

export const config = {
  // Middleware'in hangi rotalarda çalışacağını belirtir
  // '/((?!api|_next/static|_next/image|favicon.ico).*)' ifadesi:
  // - api rotaları hariç
  // - _next/static dosyaları hariç
  // - _next/image optimizasyonları hariç
  // - favicon.ico hariç
  // tüm rotalarda çalışmasını sağlar.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
