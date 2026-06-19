'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Save } from 'lucide-react'
import { useStore } from '@/store/useStore'

const OCCASIONS = [
  'Casual Day', 'Work', 'Date Night', 'Weekend', 
  'Party', 'Formal Event', 'Brunch', 'Travel'
]

const MOODS = [
  'Confident', 'Relaxed', 'Elegant', 'Playful', 
  'Professional', 'Romantic', 'Bold', 'Minimalist'
]

export default function OutfitsPage() {
  const { outfits, wardrobeItems } = useStore()
  const [occasion, setOccasion] = useState('')
  const [mood, setMood] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOutfit, setGeneratedOutfit] = useState<any>(null)

  const handleGenerate = async () => {
    if (!occasion || !mood) return
    
    setIsGenerating(true)
    try {
      // Call AI outfit generation
      const { generateOutfit } = await import('@/lib/ai')
      const user = useStore.getState().user
      
      const result = await generateOutfit(
        occasion,
        mood,
        wardrobeItems,
        user?.style_dna || {
          body_shape: 'Unknown',
          shoulder_hip_ratio: 0.75,
          torso_length: 'Average',
          face_shape: 'Unknown',
          undertone: 'Neutral',
          color_season: 'Neutral',
          summary: 'Style DNA not yet analyzed'
        }
      )
      
      // Convert item IDs to actual items
      const items = result.items
        .map((id: string) => wardrobeItems.find(item => item.id === id))
        .filter(Boolean)
      
      setGeneratedOutfit({
        items,
        reason: result.reason
      })
    } catch (error) {
      console.error('Failed to generate outfit:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="font-serif text-2xl font-semibold mb-4">AI Outfit Generator</h1>
          
          {/* Occasion & Mood Selection */}
          <div className="space-y-3">
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                {OCCASIONS.map((occ) => (
                  <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleGenerate} 
              disabled={!occasion || !mood || isGenerating}
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Outfit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {generatedOutfit ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Generated Outfit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {generatedOutfit.items.map((item: any, index: number) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {generatedOutfit.reason}
              </p>
              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Outfit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">AI Stylist</h3>
            <p className="text-muted-foreground mb-4">
              Select an occasion and mood to get personalized outfit recommendations
            </p>
          </div>
        )}

        {/* Saved Outfits */}
        {outfits.length > 0 && (
          <div className="mt-8">
            <h2 className="font-serif text-xl font-semibold mb-4">Saved Outfits</h2>
            <div className="space-y-3">
              {outfits.map((outfit) => (
                <Card key={outfit.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{outfit.name}</h4>
                        <p className="text-sm text-muted-foreground">{outfit.occasion}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
