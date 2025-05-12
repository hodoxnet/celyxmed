-- CreateTable
CREATE TABLE "HomePageFeatureTabItem" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageFeatureTabItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePageFeatureTabItemTranslation" (
    "id" TEXT NOT NULL,
    "tabItemId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "triggerText" TEXT NOT NULL,
    "tagText" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageFeatureTabItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomePageFeatureTabItem_value_key" ON "HomePageFeatureTabItem"("value");

-- CreateIndex
CREATE UNIQUE INDEX "HomePageFeatureTabItemTranslation_tabItemId_languageCode_key" ON "HomePageFeatureTabItemTranslation"("tabItemId", "languageCode");

-- AddForeignKey
ALTER TABLE "HomePageFeatureTabItemTranslation" ADD CONSTRAINT "HomePageFeatureTabItemTranslation_tabItemId_fkey" FOREIGN KEY ("tabItemId") REFERENCES "HomePageFeatureTabItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomePageFeatureTabItemTranslation" ADD CONSTRAINT "HomePageFeatureTabItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;
