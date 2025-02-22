export class FaviconManager {
  private static canvas: HTMLCanvasElement | null = null
  private static get originalFavicon(): string | null {
    return localStorage.getItem("originalFavicon")
  }
  private static set originalFavicon(value: string | null) {
    if (value) {
      localStorage.setItem("originalFavicon", value)
    }
  }
  private static get originalFaviconType(): string | null {
    return localStorage.getItem("originalFaviconType")
  }
  private static set originalFaviconType(value: string | null) {
    if (value) {
      localStorage.setItem("originalFaviconType", value)
    }
  }

  private static getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas")
      this.canvas.width = 32
      this.canvas.height = 32
    }
    return this.canvas
  }

  static addNotificationDot() {
    if (typeof document === "undefined") return

    if (!this.originalFavicon) {
      const pngFavicon = document.querySelector(
        'link[rel="icon"][type="image/png"]'
      )
      const svgFavicon = document.querySelector(
        'link[rel="icon"][type="image/svg+xml"]'
      )
      const favicon =
        pngFavicon || svgFavicon || document.querySelector('link[rel="icon"]')

      if (favicon) {
        this.originalFavicon = favicon.getAttribute("href") || "/favicon.ico"
        this.originalFaviconType =
          favicon.getAttribute("type") || "image/x-icon"
      } else {
        this.originalFavicon = "/web-app-manifest-96x96.png"
        this.originalFaviconType = "image/png"
      }
    }

    const canvas = this.getCanvas()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, 32, 32)
      ctx.drawImage(img, 0, 0, 32, 32)
      ctx.beginPath()
      ctx.arc(24, 8, 8, 0, 2 * Math.PI)
      ctx.fillStyle = "#FF0000"
      ctx.fill()

      const newLink = document.createElement("link")
      newLink.setAttribute("rel", "icon")
      newLink.setAttribute("type", "image/png")
      newLink.setAttribute("href", canvas.toDataURL("image/png"))

      document
        .querySelectorAll('link[rel="icon"]')
        .forEach((link) => link.remove())
      document.head.appendChild(newLink)
    }

    img.src = this.originalFavicon!
  }

  static removeNotificationDot() {
    if (typeof document === "undefined" || !this.originalFavicon) return

    document
      .querySelectorAll('link[rel="icon"]')
      .forEach((link) => link.remove())

    const newLink = document.createElement("link")
    newLink.setAttribute("rel", "icon")
    newLink.setAttribute("type", this.originalFaviconType || "image/png")
    newLink.setAttribute("href", this.originalFavicon)
    document.head.appendChild(newLink)
  }
}
