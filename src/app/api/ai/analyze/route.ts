import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { bodyPhoto, facePhoto } = await request.json()

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock AI analysis results
    // In production, this would call Lovable AI Vision API
    const bodyShapes = ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle']
    const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Oblong']
    const undertones = ['Warm', 'Cool', 'Neutral']
    const colorSeasons = ['Spring', 'Summer', 'Autumn', 'Winter']
    
    const randomBodyShape = bodyShapes[Math.floor(Math.random() * bodyShapes.length)]
    const randomFaceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)]
    const randomUndertone = undertones[Math.floor(Math.random() * undertones.length)]
    const randomColorSeason = colorSeasons[Math.floor(Math.random() * colorSeasons.length)]

    const mockResponse = {
      body_shape: randomBodyShape,
      shoulder_hip_ratio: 0.7 + Math.random() * 0.2,
      torso_length: ['Short', 'Average', 'Long'][Math.floor(Math.random() * 3)],
      face_shape: randomFaceShape,
      undertone: randomUndertone,
      color_season: randomColorSeason,
      summary: `You have a ${randomBodyShape.toLowerCase()} figure with a ${randomFaceShape.toLowerCase()} face shape. Your ${randomUndertone.toLowerCase()} undertones mean ${randomColorSeason.toLowerCase()} colors like ${getColorRecommendations(randomColorSeason)} will complement your complexion best.`
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze photos' },
      { status: 500 }
    )
  }
}

function getColorRecommendations(season: string): string {
  const recommendations = {
    Spring: 'coral, peach, light green, and ivory',
    Summer: 'lavender, rose, soft blue, and gray',
    Autumn: 'terracotta, olive, mustard, and warm brown',
    Winter: 'crimson, emerald, navy, and black'
  }
  return recommendations[season as keyof typeof recommendations] || 'neutral tones'
}
