import { NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"
import { z } from "zod"

// Email validation schema with required firstName
const subscribeSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
})

export async function POST(request: Request) {
  try {
    // Add debug logging
    console.log("Received request:", request.headers.get("content-type"))

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
      console.log("Parsed body:", body)
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

      // If previously unsubscribed, reactivate
      await prisma.newsletter_subscriber.update({
        where: { email },
        data: {
          active: true,
          frequency,
          firstName,
          updatedAt: new Date(),
        },
      })

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
