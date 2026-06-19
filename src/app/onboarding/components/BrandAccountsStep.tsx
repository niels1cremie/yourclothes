'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

const BRANDS = [
  { name: 'Zara', logo: 'Z' },
  { name: 'H&M', logo: 'H&M' },
  { name: 'Nike', logo: 'N' },
  { name: 'Adidas', logo: 'A' },
  { name: 'Uniqlo', logo: 'U' },
  { name: 'ASOS', logo: 'ASOS' },
]

interface BrandAccountsStepProps {
  onNext: () => void
  onBack: () => void
}

export default function BrandAccountsStep({ onNext, onBack }: BrandAccountsStepProps) {
  return (
    <div className="flex flex-col space-y-6 py-8 px-4">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-semibold">Connect Brand Accounts</h2>
        <p className="text-muted-foreground">
          Link your favorite brands for better recommendations
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          Coming soon - connect accounts to sync your purchases
        </p>
        
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <Card key={brand.name} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {brand.logo}
                  </div>
                  <span className="font-medium">{brand.name}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  )
}
