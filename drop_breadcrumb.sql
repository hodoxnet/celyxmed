-- Breadcrumb sütununu HizmetTranslation tablosundan kaldır
ALTER TABLE "HizmetTranslation" DROP COLUMN IF EXISTS "breadcrumb"; 