# Celyxmed Deployment Guide

## Sunucuya Güvenli Deployment

### 1. Deployment Öncesi Hazırlık
```bash
# Local'de
npm run build  # Hata kontrolü için
npm run typecheck
npm run lint

# Veritabanı yedeği
pg_dump -h localhost -U postgres -d celyxmed > backup_$(date +%Y%m%d).sql
```

### 2. Sunucuda İlk Kurulum
```bash
# Projeyi çek
git clone https://github.com/username/celyxmed.git
cd celyxmed

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
nano .env  # Veritabanı bilgilerini gir
```

### 3. Veritabanı Migration (Veri Kaybı Olmadan)
```bash
# Mevcut veritabanının yedeğini al
pg_dump -h localhost -U postgres -d celyxmed > prod_backup_$(date +%Y%m%d).sql

# Migration durumunu kontrol et
npx prisma migrate status

# Sadece uygulanmamış migration'ları uygula
npx prisma migrate deploy

# Schema'yı senkronize et (migration olmadan)
npx prisma db push --skip-generate
```

### 4. Build ve Başlat
```bash
# Production build
npm run build

# PM2 ile başlat
pm2 start npm --name "celyxmed" -- start
pm2 save
pm2 startup
```

### 5. Güncelleme Prosedürü
```bash
# Güncellemeleri çek
git pull origin main

# Bağımlılıkları güncelle
npm install

# Migration'ları kontrol et ve uygula
npx prisma migrate deploy

# Yeniden build et
npm run build

# PM2 ile restart
pm2 restart celyxmed
```

## Önemli Notlar

1. **Veritabanı Güvenliği:**
   - Her deployment öncesi mutlaka yedek alın
   - Migration'ları önce test ortamında deneyin
   - `prisma db push` komutu dikkatli kullanılmalı (veri kaybına neden olabilir)

2. **Ortam Değişkenleri:**
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - Diğer API anahtarları

3. **Upload Dizini:**
   - `/public/uploads` dizinindeki dosyalar git'te yok
   - Bu dizini manuel olarak kopyalayın veya ayrı bir CDN kullanın

4. **Migration Alternatifleri:**
   - Eğer schema değişiklikleri az ve basitse: `npx prisma db push --skip-generate`
   - Karmaşık değişiklikler için: Manuel SQL scriptleri yazın