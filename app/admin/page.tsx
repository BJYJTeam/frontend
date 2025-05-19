"use client"

import { useState, useEffect } from "react"
import type { Post } from "@/post_api_types"
import Link from "next/link"
import { Calendar, MessageCircle, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboard() {
  const baseUrl = process.env.VITE_BACKEND_URL
  const [questions, setQuestions] = useState<Post[]>([])
  const [sortBy, setSortBy] = useState("newest")

  // Fetch questions from backend
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`${baseUrl || "http://localhost:8080"}/api/post/list?page=1&size=1000&postStatus=ALL`)
        if (!res.ok) throw new Error("Failed to fetch posts")
        const data = await res.json()
        setQuestions(data.data.posts)
      } catch (err) {
        console.error("Failed to fetch questions:", err)
      }
    }
    fetchQuestions()
  }, [])

  // Sort questions based on selected option
  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return 0
  })

  // Filter unanswered questions
  const unansweredQuestions = sortedQuestions.filter(
    (q) => q.status !== "DOCTOR_COMMENTED" && q.status !== "AI_COMMENTED"
  )

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-1">질문 관리 및 답변 작성을 할 수 있습니다.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="질문 검색" className="w-full pl-8" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">총 질문</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{questions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">답변 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{questions.filter((q) => q.status === "DOCTOR_COMMENTED" || q.status === "AI_COMMENTED").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">미답변</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unansweredQuestions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="unanswered" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="unanswered">미답변 질문</TabsTrigger>
          <TabsTrigger value="all">전체 질문</TabsTrigger>
          <TabsTrigger value="answered">답변 완료</TabsTrigger>
          <TabsTrigger value="ai-answered">AI 답변</TabsTrigger>
        </TabsList>

        <TabsContent value="unanswered" className="space-y-4">
          {unansweredQuestions.length > 0 ? (
            unansweredQuestions.map((question) => <AdminQuestionCard key={question.postId} question={question} />)
          ) : (
            <p className="text-center text-muted-foreground py-8">미답변 질문이 없습니다.</p>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {sortedQuestions.map((question) => (
            <AdminQuestionCard key={question.postId} question={question} />
          ))}
        </TabsContent>

        <TabsContent value="answered" className="space-y-4">
          {sortedQuestions
            .filter((question) => question.status === "DOCTOR_COMMENTED")
            .map((question) => (
              <AdminQuestionCard key={question.postId} question={question} />
            ))}
        </TabsContent>

        <TabsContent value="ai-answered" className="space-y-4">
          {sortedQuestions
            .filter((question) => question.status === "AI_COMMENTED")
            .map((question) => (
              <AdminQuestionCard key={question.postId} question={question} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminQuestionCard({ question }: { question: Post }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link href={`/questions/${question.postId}`} className="hover:underline">
              {question.title}
            </Link>
          </CardTitle>
          {question.status === "DOCTOR_COMMENTED" ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              답변완료
            </Badge>
          ) : question.status === "AI_COMMENTED" ? (
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
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
            <span>{question.createdAt}</span>
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
          {question.keywords?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-0">
        <Button variant="outline" size="sm" asChild className="mr-2">
          <Link href={`/questions/${question.postId}`}>상세보기</Link>
        </Button>
        {question.status !== "DOCTOR_COMMENTED" && question.status !== "AI_COMMENTED" && (
          <Button size="sm" asChild>
            <Link href={`/questions/${question.postId}`}>답변하기</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
