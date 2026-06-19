'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useStore } from '@/store/useStore'

const STYLE_GOALS = [
  'Build a capsule wardrobe',
  'Dress more professionally',
  'Express my personality',
  'Stay on trend',
  'Shop more sustainably',
  'Mix and match easily',
  'Dress for my body type',
  'Find my signature look'
]

interface StyleGoalsStepProps {
  onNext: () => void
  onBack: () => void
  isLoading?: boolean
}

export default function StyleGoalsStep({ onNext, onBack, isLoading }: StyleGoalsStepProps) {
  const { onboardingState, setOnboardingState } = useStore()
  const [selectedGoals, setSelectedGoals] = useState<string[]>(onboardingState.styleGoals)

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    )
  }

  const handleNext = () => {
    setOnboardingState({ styleGoals: selectedGoals })
    onNext()
  }

  return (
    <div className="flex flex-col space-y-6 py-8 px-4">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-semibold">Style Goals</h2>
        <p className="text-muted-foreground">
          What do you want to achieve with your style?
        </p>
      </div>

      <div className="space-y-3">
        {STYLE_GOALS.map((goal) => (
          <div key={goal} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id={goal}
              checked={selectedGoals.includes(goal)}
              onCheckedChange={() => handleGoalToggle(goal)}
              className="mt-0.5"
            />
            <Label htmlFor={goal} className="cursor-pointer font-normal">
              {goal}
            </Label>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating Profile...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  )
}
