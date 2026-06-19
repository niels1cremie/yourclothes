export interface User {
  id: string
  email: string
  name: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  size_eu?: string
  size_us?: string
  body_shape?: string
  face_shape?: string
  undertone?: string
  color_season?: string
  style_tags?: string[]
  style_dna?: StyleDNA
  created_at: string
}

export interface StyleDNA {
  body_shape: string
  shoulder_hip_ratio: number
  torso_length: string
  face_shape: string
  undertone: string
  color_season: string
  summary: string
}

export interface WardrobeItem {
  id: string
  user_id: string
  name: string
  category: string
  color: string[]
  brand?: string
  size?: string
  fabric?: string
  season: string[]
  formality: string
  image_url: string
  original_image_url: string
  times_worn: number
  last_worn?: string
  cost?: number
  source?: string
  ai_tags?: Record<string, any>
  created_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  items: string[] // wardrobe item IDs
  occasion: string
  rating?: number
  worn_on: string[]
  ai_generated: boolean
  ai_reason?: string
  created_at: string
}

export interface OnboardingState {
  step: number
  basicInfo: {
    name: string
    age: number
    gender: string
    styleTags: string[]
  }
  measurements: {
    height: number
    weight: number
    sizeEU: string
    sizeUS: string
    bodyShape: string
  }
  photos: {
    bodyPhoto?: File
    facePhoto?: File
  }
  styleDNA?: StyleDNA
  wardrobeUploads: File[]
  processedWardrobeItems?: Array<{
    file: File
    aiTags: {
      category: string
      color: string[]
      fabric: string
      style: string
      season: string[]
      formality: string
    }
    cutoutImage: string
  }>
  brandAccounts: string[]
  styleGoals: string[]
}
