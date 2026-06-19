'use client'

import { ShoppingBag } from 'lucide-react'

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-semibold mb-2">Shop</h1>
        <p className="text-muted-foreground">
          Discover new pieces that match your style. Coming soon!
        </p>
      </div>
    </div>
  )
}
