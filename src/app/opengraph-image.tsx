import { ImageResponse } from "next/og"
import { join } from "node:path"
import { readFile } from "node:fs/promises"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/jpeg"

export default async function Image() {
  const imageData = await readFile(join(process.cwd(), "public/og-image.jpg"))
  const imageSrc = Buffer.from(imageData).toString("base64")

  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <img
          src={`data:image/jpeg;base64,${imageSrc}`}
          alt="Daily Scoop AI"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
