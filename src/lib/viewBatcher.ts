interface ViewBatch {
  count: number
  lastUpdate: number
}

class ViewBatcher {
  private batchMap: Map<string, ViewBatch>
  private batchTimeout: number
  private updateInterval: NodeJS.Timeout

  constructor(updateIntervalMs: number = 60000) {
    // Default 1 minute
    this.batchMap = new Map()
    this.batchTimeout = updateIntervalMs

    // Start periodic updates
    this.updateInterval = setInterval(() => {
      this.flushBatches()
    }, this.batchTimeout)
  }

  async addView(articleId: string): Promise<void> {
    const batch = this.batchMap.get(articleId) || {
      count: 0,
      lastUpdate: Date.now(),
    }
    batch.count++
    this.batchMap.set(articleId, batch)

    // If batch size gets too large, flush immediately
    if (batch.count >= 100) {
      await this.flushArticle(articleId)
    }
  }

  private async flushArticle(articleId: string): Promise<void> {
    const batch = this.batchMap.get(articleId)
    if (!batch || batch.count === 0) return

    try {
      await prisma.news_article.update({
        where: { id: articleId },
        data: {
          views: {
            increment: batch.count,
          },
        },
      })

      // Clear the batch after successful update
      this.batchMap.delete(articleId)
    } catch (error) {
      console.error(`Error flushing views for article ${articleId}:`, error)
    }
  }

  private async flushBatches(): Promise<void> {
    const promises = Array.from(this.batchMap.keys()).map((articleId) =>
      this.flushArticle(articleId)
    )

    try {
      await Promise.all(promises)
    } catch (error) {
      console.error("Error flushing view batches:", error)
    }
  }

  // Call this when shutting down the server
  async shutdown(): Promise<void> {
    clearInterval(this.updateInterval)
    await this.flushBatches()
  }
}

import prisma from "../../lib/prisma"

// Create a singleton instance
const viewBatcher = new ViewBatcher()

export default viewBatcher
