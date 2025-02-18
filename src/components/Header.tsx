import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/daily-scoop-thumb-light.webp"
            alt="Daily Scoop AI Logo"
            width={70}
            height={70}
          />
          <div className="flex flex-col text-foreground/70">
            <span className="text-lg font-medium">
              Breaking News Without Bias
            </span>
            <span className="text-[10px] font-medium">Powered By AI</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/newsletter"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Newsletter
          </Link>
        </nav>
      </div>
    </header>
  )
}
