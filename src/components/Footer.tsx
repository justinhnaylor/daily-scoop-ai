import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-4">About Us</h3>
            <p className="text-foreground/70">
              Daily Scoop AI delivers AI-powered news and analysis, keeping you
              informed with the latest stories across various topics.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/newsletter"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Connect With Us</h3>
            <p className="text-foreground/70">
              Sign up for our newsletter to receive daily news updates and
              analysis.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-foreground/70">
          <p>
            &copy; {new Date().getFullYear()} Daily Scoop AI. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
