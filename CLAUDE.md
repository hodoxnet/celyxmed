# CLAUDE.md

Her zaman Türkçe konuş lütfen. Bu proje için Türkçe yanıtlar verilmelidir.

Bu dosya, Claude'un Celyxmed projesiyle çalışırken kullanabileceği hatırlatmalar ve komutlar içerir.

## Proje Komutları

### Derleme ve Geliştirme
- `npm run dev` - Geliştirme sunucusunu başlat (önce konfigürasyon dosyalarını oluşturur)
- `npm run build` - Uygulamayı prodüksiyon için derle
- `npm run start` - Prodüksiyon sunucusunu başlat

### Lint ve Tip Kontrolü
- `npm run lint` - ESLint ile kod kalite kontrolü yap
- `npm run typecheck` - TypeScript tip kontrolü yap

### Konfigürasyon İşlemleri
- `npm run build:config` - Tüm konfigürasyon dosyalarını oluştur
- `npm run build:locales` - Dil konfigürasyonu dosyalarını oluştur
- `npm run build:routes` - Rota çevirilerini oluştur
- `npm run build:next-config` - Next.js konfigürasyon dosyasını oluştur

### Veritabanı İşlemleri
- `npm run seed` - Veritabanını başlangıç verileriyle doldur

## Proje Hakkında Notlar

### Teknolojiler ve Yapı
- Next.js 15.3 App Router yapısı ile geliştirilen bir web projesidir
- TypeScript ile tip güvenliği sağlanmıştır
- Prisma ORM ile PostgreSQL veritabanı yönetimi yapılır
- Tailwind CSS ile stil uygulanır
- next-intl ile çoklu dil desteği sağlanır
- next-auth ile oturum yönetimi ve kimlik doğrulama yapılır
- Radix UI ve TipTap gibi modern kütüphaneler kullanılır

### Çoklu Dil Yapısı
- Proje, dinamik [locale] URL parametresi ile çoklu dil desteği sunar
- Her içerik türü için veritabanında ayrı çeviri tabloları bulunur
- RouteTranslation modeli ile URL yollarının da çevirisi yapılır
- Statik çeviriler için src/messages/ altında JSON dosyaları kullanılır

### Proje Modülleri
- Sağlık hizmetleri ve tedaviler yönetimi (Hizmet modeli)
- Blog ve içerik yönetimi
- Menü yönetimi (Header ve Footer)
- Ana sayfa bölümleri yönetimi
  - Hero Section
  - Features Tabs
  - Treatments Section
  - Clinic Showcase
  - Why Trust Section
  - Success Stories
  - Consult Online Section
  - FAQ Section
- Admin paneli ve kullanıcı yönetimi

### Kod Düzeni
- src/app/[locale]/ - Ön yüz sayfaları ve rotaları
- src/app/admin/ - Admin paneli ve yönetim sayfaları
- src/app/api/ - API endpoint'leri 
- src/components/ - Yeniden kullanılabilir bileşenler
- src/lib/ - Yardımcı fonksiyonlar ve hizmetler
- prisma/ - Veritabanı şema tanımları ve migration'lar