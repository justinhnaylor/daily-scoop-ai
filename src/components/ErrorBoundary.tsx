// Create a new component ErrorBoundary.tsx
"use client"
import { Component, ReactNode } from "react"
import ErrorPage from "@/components/ErrorPage"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code="500"
          message="Something went wrong on the client side. Please try refreshing the page."
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
