/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `HizmetOverviewTab` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HizmetOverviewTab" DROP COLUMN "imageUrl",
ADD COLUMN     "buttonLink" TEXT,
ADD COLUMN     "imagePath" TEXT,
ALTER COLUMN "imageAlt" DROP NOT NULL;
