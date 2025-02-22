import ErrorPage from "@/components/ErrorPage"

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      message="The page you're looking for has gone over the rainbow. Let's get you back home."
    />
  )
}
