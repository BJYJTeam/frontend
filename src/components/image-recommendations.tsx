"use client"

import { useState, useEffect } from "react"
import type { APIImageResult } from "@/lib/image-database"
import { getImageType, getImageUrl, getDisplayTitle } from "@/lib/image-database"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageIcon, FileText, Activity, Camera, AlertCircle } from "lucide-react"

interface ImageRecommendationsProps {
  questionContent: string
  onSelectImage: (imageUrl: string) => void
}

export function ImageRecommendations({ questionContent, onSelectImage }: ImageRecommendationsProps) {
  const [selectedTab, setSelectedTab] = useState<string>("all")
  const [recommendedImages, setRecommendedImages] = useState<APIImageResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch recommendations when component mounts or question content changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!questionContent.trim()) {
        setRecommendedImages([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Import the function dynamically to avoid SSR issues
        const { recommendImagesFromAPI } = await import("@/lib/image-database")
        const images = await recommendImagesFromAPI(questionContent)
        setRecommendedImages(images)
      } catch (err) {
        console.error("Error fetching image recommendations:", err)
        setError("이미지 추천을 불러오는데 실패했습니다.")
        setRecommendedImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [questionContent])

  // Group images by type
  const imagesByType = recommendedImages.reduce(
    (acc, image) => {
      const type = getImageType(image.filename, image.description)
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(image)
      return acc
    },
    { xray: [], diagram: [], illustration: [], photo: [] } as Record<string, APIImageResult[]>,
  )

  // Filter images based on selected tab
  const filteredImages =
    selectedTab === "all"
      ? recommendedImages
      : recommendedImages.filter((img) => getImageType(img.filename, img.description) === selectedTab)

  // Get counts for each type
  const counts = {
    all: recommendedImages.length,
    xray: imagesByType.xray.length,
    diagram: imagesByType.diagram.length,
    illustration: imagesByType.illustration.length,
    photo: imagesByType.photo.length,
  }

  // Icon mapping for image types
  const typeIcons = {
    xray: <Activity className="h-4 w-4" />,
    diagram: <FileText className="h-4 w-4" />,
    illustration: <ImageIcon className="h-4 w-4" />,
    photo: <Camera className="h-4 w-4" />,
  }

  if (loading) {
    return (
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-lg font-medium">추천 이미지</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-lg font-medium">추천 이미지</h3>
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">추천 이미지</h3>
        {recommendedImages.length > 0 && (
          <span className="text-sm text-muted-foreground">{recommendedImages.length}개의 이미지 추천</span>
        )}
      </div>

      {recommendedImages.length > 0 ? (
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">전체 ({counts.all})</TabsTrigger>
            {counts.xray > 0 && (
              <TabsTrigger value="xray">
                <Activity className="h-4 w-4 mr-1" />
                X-ray ({counts.xray})
              </TabsTrigger>
            )}
            {counts.diagram > 0 && (
              <TabsTrigger value="diagram">
                <FileText className="h-4 w-4 mr-1" />
                다이어그램 ({counts.diagram})
              </TabsTrigger>
            )}
            {counts.illustration > 0 && (
              <TabsTrigger value="illustration">
                <ImageIcon className="h-4 w-4 mr-1" />
                일러스트 ({counts.illustration})
              </TabsTrigger>
            )}
            {counts.photo > 0 && (
              <TabsTrigger value="photo">
                <Camera className="h-4 w-4 mr-1" />
                사진 ({counts.photo})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={selectedTab} className="m-0">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-4">
                {filteredImages.map((image, index) => {
                  const imageType = getImageType(image.filename, image.description)
                  const imageUrl = getImageUrl(image.filename)
                  const displayTitle = getDisplayTitle(image.filename)

                  return (
                    <div key={`${image.filename}-${index}`} className="border rounded-md overflow-hidden flex flex-col">
                      <div className="relative aspect-square">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={displayTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.src = "/placeholder.svg?height=200&width=200&text=이미지+로딩+실패"
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-background/80 rounded-md px-1.5 py-0.5 text-xs font-medium flex items-center">
                          {typeIcons[imageType]}
                        </div>
                      </div>
                      <div className="p-2 space-y-1 flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{displayTitle}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{image.description}</p>
                        {image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {image.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={`${tag}-${tagIndex}`}
                                className="inline-block bg-secondary text-secondary-foreground text-xs px-1 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {image.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{image.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-2 pt-0">
                        <Button variant="outline" size="sm" className="w-full" type="button" onClick={() => onSelectImage(imageUrl)}>
                          이미지 사용
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
            <p>질문 내용에 맞는 추천 이미지가 없습니다.</p>
            <p className="text-xs mt-1">질문을 더 자세히 작성해보세요.</p>
          </div>
        </div>
      )}
    </div>
  )
}
