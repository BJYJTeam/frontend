"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Trash2, Upload, Undo, Redo, Edit3, Square, Circle, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ImageAnnotatorProps {
  onImageChange: (imageData: string | null) => void
  initialImageUrl?: string
}

export function ImageAnnotator({ onImageChange, initialImageUrl }: ImageAnnotatorProps) {
  const [image, setImage] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pen" | "arrow" | "rectangle" | "circle">("pen")
  const [color, setColor] = useState("#FF0000")
  const [lineWidth, setLineWidth] = useState(3)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)

  // Load initial image if provided
  useEffect(() => {
    if (initialImageUrl) {
      console.log("Loading initial image:", initialImageUrl)
      loadImageFromUrl(initialImageUrl)
    }
  }, [initialImageUrl])

  // Initialize canvas when image changes
  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsLoading(true)
    setError(null)

    const img = new Image()

    img.onload = () => {
      console.log("Image loaded successfully, dimensions:", img.width, img.height)

      // Set canvas dimensions to match image (with reasonable limits)
      const maxWidth = 800
      const maxHeight = 600

      let { width, height } = img

      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Clear canvas and draw image
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      // Save initial state for undo
      saveState()
      setIsLoading(false)
    }

    img.onerror = (e) => {
      console.error("Failed to load image:", image, e)
      setError("이미지를 불러오는데 실패했습니다.")
      setIsLoading(false)
    }

    // Set crossOrigin to handle CORS properly
    img.crossOrigin = "anonymous"
    img.src = image
  }, [image])

  // Load image from URL
  const loadImageFromUrl = async (url: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // If the URL is from our Django server, proxy it
      if (url.includes("localhost:8000")) {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
        console.log("Using proxy URL:", proxyUrl)
        setImage(proxyUrl)
      } else {
        // Otherwise use it directly
        setImage(url)
      }

      setUndoStack([])
      setRedoStack([])
    } catch (err) {
      console.error("Error loading image:", err)
      setError("이미지 URL을 처리하는데 실패했습니다.")
      setIsLoading(false)
    }
  }

  const saveState = () => {
    if (!canvasRef.current) return
    try {
      const canvas = canvasRef.current
      // Ensure canvas has content before saving
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn("Canvas has no dimensions, skipping save")
        return
      }

      const dataURL = canvas.toDataURL("image/png")
      setUndoStack((prev) => [...prev, dataURL])
      setRedoStack([])
      onImageChange(dataURL)
    } catch (err) {
      console.error("Error saving canvas state:", err)
      setError("캔버스 상태 저장에 실패했습니다.")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.")
      return
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.")
      return
    }

    setError(null)
    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      console.log("File loaded, data URL length:", result.length)
      setImage(result)
      setUndoStack([])
      setRedoStack([])
    }

    reader.onerror = () => {
      setError("파일을 읽는데 실패했습니다.")
      setIsLoading(false)
    }

    reader.readAsDataURL(file)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    setIsDrawing(true)

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    startPointRef.current = { x, y }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = "round"
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !startPointRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    if (tool !== "pen") {
      const lastState = undoStack[undoStack.length - 1]
      if (lastState) {
        const img = new Image()
        img.onload = () => {
          if (!ctx) return
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          drawShape(ctx, startPointRef.current!.x, startPointRef.current!.y, x, y)
        }
        img.src = lastState
      }
    } else {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing || !canvasRef.current) return
    setIsDrawing(false)
    saveState()
  }

  const drawShape = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()

    switch (tool) {
      case "arrow":
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
        const angle = Math.atan2(endY - startY, endX - startX)
        const headLength = 15
        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(endX, endY)
        ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
        break
      case "rectangle":
        ctx.rect(startX, startY, endX - startX, endY - startY)
        ctx.stroke()
        break
      case "circle":
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI)
        ctx.stroke()
        break
    }
  }

  const handleUndo = () => {
    if (undoStack.length <= 1) return
    const currentState = undoStack.pop()
    if (!currentState) return
    setRedoStack((prev) => [...prev, currentState])
    const previousState = undoStack[undoStack.length - 1]
    if (previousState && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        onImageChange(previousState)
      }
      img.src = previousState
    }
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return
    const nextState = redoStack.pop()
    if (!nextState) return
    setUndoStack((prev) => [...prev, nextState])
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        onImageChange(nextState)
      }
      img.src = nextState
    }
  }

  const handleClear = () => {
    setImage(null)
    setUndoStack([])
    setRedoStack([])
    onImageChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const dataURL = canvasRef.current.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = "annotated-image.png"
    link.href = dataURL
    link.click()
  }

  return (
    <div className="border rounded-md p-4 space-y-4 border-gray-300">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="text-lg font-medium">이미지 업로드 및 주석</h3>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            이미지 업로드
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          {image && (
            <Button type="button" variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <div className="border rounded-md p-4 bg-red-50 text-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">이미지 로딩 오류</p>
            <p className="text-sm">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => initialImageUrl && loadImageFromUrl(initialImageUrl)}
            >
              다시 시도
            </Button>
          </div>
        </div>
      ) : image ? (
        <div className="space-y-4">

        <div className="relative w-full max-h-[500px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-w-full h-auto cursor-crosshair"
            style={{ maxHeight: "500px", objectFit: "contain", display: isLoading ? "none" : "block" }}
          />
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>도구</Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={tool === "pen" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setTool("pen")}
                    className={`h-8 w-8 ${tool === "pen" ? "bg-black text-white border-black" : ""}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={tool === "arrow" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setTool("arrow")}
                    className={`h-8 w-8 ${tool === "arrow" ? "bg-black text-white border-black" : ""}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant={tool === "rectangle" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setTool("rectangle")}
                    className={`h-8 w-8 ${tool === "rectangle" ? "bg-black text-white border-black" : ""}`}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={tool === "circle" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setTool("circle")}
                    className={`h-8 w-8 ${tool === "circle" ? "bg-black text-white border-black" : ""}`}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-primary">
                <Label>선 두께</Label>
                <Slider
                  value={[lineWidth]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setLineWidth(value[0])}
                  className="slider-black-thumb"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>색상</Label>
              <RadioGroup value={color} onValueChange={setColor} className="grid grid-cols-5 gap-2">
                {[
                  "#FF0000",
                  "#00FF00",
                  "#0000FF",
                  "#FFFF00",
                  "#FF00FF",
                  "#00FFFF",
                  "#000000",
                  "#FFFFFF",
                  "#FFA500",
                  "#800080",
                ].map((colorOption) => (
                  <div key={colorOption} className="flex items-center space-x-2">
                    <RadioGroupItem value={colorOption} id={colorOption} className="sr-only" />
                    <Label
                      htmlFor={colorOption}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2"
                      style={{
                        backgroundColor: colorOption,
                        borderColor: color === colorOption ? "#000" : "transparent",
                      }}
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length <= 1}>
                <Undo className="h-4 w-4 mr-2" />
                실행 취소
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
                <Redo className="h-4 w-4 mr-2" />
                다시 실행
              </Button>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-md flex items-center justify-center border-gray-300 h-[300px]">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">이미지를 업로드하세요</p>
            <p className="text-xs text-muted-foreground">
              X-ray 또는 척추 이미지를 업로드하고 주석을 추가할 수 있습니다
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
