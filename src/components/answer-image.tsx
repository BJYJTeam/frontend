"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"

interface AnswerImageProps {
  questionId: number
  imageId: string
}

export function AnswerImage({ questionId, imageId }: AnswerImageProps) {
  const [imageData, setImageData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/images?questionId=${questionId}&imageId=${imageId}`)
        const data = await response.json()

        if (data.success) {
          setImageData(data.imageData)
        } else {
          setError(data.error || "이미지를 불러오는데 실패했습니다.")
        }
      } catch (err) {
        setError("이미지를 불러오는데 실패했습니다.")
        console.error("Error fetching image:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [questionId, imageId])

  const handleDownload = () => {
    if (!imageData) return

    const link = document.createElement("a")
    link.download = `annotated-image-${imageId}.png`
    link.href = imageData
    link.click()
  }

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  if (loading) {
    return <Skeleton className="w-full h-[300px]" />
  }

  if (error) {
    return <div className="text-red-500 p-4 border rounded-md">{error}</div>
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-md overflow-hidden bg-white">
        <div className="overflow-auto" style={{ maxHeight: "500px" }}>
          {imageData && (
            <Image
              src={imageData || "/placeholder.svg"}
              alt="의료진 주석 이미지"
              className="w-full h-auto transition-transform"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            />
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4 mr-1" />
            확대
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4 mr-1" />
            축소
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          다운로드
        </Button>
      </div>
    </div>
  )
}
