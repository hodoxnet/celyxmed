/*
  Warnings:

  - You are about to drop the column `breadcrumb` on the `HizmetTranslation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HizmetTranslation" DROP COLUMN "breadcrumb";

-- CreateTable
CREATE TABLE "AboutPage" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "heroImageUrl" TEXT,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPageTranslation" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "heroPrimaryButtonText" TEXT NOT NULL,
    "heroPrimaryButtonLink" TEXT NOT NULL,
    "heroSecondaryButtonText" TEXT NOT NULL,
    "heroSecondaryButtonLink" TEXT NOT NULL,
    "jciTitle" TEXT NOT NULL,
    "jciPrimaryButtonText" TEXT NOT NULL,
    "jciPrimaryButtonLink" TEXT NOT NULL,
    "jciSecondaryButtonText" TEXT NOT NULL,
    "jciSecondaryButtonLink" TEXT NOT NULL,
    "doctorsTitle" TEXT NOT NULL DEFAULT 'Uzman Doktorlarımız',
    "doctorsDescription" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPageTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPageGalleryImage" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPageGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPageCareItem" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPageCareItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPageCareItemTranslation" (
    "id" TEXT NOT NULL,
    "careItemId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPageCareItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPageDoctor" (
    "id" TEXT NOT NULL,
    "aboutPageId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPageDoctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutPageDoctorTranslation" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPageDoctorTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AboutPageTranslation_aboutPageId_languageCode_key" ON "AboutPageTranslation"("aboutPageId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "AboutPageCareItemTranslation_careItemId_languageCode_key" ON "AboutPageCareItemTranslation"("careItemId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "AboutPageDoctorTranslation_doctorId_languageCode_key" ON "AboutPageDoctorTranslation"("doctorId", "languageCode");

-- AddForeignKey
ALTER TABLE "AboutPageTranslation" ADD CONSTRAINT "AboutPageTranslation_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "AboutPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageTranslation" ADD CONSTRAINT "AboutPageTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageGalleryImage" ADD CONSTRAINT "AboutPageGalleryImage_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "AboutPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageCareItem" ADD CONSTRAINT "AboutPageCareItem_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "AboutPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageCareItemTranslation" ADD CONSTRAINT "AboutPageCareItemTranslation_careItemId_fkey" FOREIGN KEY ("careItemId") REFERENCES "AboutPageCareItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageCareItemTranslation" ADD CONSTRAINT "AboutPageCareItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageDoctor" ADD CONSTRAINT "AboutPageDoctor_aboutPageId_fkey" FOREIGN KEY ("aboutPageId") REFERENCES "AboutPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageDoctorTranslation" ADD CONSTRAINT "AboutPageDoctorTranslation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "AboutPageDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutPageDoctorTranslation" ADD CONSTRAINT "AboutPageDoctorTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;
