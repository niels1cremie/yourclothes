'use client'

import { Calendar } from 'lucide-react'

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-semibold mb-2">Outfit Planner</h1>
        <p className="text-muted-foreground">
          Plan your outfits for the week. Coming soon!
        </p>
      </div>
    </div>
  )
}
