/*
  Warnings:

  - You are about to drop the column `slug` on the `Blog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Blog_slug_key";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "BlogTranslation" ADD COLUMN     "slug" TEXT;
