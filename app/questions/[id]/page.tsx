/* eslint-disable */
"use client"

import React from "react"
import type { JSX } from "react";
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, MessageCircle, User, ImageIcon } from "lucide-react"

import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageAnnotator } from "@/components/image-annotator"
import { ImageRecommendations } from "@/components/image-recommendations"
import type { Post, Comment } from "@/post_api_types"
import { DebugImageLoader } from "@/components/debug-image-loader"

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${yyyy}-${mm}-${dd} ${hours}:${minutes} ${ampm}`
}

export default function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const { id } = React.use(params)
  const postId = id
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  useEffect(() => {
    console.log("All comments:", comments);
  }, [comments]);
  const [passwordError, setPasswordError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // AI feedback state
  const [aiFeedbackSubmitted, setAiFeedbackSubmitted] = useState(false)
  const [showUserFeedbackForm, setShowUserFeedbackForm] = useState(false)
  const [userFeedbackContent, setUserFeedbackContent] = useState("")

  const searchParams = useSearchParams()
  const router = useRouter();
  const passwordRef = React.useRef<string | null | undefined>(null);

  useEffect(() => {
    // Only prompt for password if needed
    if (searchParams.get("visibility") === "PRIVATE" && passwordRef.current === null) {
      if (passwordError) {
        alert("비밀번호가 올바르지 않습니다.");
        setPasswordError(false);
        // Do not retry, do not redirect, just stay on the page
        return;
      }
      const pw = prompt("비밀번호를 입력하세요");
      if (!pw) {
        passwordRef.current = undefined;
        router.replace("/");
        return;
      }
      passwordRef.current = pw;
    }
    async function fetchPost() {
      setIsLoading(true);
      const v = searchParams.get("visibility");
      if (v === null) {
        setIsLoading(false);
        return;
      }
      if (v === "PRIVATE") {
        if (passwordRef.current === undefined) {
          setIsLoading(false);
          return;
        }
        if (passwordRef.current === null) {
          setIsLoading(false);
          return;
        }
        try {
          const url = `${baseUrl}/api/post/${id}/private`;
          const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: passwordRef.current }),
          };
          const res = await fetch(url, options);
          if (!res.ok) {
            passwordRef.current = null; // triggers prompt again
            setPasswordError(true);
            setIsLoading(false);
            return;
          }
          const data = await res.json();
          const { post, comments } = data.data;
          setPost(post);
          setComments(comments);
        } catch (err) {
          passwordRef.current = undefined;
          router.replace("/");
        } finally {
          setIsLoading(false);
        }
        return;
      }
      if (v === "PUBLIC") {
        try {
          const url = `${baseUrl}/api/post/${id}/public`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch post detail");
          const data = await res.json();
          const { post, comments } = data.data;
          setPost(post);
          setComments(comments);
        } catch (err) {
          const fallback = posts.find((p) => p.postId === id) || posts[0];
          setPost(fallback);
          setComments([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    if (passwordRef.current !== undefined) {
      fetchPost();
    }
  }, [id, searchParams, passwordError]);

  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [answerType, setAnswerType] = useState("doctor")
  const [answerContent, setAnswerContent] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showImageAnnotator, setShowImageAnnotator] = useState(false)
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  // State for handling new comment input
  const [newComment, setNewComment] = useState("");

  // Inject dummy AI answer and DRAFT answer if there are no non-draft comments after loading
  // useEffect(() => {
  //   if (!isLoading && post) {
  //     const dummyAIComment = {
  //       commentId: "dummy-ai-" + Date.now(),
  //       status: "NORMAL" as const,
  //       content: "이 답변은 AI가 자동으로 생성한 예시입니다.",
  //       author: "AI",
  //       createdAt: new Date().toISOString(),
  //       updatedAt: new Date().toISOString(),
  //       imageUrls: [],
  //     };
  //     setComments([
  //       dummyAIComment,
  //       {
  //         commentId: "draft-test-" + Date.now(),
  //         status: "DRAFT",
  //         content: "이것은 테스트용 DRAFT 상태의 답변입니다. 'AI 자동 답변 불러오기' 버튼으로 입력창에 채워질 것입니다.",
  //         author: "AI",
  //         createdAt: new Date().toISOString(),
  //         updatedAt: new Date().toISOString(),
  //         imageUrls: [],
  //       },
  //     ]);
  //   }
  // }, [isLoading, post, comments.length]);

  // In a real application, this would be determined by authentication
  const isStaff = true // Simulating that the current user is staff
  // Answer button is only shown for staff 

  // Dynamically fetch related post titles for AI answers
  const [relatedTitles, setRelatedTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    const relatedIds = new Set<string>();
    comments.forEach((comment) => {
      comment.content.split("\n").forEach((line) => {
        if (/^[a-zA-Z0-9\-]{32,36}$/.test(line.trim())) {
          const formattedId = line.trim().replace(
            /^([a-fA-F0-9]{8})([a-fA-F0-9]{4})([a-fA-F0-9]{4})([a-fA-F0-9]{4})([a-fA-F0-9]{12})$/,
            "$1-$2-$3-$4-$5"
          );
          relatedIds.add(formattedId);
        }
      });
    });

    if (relatedIds.size === 0) {
      setRelatedTitles({});
      return;
    }

    Promise.all(
      Array.from(relatedIds).map(async (postId) => {
        try {
          const res = await fetch(`${baseUrl}/api/post/${postId}/public`);
          const data = await res.json();
          return { postId, title: data.data.post.title };
        } catch {
          return { postId, title: postId };
        }
      })
    ).then((results) => {
      const titles: Record<string, string> = {};
      results.forEach(({ postId, title }) => {
        titles[postId] = title;
      });
      setRelatedTitles(titles);
    });
  }, [comments]);

  const handleImageChange = (imageData: string | null) => {
    setAnnotatedImage(imageData)
  }

  const handleSelectRecommendedImage = (imageUrl: string) => {
    // Clear any existing annotated image when selecting a new recommended image
    setAnnotatedImage(null)
    setSelectedImageUrl(imageUrl)
    setShowImageAnnotator(true)
  }

  const handleAnswerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Submit comment
      const commentRes = await fetch(`${baseUrl}/api/doctor/post/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: answerContent,
        }),
      });

      const commentData = await commentRes.json();
      const commentId = commentData.data.commentId;

      // Step 2: Upload annotated image if exists
      if (annotatedImage && commentId) {
        const blob = await (await fetch(annotatedImage)).blob();
        const formData = new FormData();
        formData.append("image", new File([blob], "annotation.jpeg", { type: "image/jpeg" }));

        // Debugging logs before image upload
        console.log("baseUrl:", baseUrl);
        console.log("commentId:", commentId);
        console.log("Uploading image to:", `${baseUrl}/api/doctor/post/comment/image?commentId=${commentId}`);
        console.log("Blob size:", blob.size);

        await fetch(`${baseUrl}/api/doctor/post/comment/image?commentId=${commentId}`, {
          method: "POST",
          body: formData,
        });
      }

      // Reset form and UI
      setAnswerContent("");
      setShowAnswerForm(false);
      setShowImageAnnotator(false);
      setAnnotatedImage(null);
      alert("답변이 등록되었습니다.");
      setComments((prev) => [
        ...prev,
        {
          commentId,
          status: "NORMAL",
          content: answerContent,
          author: answerType === "doctor" ? "DOCTOR" : "AI",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          imageUrls: annotatedImage ? [annotatedImage] : [],
        },
      ]);
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("답변 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
                <Badge variant="default" className="text-white bg-green-500 hover:bg-green-600">
                  답변완료
                </Badge>
              ) : post.status === "AI_COMMENTED" ? (
                <Badge variant="default" className="text-white bg-blue-500 hover:bg-blue-600">
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
                <span>{formatDateTime(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>댓글 {post.commentCount}개</span>
              </div>
            </div>

            {/* Display keywords */}
            <div className="flex flex-wrap gap-1 mt-3">
              {[...new Set(post.keywords ?? [])]
                .sort((a, b) => {
                  const isA = /^\[.*\]$/.test(a);
                  const isB = /^\[.*\]$/.test(b);
                  return isA === isB ? 0 : isA ? -1 : 1;
                })
                .map((tag) => {
                  const bracketedMatch = tag.match(/^\[(.*)\]$/);
                  const label = bracketedMatch ? bracketedMatch[1] : tag;
                  const isBracketed = !!bracketedMatch;
                  return (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`text-xs flex gap-0.5 items-center ${isBracketed ? "bg-gray-300 text-black" : ""}`}
                    >
                      {isBracketed && <span>[</span>}
                      <span>{label}</span>
                      {isBracketed && <span>]</span>}
                    </Badge>
                  );
                })}
            </div>
          </div>

          <Card className="mb-8 border-gray-300">
            <CardContent className="pt-6">
              <p className="whitespace-pre-line">{post.content}</p>
            </CardContent>
          </Card>

          {/* Answer Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">답변</h2>
              {isStaff && !showAnswerForm && <Button onClick={() => setShowAnswerForm(true)} className="bg-black text-white">답변 작성하기</Button>}
            </div>

            {/* Answer Form for Staff */}
            {isStaff && showAnswerForm && (
              <Card className="mb-6 border-2 border-gray-300">
                <CardHeader>
                  <h3 className="text-lg font-medium">답변 작성</h3>
                  <CardDescription>사용자가 불만족 피드백을 남긴 질문에는 AI 초안 생성이 가능합니다. (AI 자동 답변 불러오기)</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAnswerSubmit} className="space-y-4">
                    <div className="mb-4">
                      <div title="불만족 피드백이 있어야 초안 생성이 가능합니다.">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!comments.some((c) => c.status === "DRAFT")}
                          onClick={() => {
                            const draftComment = comments.find((c) => c.status === "DRAFT");
                            if (draftComment) {
                              setAnswerContent(draftComment.content);
                            }
                          }}
                        >
                          AI 자동 답변 불러오기
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="answer-content">답변 내용</Label>
                      <Textarea
                        id="answer-content"
                        placeholder="답변 내용을 입력하세요"
                        className="min-h-[200px] border-gray-300"
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        required
                      />
                    </div>

                    {/* Image Recommendations */}
                    {answerType === "doctor" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">추천 이미지</Label>
                          <Badge variant="outline" className="bg-blue-50">
                            질문 내용 기반 추천
                          </Badge>
                        </div>
                        <ImageRecommendations
                          questionContent={post.title + " " + post.content}
                          onSelectImage={handleSelectRecommendedImage}
                        />
                      </div>
                    )}

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
                    {showImageAnnotator && (
                      <ImageAnnotator
                        key={selectedImageUrl} // Force re-render when new image is selected
                        onImageChange={handleImageChange}
                        initialImageUrl={selectedImageUrl || undefined}
                      />
                    )}

                    <div className="flex items-center space-x-2">
                      <Switch id="public-answer" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="public-answer">공개 답변으로 등록</Label>
                    </div>
                    {/* CardFooter */}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" onClick={() => setShowAnswerForm(false)}>
                        취소
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-black text-white">
                        {isSubmitting ? "등록 중..." : "답변 등록"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Display Answers with Images */}
            {comments.some(c => (c.author === "DOCTOR" || c.author === "AI") && c.status !== "DRAFT") ? (
              <Tabs defaultValue="doctor" className="w-full">
                <TabsList className="mb-4 bg-gray-100 rounded-lg p-1 flex gap-0 w-fit">
                  <TabsTrigger
                    value="doctor"
                    className="data-[state=active]:bg-white"
                  >
                    의료진 답변
                  </TabsTrigger>
                  <TabsTrigger
                    value="ai"
                    className="data-[state=active]:bg-white"
                  >
                    AI 자동 답변
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="doctor">
                  {comments.filter(c => c.author === "DOCTOR" && c.status !== "DRAFT").length > 0 ? (
                    comments
                      .filter(c => c.author === "DOCTOR" && c.status !== "DRAFT")
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((comment, idx, arr) => (
                        <div key={comment.commentId} className={idx !== arr.length - 1 ? "mb-6" : ""}>
                          <Card className="border border-gray-300">
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">온누리병원장 김영환</div>
                                <CardDescription>{formatDateTime(comment.createdAt)}</CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {Array.isArray(comment.imageUrls) && comment.imageUrls.filter((url) => url && url.trim() !== "").length > 0 && (
                                <div className="border rounded-md overflow-hidden">
                                  {comment.imageUrls
                                    .filter((url) => url && url.trim() !== "")
                                    .map((url) => (
                                      <Image
                                        key={url}
                                        src={url}
                                        alt="의료진 주석 이미지"
                                        width={600}
                                        height={400}
                                        className="w-full max-h-[400px] object-contain"
                                      />
                                    ))}
                                </div>
                              )}
                              <p className="whitespace-pre-line">{comment.content}</p>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground">아직 답변이 없습니다.</p>
                  )}
                </TabsContent>

                <TabsContent value="ai">
                  {comments.filter(c => c.author === "AI" && c.status !== "DRAFT").length > 0 ? (
                    comments
                      .filter((c) => c.author === "AI" && c.status !== "DRAFT")
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((comment) => (
                        <Card key={comment.commentId} className="border border-gray-300">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">온누리병원 AI 인턴</div>
                              <CardDescription>{formatDateTime(comment.createdAt)}</CardDescription>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {(() => {
                              const lines = comment.content.split('\n');
                              const result: JSX.Element[] = [];
                              let isRelatedSection = false;
                              lines.forEach((line, i) => {
                                if (line.trim() === "[유사 질문]") {
                                  result.push(
                                    <p key="related-header" className="font-semibold mt-4">유사 질문</p>
                                  );
                                  isRelatedSection = true;
                                  return;
                                }
                                // Updated block for related questions
                                if (isRelatedSection && /^[a-zA-Z0-9\-]+$/.test(line.trim())) {
                                  const relatedPostId = line.trim();
                                  const formattedId = relatedPostId.replace(
                                    /^([a-fA-F0-9]{8})([a-fA-F0-9]{4})([a-fA-F0-9]{4})([a-fA-F0-9]{4})([a-fA-F0-9]{12})$/,
                                    "$1-$2-$3-$4-$5"
                                  );
                                  const title = relatedTitles[formattedId] ?? formattedId;
                                  result.push(
                                    <p key={relatedPostId}>
                                      <Link
                                        href={`/questions/${formattedId}?visibility=PUBLIC`}
                                        className="text-blue-600 underline"
                                      >
                                        {title}
                                      </Link>
                                    </p>
                                  );
                                } else {
                                  result.push(<p key={`line-${i}`}>{line}</p>);
                                }
                              });
                              return result;
                            })()}
                            <div className="mt-6">
                              {aiFeedbackSubmitted ? (
                                <p className="text-sm text-green-600">피드백이 성공적으로 제출되었습니다. 감사합니다!</p>
                              ) : (
                                <>
                                  <p className="text-sm text-gray-600 mb-2">이 답변이 도움이 되었나요?</p>
                                  <p className="text-sm text-gray-500 mb-1">사유를 작성해주시면 원장님이 직접 답변해드립니다.</p>
                                  <div className="flex gap-3">
                                    <Button
                                      variant="outline"
                                      className="border border-gray-300"
                                      onClick={async () => {
                                        try {
                                          await fetch(`${baseUrl}/api/post/comment`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              commentId: comment.commentId,
                                              status: "SOLVED",
                                            }),
                                          });
                                          setAiFeedbackSubmitted(true);
                                        } catch (err) {
                                          console.error("피드백 등록 실패:", err);
                                          alert("피드백 등록에 실패했습니다.");
                                        }
                                      }}
                                    >
                                      👍 네, 만족스러웠어요
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="border border-gray-300"
                                      onClick={async () => {
                                        try {
                                          await fetch(`${baseUrl}/api/post/comment`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              commentId: comment.commentId,
                                              status: "UNSOLVED",
                                            }),
                                          });
                                          setShowUserFeedbackForm(true);
                                        } catch (err) {
                                          console.error("피드백 등록 실패:", err);
                                          alert("피드백 등록에 실패했습니다.");
                                        }
                                      }}
                                    >
                                      👎 아니요, 부족했어요
                                    </Button>
                                  </div>
                                  {showUserFeedbackForm && (
                                    <div className="mt-4 space-y-2">
                                      <Textarea
                                        placeholder="어떤 점이 부족했는지 알려주세요"
                                        value={userFeedbackContent}
                                        onChange={(e) => setUserFeedbackContent(e.target.value)}
                                      />
                                      <div className="flex justify-end">
                                        <Button
                                          onClick={async () => {
                                            if (!userFeedbackContent.trim()) return;
                                            try {
                                              const res = await fetch(`${baseUrl}/api/post/comment`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                  postId,
                                                  content: userFeedbackContent.trim(),
                                                }),
                                              });
                                              if (!res.ok) throw new Error("피드백 댓글 등록 실패");
                                              setAiFeedbackSubmitted(true);
                                              const data = await res.json();
                                              setComments((prev) => [
                                                ...prev,
                                                {
                                                  commentId: data.data.commentId,
                                                  status: "NORMAL",
                                                  content: userFeedbackContent.trim(),
                                                  author: "USER",
                                                  createdAt: new Date().toISOString(),
                                                  updatedAt: new Date().toISOString(),
                                                  imageUrls: [],
                                                },
                                              ]);
                                            } catch (err) {
                                              console.error("피드백 댓글 등록 실패", err);
                                              alert("피드백 등록에 실패했습니다.");
                                            }
                                          }}
                                          className="bg-black text-white"
                                        >
                                          피드백 제출
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <p className="text-muted-foreground">아직 답변이 없습니다.</p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-muted-foreground">아직 답변이 없습니다.</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">댓글</h2>
            {comments && comments.filter((c) => c.author !== "DOCTOR" && c.author !== "AI" && c.status !== "DRAFT").length > 0 ? (
              <div className="space-y-4">
                {comments
                  .filter((c) => c.author !== "DOCTOR" && c.author !== "AI" && c.status !== "DRAFT")
                  .map((comment) => (
                    <Card key={comment.commentId} className="border border-gray-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{comment.author === "USER" ? post?.author : comment.author}</div>
                          <CardDescription>{formatDateTime(comment.createdAt)}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{comment.content}</p>
                      </CardContent>
                    </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">아직 댓글이 없습니다.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">댓글 작성</h2>
            <Card className="border-gray-300">
              <CardContent className="pt-6">
                <Textarea
                  placeholder="댓글을 입력하세요"
                  className="mb-4 border-gray-300"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      if (!newComment.trim()) return;
                      try {
                        const res = await fetch(`${baseUrl}/api/post/comment`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            postId,
                            content: newComment.trim(),
                          }),
                        });

                        if (!res.ok) throw new Error("댓글 등록 실패");

                        const data = await res.json();
                        setComments((prev) => [
                          ...prev,
                          {
                            commentId: data.data.commentId,
                            status: "NORMAL",
                            content: newComment.trim(),
                            author: "USER",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            imageUrls: [],
                          },
                        ]);
                        setNewComment("");
                      } catch (err) {
                        console.error("댓글 등록 실패", err);
                        alert("댓글 등록에 실패했습니다.");
                      }
                    }}
                    className="bg-black text-white"
                  >
                    댓글 등록
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : isLoading ? (
        <p>로딩 중입니다...</p>
      ) : null}
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