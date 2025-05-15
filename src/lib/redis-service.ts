import { kv } from "@vercel/kv"

export async function saveImage(questionId: number, imageData: string): Promise<string> {
  const imageId = `image_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const key = `question:${questionId}:image:${imageId}`

  await kv.set(key, imageData)

  return imageId
}

export async function getImage(questionId: number, imageId: string): Promise<string | null> {
  const key = `question:${questionId}:image:${imageId}`
  return await kv.get(key)
}

export async function deleteImage(questionId: number, imageId: string): Promise<void> {
  const key = `question:${questionId}:image:${imageId}`
  await kv.del(key)
}
