import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Daily Scoop AI - Our Content Policy",
  description:
    "Learn about Daily Scoop AI's commitment to delivering unbiased, AI-powered news and our content policies.",
  openGraph: {
    title: "About Daily Scoop AI - Our Content Policy",
    description:
      "Learn about Daily Scoop AI's commitment to delivering unbiased, AI-powered news and our content policies.",
    type: "website",
  },
}

export default function AboutPage() {
  return (
    <main className="max-w-4xl text-foreground mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Daily Scoop AI</h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className=" text-foreground ">Our Mission</h2>
          <p className="text-foreground/60">
            Daily Scoop AI is committed to delivering accurate, unbiased news
            powered by artificial intelligence. We believe in transparent
            journalism that serves the public interest while embracing
            innovative technology.
          </p>
        </section>

        <section className="mb-8">
          <h2 className=" text-foreground ">AI Content Disclosure</h2>
          <p className="text-sm text-foreground/60">
            Last Updated: February 2024
          </p>

          <p className="text-foreground/60">
            At Daily Scoop AI, transparency is a priority. All content on this
            website, including articles, images, and audio, is generated using
            artificial intelligence (AI). Below is an overview of how our
            AI-generated content is created, reviewed, and how you can engage
            with it responsibly.
          </p>

          <h3 className="text-foreground">1. AI-Generated Content</h3>
          <p className="text-foreground/60">
            We utilize AI tools to generate the following:
          </p>
          <ul className="text-foreground/60">
            <li>
              <strong className="text-foreground">
                Articles & News Reports:
              </strong>{" "}
              AI processes publicly available data and sources to generate
              articles. While we strive for factual accuracy, occasional errors
              may occur.
            </li>
            <li>
              <strong className="text-foreground">Images:</strong> All images on
              this site are AI-generated and are not real-world photographs.
            </li>
            <li>
              <strong className="text-foreground">Audio Content:</strong>{" "}
              AI-generated voices are used for narrations or summaries.
            </li>
          </ul>

          <h3 className="text-foreground">2. Accuracy & Fact-Checking</h3>
          <p className="text-foreground/60">
            We aim to provide accurate, reliable content. However, AI can
            sometimes misinterpret data or generate misleading information.
            While our system strives for factual accuracy, users should verify
            information from official or primary sources when necessary.
          </p>

          <h3 className="text-foreground">3. User Responsibility</h3>
          <ul className="text-foreground/60">
            <li>
              Use our content as a starting point for research, but cross-check
              with other sources.
            </li>
            <li>
              Report inaccuracies or misleading information to{" "}
              <a
                className="text-foreground underline"
                href="mailto:editorial@dailyscoopai.com"
              >
                editorial@dailyscoopai.com
              </a>
            </li>
            <li>
              Be aware that AI-generated images do not depict real events or
              individuals unless explicitly stated.
            </li>
          </ul>

          <h3 className="text-foreground">4. Ethical Use & AI Limitations</h3>
          <p className="text-foreground/60">
            AI-generated content is designed to inform and engage, not to
            deceive. We do not use AI to spread misinformation, create
            deepfakes, or manipulate facts. If any content is found to violate
            these principles, it will be corrected or removed promptly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className=" text-foreground ">Content Policy</h2>
          <h3 className="text-foreground">1. Editorial Standards</h3>
          <ul className="text-foreground/60">
            <li>All content is AI-generated and human-reviewed for accuracy</li>
            <li>
              Articles are based on verified sources and factual information
            </li>
            <li>Clear separation between news reporting and opinion content</li>
            <li>Commitment to balanced coverage of controversial topics</li>
          </ul>

          <h3 className="text-foreground">2. Accuracy and Corrections</h3>
          <ul className="text-foreground/60">
            <li>Prompt correction of any identified errors</li>
            <li>Regular review and updating of published content</li>
          </ul>

          <h3 className="text-foreground">3. AI Ethics</h3>
          <ul className="text-foreground/60">
            <li>Transparent disclosure of AI-generated content</li>
            <li>Regular auditing of AI systems for bias</li>
            <li>Human oversight of AI-generated content</li>
            <li>Commitment to responsible AI development</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className=" text-foreground ">Contact Us</h2>
          <p className="text-foreground/60">
            For questions about our content policy, to report concerns, or
            provide feedback about our AI-generated content, please contact our
            editorial team at{" "}
            <a
              className="text-foreground underline"
              href="mailto:editorial@dailyscoopai.com"
            >
              editorial@dailyscoopai.com
            </a>
            .
          </p>
          <p className="text-foreground/60">
            By using this website, you acknowledge and understand that all
            content is AI-generated and should be interpreted with reasonable
            discretion.
          </p>
        </section>
      </div>
    </main>
  )
}
