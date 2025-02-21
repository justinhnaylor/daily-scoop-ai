import { NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import crypto from "crypto"

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

    await prisma.newsletter_subscriber.update({
      where: { email },
      data: { active: false },
    })

    // Return a proper HTML response instead of JSON
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribe Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
              text-align: center;
            }
            .success-message {
              color: #28a745;
              margin-bottom: 20px;
            }
            .email {
              color: #666;
              margin-bottom: 30px;
            }
          </style>
        </head>
        <body>
          <h1 class="success-message">Successfully Unsubscribed</h1>
          <p class="email">Email: ${email}</p>
          <p>You have been successfully unsubscribed from our newsletter.</p>
          <p>If this was a mistake, you can always subscribe again from our website.</p>
        </body>
      </html>
    `

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
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
