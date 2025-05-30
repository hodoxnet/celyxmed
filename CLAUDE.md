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

### Kimlik Doğrulama ve Yetkilendirme
- NextAuth.js ile JWT tabanlı oturum yönetimi
- `withAdminMiddleware` fonksiyonu admin rotalarını korur (`/admin/*`)
- Roller: USER ve ADMIN
- bcrypt ile şifre hashleme

### Middleware Katmanı
`src/middleware.ts` dosyası şu işlemleri sırasıyla yapar:
1. Admin rotalarını kontrol eder ve yetkilendirme yapar
2. Locale (dil) tespiti yapar
3. URL yolu çevirilerini uygular (örn: `/tr/hizmetler` → `/en/services`)
4. next-intl middleware'ini çalıştırır

### Dinamik Konfigürasyon Sistemi
Build zamanında veritabanından alınan verilerle statik konfigürasyon dosyaları oluşturulur:
- `scripts/generate-locales-config.mjs` - Aktif dilleri alır
- `scripts/generate-route-translations.mjs` - URL çevirilerini alır
- `scripts/generate-next-config.mjs` - next.config.ts dosyasını oluşturur
- Oluşturulan dosyalar `src/generated/` klasöründe saklanır

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

## Çevre Değişkenleri

Gerekli `.env` değişkenleri:
- `DATABASE_URL` - PostgreSQL bağlantı string'i
- `NEXTAUTH_SECRET` - NextAuth JWT secret key
- `NEXTAUTH_URL` - Uygulama URL'i (development: http://localhost:3002)