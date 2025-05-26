"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, MessageCircle, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Post, PostListResponse } from "@/post_api_types"

export default function QnABoard() {
  const [questions, setQuestions] = useState<Post[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    async function fetchPosts() {
      try {
        const tagParams = selectedTags.map((tag) => `keywords=${encodeURIComponent(tag)}`).join("&")
        const queryParam = searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ""
        const res = await fetch(`${baseUrl || "http://localhost:8080"}/api/post/list?page=${currentPage}&size=10${tagParams ? `&${tagParams}` : ""}${queryParam}&postStatus=ALL`)
        if (!res.ok) throw new Error("Failed to fetch posts")
        const data: PostListResponse = await res.json()
        setQuestions(data.data.posts)
        setTotalPage(data.data.totalPage)
      } catch (err) {
        console.error("Failed to fetch posts from backend:", err)
      }
    }

    fetchPosts()
  }, [currentPage, searchQuery, selectedTags])

  const allTags = Array.from(new Set(questions.flatMap((question) => question.keywords))).sort()

  const filterQuestionsByTags = (questionsToFilter: Post[]) => {
    if (selectedTags.length === 0) return questionsToFilter
    return questionsToFilter.filter((question) => selectedTags.some((tag) => question.keywords.includes(tag)))
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">질문게시판</h1>
          <p className="text-muted-foreground mt-1">척추측만증에 관한 질문을 남겨주시면 전문의가 답변해 드립니다.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px] flex">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                className="w-full pl-8 border border-gray-200 focus:border-black focus:ring-0"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput)
                    setCurrentPage(1)
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => {
                setSearchQuery(searchInput)
                setCurrentPage(1)
              }}
            >
              검색
            </Button>
          </div>
          <Button className="bg-black text-white">
            <Link href="/questions/new">질문하기</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-2">태그로 필터링</h2>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer ${selectedTags.includes(tag) ? "" : "hover:bg-secondary"}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearTags} className="h-6 px-2 text-xs flex items-center">
              <X className="h-3 w-3 mr-1" />
              필터 초기화
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 bg-gray-100 rounded-lg p-1 flex gap-0 w-fit">
          <TabsTrigger
            value="all"
            className="tab-trigger rounded-md transition-colors px-3 py-1.5 focus:z-10 relative"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            전체
          </TabsTrigger>
          <TabsTrigger
            value="answered"
            className="tab-trigger rounded-md transition-colors px-3 py-1.5 focus:z-10 relative"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            답변 완료
          </TabsTrigger>
          <TabsTrigger
            value="ai-answered"
            className="tab-trigger rounded-md transition-colors px-3 py-1.5 focus:z-10 relative"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            AI 자동 답변 완료
          </TabsTrigger>
          <TabsTrigger
            value="unanswered"
            className="tab-trigger rounded-md transition-colors px-3 py-1.5 focus:z-10 relative"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            미답변
          </TabsTrigger>
        </TabsList>

        {renderTabContent("all", questions)}
        {renderTabContent("answered", questions.filter((q) => q.status === "DOCTOR_COMMENTED"))}
        {renderTabContent("ai-answered", questions.filter((q) => q.status === "AI_COMMENTED"))}
        {renderTabContent("unanswered", questions.filter((q) => q.status === "NORMAL"))}
      </Tabs>

      <div className="flex justify-center mt-8">
        <nav aria-label="Pagination" className="flex justify-center items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            ≪
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </Button>

          {(() => {
            const pageGroupSize = 10
            const groupStart = Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1
            const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPage)
            const buttons = []
            for (let pageNumber = groupStart; pageNumber <= groupEnd; pageNumber++) {
              buttons.push(
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${pageNumber === currentPage ? "bg-black text-white" : ""}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            }
            return buttons
          })()}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((prev) => Math.min(totalPage, prev + 1))}
            disabled={currentPage === totalPage}
          >
            ›
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(totalPage)}
            disabled={currentPage === totalPage}
          >
            ≫
          </Button>
        </nav>
      </div>
    </div>
  )

  function renderTabContent(value: string, data: Post[]) {
    const filtered = filterQuestionsByTags(data)
    return (
      <TabsContent value={value} className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((question) => <QuestionCard key={question.postId} question={question} />)
        ) : (
          <p className="text-center text-muted-foreground py-8">선택한 태그에 해당하는 질문이 없습니다.</p>
        )}
      </TabsContent>
    )
  }
}

function QuestionCard({ question }: { question: Post }) {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link
              href={{
                pathname: `/questions/${question.postId}`,
                query: { visibility: question.visibility },
              }}
              className="hover:underline"
            >
              {question.title}
            </Link>
          </CardTitle>
          {question.status === "DOCTOR_COMMENTED" ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-0 rounded-full px-3 py-1">답변완료</Badge>
          ) : question.status === "AI_COMMENTED" ? (
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-full px-3 py-1">AI 답변</Badge>
          ) : (
            <Badge variant="outline" className="border-gray-300 text-gray-500 rounded-full px-3 py-1">미답변</Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <span>{question.author}</span>
          <span>•</span>
          <span>{question.createdAt.slice(0, 10)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-2 text-muted-foreground">
          {question.content.length > 150 ? `${question.content.slice(0, 150)}...` : question.content}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {question.keywords.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4 mr-1" />
          {question.commentCount}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={{
              pathname: `/questions/${question.postId}`,
              query: { visibility: question.visibility },
            }}
            className="flex items-center"
          >
            자세히 보기
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}