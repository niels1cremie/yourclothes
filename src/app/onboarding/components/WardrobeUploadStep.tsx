'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface WardrobeUploadStepProps {
  onNext: () => void
  onBack: () => void
}

export default function WardrobeUploadStep({ onNext, onBack }: WardrobeUploadStepProps) {
  const { onboardingState, setOnboardingState } = useStore()
  const [uploads, setUploads] = useState<File[]>(onboardingState.wardrobeUploads)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    setUploads(prev => [...prev, ...newFiles])
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemoveFile = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    if (uploads.length > 0) {
      setIsProcessing(true)
      try {
        // Process wardrobe photos with AI cutout and tagging
        const { processWardrobePhoto } = await import('@/lib/ai')
        
        // Process each photo with AI (in production, this would be batched)
        const processedItems = await Promise.all(
          uploads.map(async (file) => {
            const result = await processWardrobePhoto(file)
            return {
              file,
              aiTags: result.tags,
              cutoutImage: result.cutoutImage
            }
          })
        )
        
        setOnboardingState({ 
          wardrobeUploads: uploads,
          processedWardrobeItems: processedItems
        })
      } catch (error) {
        console.error('AI processing failed:', error)
        // Even if AI fails, save the uploads
        setOnboardingState({ wardrobeUploads: uploads })
      } finally {
        setIsProcessing(false)
      }
    } else {
      setOnboardingState({ wardrobeUploads: uploads })
    }
    onNext()
  }

  return (
    <div className="flex flex-col space-y-6 py-8 px-4">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-semibold">Upload Your Wardrobe</h2>
        <p className="text-muted-foreground">
          Add photos of your clothes for AI analysis
        </p>
      </div>

      <div className="space-y-4">
        {/* Upload Area */}
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-3 py-8">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Drag & drop photos here, or click to browse
              </p>
              <label htmlFor="wardrobe-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Select Photos
                  </span>
                </Button>
              </label>
              <input
                id="wardrobe-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files Preview */}
        {uploads.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {uploads.length} photo{uploads.length !== 1 ? 's' : ''} selected
            </p>
            <div className="grid grid-cols-3 gap-3">
              {uploads.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1 right-1 h-8 w-8 bg-background"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Processing your wardrobe with AI...</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isProcessing}>
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : uploads.length > 0 ? 'Continue' : 'Skip for Now'}
        </Button>
      </div>
    </div>
  )
}
