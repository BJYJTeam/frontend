"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugImageLoader() {
  const [imageUrl, setImageUrl] = useState("")
  const [proxyUrl, setProxyUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const testDirectImage = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const img = new Image()
      img.onload = () => {
        setSuccess(true)
        setLoading(false)
      }
      img.onerror = (e) => {
        setError(`직접 로드 실패: ${e}`)
        setLoading(false)
      }
      img.src = imageUrl
    } catch (err) {
      setError(`직접 로드 오류: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  const testProxyImage = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
      setProxyUrl(proxyUrl)

      const img = new Image()
      img.onload = () => {
        setSuccess(true)
        setLoading(false)
      }
      img.onerror = (e) => {
        setError(`프록시 로드 실패: ${e}`)
        setLoading(false)
      }
      img.src = proxyUrl
    } catch (err) {
      setError(`프록시 로드 오류: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>이미지 로드 디버거</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="테스트할 이미지 URL 입력"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button onClick={testDirectImage} disabled={!imageUrl || loading}>
            직접 로드
          </Button>
          <Button onClick={testProxyImage} disabled={!imageUrl || loading}>
            프록시 로드
          </Button>
        </div>

        {loading && <p>로딩 중...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">이미지 로드 성공!</p>}

        {imageUrl && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">직접 로드:</h3>
              <div className="border rounded p-2 bg-gray-50">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="직접 로드"
                  className="max-h-[200px] mx-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    const errorText = document.createElement("p")
                    errorText.className = "text-red-500 text-center"
                    errorText.textContent = "이미지 로드 실패"
                    e.currentTarget.parentNode?.appendChild(errorText)
                  }}
                />
              </div>
            </div>

            {proxyUrl && (
              <div>
                <h3 className="font-medium mb-2">프록시 로드:</h3>
                <div className="border rounded p-2 bg-gray-50">
                  <img
                    src={proxyUrl || "/placeholder.svg"}
                    alt="프록시 로드"
                    className="max-h-[200px] mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      const errorText = document.createElement("p")
                      errorText.className = "text-red-500 text-center"
                      errorText.textContent = "이미지 로드 실패"
                      e.currentTarget.parentNode?.appendChild(errorText)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
