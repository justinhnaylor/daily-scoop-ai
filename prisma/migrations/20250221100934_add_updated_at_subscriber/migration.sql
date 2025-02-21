/*
  Warnings:

  - Added the required column `updatedAt` to the `newsletter_subscriber` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "newsletter_subscriber" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
