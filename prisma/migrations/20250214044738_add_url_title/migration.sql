/*
  Warnings:

  - Added the required column `urlTitle` to the `news_article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "news_article" ADD COLUMN     "urlTitle" TEXT NOT NULL;
