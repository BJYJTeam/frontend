"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function NewQuestion() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const [formData, setFormData] = useState<{
    title: string
    content: string
    author: string
    password: string
    isPrivate: boolean
    // tags: string[]
  }>({
    title: "",
    content: "",
    author: "",
    password: "",
    isPrivate: false,
    // tags: [],
  })
  // const [tagInput, setTagInput] = useState("")

  

  // Common tags for suggestions
  const commonTags = ["청소년", "성인", "치료", "운동", "통증", "검사", "수술", "보조기", "임신", "스포츠"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPrivate: checked }))
  }

  // const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setTagInput(e.target.value)
  // }

  // const addTag = (tag: string) => {
  //   if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
  //     setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
  //     setTagInput("")
  //   }
  // }

  // const removeTag = (tagToRemove: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     tags: prev.tags.filter((tag) => tag !== tagToRemove),
  //   }))
  // }

  // const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   if (e.key === "Enter" || e.key === ",") {
  //     e.preventDefault()
  //     addTag(tagInput.trim())
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch(`${baseUrl}/api/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          author: formData.author,
          password: formData.password,
          visibility: formData.isPrivate ? "PRIVATE" : "PUBLIC",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Post created:", result)
        window.location.href = "/"
      } else {
        const errorResult = await response.json()
        console.error("Failed to create post:", errorResult)
        console.error("Failed to create post")
        alert("질문 등록에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("질문 등록에 실패했습니다.")
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>질문 작성하기</CardTitle>
          <CardDescription>척추측만증에 관한 질문을 남겨주시면 전문의가 답변해 드립니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                placeholder="질문 제목을 입력하세요"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="질문 내용을 자세히 입력해주세요"
                className="min-h-[200px]"
                value={formData.content}
                onChange={handleChange}
                required
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="tags">태그 (최대 5개)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tagInput"
                  placeholder="태그를 입력하고 Enter 키를 누르세요"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={formData.tags.length >= 5}
                />
                <Button
                  type="button"
                  onClick={() => addTag(tagInput.trim())}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                >
                  추가
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                추천 태그:
                <div className="flex flex-wrap gap-1 mt-1">
                  {commonTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">작성자</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="이름을 입력하세요"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="게시글 수정/삭제용 비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isPrivate" checked={formData.isPrivate} onCheckedChange={handleCheckboxChange} />
              <Label
                htmlFor="isPrivate"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                비공개 질문으로 작성하기
              </Label>
            </div>
            <div className="flex justify-end">
              <Button type="submit">질문 등록하기</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
