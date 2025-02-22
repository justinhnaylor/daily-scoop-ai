import { NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"
import * as SibApiV3Sdk from "@getbrevo/brevo"
import crypto from "crypto"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a new ratelimiter that allows 5 requests per hour
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
})

const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi()
brevoClient.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
)

const TEMPLATE_IDS = {
  daily: 1,
  weekly: 1,
}

function validateTemplateId(templateId: number): boolean {
  console.log("Validating template ID:", templateId)

  const validTemplateIds = Object.values(TEMPLATE_IDS)
  const isValid = validTemplateIds.includes(templateId)

  if (!isValid) {
    console.error(
      "Invalid template ID:",
      templateId,
      "Valid IDs are:",
      validTemplateIds
    )
  }

  return isValid
}

async function getTodaysNewsletter() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const newsletter = await prisma.daily_newsletter.findFirst({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      newsArticle: {
        include: {
          category: true,
        },
      },
    },
  })

  if (!newsletter) {
    return null
  }

  return {
    article: newsletter.newsArticle,
    issue: newsletter.issue,
    titleText: newsletter.titleText,
    previewText: newsletter.previewText,
  }
}

function generateRequestSignature(timestamp: string, frequency: string) {
  const secret = process.env.NEWSLETTER_SECRET_KEY!
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}:${frequency}`)
    .digest("hex")
}

function isAuthorized(request: Request) {
  try {
    // Check if it's a Vercel Cron request
    const authHeader = request.headers.get("authorization")
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      console.log("Authorized Vercel cron request")
      return true
    }

    // For non-cron requests, continue with existing auth logic
    const timestamp = request.headers.get("x-timestamp")
    const signature = request.headers.get("x-signature")
    const { searchParams } = new URL(request.url)
    const frequency = searchParams.get("frequency") || ""

    console.log("Auth Debug:", {
      authHeader: authHeader?.substring(0, 20) + "...",
      timestamp,
      signature: signature?.substring(0, 20) + "...",
      frequency,
    })

    // Basic validation
    if (!authHeader || !timestamp || !signature) {
      console.log("Failed basic validation - missing headers")
      return false
    }

    // API key check
    const apiKey = process.env.NEWSLETTER_API_KEY
    const providedApiKey = authHeader.replace("Bearer ", "")
    if (providedApiKey !== apiKey) {
      console.log("Failed API key validation")
      return false
    }

    // Timestamp validation (within 5 minutes of request time)
    const requestTime = parseInt(timestamp)
    const currentTime = Date.now()
    const timeDiff = Math.abs(currentTime - requestTime)
    if (timeDiff > 5 * 60 * 1000) {
      console.log("Failed time validation")
      return false
    }

    // Signature validation
    const expectedSignature = generateRequestSignature(timestamp, frequency)
    if (signature !== expectedSignature) {
      console.log("Failed signature validation")
      return false
    }

    console.log("Authorization successful!")
    return true
  } catch (error) {
    console.error("Authorization error:", error)
    return false
  }
}

function convertMarkupToHtml(text: string): string {
  text = text.replace(/\[p\]/g, "")

  const patterns = [
    { regex: /\[bold\](.*?)\[\/bold\]/g, html: "<strong>$1</strong>" },
    { regex: /\[italic\](.*?)\[\/italic\]/g, html: "<em>$1</em>" },
    {
      regex: /\[bold-italic\](.*?)\[\/bold-italic\]/g,
      html: "<strong><em>$1</em></strong>",
    },
    {
      regex: /\[underline-italic\](.*?)\[\/underline-italic\]/g,
      html: "<u><em>$1</em></u>",
    },
    {
      regex: /\[bold-underline\](.*?)\[\/bold-underline\]/g,
      html: "<strong><u>$1</u></strong>",
    },
    {
      regex: /\[strikethrough\](.*?)\[\/strikethrough\]/g,
      html: "<del>$1</del>",
    },
  ]

  let htmlText = text
  patterns.forEach(({ regex, html }) => {
    htmlText = htmlText.replace(regex, html)
  })

  htmlText = htmlText.replace(/\n/g, "<br>")

  return htmlText
}

async function getRandomGreeting(): Promise<string> {
  const count = await prisma.daily_greeting.count()

  const randomIndex = Math.floor(Math.random() * count)

  const greeting = await prisma.daily_greeting.findFirst({
    skip: randomIndex,
    take: 1,
  })

  return (
    greeting?.message || "Here's today's top story you won't want to miss..."
  )
}

function generateUnsubscribeUrl(email: string): string {
  const timestamp = Date.now().toString()
  const signature = crypto
    .createHmac("sha256", process.env.NEWSLETTER_SECRET_KEY!)
    .update(`${timestamp}:unsubscribe`)
    .digest("hex")

  const params = new URLSearchParams({
    email,
    timestamp,
    signature,
    key: process.env.NEWSLETTER_API_KEY!,
  })

  return `${
    process.env.NEXT_PUBLIC_BASE_URL
  }/api/newsletter/unsubscribe?${params.toString()}`
}

export async function POST(request: Request) {
  // Check if it's a Vercel cron request first
  const authHeader = request.headers.get("authorization")
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

  // Only apply rate limiting for non-cron requests
  if (!isVercelCron) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1"
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        {
          message: "Too many requests",
          reset: reset,
          remaining: remaining,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      )
    }
  }

  if (!isAuthorized(request)) {
    console.warn("Unauthorized newsletter send attempt", {
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const frequency = searchParams.get("frequency")

    if (!frequency || !["daily", "weekly"].includes(frequency)) {
      return NextResponse.json(
        { message: "Invalid frequency" },
        { status: 400 }
      )
    }

    const subscribers = await prisma.newsletter_subscriber.findMany({
      where: {
        frequency,
        active: true,
      },
    })

    if (subscribers.length === 0) {
      return NextResponse.json({
        message: "No active subscribers found for this frequency",
        frequency,
      })
    }

    const newsletter = await getTodaysNewsletter()
    if (!newsletter) {
      return NextResponse.json(
        { message: "No newsletter scheduled for today" },
        { status: 404 }
      )
    }

    const { article, issue, titleText, previewText } = newsletter
    const subjectWithIssue = `${titleText} - Issue #${issue}`

    const emailsSent = []
    const emailErrors = []

    for (const subscriber of subscribers) {
      try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

        const subscriberName =
          subscriber.firstName || subscriber.email.split("@")[0]
        const greeting = await getRandomGreeting()

        console.log("Selected greeting:", greeting)

        // Convert the article body to HTML first
        const articleHtml = convertMarkupToHtml(article.body)
        const excerpt = articleHtml.substring(0, 200) + "..."

        // Format the date for the URL
        const articleDate = new Date(article.createdAt)
        const year = articleDate.getFullYear()
        const month = articleDate.getMonth() + 1 // getMonth() returns 0-11
        const day = articleDate.getDate()

        // Construct the article URL with date components
        const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${year}/${month}/${day}/${article.urlTitle}`

        // Log what we're sending for debugging
        console.log("Sending email with content:", {
          originalText: article.body.substring(0, 200),
          convertedHtml: excerpt,
          articleUrl,
        })

        // Get and validate template ID
        const templateId = TEMPLATE_IDS[frequency as keyof typeof TEMPLATE_IDS]
        if (!validateTemplateId(templateId)) {
          throw new Error(
            `Invalid template ID: ${templateId} for frequency: ${frequency}`
          )
        }

        // Set template parameters
        sendSmtpEmail.templateId = templateId
        sendSmtpEmail.params = {
          title:
            frequency === "daily"
              ? "Your Daily News Update"
              : "Your Weekly News Roundup",
          name: subscriberName,
          message: greeting,
          articleTitle: article.title,
          articleExcerpt: excerpt,
          articleUrl: articleUrl,
          imageUrl: article.imageUrl,
          frequency: frequency,
          issueNumber: issue,
          date: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          unsubscribeUrl: generateUnsubscribeUrl(subscriber.email),
          previewText: previewText.replace(/\[.*?\]/g, ""),
        }

        sendSmtpEmail.headers = {
          "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?email=${subscriber.email}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Mailer": "Daily Scoop AI Newsletter",
        }

        sendSmtpEmail.subject = subjectWithIssue
        sendSmtpEmail.sender = {
          name: "Daily Scoop AI",
          email: "newsletter@dailyscoopai.com",
        }
        sendSmtpEmail.to = [
          {
            email: subscriber.email,
            name: subscriber.firstName || subscriber.email.split("@")[0],
          },
        ]

        // Add replyTo address
        sendSmtpEmail.replyTo = {
          name: "Daily Scoop AI Support",
          email: "newsletter@dailyscoopai.com",
        }

        const result = await brevoClient.sendTransacEmail(sendSmtpEmail)
        console.log("Email sent successfully:", {
          to: subscriber.email,
          messageId: result.body.messageId,
        })

        await prisma.newsletter_subscriber.update({
          where: { id: subscriber.id },
          data: { lastEmailSent: new Date() },
        })

        emailsSent.push({
          email: subscriber.email,
          response: result.response.statusCode,
          messageId: result.body.messageId,
        })
      } catch (error) {
        console.error("Error sending to", subscriber.email, ":", error)
        emailErrors.push({
          email: subscriber.email,
          error: error instanceof Error ? error.message : "Unknown error",
          details: error,
        })
      }
    }

    return NextResponse.json({
      message: "Newsletter process completed",
      stats: {
        totalSubscribers: subscribers.length,
        successfulSends: emailsSent.length,
        failedSends: emailErrors.length,
      },
      newsletter: {
        issue,
        article: {
          title: article.title,
          subject: subjectWithIssue,
          previewText,
        },
      },
      successfulSends: emailsSent,
      errors: emailErrors,
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json(
      {
        message: "Error sending newsletter",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // Reuse the same logic as POST
  return POST(request)
}
