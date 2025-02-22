import { clients } from "../clients"

export async function GET() {
  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController) {
      clients.add(controller)
      controller.enqueue(new TextEncoder().encode("data: connected\n\n"))
    },
    cancel(controller: ReadableStreamDefaultController) {
      clients.delete(controller)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
