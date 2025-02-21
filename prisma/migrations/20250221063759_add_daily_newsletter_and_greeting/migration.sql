-- CreateTable
CREATE TABLE "daily_greeting" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "daily_greeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_newsletter" (
    "id" TEXT NOT NULL,
    "news_article_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issue" SERIAL NOT NULL,

    CONSTRAINT "daily_newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_newsletter_news_article_id_key" ON "daily_newsletter"("news_article_id");

-- AddForeignKey
ALTER TABLE "daily_newsletter" ADD CONSTRAINT "daily_newsletter_news_article_id_fkey" FOREIGN KEY ("news_article_id") REFERENCES "news_article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
