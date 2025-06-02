# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Her zaman Türkçe konuş lütfen. Bu proje için Türkçe yanıtlar verilmelidir.

## Proje Komutları

### Derleme ve Geliştirme
- `npm run dev` - Geliştirme sunucusunu port 3002'de başlat (önce konfigürasyon dosyalarını oluşturur)
- `npm run build` - Uygulamayı prodüksiyon için derle (önce konfigürasyon dosyalarını oluşturur)
- `npm run start` - Prodüksiyon sunucusunu port 3002'de başlat

### Kod Kalitesi
- `npm run lint` - ESLint ile kod kalite kontrolü yap

### Konfigürasyon İşlemleri
- `npm run build:config` - Tüm konfigürasyon dosyalarını oluştur (locales, routes, next-config)
- `npm run build:locales` - Prisma generate çalıştırır ve dil konfigürasyonu dosyalarını oluşturur
- `npm run build:routes` - Rota çevirilerini veritabanından alıp statik dosya oluşturur
- `npm run build:next-config` - Next.js konfigürasyon dosyasını dinamik olarak oluşturur

### Veritabanı İşlemleri
- `npm run seed` - Veritabanını başlangıç verileriyle doldur
- `npx prisma generate` - Prisma client'ı yeniden oluştur
- `npx prisma migrate dev` - Geliştirme ortamında migration çalıştır
- `npx prisma migrate deploy` - Prodüksiyon ortamında migration'ları uygula
- `npx prisma studio` - Veritabanını görsel olarak yönet

## Yüksek Seviye Mimari

### Veri Modeli Mimarisi
Proje, çoklu dil desteği için **Ana Model + Çeviri Modeli** pattern'ini kullanır:
- Her içerik için dil bağımsız ana model (örn: `Blog`, `Hizmet`)
- Her ana model için ayrı çeviri modeli (örn: `BlogTranslation`, `HizmetTranslation`)
- Çeviriler `languageCode` ile `Language` tablosuna bağlıdır
- `@@unique([parentId, languageCode])` constraint'i ile veri bütünlüğü sağlanır

**URL Yönetimi Modelleri:**
- `RouteTranslation` - Ana sayfa rotalarının çevirileri
  - `useRootPath` - İngilizce için prefix olmayan URL kullanımı
  - `customPath` - Özel URL yolu tanımlama
- `HizmetLegacyUrl` - Hizmet bazlı legacy URL yönetimi
  - `hizmetId` - Hangi hizmete ait olduğu
  - `legacyUrl` - Eski site URL'i
  - `isActive` - Aktif/pasif durumu

### Kimlik Doğrulama ve Yetkilendirme
- NextAuth.js ile JWT tabanlı oturum yönetimi
- `withAdminMiddleware` fonksiyonu admin rotalarını korur (`/admin/*`)
- Roller: USER ve ADMIN
- bcrypt ile şifre hashleme

### Middleware Katmanı
`src/middleware.ts` dosyası şu işlemleri sırasıyla yapar:

1. **Admin Rotaları Kontrolü:** `/admin/*` yolları için yetkilendirme kontrolü
2. **Root URL Kontrolü:** Ana sayfa (`/`) için varsayılan dil içeriği servis eder
3. **Legacy URL Kontrolü:** Eski site URL'lerini (`legacyUrls`) kontrol eder ve 301 redirect yapar
4. **Root Path Kontrolü:** Prefix olmayan URL'leri (`rootPathRoutes`) internal rewrite ile dil URL'lerine çevirir
   - Örnek: `/about-us` → `/en/hakkimizda` (URL değişmez, internal)
5. **Service Root Level Kontrolü:** İngilizce ana dil için hizmet detaylarını root level'da sunar
   - Örnek: `/hair-transplant-turkey` → `/en/hizmetler/hair-transplant-turkey` (internal)
   - Slug translations kullanarak hizmet slug'ının geçerli olup olmadığını kontrol eder
6. **Dil Tespiti:** URL'den dili tespit eder veya varsayılan dili kullanır
7. **URL Yolu Çevirileri:** `routeTranslations` ve `slugTranslations` kullanarak URL'leri çevirir
   - Örnek: `/tr/hizmetler/sac-ekimi` → `/tr/services/hair-transplant-turkey`
8. **next-intl Middleware:** Dil yönetimi için next-intl middleware'ini çalıştırır
   - `localePrefix: 'as-needed'` - Ana dil için prefix yok, diğerleri için prefix var
   - `localeDetection: false` - URL'den manuel dil tespiti

### URL Routing Sistemi (Eski Sitemap Uyumlu)
Sistem, eski site URL yapısına uyumlu dinamik çoklu dil routing sağlar:

**Ana Dil (İngilizce) - Prefix YOK:**
- `https://celyxmed.com/` (Ana sayfa)
- `https://celyxmed.com/about-us` (Hakkımızda)
- `https://celyxmed.com/hair-transplant-turkey` (Hizmet detayları)
- `https://celyxmed.com/contact` (İletişim)

**Diğer Diller - Prefix VAR:**
- `https://celyxmed.com/tr/` (Türkçe ana sayfa)
- `https://celyxmed.com/tr/hakkimizda` (Türkçe hakkımızda)
- `https://celyxmed.com/de/haartransplantation-turkei` (Almanca hizmet)

