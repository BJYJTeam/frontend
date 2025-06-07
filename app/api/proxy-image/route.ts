import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 })
  }

  console.log("Proxying image:", url)

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Add headers that might help with CORS
        Accept: "image/*",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status}`)
      return NextResponse.json({ error: `Failed to fetch image: ${response.status}` }, { status: response.status })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get("Content-Type") || "image/jpeg"

    console.log(`Successfully proxied image (${buffer.byteLength} bytes, ${contentType})`)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        // Add CORS headers to ensure the image can be used in canvas
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("Proxy image error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
