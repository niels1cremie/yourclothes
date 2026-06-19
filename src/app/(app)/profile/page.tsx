'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Settings, LogOut } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function ProfilePage() {
  const { user, onboardingState } = useStore()

  const handleRescan = () => {
    // TODO: Implement re-scan functionality
    console.log('Re-scan triggered')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {onboardingState.basicInfo.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold">
                {onboardingState.basicInfo.name || 'User'}
              </h1>
              <p className="text-muted-foreground">
                {onboardingState.basicInfo.styleTags?.join(', ') || 'No style tags yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Style DNA Card */}
        {user?.style_dna && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Style DNA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Body Shape</p>
                  <p className="font-medium">{user.style_dna.body_shape}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Face Shape</p>
                  <p className="font-medium">{user.style_dna.face_shape}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Color Season</p>
                  <p className="font-medium">{user.style_dna.color_season}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xs text-muted-foreground">Undertone</p>
                  <p className="font-medium">{user.style_dna.undertone}</p>
                </div>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Summary</p>
                <p className="text-sm">{user.style_dna.summary}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleRescan}>
                <Camera className="h-4 w-4 mr-2" />
                Re-scan Photos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Age</span>
              <span className="font-medium">{onboardingState.basicInfo.age || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-medium">{onboardingState.basicInfo.gender || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Height</span>
              <span className="font-medium">{onboardingState.measurements.height || '-'} cm</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-medium">{onboardingState.measurements.weight || '-'} kg</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Size (EU)</span>
              <span className="font-medium">{onboardingState.measurements.sizeEU || '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-4">
            <Button variant="outline" className="w-full mb-2">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" className="w-full text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
