import { NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import crypto from "crypto"
import * as SibApiV3Sdk from "@getbrevo/brevo"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a new ratelimiter that allows 10 requests per hour per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
})

// Initialize Brevo client
const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi()
brevoClient.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
)

const UNSUBSCRIBE_TEMPLATE_ID = 4

function isAuthorized(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timestamp = searchParams.get("timestamp")
    const signature = searchParams.get("signature")
    const providedApiKey = searchParams.get("key")

    // Basic validation
    if (!timestamp || !signature || !providedApiKey) {
      console.log("Failed basic validation - missing parameters")
      return false
    }

    // API key check
    const apiKey = process.env.NEWSLETTER_API_KEY
    if (providedApiKey !== apiKey) {
      console.log("Failed API key validation")
      return false
    }

    // Timestamp validation (within 24 hours for unsubscribe links)
    const requestTime = parseInt(timestamp)
    const currentTime = Date.now()
    const timeDiff = Math.abs(currentTime - requestTime)
    if (timeDiff > 24 * 60 * 60 * 1000) {
      // 24 hours
      console.log("Failed time validation")
      return false
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.NEWSLETTER_SECRET_KEY!)
      .update(`${timestamp}:unsubscribe`)
      .digest("hex")

    if (signature !== expectedSignature) {
      console.log("Failed signature validation")
      return false
    }

    return true
  } catch (error) {
    console.error("Authorization error:", error)
    return false
  }
}

async function sendUnsubscribeEmail(email: string, firstName: string) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    sendSmtpEmail.templateId = UNSUBSCRIBE_TEMPLATE_ID
    sendSmtpEmail.params = {
      name: firstName || email.split("@")[0],
      email: email,
    }

    sendSmtpEmail.subject = "We're Sad to See You Go!"
    sendSmtpEmail.sender = {
      name: "Daily Scoop AI",
      email: "newsletter@dailyscoopai.com",
    }
    sendSmtpEmail.to = [
      {
        email: email,
        name: firstName || email.split("@")[0],
      },
    ]

    return await brevoClient.sendTransacEmail(sendSmtpEmail)
  } catch (error) {
    console.error("Error sending unsubscribe confirmation email:", error)
    throw error
  }
}

export async function GET(request: Request) {
  // Get IP for rate limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1"

  // Check rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      {
        message: "Too many requests",
        reset,
        remaining,
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

  if (!isAuthorized(request)) {
    console.warn("Unauthorized unsubscribe attempt", {
      ip,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    // Get the subscriber before updating to access their firstName
    const subscriber = await prisma.newsletter_subscriber.findUnique({
      where: { email },
    })

    // Update subscriber status
    await prisma.newsletter_subscriber.update({
      where: { email },
      data: { active: false },
    })

    // Send unsubscribe confirmation email
    if (subscriber) {
      await sendUnsubscribeEmail(email, subscriber.firstName || "")
    }

    return NextResponse.redirect(
      new URL(
        `/newsletter/unsubscribed?email=${encodeURIComponent(email)}`,
        process.env.NEXT_PUBLIC_BASE_URL!
      )
    )
  } catch (error) {
    console.error("Error unsubscribing:", error)
    return NextResponse.json(
      {
        message: "Error unsubscribing from newsletter",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
