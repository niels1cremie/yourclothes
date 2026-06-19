'use client'

import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      
      <div className="space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          Welcome to MIRROR
        </h1>
        <p className="text-lg text-muted-foreground max-w-sm">
          Your AI-powered personal stylist. Discover your style DNA, organize your wardrobe, and get outfit recommendations tailored just for you.
        </p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <Button onClick={onNext} className="w-full" size="lg">
          Get Started
        </Button>
        <p className="text-xs text-muted-foreground">
          Takes about 5 minutes to complete
        </p>
      </div>
    </div>
  )
}
