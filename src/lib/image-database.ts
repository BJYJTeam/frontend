export interface APIImageResult {
  filename: string
  description: string
  tags: string[]
  raw_caption: string
}


const IMAGE_BASE_URL = "http://127.0.0.1:8001/media/"

// Function to get image type from filename or description
export function getImageType(filename: string, description: string): "xray" | "diagram" | "illustration" | "photo" {
  const filenameLower = filename.toLowerCase()
  const descriptionLower = description.toLowerCase()

  if (filenameLower.includes("xray") || filenameLower.includes("x-ray") || descriptionLower.includes("x-ray")) {
    return "xray"
  } else if (filenameLower.includes("diagram") || descriptionLower.includes("diagram")) {
    return "diagram"
  } else if (filenameLower.includes("illustration") || descriptionLower.includes("illustration")) {
    return "illustration"
  }
  return "photo"
}

// Function to get full image URL
export function getImageUrl(filename: string): string {
  return IMAGE_BASE_URL + filename
}

// Function to get display title from filename
export function getDisplayTitle(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "") // Remove file extension
}

// Function to recommend images from API based on question content
export async function recommendImagesFromAPI(questionContent: string): Promise<APIImageResult[]> {
  try {
    const response = await fetch("http://127.0.0.1:8001/api/recommend-images/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: questionContent,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.results && Array.isArray(data.results)) {
      return data.results
    }

    return []
  } catch (error) {
    console.error("Error fetching image recommendations from API:", error)
    throw error
  }
}