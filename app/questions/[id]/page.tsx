"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, MessageCircle, User, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageAnnotator } from "@/components/image-annotator"
import type { Post } from "@/post_api_types"

export default function PostDetail({ params }: { params: { id: string } }) {

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const postId = Number.parseInt(params.id)
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`${baseUrl}/api/post/${params.id}`)
        if (!res.ok) throw new Error("Failed to fetch from API")
        const data = await res.json()
        if (data && data.postId) {
          setPost(data)
          return
        }
      } catch (err) {
        console.warn("Falling back to mock data due to error:", err)
      }

      // fallback
      const fallback = posts.find((p) => p.postId === params.id) || posts[0]
      setPost(fallback)
    }

    fetchPost()
  }, [params.id])

  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [answerType, setAnswerType] = useState("doctor")
  const [answerContent, setAnswerContent] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showImageAnnotator, setShowImageAnnotator] = useState(false)
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In a real application, this would be determined by authentication
  const isStaff = true // Simulating that the current user is staff
  // Answer button is only shown for staff 

  const handleImageChange = (imageData: string | null) => {
    setAnnotatedImage(imageData)
  }

  const handleAnswerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real application, you would send this data to your backend
      let imageId = null

      // If there's an annotated image, save it to Redis
      if (annotatedImage) {
        const response = await fetch("/api/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
            imageData: annotatedImage,
          }),
        })

        const data = await response.json()
        if (data.success) {
          imageId = data.imageId
        }
      }

      console.log("Answer submitted:", {
        postId,
        answerType,
        content: answerContent,
        isPublic,
        imageId,
      })

      // Reset form and hide it
      setAnswerContent("")
      setShowAnswerForm(false)
      setShowImageAnnotator(false)
      setAnnotatedImage(null)

      // Show success message or update UI
      alert("답변이 등록되었습니다.")
    } catch (error) {
      console.error("Error submitting answer:", error)
      alert("답변 등록에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {post ? (
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
              </Link>
            </Button>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{post.title}</h1>
              {post.status === "DOCTOR_COMMENTED" ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  답변완료
                </Badge>
              ) : post.status === "AI_COMMENTED" ? (
                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                  AI 답변
                </Badge>
              ) : (
                <Badge variant="outline">미답변</Badge>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.createdAt}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>댓글 {post.commentCount}개</span>
              </div>
            </div>

            {/* Display keywords */}
            <div className="flex flex-wrap gap-1 mt-3">
              {post.keywords?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="whitespace-pre-line">{post.content}</p>
            </CardContent>
          </Card>

          {/* Answer Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">답변</h2>
              {isStaff && !showAnswerForm && <Button onClick={() => setShowAnswerForm(true)}>답변 작성하기</Button>}
            </div>

            {/* Answer Form for Staff */}
            {isStaff && showAnswerForm && (
              <Card className="mb-6 border-2 border-primary/20">
                <CardHeader>
                  <h3 className="text-lg font-medium">답변 작성</h3>
                  <CardDescription>작성한 답변은 질문자와 모든 방문자에게 공개됩니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAnswerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>답변 유형</Label>
                      <RadioGroup
                        defaultValue="doctor"
                        value={answerType}
                        onValueChange={setAnswerType}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="doctor" id="doctor" />
                          <Label htmlFor="doctor">의료진 답변</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ai" id="ai" />
                          <Label htmlFor="ai">AI 자동 답변</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="answer-content">답변 내용</Label>
                      <Textarea
                        id="answer-content"
                        placeholder="답변 내용을 입력하세요"
                        className="min-h-[200px]"
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        required
                      />
                    </div>

                    {/* Image Annotator Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-image-annotator"
                          checked={showImageAnnotator}
                          onCheckedChange={setShowImageAnnotator}
                        />
                        <Label htmlFor="show-image-annotator" className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          이미지 첨부 및 주석
                        </Label>
                      </div>
                      {annotatedImage && (
                        <Badge variant="outline" className="bg-green-50">
                          이미지 첨부됨
                        </Badge>
                      )}
                    </div>

                    {/* Image Annotator */}
                    {showImageAnnotator && <ImageAnnotator onImageChange={handleImageChange} />}

                    <div className="flex items-center space-x-2">
                      <Switch id="public-answer" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="public-answer">공개 답변으로 등록</Label>
                    </div>
                    {/* CardFooter */}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" onClick={() => setShowAnswerForm(false)}>
                        취소
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "등록 중..." : "답변 등록"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Display Answers with Images */}
            {post.status === "DOCTOR_COMMENTED" || post.status === "AI_COMMENTED" ? (
              <Tabs defaultValue={post.status === "DOCTOR_COMMENTED" ? "doctor" : "ai"} className="w-full">
                <TabsList className="mb-4">
                  {post.status === "DOCTOR_COMMENTED" && <TabsTrigger value="doctor">의료진 답변</TabsTrigger>}
                  {post.status === "AI_COMMENTED" && <TabsTrigger value="ai">AI 자동 답변</TabsTrigger>}
                </TabsList>

                {post.status === "DOCTOR_COMMENTED" && (
                  <TabsContent value="doctor">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">김의사 원장</div>
                          <CardDescription>2023-04-16</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Example annotated image */}
                        {post.postId === "1" && (
                          <div className="border rounded-md overflow-hidden">
                            <Image
                              src="/placeholder.svg?height=400&width=600"
                              alt="척추측만증 X-ray 주석"
                              className="w-full max-h-[400px] object-contain"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-line">
                          안녕하세요, 질문 감사합니다. 14세 청소년의 25도 콥스 각도는 일반적으로 즉각적인 수술이 필요한
                          정도는 아닙니다. 보통 40-50도 이상일 때 수술을 고려하게 됩니다. 현재 상태에서는 보조기 착용이
                          적절한 치료 방법입니다. 보스턴 브레이스나 샤르노 보조기 등이 많이 사용되며, 하루 18-23시간 착용을
                          권장합니다. 위 X-ray 이미지에서 표시한 부분을 보시면 척추의 곡선이 정상 범위를 벗어나 있는 것을
                          확인할 수 있습니다. 빨간색 선으로 표시한 부분이 비정상적인 각도를 나타내고 있습니다. 운동 치료로는
                          슈로스 운동법이나 측만증에 특화된 물리치료가 효과적입니다. 수영(특히 배영)도 척추 주변 근육을 균형
                          있게 발달시키는 데 도움이 됩니다. 정기적인 X-ray 검사를 통해 진행 상황을 모니터링하는 것이
                          중요합니다. 6개월마다 검진을 받아보시길 권장합니다.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {post.status === "AI_COMMENTED" && (
                  <TabsContent value="ai">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">AI 어시스턴트</div>
                          <CardDescription>2023-04-02</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">
                          안녕하세요, 척추측만증 검사에 관해 문의해 주셔서 감사합니다. 척추측만증 검사는 주로 X-ray 촬영을
                          통해 이루어지며, 필요에 따라 MRI나 CT 검사가 추가될 수 있습니다. 기본 X-ray 검사 비용은 약 3-5만원
                          정도이며, 건강보험이 적용됩니다. 다만, 추가 검사가 필요한 경우 비용이 더 발생할 수 있습니다.
                          정확한 비용은 의료기관마다 차이가 있을 수 있으니, 방문 전 전화로 문의하시는 것이 좋습니다.
                          본원에서는 초진 상담 시 자세한 검사 계획과 비용에 대해 안내해 드리고 있습니다. 이 답변은 AI가
                          자동으로 생성한 것으로, 정확한 진단과 치료를 위해서는 전문의와의 상담을 권장합니다.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <p className="text-muted-foreground">아직 답변이 없습니다.</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">댓글</h2>
            {post.commentCount > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">박지영</div>
                      <CardDescription>2023-04-15</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>저도 비슷한 경험이 있어요. 보조기 착용이 처음에는 불편하지만 꾸준히 하니 효과가 있었습니다.</p>
                  </CardContent>
                </Card>
                {post.commentCount > 1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">이승훈</div>
                        <CardDescription>2023-04-16</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>슈로스 운동법 추천합니다. 저희 아이도 많은 도움이 되었어요.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">아직 댓글이 없습니다.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">댓글 작성</h2>
            <Card>
              <CardContent className="pt-6">
                <Textarea placeholder="댓글을 입력하세요" className="mb-4" />
                <div className="flex justify-end">
                  <Button>댓글 등록</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <p>로딩 중입니다...</p>
      )}
    </>
  )
}

const posts: Post[] = [
  {
    postId: "1",
    title: "청소년기 척추측만증 치료 방법에 대해 궁금합니다.",
    author: "김민지",
    content:
      "14세 자녀가 최근 척추측만증 진단을 받았습니다. 콥스 각도가 25도인데, 이 정도면 수술이 필요한지, 아니면 보조기 착용만으로도 충분한지 궁금합니다. 또한 운동 치료는 어떤 것이 효과적인가요?",
    commentCount: 2,
    keywords: ["청소년", "치료", "보조기", "운동"],
    status: "DOCTOR_COMMENTED",
    createdAt: "2023-04-15T12:00:00",
    updatedAt: "2023-04-15T12:00:00",
    visibility: "PUBLIC",
  },
  {
    postId: "2",
    title: "성인 척추측만증 통증 관리 방법",
    author: "이준호",
    content:
      "35세 성인입니다. 어릴 때부터 척추측만증이 있었으나 특별한 치료 없이 지내왔습니다. 최근 들어 요통이 심해졌는데, 척추측만증과 관련이 있을까요? 일상생활에서 통증을 줄이는 방법이 있을까요?",
    commentCount: 3,
    keywords: ["성인", "통증", "요통", "일상생활"],
    status: "DOCTOR_COMMENTED",
    createdAt: "2023-04-10T12:00:00",
    updatedAt: "2023-04-10T12:00:00",
    visibility: "PUBLIC",
  },
  {
    postId: "3",
    title: "척추측만증과 임신",
    author: "박소연",
    content:
      "척추측만증이 있는 30대 여성입니다. 임신을 계획 중인데, 척추측만증이 임신과 출산에 영향을 미칠지 걱정됩니다. 임신 중 특별히 주의해야 할 점이나 관리 방법이 있을까요?",
    commentCount: 0,
    keywords: ["임신", "여성", "관리"],
    status: "NORMAL",
    createdAt: "2023-04-05T12:00:00",
    updatedAt: "2023-04-05T12:00:00",
    visibility: "PUBLIC",
  },
  {
    postId: "4",
    title: "척추측만증 검사 비용 문의",
    author: "최동현",
    content:
      "척추측만증 검사를 받고 싶은데, 어떤 검사를 받아야 하는지, 그리고 대략적인 비용이 얼마인지 알고 싶습니다. 또한 건강보험 적용 여부도 궁금합니다.",
    commentCount: 1,
    keywords: ["검사", "비용", "건강보험"],
    status: "AI_COMMENTED",
    createdAt: "2023-04-01T12:00:00",
    updatedAt: "2023-04-01T12:00:00",
    visibility: "PUBLIC",
  },
  {
    postId: "5",
    title: "척추측만증과 스포츠 활동",
    author: "정하은",
    content:
      "16세 딸이 척추측만증 진단을 받았습니다. 현재 수영을 배우고 있는데, 계속해도 괜찮을까요? 척추측만증에 도움이 되는 스포츠와 피해야 할 스포츠가 있다면 알려주세요.",
    commentCount: 0,
    keywords: ["청소년", "스포츠", "수영", "운동"],
    status: "AI_COMMENTED",
    createdAt: "2023-03-28T12:00:00",
    updatedAt: "2023-03-28T12:00:00",
    visibility: "PUBLIC",
  },
]