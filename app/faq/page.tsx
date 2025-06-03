"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { faqItems } from "@/lib/faq-data"

export default function FAQPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [apiFaqItems, setApiFaqItems] = useState<typeof faqItems | null>(null)

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch(`${baseUrl}/api/post/list?postStatus=ALL`);
        if (res.ok) {
          const data = await res.json();
          setApiFaqItems(data.result.faqPosts);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs from API:", error);
      }
    }
    fetchFaqs();
  }, [])

  // Toggle expanded state for FAQ items
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const displayedFaqs = apiFaqItems ?? faqItems

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">자주 묻는 질문</h1>
          <p className="text-gray-500">척추측만증에 대한 궁금한 점들을 빠르게 해결하세요</p>
        </div>

      </div>


      <Card className="border border-gray-300">
        <CardContent className="space-y-4 pt-6">
          {displayedFaqs.map((faq) => (
            <Collapsible key={faq.id}>
              <CollapsibleTrigger
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 p-4 text-left hover:bg-muted/50"
                onClick={() => toggleExpanded(faq.id)}
              >
                <span className="font-medium">{faq.question}</span>
                {expandedItems.has(faq.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 pt-2">
                <p className="text-muted-foreground">{faq.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card className="mt-8 border border-gray-300">
        <CardContent className="pt-6">
          <p className="mb-4 text-center">원하는 답변을 찾지 못하셨나요?</p>
          <div className="flex justify-center">
            <Button asChild className="bg-black text-white hover:bg-black/90">
              <Link href="/questions/new">질문 게시판에 문의하기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
