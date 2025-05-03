import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

// Middleware fonksiyonu
export default function middleware(request: NextRequest) {
  // Kök dizine gelen istekleri yönlendir
  const pathname = request.nextUrl.pathname;
  
  console.log(`[Middleware] Processing path: ${pathname}`);
  
  // Kök yola gelen istekleri doğrudan yönlendir
  if (pathname === '/' || pathname === '') {
    console.log(`[Middleware] Redirecting / to /${defaultLocale}`);
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }
  
  // Diğer rotalar için next-intl middleware'i kullan
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
