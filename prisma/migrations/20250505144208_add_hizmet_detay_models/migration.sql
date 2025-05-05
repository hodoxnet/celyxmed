-- CreateTable
CREATE TABLE "HizmetDetay" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "breadcrumb" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "languageCode" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "heroImageAlt" TEXT NOT NULL,
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
    "overviewTitle" TEXT NOT NULL,
    "overviewDescription" TEXT NOT NULL,
    "whyTitle" TEXT NOT NULL,
    "whyBackgroundImageUrl" TEXT,
    "galleryTitle" TEXT NOT NULL,
    "galleryDescription" TEXT NOT NULL,
    "testimonialsSectionTitle" TEXT,
    "stepsTitle" TEXT NOT NULL,
    "stepsDescription" TEXT,
    "recoveryTitle" TEXT NOT NULL,
    "recoveryDescription" TEXT,
    "ctaTagline" TEXT,
    "ctaTitle" TEXT NOT NULL,
    "ctaDescription" TEXT NOT NULL,
    "ctaButtonText" TEXT NOT NULL,
    "ctaButtonLink" TEXT,
    "ctaAvatarText" TEXT,
    "ctaBackgroundImageUrl" TEXT,
    "ctaMainImageUrl" TEXT,
    "ctaMainImageAlt" TEXT,
    "pricingTitle" TEXT NOT NULL,
    "pricingDescription" TEXT,
    "expertsSectionTitle" TEXT NOT NULL,
    "expertsTagline" TEXT,
    "faqSectionTitle" TEXT NOT NULL,
    "faqSectionDescription" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,

    CONSTRAINT "HizmetDetay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetTocItem" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isBold" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetTocItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetMarqueeImage" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetMarqueeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetIntroLink" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetIntroLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetOverviewTab" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "triggerText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetOverviewTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetWhyItem" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetWhyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetGalleryImage" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetTestimonial" (
    "id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "treatment" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetStep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "linkText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetRecoveryItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetRecoveryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetCtaAvatar" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetCtaAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetPricingPackage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "features" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetPricingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetExpertItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "ctaText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetExpertItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HizmetFaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hizmetDetayId" TEXT NOT NULL,

    CONSTRAINT "HizmetFaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HizmetDetay_slug_languageCode_key" ON "HizmetDetay"("slug", "languageCode");

-- AddForeignKey
ALTER TABLE "HizmetDetay" ADD CONSTRAINT "HizmetDetay_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTocItem" ADD CONSTRAINT "HizmetTocItem_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetMarqueeImage" ADD CONSTRAINT "HizmetMarqueeImage_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetIntroLink" ADD CONSTRAINT "HizmetIntroLink_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetOverviewTab" ADD CONSTRAINT "HizmetOverviewTab_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetWhyItem" ADD CONSTRAINT "HizmetWhyItem_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetGalleryImage" ADD CONSTRAINT "HizmetGalleryImage_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetTestimonial" ADD CONSTRAINT "HizmetTestimonial_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetStep" ADD CONSTRAINT "HizmetStep_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetRecoveryItem" ADD CONSTRAINT "HizmetRecoveryItem_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetCtaAvatar" ADD CONSTRAINT "HizmetCtaAvatar_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetPricingPackage" ADD CONSTRAINT "HizmetPricingPackage_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetExpertItem" ADD CONSTRAINT "HizmetExpertItem_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HizmetFaqItem" ADD CONSTRAINT "HizmetFaqItem_hizmetDetayId_fkey" FOREIGN KEY ("hizmetDetayId") REFERENCES "HizmetDetay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
