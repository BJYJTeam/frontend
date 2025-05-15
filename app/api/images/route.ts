import { type NextRequest, NextResponse } from "next/server"
import { saveImage, getImage, deleteImage } from "@/lib/redis-service"

export async function POST(request: NextRequest) {
  try {
    const { questionId, imageData } = await request.json()

    if (!questionId || !imageData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const imageId = await saveImage(questionId, imageData)

    return NextResponse.json({ success: true, imageId })
  } catch (error) {
    console.error("Error saving image:", error)
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const questionId = url.searchParams.get("questionId")
    const imageId = url.searchParams.get("imageId")

    if (!questionId || !imageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const imageData = await getImage(Number(questionId), imageId)

    if (!imageData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, imageData })
  } catch (error) {
    console.error("Error retrieving image:", error)
    return NextResponse.json({ error: "Failed to retrieve image" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const questionId = url.searchParams.get("questionId")
    const imageId = url.searchParams.get("imageId")

    if (!questionId || !imageId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    await deleteImage(Number(questionId), imageId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
