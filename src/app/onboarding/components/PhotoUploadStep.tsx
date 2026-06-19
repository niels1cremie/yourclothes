'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Camera, X } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface PhotoUploadStepProps {
  onNext: () => void
  onBack: () => void
}

export default function PhotoUploadStep({ onNext, onBack }: PhotoUploadStepProps) {
  const { onboardingState, setOnboardingState } = useStore()
  const [bodyPhoto, setBodyPhoto] = useState<File | undefined>(onboardingState.photos.bodyPhoto)
  const [facePhoto, setFacePhoto] = useState<File | undefined>(onboardingState.photos.facePhoto)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleBodyPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setBodyPhoto(file)
  }

  const handleFacePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFacePhoto(file)
  }

  const handleRemoveBodyPhoto = () => setBodyPhoto(undefined)
  const handleRemoveFacePhoto = () => setFacePhoto(undefined)

  const handleNext = async () => {
    if (!bodyPhoto || !facePhoto) return

    setIsAnalyzing(true)
    try {
      // Call AI analysis
      const { analyzeBodyAndFace } = await import('@/lib/ai')
      const styleDNA = await analyzeBodyAndFace(bodyPhoto, facePhoto)
      
      // Save photos and analysis results
      setOnboardingState({
        photos: { bodyPhoto, facePhoto },
        styleDNA
      })
      onNext()
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Even if analysis fails, save photos and continue
      setOnboardingState({
        photos: { bodyPhoto, facePhoto }
      })
      onNext()
    } finally {
      setIsAnalyzing(false)
    }
  }

  const isFormValid = bodyPhoto && facePhoto

  return (
    <div className="flex flex-col space-y-6 py-8 px-4">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-semibold">Photo Upload</h2>
        <p className="text-muted-foreground">
          Upload photos for AI body & face analysis
        </p>
      </div>

      <div className="space-y-6">
        {/* Body Photo */}
        <div className="space-y-2">
          <Label>Full Body Photo</Label>
          <Card className="border-2 border-dashed">
            <CardContent className="p-6">
              {bodyPhoto ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(bodyPhoto)}
                    alt="Body photo"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background"
                    onClick={handleRemoveBodyPhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 py-8">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Full body shot, front view
                  </p>
                  <label htmlFor="body-photo">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </label>
                  <input
                    id="body-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleBodyPhotoChange}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Face Photo */}
        <div className="space-y-2">
          <Label>Face Photo</Label>
          <Card className="border-2 border-dashed">
            <CardContent className="p-6">
              {facePhoto ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(facePhoto)}
                    alt="Face photo"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-background"
                    onClick={handleRemoveFacePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 py-8">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Clear face shot, good lighting
                  </p>
                  <label htmlFor="face-photo">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </label>
                  <input
                    id="face-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFacePhotoChange}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isAnalyzing && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Analyzing your photos with AI...</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isAnalyzing}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isFormValid || isAnalyzing} className="flex-1">
          {isAnalyzing ? 'Analyzing...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