**Sistem Özellikleri:**
- **Root Path System:** Admin panelinden prefix olmayan URL'ler tanımlanabilir
  - `RouteTranslation` modelinde `useRootPath` ve `customPath` alanları
  - İngilizce ana dil için otomatik root path oluşturma
- **Legacy URL Support:** Eski site URL'leri yeni sisteme 301 redirect
  - `HizmetLegacyUrl` modeli ile hizmet bazlı legacy URL yönetimi
  - `legacyUrls` export'u ile genel legacy URL mapping
- **Slug Translations:** Her dil için SEO-friendly slug'lar
  - Bilateral slug mapping - tüm dil kombinasyonları desteklenir
  - Service root level detection için slug validation
- **Automatic Hreflang:** Dil alternatifleri otomatik oluşturulur
- **Admin Controlled:** Tüm URL yapısı admin panelinden kontrol edilebilir
  - Rota çevirileri admin paneli (`/admin/rota-cevirileri`)
  - Hizmet detay sayfalarında legacy URL yönetimi

### Dinamik Konfigürasyon Sistemi
Build zamanında veritabanından alınan verilerle statik konfigürasyon dosyaları oluşturulur:

**Build Script'ler:**
- `scripts/generate-locales-config.mjs` - Aktif dilleri alır ve ana dili İngilizce olarak ayarlar
- `scripts/generate-route-translations.mjs` - URL çevirilerini, slug çevirilerini, root path'ları ve legacy URL'leri alır
  - Bilateral slug mapping oluşturur (her slug için tüm dil alternatifleri)
  - Root path routes mapping'i (`rootPathRoutes`) oluşturur
  - Legacy URL mapping'i (`legacyUrls`) oluşturur
- `scripts/generate-next-config.mjs` - next.config.ts dosyasını template'ten oluşturur
  - Route rewrites'ları ekler
  - Hardcoded redirect'leri kaldırır (middleware'e bırakır)

**Oluşturulan Dosyalar:**
- `src/generated/locales-config.ts` - Dil listesi ve ana dil (İngilizce)
  ```typescript
  export const locales = ['en', 'tr', 'de', 'fr', 'it', 'es', 'ru'];
  export const defaultLocale = 'en';
  ```
- `src/generated/route-translations.ts` - Kapsamlı URL yönetimi
  ```typescript
  export const routeTranslations = { ... }; // Ana sayfa rotaları
  export const slugTranslations = { ... };  // Hizmet slug'ları (bilateral)
  export const rootPathRoutes = { ... };    // Root path mapping
  export const legacyUrls = { ... };        // Legacy URL redirects
  ```

**Sistem Akışı:**
1. `npm run build:config` - Tüm konfigürasyon dosyalarını oluşturur
2. Middleware build-time'da oluşturulan dosyaları import eder
3. Runtime'da statik konfigürasyon kullanılır (database sorgusu yok)

### Ana Sayfa Bölümleri (Singleton Pattern)
Her bölüm veritabanında tek kayıt olarak tutulur:
- `HeroContent` - Hero alanı
- `WhyChooseSection` - Neden bizi seçmelisiniz
- `TreatmentSectionContent` - Tedaviler bölümü
- `ClinicShowcase` - Klinik tanıtımı
- `WhyTrustSection` - Neden güvenmelisiniz
- `SuccessStoriesSection` - Başarı hikayeleri
- `ConsultOnlineSection` - Online konsültasyon
- `HomePageFeaturesTabsSection` - Özellik sekmeleri

### Özel Script'ler
`scripts/` klasöründe veri oluşturma script'leri:
- `create-languages.ts` - Desteklenen dilleri ekler
- `seed-faq-section.ts` - SSS bölümünü oluşturur
- `create-consult-online-section.ts` - Online konsültasyon bölümünü oluşturur
- `create-success-stories-section.ts` - Başarı hikayeleri bölümünü oluşturur
- `create-why-trust-section.ts` - Neden güvenmelisiniz bölümünü oluşturur

## Önemli Teknik Notlar

### API Endpoint'leri
- API çağrıları her zaman port 3002 kullanır: `http://localhost:3002`
- API URL'leri hiçbir zaman çevrilmez, her zaman `/api/` prefix'i ile başlar
- Service detail page: `/api/hizmetler/[slug]?locale=[locale]`

### Build Süreç Sırası
1. `npm run build:config` - Konfigürasyon dosyalarını oluştur
2. `npm run build` - Next.js build (konfigürasyonları kullanır)
3. Middleware runtime'da statik dosyaları kullanır

### Kritik Dosyalar
- `src/middleware.ts` - URL routing ve yönlendirme mantığı
- `src/generated/route-translations.ts` - Build-time oluşturulan URL mapping'leri
- `next.config.ts` - Dynamic olarak oluşturulan Next.js konfigürasyonu
- Navigation bileşenleri: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`

### Debugging
- Middleware loglama: `console.log('[Middleware] ...')` formatında
- Service detail page loglama: `console.log('[Page] ...')` formatında
- API loglama: `console.log('[API] ...')` formatında

## Çevre Değişkenleri

Gerekli `.env` değişkenleri:
- `DATABASE_URL` - PostgreSQL bağlantı string'i
- `NEXTAUTH_SECRET` - NextAuth JWT secret key
- `NEXTAUTH_URL` - Uygulama URL'i (development: http://localhost:3002)
- `NEXT_PUBLIC_API_URL` - API base URL (development: http://localhost:3002)