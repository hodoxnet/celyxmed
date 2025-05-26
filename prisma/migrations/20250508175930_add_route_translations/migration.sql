-- CreateTable
CREATE TABLE IF NOT EXISTS "RouteTranslation" (
  "id" TEXT NOT NULL,
  "routeKey" TEXT NOT NULL,
  "languageCode" TEXT NOT NULL,
  "translatedValue" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RouteTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RouteTranslation_routeKey_languageCode_key" ON "RouteTranslation"("routeKey", "languageCode");

-- AddForeignKey
ALTER TABLE "RouteTranslation" ADD CONSTRAINT "RouteTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fetch active languages
DO $$
DECLARE 
    lang record;
BEGIN
    -- Add default values for active languages only
    FOR lang IN (SELECT code FROM "Language" WHERE "isActive" = true)
    LOOP
        -- Hizmetler translations
        INSERT INTO "RouteTranslation" ("id", "routeKey", "languageCode", "translatedValue", "createdAt", "updatedAt")
        SELECT 
            gen_random_uuid(),
            'hizmetler',
            lang.code,
            CASE 
                WHEN lang.code = 'tr' THEN 'hizmetler'
                WHEN lang.code = 'en' THEN 'services'
                WHEN lang.code = 'es' THEN 'servicios'
                WHEN lang.code = 'fr' THEN 'services'
                WHEN lang.code = 'de' THEN 'dienstleistungen'
                WHEN lang.code = 'it' THEN 'servizi'
                WHEN lang.code = 'ru' THEN 'услуги'
                ELSE 'services' -- Default to English if unknown
            END,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        WHERE NOT EXISTS (
            SELECT 1 FROM "RouteTranslation"
            WHERE "routeKey" = 'hizmetler' AND "languageCode" = lang.code
        );
        
        -- Blog translations
        INSERT INTO "RouteTranslation" ("id", "routeKey", "languageCode", "translatedValue", "createdAt", "updatedAt")
        SELECT 
            gen_random_uuid(),
            'blog',
            lang.code,
            CASE 
                WHEN lang.code = 'ru' THEN 'блог'
                ELSE 'blog' -- Same for most languages
            END,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        WHERE NOT EXISTS (
            SELECT 1 FROM "RouteTranslation"
            WHERE "routeKey" = 'blog' AND "languageCode" = lang.code
        );
        
        -- İletişim translations
        INSERT INTO "RouteTranslation" ("id", "routeKey", "languageCode", "translatedValue", "createdAt", "updatedAt")
        SELECT 
            gen_random_uuid(),
            'iletisim',
            lang.code,
            CASE 
                WHEN lang.code = 'tr' THEN 'iletisim'
                WHEN lang.code = 'en' THEN 'contact'
                WHEN lang.code = 'es' THEN 'contacto'
                WHEN lang.code = 'fr' THEN 'contact'
                WHEN lang.code = 'de' THEN 'kontakt'
                WHEN lang.code = 'it' THEN 'contatto'
                WHEN lang.code = 'ru' THEN 'контакты'
                ELSE 'contact' -- Default to English if unknown
            END,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        WHERE NOT EXISTS (
            SELECT 1 FROM "RouteTranslation"
            WHERE "routeKey" = 'iletisim' AND "languageCode" = lang.code
        );
    END LOOP;
END $$;