import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { photo } = await request.json()

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock AI cutout and tagging results
    // In production, this would call AI for cutout and classification
    const categories = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Accessory']
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Gray', 'Pink', 'Purple', 'Navy', 'Beige']
    const fabrics = ['Cotton', 'Silk', 'Wool', 'Denim', 'Polyester', 'Linen', 'Leather', 'Cashmere']
    const styles = ['Casual', 'Formal', 'Business', 'Sport', 'Bohemian', 'Minimalist', 'Classic']
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter']
    const formalities = ['Casual', 'Business Casual', 'Formal', 'Semi-Formal']

    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const randomColors = [
      colors[Math.floor(Math.random() * colors.length)],
      colors[Math.floor(Math.random() * colors.length)]
    ].filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates

    const mockResponse = {
      cutoutImage: photo, // In production, this would be the actual cutout image
      tags: {
        category: randomCategory,
        color: randomColors,
        fabric: fabrics[Math.floor(Math.random() * fabrics.length)],
        style: styles[Math.floor(Math.random() * styles.length)],
        season: [seasons[Math.floor(Math.random() * seasons.length)]],
        formality: formalities[Math.floor(Math.random() * formalities.length)]
      }
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
