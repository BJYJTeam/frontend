"use client"

import { useState, useEffect } from "react"
import type { Post, DoctorPostListResponse, DoctorPostStatusCountResponse } from "@/post_api_types"
import Link from "next/link"
import { Calendar, MessageCircle, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const [sortBy, setSortBy] = useState("newest")
  const [totalCount, setTotalCount] = useState(0)
  const [commentedCount, setCommentedCount] = useState(0)
  const [unCommentCount, setUnCommentCount] = useState(0)
  // Pagination state for 전체 질문
  const [allPage, setAllPage] = useState(1)
  const [allTotalPage, setAllTotalPage] = useState(1)
  const [allQuestions, setAllQuestions] = useState<Post[]>([])
  // Pagination state for 답변 완료
  const [answeredPage, setAnsweredPage] = useState(1)
  const [answeredTotalPage, setAnsweredTotalPage] = useState(1)
  const [answeredQuestions, setAnsweredQuestions] = useState<Post[]>([])
  // Pagination state for AI 답변
  const [aiPage, setAiPage] = useState(1)
  const [aiTotalPage, setAiTotalPage] = useState(1)
  const [aiQuestions, setAiQuestions] = useState<Post[]>([])
  // Pagination state for 미답변 질문
  const [unansweredPage, setUnansweredPage] = useState(1)
  const [unansweredTotalPage, setUnansweredTotalPage] = useState(1)
  const [unansweredPaginatedQuestions, setUnansweredPaginatedQuestions] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentTab, setCurrentTab] = useState("unanswered")

  // Fetch paginated questions for 전체 질문
  useEffect(() => {
    if (currentTab !== "all") return
    async function fetchAllQuestions() {
      try {
        const queryParam = searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ""
        const res = await fetch(
          `${baseUrl || "http://localhost:8080"}/api/doctor/post/list?page=${allPage}&size=10&postStatus=ALL${queryParam}`
        )
        if (!res.ok) throw new Error("Failed to fetch posts")
        const data: DoctorPostListResponse = await res.json()
        setAllQuestions(
          data.data.posts.map(post => ({
            ...post,
            keywords: [...new Set(post.keywords ?? [])]
          }))
        )
        setAllTotalPage(data.data.totalPage || 1)
      } catch (err) {
        console.error("Failed to fetch questions:", err)
      }
    }
    fetchAllQuestions()
  }, [allPage, baseUrl, searchQuery, currentTab])

  // Fetch paginated answered questions
  useEffect(() => {
    if (currentTab !== "answered") return
    async function fetchAnsweredQuestions() {
      try {
        const queryParam = searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ""
        const res = await fetch(
          `${baseUrl || "http://localhost:8080"}/api/doctor/post/list?page=${answeredPage}&size=10&postStatus=DOCTOR_COMMENTED${queryParam}`
        )
        if (!res.ok) throw new Error("Failed to fetch answered posts")
        const data: DoctorPostListResponse = await res.json()
        setAnsweredQuestions(
          data.data.posts.map(post => ({
            ...post,
            keywords: [...new Set(post.keywords ?? [])]
          }))
        )
        setAnsweredTotalPage(data.data.totalPage || 1)
      } catch (err) {
        console.error("Failed to fetch answered questions:", err)
      }
    }
    fetchAnsweredQuestions()
  }, [answeredPage, baseUrl, searchQuery, currentTab])

  // Fetch paginated AI answered questions
  useEffect(() => {
    if (currentTab !== "ai-answered") return
    async function fetchAiQuestions() {
      try {
        const queryParam = searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ""
        const res = await fetch(
          `${baseUrl || "http://localhost:8080"}/api/doctor/post/list?page=${aiPage}&size=10&postStatus=AI_COMMENTED${queryParam}`
        )
        if (!res.ok) throw new Error("Failed to fetch AI answered posts")
        const data: DoctorPostListResponse = await res.json()
        setAiQuestions(
          data.data.posts.map(post => ({
            ...post,
            keywords: [...new Set(post.keywords ?? [])]
          }))
        )
        setAiTotalPage(data.data.totalPage || 1)
      } catch (err) {
        console.error("Failed to fetch AI answered questions:", err)
      }
    }
    fetchAiQuestions()
  }, [aiPage, baseUrl, searchQuery, currentTab])

  // Fetch paginated unanswered questions
  useEffect(() => {
    if (currentTab !== "unanswered") return
    async function fetchUnansweredQuestions() {
      try {
        const queryParam = searchQuery ? `&searchQuery=${encodeURIComponent(searchQuery)}` : ""
        const res = await fetch(
          `${baseUrl || "http://localhost:8080"}/api/doctor/post/list?page=${unansweredPage}&size=10&postStatus=NORMAL${queryParam}`
        )
        if (!res.ok) throw new Error("Failed to fetch unanswered posts")
        const data: DoctorPostListResponse = await res.json()
        setUnansweredPaginatedQuestions(
          data.data.posts.map(post => ({
            ...post,
            keywords: [...new Set(post.keywords ?? [])]
          }))
        )
        setUnansweredTotalPage(data.data.totalPage || 1)
      } catch (err) {
        console.error("Failed to fetch unanswered questions:", err)
      }
    }
    fetchUnansweredQuestions()
  }, [unansweredPage, baseUrl, searchQuery, currentTab])


  // Fetch post status counts
  useEffect(() => {
    async function fetchStatusCounts() {
      try {
        const res = await fetch(`${baseUrl || "http://localhost:8080"}/api/doctor/post/count/status`)
        if (!res.ok) throw new Error("Failed to fetch post status count")
        const data: DoctorPostStatusCountResponse = await res.json()
        setTotalCount(data.data.totalCount)
        setCommentedCount(data.data.commentedCount)
        setUnCommentCount(data.data.unCommentCount)
      } catch (err) {
        console.error("Failed to fetch post status count:", err)
      }
    }
    fetchStatusCounts()
  }, [])


  // Sort allQuestions for pagination tab
  const sortedAllQuestions = [...allQuestions].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return 0
  })

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-1">질문 관리 및 답변 작성을 할 수 있습니다.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px] flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="질문 검색"
              className="w-full pl-8 border-gray-300"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(searchInput)
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => setSearchQuery(searchInput)}
              className="px-4 ml-2 border-gray-300"
            >
              검색
            </Button>
          </div>
          {/*
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
            </SelectContent>
          </Select>
          */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">총 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">답변 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{commentedCount}</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">미답변</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unCommentCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} defaultValue="unanswered" className="w-full">
        <TabsList className="mb-4 bg-gray-100 rounded-lg p-1 flex gap-0 w-fit">
          <TabsTrigger
            value="unanswered"
            className="tab-trigger rounded-md transition-colors px-3 py-1.5 focus:z-10 relative"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            미답변 질문
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="tab-trigger rounded-md transition-colors px-3 py-1.5 focus:z-10 relative"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            전체 질문
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
            AI 답변
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unanswered" className="space-y-4">
          {unansweredPaginatedQuestions.length > 0 ? (
            unansweredPaginatedQuestions.map((question) => <AdminQuestionCard key={question.postId} question={question} />)
          ) : (
            <p className="text-center text-muted-foreground py-8">미답변 질문이 없습니다.</p>
          )}
          {/* Numbered Pagination controls for unanswered */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={unansweredPage === 1}
              onClick={() => setUnansweredPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            {Array.from({ length: unansweredTotalPage }, (_, i) => i + 1)
              .filter((pageNum) => {
                if (unansweredTotalPage <= 5) return true;
                if (unansweredPage <= 3) return pageNum <= 5;
                if (unansweredPage >= unansweredTotalPage - 2) return pageNum > unansweredTotalPage - 5;
                return Math.abs(pageNum - unansweredPage) <= 2;
              })
              .map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === unansweredPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUnansweredPage(pageNum)}
                  className={pageNum === unansweredPage ? "font-bold" : ""}
                >
                  {pageNum}
                </Button>
              ))}
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={unansweredPage === unansweredTotalPage}
              onClick={() => setUnansweredPage((p) => Math.min(unansweredTotalPage, p + 1))}
            >
              다음
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {sortedAllQuestions.length > 0 ? (
            sortedAllQuestions.map((question) => (
              <AdminQuestionCard key={question.postId} question={question} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">질문이 없습니다.</p>
          )}
          {/* Numbered Pagination controls */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={allPage === 1}
              onClick={() => setAllPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            {/* Page number buttons (show up to 5, centered around current page) */}
            {Array.from({ length: allTotalPage }, (_, i) => i + 1)
              .filter((pageNum) => {
                if (allTotalPage <= 5) return true;
                if (allPage <= 3) return pageNum <= 5;
                if (allPage >= allTotalPage - 2) return pageNum > allTotalPage - 5;
                return Math.abs(pageNum - allPage) <= 2;
              })
              .map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === allPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAllPage(pageNum)}
                  className={pageNum === allPage ? "font-bold" : ""}
                >
                  {pageNum}
                </Button>
              ))}
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={allPage === allTotalPage}
              onClick={() => setAllPage((p) => Math.min(allTotalPage, p + 1))}
            >
              다음
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="answered" className="space-y-4">
          {answeredQuestions.length > 0 ? (
            answeredQuestions.map((question) => (
              <AdminQuestionCard key={question.postId} question={question} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">답변 완료된 질문이 없습니다.</p>
          )}
          {/* Numbered Pagination controls for answered */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={answeredPage === 1}
              onClick={() => setAnsweredPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            {Array.from({ length: answeredTotalPage }, (_, i) => i + 1)
              .filter((pageNum) => {
                if (answeredTotalPage <= 5) return true;
                if (answeredPage <= 3) return pageNum <= 5;
                if (answeredPage >= answeredTotalPage - 2) return pageNum > answeredTotalPage - 5;
                return Math.abs(pageNum - answeredPage) <= 2;
              })
              .map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === answeredPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnsweredPage(pageNum)}
                  className={pageNum === answeredPage ? "font-bold" : ""}
                >
                  {pageNum}
                </Button>
              ))}
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={answeredPage === answeredTotalPage}
              onClick={() => setAnsweredPage((p) => Math.min(answeredTotalPage, p + 1))}
            >
              다음
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ai-answered" className="space-y-4">
          {aiQuestions.length > 0 ? (
            aiQuestions.map((question) => (
              <AdminQuestionCard key={question.postId} question={question} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">AI 답변된 질문이 없습니다.</p>
          )}
          {/* Numbered Pagination controls for AI answered */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={aiPage === 1}
              onClick={() => setAiPage((p) => Math.max(1, p - 1))}
            >
              이전
            </Button>
            {Array.from({ length: aiTotalPage }, (_, i) => i + 1)
              .filter((pageNum) => {
                if (aiTotalPage <= 5) return true;
                if (aiPage <= 3) return pageNum <= 5;
                if (aiPage >= aiTotalPage - 2) return pageNum > aiTotalPage - 5;
                return Math.abs(pageNum - aiPage) <= 2;
              })
              .map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === aiPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAiPage(pageNum)}
                  className={pageNum === aiPage ? "font-bold" : ""}
                >
                  {pageNum}
                </Button>
              ))}
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              disabled={aiPage === aiTotalPage}
              onClick={() => setAiPage((p) => Math.min(aiTotalPage, p + 1))}
            >
              다음
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminQuestionCard({ question }: { question: Post }) {
  // Format date as yyyy-MM-dd HH:mm
  const date = new Date(question.createdAt)
  const yyyy = date.getFullYear()
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const HH = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const formattedDate = `${yyyy}-${MM}-${dd} ${HH}:${mm}`

  return (
    <Card className="border border-gray-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link href={`/questions/${question.postId}`} className="hover:underline">
              {question.title}
            </Link>
          </CardTitle>
          {question.status === "DOCTOR_COMMENTED" ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
              답변완료
            </Badge>
          ) : question.status === "AI_COMMENTED" ? (
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
              AI 답변
            </Badge>
          ) : (
            <Badge variant="outline">미답변</Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{question.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{question.commentCount}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="line-clamp-2 text-muted-foreground">{question.content}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {[...new Set(question.keywords ?? [])].map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-0">
        <Button variant="outline" size="sm" asChild className="mr-2 border-gray-300">
          <Link href={`/questions/${question.postId}`}>상세보기</Link>
        </Button>
        {question.status !== "DOCTOR_COMMENTED" && (
          <Button
            size="sm"
            asChild
            className="bg-black text-white hover:bg-black/90"
          >
            <Link href={`/questions/${question.postId}`}>답변하기</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
