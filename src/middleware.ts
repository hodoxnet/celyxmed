import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n'; // Statik listeyi import et
import { withAdminMiddleware } from './middleware/withAdmin';

// next-intl handler'ını dışarıda oluştur
const handleIntl = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false
});

// Middleware fonksiyonu
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(`[Middleware] Processing path: ${pathname}`);

  // Admin yollarını kontrol et
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Processing admin path: ${pathname}`);
    // Admin yetkilendirme kontrolü
    const adminAuthResponse = await withAdminMiddleware(request);

    // Eğer admin yetkilendirme bir yönlendirme döndürdüyse (örn. login'e), onu hemen döndür
    // 307 (Temporary Redirect) veya 308 (Permanent Redirect) durum kodlarını kontrol et
    if (adminAuthResponse.status === 307 || adminAuthResponse.status === 308) {
      console.log('[Middleware] Admin auth redirected. Returning redirect response.');
      return adminAuthResponse;
    }
    
    // Eğer admin yetkilendirmesi başarılı olduysa (NextResponse.next() döndü),
    // işlemi durdurma, aşağıda next-intl handler'ının çalışmasına izin ver.
    console.log('[Middleware] Admin auth passed. Proceeding to next-intl handling for admin path.');
  }

  // Bu noktaya ulaşan TÜM istekler (yetkili admin istekleri dahil) 
  // next-intl handler'ı tarafından işlenecek.
  console.log(`[Middleware] Applying next-intl handler for path: ${pathname}`);
  return handleIntl(request);
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
