'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/store/useStore'

const BODY_SHAPES = [
  'Hourglass', 'Pear', 'Apple', 'Rectangle', 'Inverted Triangle'
]

interface MeasurementsStepProps {
  onNext: () => void
  onBack: () => void
}

export default function MeasurementsStep({ onNext, onBack }: MeasurementsStepProps) {
  const { onboardingState, setOnboardingState } = useStore()
  const [height, setHeight] = useState(onboardingState.measurements.height?.toString() || '')
  const [weight, setWeight] = useState(onboardingState.measurements.weight?.toString() || '')
  const [sizeEU, setSizeEU] = useState(onboardingState.measurements.sizeEU || '')
  const [sizeUS, setSizeUS] = useState(onboardingState.measurements.sizeUS || '')
  const [bodyShape, setBodyShape] = useState(onboardingState.measurements.bodyShape || '')

  const handleNext = () => {
    setOnboardingState({
      measurements: {
        height: parseFloat(height) || 0,
        weight: parseFloat(weight) || 0,
        sizeEU,
        sizeUS,
        bodyShape
      }
    })
    onNext()
  }

  const isFormValid = height && weight

  return (
    <div className="flex flex-col space-y-6 py-8 px-4">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-semibold">Body Measurements</h2>
        <p className="text-muted-foreground">Help us understand your body type</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="170"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="65"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizeEU">Size (EU)</Label>
          <Input
            id="sizeEU"
            placeholder="38"
            value={sizeEU}
            onChange={(e) => setSizeEU(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizeUS">Size (US)</Label>
          <Input
            id="sizeUS"
            placeholder="6"
            value={sizeUS}
            onChange={(e) => setSizeUS(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyShape">Body Shape</Label>
          <Select value={bodyShape} onValueChange={setBodyShape}>
            <SelectTrigger id="bodyShape">
              <SelectValue placeholder="Select body shape" />
            </SelectTrigger>
            <SelectContent>
              {BODY_SHAPES.map((shape) => (
                <SelectItem key={shape} value={shape}>
                  {shape}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Optional - we&apos;ll analyze this from your photos too
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isFormValid} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  )
}
