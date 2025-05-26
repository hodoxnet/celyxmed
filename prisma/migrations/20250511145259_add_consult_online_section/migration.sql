/*
  Warnings:

  - You are about to drop the column `introVideoId` on the `HizmetTranslation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MenuItemType" AS ENUM ('LINK', 'BLOG_POST', 'SERVICE_PAGE');

-- AlterTable
ALTER TABLE "Hizmet" ADD COLUMN     "introVideoId" TEXT;

-- AlterTable
ALTER TABLE "HizmetTranslation" DROP COLUMN "introVideoId";

-- CreateTable
CREATE TABLE "GeneralSetting" (
    "id" TEXT NOT NULL,
    "faviconUrl" TEXT,
    "logoUrl" TEXT,
    "whatsappNumber" TEXT,
    "phoneNumber" TEXT,
    "emailAddress" TEXT,
    "fullAddress" TEXT,
    "googleMapsEmbed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralSettingTranslation" (
    "id" TEXT NOT NULL,
    "generalSettingId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "headerButtonText" TEXT,
    "headerButtonLink" TEXT,
    "socialYoutubeUrl" TEXT,
    "socialInstagramUrl" TEXT,
    "socialTiktokUrl" TEXT,
    "socialFacebookUrl" TEXT,
    "socialLinkedinUrl" TEXT,
    "copyrightText" TEXT,
    "stickyButtonText" TEXT,
    "stickyButtonLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralSettingTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroContent" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroContentTranslation" (
    "id" TEXT NOT NULL,
    "heroContentId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "button1Text" TEXT,
    "button1Link" TEXT,
    "button2Text" TEXT,
    "button2Link" TEXT,

    CONSTRAINT "HeroContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroBackgroundImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "heroContentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroBackgroundImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyChooseSection" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyChooseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyChooseSectionTranslation" (
    "id" TEXT NOT NULL,
    "whyChooseSectionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryButtonText" TEXT NOT NULL,
    "primaryButtonLink" TEXT NOT NULL,
    "secondaryButtonText" TEXT NOT NULL,
    "secondaryButtonLink" TEXT NOT NULL,

    CONSTRAINT "WhyChooseSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSectionContent" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentSectionContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSectionContentTranslation" (
    "id" TEXT NOT NULL,
    "treatmentSectionContentId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "mainTitle" TEXT NOT NULL,
    "mainDescription" TEXT NOT NULL,
    "exploreButtonText" TEXT NOT NULL,
    "exploreButtonLink" TEXT NOT NULL,
    "avatarGroupText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentSectionContentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSectionAvatar" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "treatmentSectionContentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentSectionAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSectionItem" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentSectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSectionItemTranslation" (
    "id" TEXT NOT NULL,
    "treatmentSectionItemId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentSectionItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicShowcase" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicShowcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicShowcaseTranslation" (
    "id" TEXT NOT NULL,
    "clinicShowcaseId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicShowcaseTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicShowcaseImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "clinicShowcaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicShowcaseImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderMenu" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderMenuTranslation" (
    "id" TEXT NOT NULL,
    "headerMenuId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderMenuTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderMenuItem" (
    "id" TEXT NOT NULL,
    "headerMenuId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "itemType" "MenuItemType" NOT NULL,
    "linkUrl" TEXT,
    "blogPostId" TEXT,
    "hizmetId" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderMenuItemTranslation" (
    "id" TEXT NOT NULL,
    "headerMenuItemId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderMenuItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterMenu" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterMenuTranslation" (
    "id" TEXT NOT NULL,
    "footerMenuId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterMenuTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterMenuItem" (
    "id" TEXT NOT NULL,
    "footerMenuId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "itemType" "MenuItemType" NOT NULL,
    "linkUrl" TEXT,
    "blogPostId" TEXT,
    "hizmetId" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterMenuItemTranslation" (
    "id" TEXT NOT NULL,
    "footerMenuItemId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterMenuItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyTrustSection" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "backgroundImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyTrustSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyTrustSectionTranslation" (
    "id" TEXT NOT NULL,
    "whyTrustSectionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyTrustSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyTrustPoint" (
    "id" TEXT NOT NULL,
    "whyTrustSectionId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyTrustPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyTrustPointTranslation" (
    "id" TEXT NOT NULL,
    "whyTrustPointId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyTrustPointTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStoriesSection" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStoriesSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStoriesSectionTranslation" (
    "id" TEXT NOT NULL,
    "successStoriesSectionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "consultButtonText" TEXT,
    "consultButtonLink" TEXT,
    "discoverButtonText" TEXT,
    "discoverButtonLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStoriesSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStoriesImage" (
    "id" TEXT NOT NULL,
    "successStoriesSectionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStoriesImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStoriesTestimonial" (
    "id" TEXT NOT NULL,
    "successStoriesSectionId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 5,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStoriesTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStoriesTestimonialTranslation" (
    "id" TEXT NOT NULL,
    "testimonialId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStoriesTestimonialTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultOnlineSection" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultOnlineSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultOnlineSectionTranslation" (
    "id" TEXT NOT NULL,
    "consultOnlineSectionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "tagText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "avatarText" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultOnlineSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultOnlineDoctorAvatar" (
    "id" TEXT NOT NULL,
    "consultOnlineSectionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultOnlineDoctorAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneralSettingTranslation_generalSettingId_languageCode_key" ON "GeneralSettingTranslation"("generalSettingId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HeroContentTranslation_heroContentId_languageCode_key" ON "HeroContentTranslation"("heroContentId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "WhyChooseSectionTranslation_whyChooseSectionId_languageCode_key" ON "WhyChooseSectionTranslation"("whyChooseSectionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentSectionContentTranslation_treatmentSectionContentI_key" ON "TreatmentSectionContentTranslation"("treatmentSectionContentId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentSectionItemTranslation_treatmentSectionItemId_lang_key" ON "TreatmentSectionItemTranslation"("treatmentSectionItemId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicShowcaseTranslation_clinicShowcaseId_languageCode_key" ON "ClinicShowcaseTranslation"("clinicShowcaseId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HeaderMenuTranslation_headerMenuId_languageCode_key" ON "HeaderMenuTranslation"("headerMenuId", "languageCode");

-- CreateIndex
CREATE INDEX "HeaderMenuItem_headerMenuId_idx" ON "HeaderMenuItem"("headerMenuId");

-- CreateIndex
CREATE INDEX "HeaderMenuItem_parentId_idx" ON "HeaderMenuItem"("parentId");

-- CreateIndex
CREATE INDEX "HeaderMenuItem_blogPostId_idx" ON "HeaderMenuItem"("blogPostId");

-- CreateIndex
CREATE INDEX "HeaderMenuItem_hizmetId_idx" ON "HeaderMenuItem"("hizmetId");

-- CreateIndex
CREATE UNIQUE INDEX "HeaderMenuItemTranslation_headerMenuItemId_languageCode_key" ON "HeaderMenuItemTranslation"("headerMenuItemId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "FooterMenuTranslation_footerMenuId_languageCode_key" ON "FooterMenuTranslation"("footerMenuId", "languageCode");

-- CreateIndex
CREATE INDEX "FooterMenuItem_footerMenuId_idx" ON "FooterMenuItem"("footerMenuId");

-- CreateIndex
CREATE INDEX "FooterMenuItem_blogPostId_idx" ON "FooterMenuItem"("blogPostId");

-- CreateIndex
CREATE INDEX "FooterMenuItem_hizmetId_idx" ON "FooterMenuItem"("hizmetId");

-- CreateIndex
CREATE UNIQUE INDEX "FooterMenuItemTranslation_footerMenuItemId_languageCode_key" ON "FooterMenuItemTranslation"("footerMenuItemId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "WhyTrustSectionTranslation_whyTrustSectionId_languageCode_key" ON "WhyTrustSectionTranslation"("whyTrustSectionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "WhyTrustPointTranslation_whyTrustPointId_languageCode_key" ON "WhyTrustPointTranslation"("whyTrustPointId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessStoriesSectionTranslation_successStoriesSectionId_la_key" ON "SuccessStoriesSectionTranslation"("successStoriesSectionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessStoriesTestimonialTranslation_testimonialId_language_key" ON "SuccessStoriesTestimonialTranslation"("testimonialId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultOnlineSectionTranslation_consultOnlineSectionId_lang_key" ON "ConsultOnlineSectionTranslation"("consultOnlineSectionId", "languageCode");

-- AddForeignKey
ALTER TABLE "GeneralSettingTranslation" ADD CONSTRAINT "GeneralSettingTranslation_generalSettingId_fkey" FOREIGN KEY ("generalSettingId") REFERENCES "GeneralSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralSettingTranslation" ADD CONSTRAINT "GeneralSettingTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroContentTranslation" ADD CONSTRAINT "HeroContentTranslation_heroContentId_fkey" FOREIGN KEY ("heroContentId") REFERENCES "HeroContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroContentTranslation" ADD CONSTRAINT "HeroContentTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroBackgroundImage" ADD CONSTRAINT "HeroBackgroundImage_heroContentId_fkey" FOREIGN KEY ("heroContentId") REFERENCES "HeroContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseSectionTranslation" ADD CONSTRAINT "WhyChooseSectionTranslation_whyChooseSectionId_fkey" FOREIGN KEY ("whyChooseSectionId") REFERENCES "WhyChooseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyChooseSectionTranslation" ADD CONSTRAINT "WhyChooseSectionTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentSectionContentTranslation" ADD CONSTRAINT "TreatmentSectionContentTranslation_treatmentSectionContent_fkey" FOREIGN KEY ("treatmentSectionContentId") REFERENCES "TreatmentSectionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentSectionContentTranslation" ADD CONSTRAINT "TreatmentSectionContentTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentSectionAvatar" ADD CONSTRAINT "TreatmentSectionAvatar_treatmentSectionContentId_fkey" FOREIGN KEY ("treatmentSectionContentId") REFERENCES "TreatmentSectionContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentSectionItemTranslation" ADD CONSTRAINT "TreatmentSectionItemTranslation_treatmentSectionItemId_fkey" FOREIGN KEY ("treatmentSectionItemId") REFERENCES "TreatmentSectionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentSectionItemTranslation" ADD CONSTRAINT "TreatmentSectionItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicShowcaseTranslation" ADD CONSTRAINT "ClinicShowcaseTranslation_clinicShowcaseId_fkey" FOREIGN KEY ("clinicShowcaseId") REFERENCES "ClinicShowcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicShowcaseTranslation" ADD CONSTRAINT "ClinicShowcaseTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicShowcaseImage" ADD CONSTRAINT "ClinicShowcaseImage_clinicShowcaseId_fkey" FOREIGN KEY ("clinicShowcaseId") REFERENCES "ClinicShowcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuTranslation" ADD CONSTRAINT "HeaderMenuTranslation_headerMenuId_fkey" FOREIGN KEY ("headerMenuId") REFERENCES "HeaderMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuTranslation" ADD CONSTRAINT "HeaderMenuTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuItem" ADD CONSTRAINT "HeaderMenuItem_headerMenuId_fkey" FOREIGN KEY ("headerMenuId") REFERENCES "HeaderMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuItem" ADD CONSTRAINT "HeaderMenuItem_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuItem" ADD CONSTRAINT "HeaderMenuItem_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuItem" ADD CONSTRAINT "HeaderMenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "HeaderMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuItemTranslation" ADD CONSTRAINT "HeaderMenuItemTranslation_headerMenuItemId_fkey" FOREIGN KEY ("headerMenuItemId") REFERENCES "HeaderMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeaderMenuItemTranslation" ADD CONSTRAINT "HeaderMenuItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterMenuTranslation" ADD CONSTRAINT "FooterMenuTranslation_footerMenuId_fkey" FOREIGN KEY ("footerMenuId") REFERENCES "FooterMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterMenuTranslation" ADD CONSTRAINT "FooterMenuTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterMenuItem" ADD CONSTRAINT "FooterMenuItem_footerMenuId_fkey" FOREIGN KEY ("footerMenuId") REFERENCES "FooterMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterMenuItem" ADD CONSTRAINT "FooterMenuItem_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterMenuItem" ADD CONSTRAINT "FooterMenuItem_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterMenuItemTranslation" ADD CONSTRAINT "FooterMenuItemTranslation_footerMenuItemId_fkey" FOREIGN KEY ("footerMenuItemId") REFERENCES "FooterMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterMenuItemTranslation" ADD CONSTRAINT "FooterMenuItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyTrustSectionTranslation" ADD CONSTRAINT "WhyTrustSectionTranslation_whyTrustSectionId_fkey" FOREIGN KEY ("whyTrustSectionId") REFERENCES "WhyTrustSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyTrustSectionTranslation" ADD CONSTRAINT "WhyTrustSectionTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyTrustPoint" ADD CONSTRAINT "WhyTrustPoint_whyTrustSectionId_fkey" FOREIGN KEY ("whyTrustSectionId") REFERENCES "WhyTrustSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyTrustPointTranslation" ADD CONSTRAINT "WhyTrustPointTranslation_whyTrustPointId_fkey" FOREIGN KEY ("whyTrustPointId") REFERENCES "WhyTrustPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyTrustPointTranslation" ADD CONSTRAINT "WhyTrustPointTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStoriesSectionTranslation" ADD CONSTRAINT "SuccessStoriesSectionTranslation_successStoriesSectionId_fkey" FOREIGN KEY ("successStoriesSectionId") REFERENCES "SuccessStoriesSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStoriesSectionTranslation" ADD CONSTRAINT "SuccessStoriesSectionTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStoriesImage" ADD CONSTRAINT "SuccessStoriesImage_successStoriesSectionId_fkey" FOREIGN KEY ("successStoriesSectionId") REFERENCES "SuccessStoriesSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStoriesTestimonial" ADD CONSTRAINT "SuccessStoriesTestimonial_successStoriesSectionId_fkey" FOREIGN KEY ("successStoriesSectionId") REFERENCES "SuccessStoriesSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStoriesTestimonialTranslation" ADD CONSTRAINT "SuccessStoriesTestimonialTranslation_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "SuccessStoriesTestimonial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStoriesTestimonialTranslation" ADD CONSTRAINT "SuccessStoriesTestimonialTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultOnlineSectionTranslation" ADD CONSTRAINT "ConsultOnlineSectionTranslation_consultOnlineSectionId_fkey" FOREIGN KEY ("consultOnlineSectionId") REFERENCES "ConsultOnlineSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultOnlineSectionTranslation" ADD CONSTRAINT "ConsultOnlineSectionTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultOnlineDoctorAvatar" ADD CONSTRAINT "ConsultOnlineDoctorAvatar_consultOnlineSectionId_fkey" FOREIGN KEY ("consultOnlineSectionId") REFERENCES "ConsultOnlineSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
