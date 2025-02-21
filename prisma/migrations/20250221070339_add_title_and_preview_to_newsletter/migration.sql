/*
  Warnings:

  - You are about to drop the column `news_article_id` on the `daily_newsletter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[newsArticleId]` on the table `daily_newsletter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `newsArticleId` to the `daily_newsletter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewText` to the `daily_newsletter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleText` to the `daily_newsletter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "daily_newsletter" DROP CONSTRAINT "daily_newsletter_news_article_id_fkey";

-- DropIndex
DROP INDEX "daily_newsletter_news_article_id_key";

-- AlterTable
ALTER TABLE "daily_newsletter" DROP COLUMN "news_article_id",
ADD COLUMN     "newsArticleId" TEXT NOT NULL,
ADD COLUMN     "previewText" TEXT NOT NULL,
ADD COLUMN     "titleText" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "daily_newsletter_newsArticleId_key" ON "daily_newsletter"("newsArticleId");

-- AddForeignKey
ALTER TABLE "daily_newsletter" ADD CONSTRAINT "daily_newsletter_newsArticleId_fkey" FOREIGN KEY ("newsArticleId") REFERENCES "news_article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
