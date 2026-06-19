import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f2] to-[#f5dceb]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 font-cormorant">
            MIRROR
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4 font-light">
            AI-Powered Personal Styling
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Your intelligent wardrobe companion that learns your style, suggests outfits, and helps you look your best every day.
          </p>
          
          <Link href="/onboarding">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-6 rounded-full">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 font-cormorant">
            Discover Your Personal Style
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#f5dceb] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Style Analysis</h3>
                <p className="text-gray-600">
                  Our AI analyzes your preferences, body type, and lifestyle to create your unique style DNA.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#f5dceb] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Wardrobe</h3>
                <p className="text-gray-600">
                  Digitize your wardrobe and get intelligent outfit suggestions for any occasion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#f5dceb] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Personalized Picks</h3>
                <p className="text-gray-600">
                  Receive curated recommendations that match your style, fit, and preferences perfectly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gray-900 text-white">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cormorant">
              Ready to Transform Your Style?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of users who have discovered their perfect look with MIRROR.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 rounded-full">
                Start Your Journey
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; 2024 MIRROR. All rights reserved.</p>
      </footer>
    </div>
  )
}
