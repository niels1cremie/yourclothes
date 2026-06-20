import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { occasion, mood, wardrobeItems, styleDNA } = await request.json()

    if (!wardrobeItems || wardrobeItems.length < 3) {
      return NextResponse.json({
        items: [],
        reason: 'You need at least 3 wardrobe items to generate an outfit.'
      })
    }

    // Use Groq AI for outfit generation
    const wardrobeSummary = wardrobeItems.map((item: any) => 
      `${item.category || 'item'} in ${item.color?.join(', ') || 'various colors'}`
    ).join(', ')

    const prompt = `Generate an outfit recommendation for a ${occasion} occasion with a ${mood} mood.

Available wardrobe items: ${wardrobeSummary}

User's style profile:
- Body shape: ${styleDNA?.body_shape || 'unknown'}
- Color season: ${styleDNA?.color_season || 'unknown'}
- Undertone: ${styleDNA?.undertone || 'unknown'}

Select 3 items from the wardrobe that work well together. Provide a JSON response with:
- items: array of 3 item IDs from the provided wardrobe
- reason: brief explanation of why this outfit works for the occasion and the user's style

Available item IDs: ${wardrobeItems.map((item: any) => item.id).join(', ')}`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert fashion stylist AI. Create outfit recommendations that complement the user\'s body type, color season, and personal style.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI outfit generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate outfit' },
      { status: 500 }
    )
  }
}
