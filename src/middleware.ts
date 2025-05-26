import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n'; // Statik listeyi import et
import { withAdminMiddleware } from './middleware/withAdmin';
// Rota çevirilerini import et - bu dosya build sırasında oluşturulur
import { routeTranslations, slugTranslations } from './generated/route-translations';

// Dile göre yol çevirme (path translation) fonksiyonu
function getLocalizedPathname(pathname: string, locale: string): string {
  // URL yollarını ve içerik slug'larını dile göre çevirmek için
  try {
    // Artık çevirileri build sırasında oluşturulan dosyadan alıyoruz:
    const pathTranslations = routeTranslations;
    const slugMappings = slugTranslations;

    // Eğer pathname root ise veya çok kısa ise çevirmeye gerek yok
    if (!pathname || pathname === '/' || pathname.split('/').filter(Boolean).length === 0) {
      return pathname;
    }

    // Yolu parçalara ayırma
    const parts = pathname.split('/').filter(Boolean);
    
    // En az 1 parça olmalı
    if (parts.length >= 1) {
      // İlk parça locale olabilir
      const isFirstLocale = locales.includes(parts[0]);
      // İlk parça locale ise, ikinci parçayı kontrol et; değilse ilk parçayı
      const pathPartIndex = isFirstLocale ? 1 : 0;
      
      // Eğer bu index parts dizisinde geçerli değilse, orijinal pathname'i döndür
      if (pathPartIndex >= parts.length) {
        return pathname;
      }

      const pathPart = parts[pathPartIndex];
      let pathChanged = false;
      
      // 1. İlk adım: Ana yol çevirisi (hizmetler -> services)
      if (pathTranslations[pathPart] && pathTranslations[pathPart][locale]) {
        const localizedPathPart = pathTranslations[pathPart][locale];
        
        // Orijinal yolu, çevrilmiş yolla değiştir
        parts[pathPartIndex] = localizedPathPart;
        pathChanged = true;
      }

      // 2. İkinci adım: Eğer bir slug varsa, onu da çevir
      // Slug her zaman path'tan sonraki parçadır (pathPartIndex + 1)
      const slugIndex = pathPartIndex + 1;
      
      // Eğer slug varsa ve çeviri sözlüğünde mevcutsa
      if (slugIndex < parts.length) {
        const slug = parts[slugIndex];
        
        // Slug'ı hedef dile çevirebiliyorsak çevir
        if (slugMappings[slug] && slugMappings[slug][locale]) {
          parts[slugIndex] = slugMappings[slug][locale];
          pathChanged = true;
        }
      }
      
      // Eğer herhangi bir değişiklik yaptıysak, yeni yolu döndür
      if (pathChanged) {
        return '/' + parts.join('/');
      }
    }
  } catch (error) {
    console.error('[Middleware] Error in path translation:', error);
  }
  
  // Herhangi bir değişiklik yapılmadıysa orijinal pathname'i döndür
  return pathname;
}

// Middleware fonksiyonu
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Middleware çalışma akışını takip etmek için loglama
  console.log(`[Middleware] Processing path: ${pathname}`);

  // 1. Önce admin yollarını kontrol et ve admin middleware'ine yönlendir
  if (pathname.startsWith('/admin')) {
    console.log(`[Middleware] Processing admin path: ${pathname}`);
    // Admin yetkilendirme kontrolü - burada next-intl middleware çalışmaz
    return await withAdminMiddleware(request); 
    // withAdminMiddleware başarılıysa NextResponse.next() dönecek
    // Başarısızsa yönlendirme yapacak
  }

  // 2. Dil kontrolü ve yol çevirisine geç - URL'deki dili tespit et veya varsayılan dili kullan
  const parts = pathname.split('/').filter(Boolean);
  const currentLocale = locales.includes(parts[0]) ? parts[0] : defaultLocale;
  console.log(`[Middleware] Detected locale: ${currentLocale}`);
  
  // 3. Geçerli dil için URL yolunu çevir (örn. /tr/hizmetler -> /tr/services)
  const localizedPathname = getLocalizedPathname(pathname, currentLocale);
  
  // 4. Eğer URL değiştiyse, yeni URL'ye yönlendir
  if (localizedPathname !== pathname) {
    console.log(`[Middleware] Redirecting to localized path: ${pathname} -> ${localizedPathname} (using dynamic translations)`);
    const url = request.nextUrl.clone();
    url.pathname = localizedPathname;
    // 302 (Found) ile yönlendirme yaparak tarayıcıların önbelleğe almasını önle
    return NextResponse.redirect(url, 302);
  }

  // 5. Admin olmayan yollar için next-intl middleware'ini çağır
  console.log(`[Middleware] Processing non-admin path with next-intl: ${pathname}`);
  
  // 6. next-intl createMiddleware'e gerekli yapılandırmayı ver
  const handle = createMiddleware({
     locales,         // Desteklenen diller
     defaultLocale,   // Varsayılan dil
     localePrefix: 'always',    // URL'lerde dil kodu her zaman görünür
     localeDetection: false     // URL'den dil tespitini kapat, çünkü elle yapıyoruz
  });

  // 7. next-intl middleware'ini çalıştır
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
