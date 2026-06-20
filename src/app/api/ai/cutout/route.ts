import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { photo } = await request.json()

    // Use Groq AI for clothing classification and tagging
    const prompt = `Analyze this clothing item and provide detailed fashion tags. 

Categories to choose from: Top, Bottom, Dress, Outerwear, Shoes, Accessory
Colors: Black, White, Red, Blue, Green, Yellow, Brown, Gray, Pink, Purple, Navy, Beige, Orange, Teal, Burgundy
Fabrics: Cotton, Silk, Wool, Denim, Polyester, Linen, Leather, Cashmere, Velvet, Satin
Styles: Casual, Formal, Business, Sport, Bohemian, Minimalist, Classic, Edgy, Romantic
Seasons: Spring, Summer, Fall, Winter
Formality levels: Casual, Business Casual, Formal, Semi-Formal

Provide a JSON response with these fields:
- category: single category from the list
- color: array of 1-2 dominant colors
- fabric: single fabric type
- style: single style descriptor
- season: array of 1-2 suitable seasons
- formality: single formality level`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert fashion analyst AI. Analyze clothing items and provide accurate fashion tags for wardrobe organization and styling.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')

    const mockResponse = {
      cutoutImage: photo, // Note: Actual cutout would require image processing API
      tags: response
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('AI cutout error:', error)
    return NextResponse.json(
      { error: 'Failed to process photo' },
      { status: 500 }
    )
  }
}
