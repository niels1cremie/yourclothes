import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { bodyPhoto, facePhoto } = await request.json()

    // Use Groq AI for body and face analysis
    const prompt = `Analyze the provided body and face photos to determine:
1. Body shape (Hourglass, Pear, Apple, Rectangle, Inverted Triangle)
2. Face shape (Oval, Round, Square, Heart, Oblong)
3. Skin undertone (Warm, Cool, Neutral)
4. Color season (Spring, Summer, Autumn, Winter)
5. Shoulder-to-hip ratio (estimate as decimal between 0.6-0.9)
6. Torso length (Short, Average, Long)

Provide a JSON response with these fields: body_shape, shoulder_hip_ratio, torso_length, face_shape, undertone, color_season, summary (a brief personalized description).`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert fashion stylist and body analysis AI. Provide accurate, helpful fashion and style advice based on physical characteristics.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.5,
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze photos' },
      { status: 500 }
    )
  }
}
