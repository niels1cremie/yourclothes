-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  height NUMERIC,
  weight NUMERIC,
  size_eu TEXT,
  size_us TEXT,
  body_shape TEXT,
  face_shape TEXT,
  undertone TEXT,
  color_season TEXT,
  style_tags TEXT[],
  style_dna JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wardrobe items table
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT[] NOT NULL,
  brand TEXT,
  size TEXT,
  fabric TEXT,
  season TEXT[] NOT NULL,
  formality TEXT NOT NULL,
  image_url TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  times_worn INTEGER DEFAULT 0,
  last_worn TIMESTAMP WITH TIME ZONE,
  cost NUMERIC,
  source TEXT,
  ai_tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items UUID[] NOT NULL,
  occasion TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  worn_on TIMESTAMP WITH TIME ZONE[],
  ai_generated BOOLEAN DEFAULT false,
  ai_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for wardrobe_items table
CREATE POLICY "Users can view own wardrobe items"
  ON wardrobe_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe items"
  ON wardrobe_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe items"
  ON wardrobe_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe items"
  ON wardrobe_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for outfits table
CREATE POLICY "Users can view own outfits"
  ON outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits"
  ON outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits"
  ON outfits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits"
  ON outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_season ON wardrobe_items USING GIN(season);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_color ON wardrobe_items USING GIN(color);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
