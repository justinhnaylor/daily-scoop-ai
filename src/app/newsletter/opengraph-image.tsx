import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/jpeg"

export default async function Image() {
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
        <h1
          style={{
            fontSize: "64px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Daily Scoop AI Newsletter
        </h1>
        <p style={{ fontSize: "32px", textAlign: "center" }}>
          Stay Updated with AI-Powered News
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
