'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/useStore'
import WelcomeStep from '@/app/onboarding/components/WelcomeStep'
import BasicInfoStep from '@/app/onboarding/components/BasicInfoStep'
import MeasurementsStep from '@/app/onboarding/components/MeasurementsStep'
import PhotoUploadStep from '@/app/onboarding/components/PhotoUploadStep'
import WardrobeUploadStep from '@/app/onboarding/components/WardrobeUploadStep'
import BrandAccountsStep from '@/app/onboarding/components/BrandAccountsStep'
import StyleGoalsStep from '@/app/onboarding/components/StyleGoalsStep'

const steps = [
  { id: 0, title: 'Welcome' },
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Measurements' },
  { id: 3, title: 'Photo Upload' },
  { id: 4, title: 'Wardrobe' },
  { id: 5, title: 'Brand Accounts' },
  { id: 6, title: 'Style Goals' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { onboardingState, setOnboardingState, resetOnboarding } = useStore()
  const [isLoading, setIsLoading] = useState(false)

  const currentStep = onboardingState.step

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setOnboardingState({ step: currentStep + 1 })
    } else {
      // Complete onboarding - save to Supabase and redirect
      handleCompleteOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setOnboardingState({ step: currentStep - 1 })
    }
  }

  const handleCompleteOnboarding = async () => {
    setIsLoading(true)
    try {
      // Import Supabase client functions
      const { createUser } = await import('@/lib/supabase-client')
      
      // Prepare user data from onboarding state
      const userData = {
        email: `${onboardingState.basicInfo.name.toLowerCase().replace(/\s/g, '.')}@example.com`, // Generate email from name
        name: onboardingState.basicInfo.name,
        age: onboardingState.basicInfo.age,
        gender: onboardingState.basicInfo.gender,
        height: onboardingState.measurements.height,
        weight: onboardingState.measurements.weight,
        size_eu: onboardingState.measurements.sizeEU,
        size_us: onboardingState.measurements.sizeUS,
        body_shape: onboardingState.measurements.bodyShape,
        style_tags: onboardingState.basicInfo.styleTags
        // style_dna will be populated after AI analysis
      }

      // Save user to Supabase
      const user = await createUser(userData)
      
      // Update store with user data using the store's setUser function
      const { setUser } = useStore.getState()
      setUser(user)
      
      // Reset onboarding state
      resetOnboarding()
      
      // Redirect to app
      router.push('/app')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      // Even if database save fails, continue to app for now
      router.push('/app')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />
      case 1:
        return <BasicInfoStep onNext={handleNext} onBack={handleBack} />
      case 2:
        return <MeasurementsStep onNext={handleNext} onBack={handleBack} />
      case 3:
        return <PhotoUploadStep onNext={handleNext} onBack={handleBack} />
      case 4:
        return <WardrobeUploadStep onNext={handleNext} onBack={handleBack} />
      case 5:
        return <BrandAccountsStep onNext={handleNext} onBack={handleBack} />
      case 6:
        return <StyleGoalsStep onNext={handleNext} onBack={handleBack} isLoading={isLoading} />
      default:
        return <WelcomeStep onNext={handleNext} />
    }
  }

  return (
    <div className="min-h-screen bg-[#f5dceb] flex flex-col">
      {/* Progress Bar */}
      {currentStep > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#fae6f5]/95 backdrop-blur-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {steps.length - 1}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {steps[currentStep].title}
              </span>
            </div>
            <Progress value={(currentStep / (steps.length - 1)) * 100} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex items-center justify-center p-4 ${currentStep > 0 ? 'pt-24' : ''}`}>
        <Card className="w-full max-w-md border-0 shadow-none bg-[#fae6f5]">
          <CardContent className="p-0">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
