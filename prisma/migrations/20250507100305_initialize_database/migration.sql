-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTranslation" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tocItems" JSONB,
    "blogId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,

    CONSTRAINT "BlogTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hizmet" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "heroImageUrl" TEXT,
    "heroImageAlt" TEXT,
    "whyBackgroundImageUrl" TEXT,
    "ctaBackgroundImageUrl" TEXT,
    "ctaMainImageUrl" TEXT,
    "ctaMainImageAlt" TEXT,

    CONSTRAINT "Hizmet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetTranslation" (
    "id" TEXT NOT NULL,
    "hizmetId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "breadcrumb" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tocTitle" TEXT NOT NULL,
    "tocAuthorInfo" TEXT,
    "tocCtaDescription" TEXT NOT NULL,
    "introVideoId" TEXT,
    "introTitle" TEXT NOT NULL,
    "introDescription" TEXT NOT NULL,
    "introPrimaryButtonText" TEXT NOT NULL,
    "introPrimaryButtonLink" TEXT NOT NULL,
    "introSecondaryButtonText" TEXT NOT NULL,
    "introSecondaryButtonLink" TEXT NOT NULL,
    "overviewSectionTitle" TEXT NOT NULL,
    "overviewSectionDescription" TEXT,
    "whySectionTitle" TEXT NOT NULL,
    "gallerySectionTitle" TEXT NOT NULL,
    "gallerySectionDescription" TEXT NOT NULL,
    "testimonialsSectionTitle" TEXT,
    "stepsSectionTitle" TEXT NOT NULL,
    "stepsSectionDescription" TEXT,
    "recoverySectionTitle" TEXT NOT NULL,
    "recoverySectionDescription" TEXT,
    "ctaTagline" TEXT,
    "ctaTitle" TEXT NOT NULL,
    "ctaDescription" TEXT NOT NULL,
    "ctaButtonText" TEXT NOT NULL,
    "ctaButtonLink" TEXT,
    "ctaAvatarText" TEXT,
    "pricingSectionTitle" TEXT NOT NULL,
    "pricingSectionDescription" TEXT,
    "expertsSectionTitle" TEXT NOT NULL,
    "expertsTagline" TEXT,
    "faqSectionTitle" TEXT NOT NULL,
    "faqSectionDescription" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,

    CONSTRAINT "HizmetTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetMarqueeImage" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetId" TEXT NOT NULL,

    CONSTRAINT "HizmetMarqueeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetGalleryImage" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetId" TEXT NOT NULL,

    CONSTRAINT "HizmetGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetCtaAvatar" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetId" TEXT NOT NULL,

    CONSTRAINT "HizmetCtaAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetTocItem" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isBold" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetTranslationId" TEXT NOT NULL,

    CONSTRAINT "HizmetTocItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetIntroLink" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetTranslationId" TEXT NOT NULL,

    CONSTRAINT "HizmetIntroLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetStep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "linkText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetTranslationId" TEXT NOT NULL,

    CONSTRAINT "HizmetStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetFaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetTranslationId" TEXT NOT NULL,

    CONSTRAINT "HizmetFaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetOverviewTabDefinition" (
    "id" TEXT NOT NULL,
    "hizmetId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "imagePath" TEXT,
    "imageAlt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HizmetOverviewTabDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetOverviewTabTranslation" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "triggerText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "buttonLink" TEXT,

    CONSTRAINT "HizmetOverviewTabTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetWhyItemDefinition" (
    "id" TEXT NOT NULL,
    "hizmetId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HizmetWhyItemDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetWhyItemTranslation" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "HizmetWhyItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetTestimonialDefinition" (
    "id" TEXT NOT NULL,
    "hizmetId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 5,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HizmetTestimonialDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetTestimonialTranslation" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "treatment" TEXT,

    CONSTRAINT "HizmetTestimonialTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetRecoveryItemDefinition" (
    "id" TEXT NOT NULL,
    "hizmetId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HizmetRecoveryItemDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetRecoveryItemTranslation" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "HizmetRecoveryItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetPricingPackageDefinition" (
    "id" TEXT NOT NULL,
    "hizmetId" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HizmetPricingPackageDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetPricingPackageTranslation" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "features" TEXT[],

    CONSTRAINT "HizmetPricingPackageTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetExpertItemDefinition" (
    "id" TEXT NOT NULL,
    "hizmetId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HizmetExpertItemDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetExpertItemTranslation" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaText" TEXT,

    CONSTRAINT "HizmetExpertItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTranslation_blogId_languageCode_key" ON "BlogTranslation"("blogId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetTranslation_hizmetId_languageCode_key" ON "HizmetTranslation"("hizmetId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetTranslation_slug_languageCode_key" ON "HizmetTranslation"("slug", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetOverviewTabDefinition_hizmetId_value_key" ON "HizmetOverviewTabDefinition"("hizmetId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetOverviewTabTranslation_definitionId_languageCode_key" ON "HizmetOverviewTabTranslation"("definitionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetWhyItemTranslation_definitionId_languageCode_key" ON "HizmetWhyItemTranslation"("definitionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetTestimonialTranslation_definitionId_languageCode_key" ON "HizmetTestimonialTranslation"("definitionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetRecoveryItemTranslation_definitionId_languageCode_key" ON "HizmetRecoveryItemTranslation"("definitionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetPricingPackageTranslation_definitionId_languageCode_key" ON "HizmetPricingPackageTranslation"("definitionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "HizmetExpertItemTranslation_definitionId_languageCode_key" ON "HizmetExpertItemTranslation"("definitionId", "languageCode");

-- AddForeignKey
ALTER TABLE "BlogTranslation" ADD CONSTRAINT "BlogTranslation_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTranslation" ADD CONSTRAINT "BlogTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTranslation" ADD CONSTRAINT "HizmetTranslation_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTranslation" ADD CONSTRAINT "HizmetTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetMarqueeImage" ADD CONSTRAINT "HizmetMarqueeImage_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetGalleryImage" ADD CONSTRAINT "HizmetGalleryImage_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetCtaAvatar" ADD CONSTRAINT "HizmetCtaAvatar_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTocItem" ADD CONSTRAINT "HizmetTocItem_hizmetTranslationId_fkey" FOREIGN KEY ("hizmetTranslationId") REFERENCES "HizmetTranslation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetIntroLink" ADD CONSTRAINT "HizmetIntroLink_hizmetTranslationId_fkey" FOREIGN KEY ("hizmetTranslationId") REFERENCES "HizmetTranslation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetStep" ADD CONSTRAINT "HizmetStep_hizmetTranslationId_fkey" FOREIGN KEY ("hizmetTranslationId") REFERENCES "HizmetTranslation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetFaqItem" ADD CONSTRAINT "HizmetFaqItem_hizmetTranslationId_fkey" FOREIGN KEY ("hizmetTranslationId") REFERENCES "HizmetTranslation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetOverviewTabDefinition" ADD CONSTRAINT "HizmetOverviewTabDefinition_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetOverviewTabTranslation" ADD CONSTRAINT "HizmetOverviewTabTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "HizmetOverviewTabDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetOverviewTabTranslation" ADD CONSTRAINT "HizmetOverviewTabTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetWhyItemDefinition" ADD CONSTRAINT "HizmetWhyItemDefinition_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetWhyItemTranslation" ADD CONSTRAINT "HizmetWhyItemTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "HizmetWhyItemDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetWhyItemTranslation" ADD CONSTRAINT "HizmetWhyItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTestimonialDefinition" ADD CONSTRAINT "HizmetTestimonialDefinition_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTestimonialTranslation" ADD CONSTRAINT "HizmetTestimonialTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "HizmetTestimonialDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTestimonialTranslation" ADD CONSTRAINT "HizmetTestimonialTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetRecoveryItemDefinition" ADD CONSTRAINT "HizmetRecoveryItemDefinition_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetRecoveryItemTranslation" ADD CONSTRAINT "HizmetRecoveryItemTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "HizmetRecoveryItemDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetRecoveryItemTranslation" ADD CONSTRAINT "HizmetRecoveryItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetPricingPackageDefinition" ADD CONSTRAINT "HizmetPricingPackageDefinition_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetPricingPackageTranslation" ADD CONSTRAINT "HizmetPricingPackageTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "HizmetPricingPackageDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetPricingPackageTranslation" ADD CONSTRAINT "HizmetPricingPackageTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetExpertItemDefinition" ADD CONSTRAINT "HizmetExpertItemDefinition_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetExpertItemTranslation" ADD CONSTRAINT "HizmetExpertItemTranslation_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "HizmetExpertItemDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetExpertItemTranslation" ADD CONSTRAINT "HizmetExpertItemTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;
