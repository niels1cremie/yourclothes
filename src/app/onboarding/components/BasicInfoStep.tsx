'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useStore } from '@/store/useStore'

const STYLE_TAGS = [
  { id: 'Minimalist', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop', color: 'bg-gray-100' },
  { id: 'Classic', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=400&fit=crop', color: 'bg-blue-100' },
  { id: 'Bohemian', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop', color: 'bg-pink-100' },
  { id: 'Streetwear', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400&h=400&fit=crop', color: 'bg-orange-100' },
  { id: 'Preppy', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', color: 'bg-green-100' },
  { id: 'Romantic', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop', color: 'bg-red-100' },
  { id: 'Edgy', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', color: 'bg-purple-100' },
  { id: 'Casual', image: 'https://images.unsplash.com/photo-1529139574466-a302d2d36f94?w=400&h=400&fit=crop', color: 'bg-yellow-100' },
  { id: 'Formal', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop', color: 'bg-indigo-100' },
  { id: 'Athletic', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop', color: 'bg-teal-100' }
]

interface BasicInfoStepProps {
  onNext: () => void
  onBack: () => void
}

export default function BasicInfoStep({ onNext, onBack }: BasicInfoStepProps) {
  const { onboardingState, setOnboardingState } = useStore()
  const [name, setName] = useState(onboardingState.basicInfo.name)
  const [age, setAge] = useState(onboardingState.basicInfo.age || '')
  const [gender, setGender] = useState(onboardingState.basicInfo.gender)
  const [selectedTags, setSelectedTags] = useState<string[]>(onboardingState.basicInfo.styleTags)

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  const handleNext = () => {
    setOnboardingState({
      basicInfo: {
        name,
        age: parseInt(String(age)) || 0,
        gender,
        styleTags: selectedTags
      }
    })
    onNext()
  }

  const isFormValid = name && age && gender && selectedTags.length > 0

  return (
    <div className="flex flex-col space-y-6 py-8 px-4">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-semibold">Basic Info</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="Your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Style Preferences (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-3">
            {STYLE_TAGS.map((style) => (
              <div 
                key={style.id} 
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTags.includes(style.id) 
                    ? 'border-primary bg-primary/10' 
                    : 'border-input hover:border-primary/50'
                }`}
                onClick={() => handleTagToggle(style.id)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-20 h-20 rounded-xl overflow-hidden">
                    <img
                      src={style.image}
                      alt={style.id}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-center">{style.id}</span>
                  <Checkbox
                    id={style.id}
                    checked={selectedTags.includes(style.id)}
                    onCheckedChange={() => handleTagToggle(style.id)}
                    className="absolute top-2 right-2"
                  />
                </div>
              </div>
            ))}
          </div>
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
