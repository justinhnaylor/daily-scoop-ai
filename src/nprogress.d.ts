declare module "nprogress" {
  export function start(): void
  export function done(): void
  export function configure(options: NProgressOptions): void

  interface NProgressOptions {
    minimum?: number
    template?: string
    easing?: string
    speed?: number
    trickle?: boolean
    trickleSpeed?: number
    showSpinner?: boolean
    parent?: string
  }
}
