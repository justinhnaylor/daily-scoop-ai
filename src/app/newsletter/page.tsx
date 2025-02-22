"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  frequency: z.enum(["daily", "weekly"], {
    required_error: "Please select an email frequency.",
  }),
})

export default function NewsletterPage() {
  const { md, sm } = useMediaQuery()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      email: "",
      frequency: "daily",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe")
      }

      toast({
        title: "Successfully subscribed! 🎉",
        description: `You'll receive the ${values.frequency} newsletter at ${values.email}`,
      })

      localStorage.setItem("newsletterToastDismissed", "true")
      router.push("/")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Subscription failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <h1
        className={cn(
          "font-bold mb-2 text-left whitespace-nowrap",
          md ? "text-3xl" : sm ? "text-2xl" : "text-lg text-center"
        )}
      >
        Daily Headlines Without the Extra Fluff
      </h1>
      <p
        className={cn(
          "mb-8 text-foreground/60",
          md ? "text-sm" : sm ? "text-xs text-left" : "text-[10px] text-center"
        )}
      >
        Our Newsletter Emails Are Like a Fine Wine...But Free and More Frequent.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 md:space-y-8"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(md ? "text-base" : sm ? "text-sm" : "text-xs")}
                >
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    {...field}
                    className={cn(
                      md ? "text-base" : sm ? "text-sm" : "text-xs",
                      "h-8 md:h-10"
                    )}
                  />
                </FormControl>
                <FormMessage className={cn(md ? "text-sm" : "text-xs")} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(md ? "text-base" : sm ? "text-sm" : "text-xs")}
                >
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="john@example.com"
                    type="email"
                    {...field}
                    className={cn(md ? "text-lg" : "text-base", "h-8 md:h-10")}
                  />
                </FormControl>
                <FormMessage className={cn(md ? "text-sm" : "text-xs")} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  className={cn(md ? "text-base" : sm ? "text-sm" : "text-xs")}
                >
                  Email Frequency
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        md ? "text-base" : sm ? "text-sm" : "text-xs",
                        "h-8 md:h-10"
                      )}
                    >
                      <SelectValue placeholder="Choose how frequently you'd like to receive our newsletter." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      value="daily"
                      className={cn(
                        md ? "text-base" : sm ? "text-sm" : "text-xs"
                      )}
                    >
                      Daily
                    </SelectItem>
                    <SelectItem
                      value="weekly"
                      className={cn(
                        md ? "text-base" : sm ? "text-sm" : "text-xs"
                      )}
                    >
                      Weekly
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className={cn(md ? "text-sm" : "text-xs")} />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              md ? "text-base" : sm ? "text-sm" : "text-xs",
              "h-8 md:h-10"
            )}
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
