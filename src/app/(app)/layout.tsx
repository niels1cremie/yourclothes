'use client'

import { usePathname } from 'next/navigation'
import { Home, Shirt, Calendar, ShoppingBag, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'wardrobe', label: 'Wardrobe', icon: Shirt, href: '/app/wardrobe' },
  { id: 'outfits', label: 'Outfits', icon: Home, href: '/app/outfits' },
  { id: 'planner', label: 'Planner', icon: Calendar, href: '/app/planner' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, href: '/app/shop' },
  { id: 'insights', label: 'Insights', icon: BarChart3, href: '/app/insights' },
  { id: 'profile', label: 'Profile', icon: User, href: '/app/profile' },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      
      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
        <div className="max-w-md mx-auto px-2">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              const Icon = tab.icon
              
              return (
                <a
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    'flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-colors touch-target',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
