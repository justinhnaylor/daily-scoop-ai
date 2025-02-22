import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { TypographyP, TypographyH1 } from "@/components/ui/typography"

export const metadata: Metadata = {
  title: "Unsubscribed - Daily Scoop AI",
  description: "You have been successfully unsubscribed from our newsletter.",
}

type Props = {
  params: Promise<{ email: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UnsubscribedPage({ params }: Props) {
  const { email } = await params

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <TypographyH1 className="text-green-600 mb-6">
        Successfully Unsubscribed
      </TypographyH1>

      <Card>
        <CardContent className="p-8">
          <TypographyP className="text-gray-600 mb-6">
            Email: <span className="font-medium">{email}</span>
          </TypographyP>

          <TypographyP className="text-gray-700 mb-4">
            You have been successfully unsubscribed from our newsletter.
          </TypographyP>

          <TypographyP className="text-gray-700">
            If this was a mistake, you can always{" "}
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              subscribe again
            </Link>{" "}
            from our website.
          </TypographyP>
        </CardContent>
      </Card>
    </div>
  )
}
