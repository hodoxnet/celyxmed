import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Desteklenen dillerin listesi
  locales: ['en', 'tr'],

  // Varsayılan dil
  defaultLocale: 'tr'
});

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
