'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Search, Filter, Grid, List, Shirt } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function WardrobePage() {
  const { wardrobeItems } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filteredItems = wardrobeItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="font-serif text-2xl font-semibold mb-4">Wardrobe</h1>
          
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 h-12 px-6 py-2 rounded-full border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-target"
            >
              <Filter className="h-4 w-4 mr-2 inline" />
              Filters
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="h-12 px-4 py-2 rounded-full border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-target"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4 inline" /> : <Grid className="h-4 w-4 inline" />}
            </button>
            <Button className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Add Items
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shirt className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">Your wardrobe is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your clothes to get personalized outfit recommendations
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Items
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 gap-3' 
            : 'space-y-3'
          }>
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={viewMode === 'grid' ? 'aspect-square' : 'h-24'}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
