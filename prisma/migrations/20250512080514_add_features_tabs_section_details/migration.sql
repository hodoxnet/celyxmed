-- CreateTable
CREATE TABLE "HomePageFeaturesTabsSection" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageFeaturesTabsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePageFeaturesTabsSectionTranslation" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "mainTitle" TEXT,
    "mainDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageFeaturesTabsSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomePageFeaturesTabsSectionTranslation_sectionId_languageCo_key" ON "HomePageFeaturesTabsSectionTranslation"("sectionId", "languageCode");

-- AddForeignKey
ALTER TABLE "HomePageFeaturesTabsSectionTranslation" ADD CONSTRAINT "HomePageFeaturesTabsSectionTranslation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomePageFeaturesTabsSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomePageFeaturesTabsSectionTranslation" ADD CONSTRAINT "HomePageFeaturesTabsSectionTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;
