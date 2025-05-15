"use client"

import { useState } from "react"
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
  const [sortBy, setSortBy] = useState("newest")

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

const questions: Post[] = [
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