# MIRROR - AI-Powered Personal Styling App

A comprehensive AI-powered wardrobe and personal styling application built with Next.js 14, Supabase, and Tailwind CSS.

## Features

### Onboarding (7 Steps)
- Welcome screen with app introduction
- Basic info collection (name, age, gender, style preferences)
- Body measurements input
- Photo upload for AI body & face analysis
- Wardrobe bulk upload with drag-and-drop
- Brand account connections (UI placeholder)
- Style goals selection

### Main App Features
- **Wardrobe Tab**: View and manage your clothing items with search and filters
- **Outfits Tab**: AI-powered outfit generator based on occasion and mood
- **Profile Tab**: View your Style DNA profile and basic info
- **Planner Tab**: Coming soon - outfit planning calendar
- **Shop Tab**: Coming soon - personalized shopping recommendations
- **Insights Tab**: Coming soon - style analytics

### Design System
- **Colors**: Warm off-white background (#faf8f2), gold-taupe accent (#9e886c)
- **Typography**: Cormorant Garamond (serif), Inter (sans), DM Sans (display)
- **Components**: Pill-shaped buttons, 16px rounded cards, skeleton loading states
- **Mobile-First**: Touch-friendly tap targets (min 44px), safe-area insets support

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)

### Installation

1. Clone the repository and navigate to the project:
```bash
cd mirror
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor in your Supabase dashboard
   - Copy and run the SQL from `supabase/schema.sql`
   - Get your project URL and anon key from Settings > API

4. Create environment file:
```bash
cp .env.local.example .env.local
```

5. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Users Table
- `id`: UUID (primary key)
- `email`: Text (unique)
- `name`: Text
- `age`, `gender`, `height`, `weight`: Optional fields
- `size_eu`, `size_us`: Clothing sizes
- `body_shape`, `face_shape`, `undertone`, `color_season`: AI analysis results
- `style_tags`: Array of style preferences
- `style_dna`: JSONB with detailed analysis
- `created_at`: Timestamp

### Wardrobe Items Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users)
- `name`, `category`, `color`, `brand`, `size`, `fabric`: Item details
- `season`, `formality`: Classification
- `image_url`, `original_image_url`: Image URLs
- `times_worn`, `last_worn`, `cost`, `source`: Usage tracking
- `ai_tags`: JSONB with AI-generated tags
- `created_at`: Timestamp

### Outfits Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to users)
- `name`, `occasion`: Outfit details
- `items`: Array of wardrobe item IDs
- `rating`: 1-5 scale
- `worn_on`: Array of timestamps
- `ai_generated`: Boolean flag
- `ai_reason`: AI explanation
- `created_at`: Timestamp

## PWA Support

The app is configured as a Progressive Web App (PWA) for mobile installation:
- Manifest file for installability
- Service worker for offline support
- Safe-area insets for notched devices
- Touch-optimized interactions

## Mobile Responsiveness

Tested and optimized for:
- iOS Safari (iPhone 12/13/14/15)
- Android Chrome (Pixel, Samsung Galaxy)
- Breakpoints: 375px, 390px, 412px width
- No horizontal scroll, no overlapping elements
- Input zoom prevention on iOS

## AI Integration

### Body & Face Analysis
- Upload full-body and face photos
- AI analyzes body shape, face shape, color season, undertone
- Generates personalized Style DNA profile

### Wardrobe Processing
- Bulk photo upload with drag-and-drop
- AI cuts out clothing items from photos
- Auto-tags: category, color, fabric, style, season, formality
- Review and edit tags before saving

### Outfit Generation
- Select occasion and mood
- AI assembles outfits from your wardrobe
- Personalized recommendations based on Style DNA
- Save and organize generated outfits

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Fonts**: Cormorant Garamond, Inter, DM Sans (Google Fonts)
- **PWA**: next-pwa

## Project Structure

```
mirror/
├── src/
│   ├── app/
│   │   ├── (app)/          # Main app with bottom navigation
│   │   │   ├── wardrobe/
│   │   │   ├── outfits/
│   │   │   ├── planner/
│   │   │   ├── shop/
│   │   │   ├── insights/
│   │   │   └── profile/
│   │   ├── onboarding/     # 7-step onboarding flow
│   │   ├── layout.tsx       # Root layout with fonts
│   │   ├── page.tsx         # Home page (redirects to onboarding)
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── ui/             # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   ├── supabase-client.ts # Database operations
│   │   ├── ai.ts           # AI integration functions
│   │   └── utils.ts        # Utility functions
│   ├── store/
│   │   └── useStore.ts     # Zustand state management
│   └── types/
│       └── index.ts        # TypeScript types
├── public/
│   └── manifest.json       # PWA manifest
├── supabase/
│   └── schema.sql         # Database schema
└── package.json
```

## Future Enhancements

- Calendar sync for outfit planning
- Weather-based outfit recommendations
- Real brand account integrations
- Shopping recommendations based on wardrobe gaps
- Style analytics and insights
- Social sharing of outfits
- Wardrobe cost tracking

## License

MIT
