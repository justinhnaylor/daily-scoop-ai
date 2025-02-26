import { NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"
import { z } from "zod"
import * as SibApiV3Sdk from "@getbrevo/brevo"
import crypto from "crypto"

// Email validation schema with required firstName
const subscribeSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
})

// Initialize Brevo client
const brevoClient = new SibApiV3Sdk.TransactionalEmailsApi()
brevoClient.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
)

// Update template ID to match your template
const WELCOME_TEMPLATE_ID = 3

function validateTemplateId(templateId: number): boolean {
  const validTemplateIds = [3] // Add all your valid template IDs here
  return validTemplateIds.includes(templateId)
}

// Update function to include unsubscribe URL
async function sendWelcomeEmail(
  email: string,
  firstName: string,
  frequency: string
) {
  try {
    if (!validateTemplateId(WELCOME_TEMPLATE_ID)) {
      throw new Error(`Invalid template ID: ${WELCOME_TEMPLATE_ID}`)
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    // Generate unsubscribe URL
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

    const unsubscribeUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/newsletter/unsubscribe?${params.toString()}`

    sendSmtpEmail.templateId = WELCOME_TEMPLATE_ID
    sendSmtpEmail.params = {
      name: firstName,
      frequency: frequency === "daily" ? "day" : "week",
      email: email,
      unsubscribeUrl: unsubscribeUrl,
    }

    sendSmtpEmail.subject = "Who Told You You Could be so Smart? - Welcome!"
    sendSmtpEmail.sender = {
      name: "Daily Scoop AI",
      email: "newsletter@dailyscoopai.com",
    }
    sendSmtpEmail.to = [
      {
        email: email,
        name: firstName,
      },
    ]

    const result = await brevoClient.sendTransacEmail(sendSmtpEmail)
    return result
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    // Ensure we're getting JSON content
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { message: "Content-Type must be application/json" },
        { status: 400 }
      )
    }

    // Parse the request body and add error handling
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("Error parsing JSON:", e)
      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400 }
      )
    }

    // Validate input
    const validatedData = subscribeSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: validatedData.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, firstName, frequency } = validatedData.data

    // Check if email domain is valid (has MX record)
    const [domain] = email.split("@")[1].split(".")
    const invalidDomains = ["temp", "disposable", "throwaway"]
    if (invalidDomains.includes(domain.toLowerCase())) {
      return NextResponse.json(
        { message: "Please use a valid email address" },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existingSubscriber = await prisma.newsletter_subscriber.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      // If already subscribed and active, return error
      if (existingSubscriber.active) {
        return NextResponse.json(
          { message: "Email already subscribed" },
          { status: 400 }
        )
      }

      // If previously unsubscribed, reactivate and send welcome email
      await prisma.newsletter_subscriber.update({
        where: { email },
        data: {
          active: true,
          frequency,
          firstName,
          updatedAt: new Date(),
        },
      })

      // Send welcome email
      await sendWelcomeEmail(email, firstName, frequency)

      return NextResponse.json({
        message: "Successfully resubscribed to newsletter",
        frequency,
      })
    }

    // Create new subscriber
    await prisma.newsletter_subscriber.create({
      data: {
        email,
        firstName,
        frequency,
        active: true,
      },
    })

    // Send welcome email
    await sendWelcomeEmail(email, firstName, frequency)

    return NextResponse.json({
      message: "Successfully subscribed to newsletter",
      frequency,
    })
  } catch (error) {
    console.error("Error in subscribe endpoint:", error)
    return NextResponse.json(
      {
        message: "Error processing subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Optional: Add a GET endpoint to check subscription status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { message: "Email parameter is required" },
        { status: 400 }
      )
    }

    const subscriber = await prisma.newsletter_subscriber.findUnique({
      where: { email },
      select: {
        active: true,
        frequency: true,
        createdAt: true,
      },
    })

    if (!subscriber) {
      return NextResponse.json({ subscribed: false })
    }

    return NextResponse.json({
      subscribed: subscriber.active,
      frequency: subscriber.frequency,
      since: subscriber.createdAt,
    })
  } catch (error) {
    console.error("Error checking subscription status:", error)
    return NextResponse.json(
      { message: "Error checking subscription status" },
      { status: 500 }
    )
  }
}
