-- ================================================
-- Test Data Setup for YourClothes Android App
-- ================================================
-- This script creates test data to verify database connection
-- Run this in your Supabase SQL Editor
-- ================================================

-- Step 1: Create required tables if they don't exist
-- ================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    body_shape TEXT,
    skin_undertone TEXT,
    color_season TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wardrobe_items table
CREATE TABLE IF NOT EXISTS wardrobe_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT,
    style TEXT,
    fabric TEXT,
    laundry_status TEXT DEFAULT 'clean',
    times_worn INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planned_outfits table
CREATE TABLE IF NOT EXISTS planned_outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    occasion TEXT,
    notes TEXT,
    weather_condition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create outfit_items junction table
CREATE TABLE IF NOT EXISTS outfit_items (
    outfit_id UUID REFERENCES planned_outfits(id) ON DELETE CASCADE,
    item_id UUID REFERENCES wardrobe_items(id) ON DELETE CASCADE,
    PRIMARY KEY (outfit_id, item_id)
);

-- Create occasion_templates table
CREATE TABLE IF NOT EXISTS occasion_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    suggested_categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create Row Level Security (RLS) policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasion_templates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- Wardrobe items policies
CREATE POLICY "Users can view own wardrobe items" ON wardrobe_items FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own wardrobe items" ON wardrobe_items FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own wardrobe items" ON wardrobe_items FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own wardrobe items" ON wardrobe_items FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Planned outfits policies
CREATE POLICY "Users can view own planned outfits" ON planned_outfits FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own planned outfits" ON planned_outfits FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own planned outfits" ON planned_outfits FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own planned outfits" ON planned_outfits FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- Outfit items policies
CREATE POLICY "Users can view own outfit items" ON outfit_items FOR SELECT USING (
    outfit_id IN (SELECT id FROM planned_outfits WHERE user_id IN (SELECT id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "Users can insert own outfit items" ON outfit_items FOR INSERT WITH CHECK (
    outfit_id IN (SELECT id FROM planned_outfits WHERE user_id IN (SELECT id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "Users can delete own outfit items" ON outfit_items FOR DELETE USING (
    outfit_id IN (SELECT id FROM planned_outfits WHERE user_id IN (SELECT id FROM profiles WHERE id = auth.uid()))
);

-- Occasion templates policies (public read, admin write)
CREATE POLICY "Anyone can view occasion templates" ON occasion_templates FOR SELECT USING (true);
CREATE POLICY "Admins can insert occasion templates" ON occasion_templates FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Step 3: Insert Occasion Templates
-- ================================================

INSERT INTO occasion_templates (name, description, suggested_categories) VALUES
('Casual', 'Alledaags, comfortabele kleding', ARRAY['T-shirts', 'Jeans', 'Sneakers']),
('Business', 'Professionele kleding voor werk', ARRAY['Overhemden', 'Broeken', 'Pakken']),
('Formeel', 'Chique kleding voor speciale gelegenheden', ARRAY['Pakken', 'Kostuums', 'Formele schoenen']),
('Sport', 'Sportieve kleding', ARRAY['Sportshirts', 'Sportbroeken', 'Sportschoenen']),
('Feest', 'Feestelijke kleding', ARRAY['Feestkleding', 'Accessoires', 'Schoenen'])
ON CONFLICT (name) DO NOTHING;

-- Step 4: Create Test User (you'll need to sign up through the app, but this creates the profile structure)
-- ================================================

-- IMPORTANT: To create test data, first sign up a test user in your app
-- Then replace 'YOUR_USER_UUID' with the actual user UUID from auth.users

-- Get the current user ID (use this in Supabase SQL Editor after signing in)
-- SELECT id FROM auth.users LIMIT 1;

-- Uncomment and replace YOUR_USER_UUID with actual user ID after signing up:
/*
-- Create test profile for existing user
INSERT INTO profiles (id, first_name, last_name, date_of_birth, body_shape, skin_undertone, color_season, onboarding_completed)
VALUES (
    'YOUR_USER_UUID',  -- Replace with actual user UUID
    'Test',
    'Gebruiker',
    '1990-01-15',
    'Hourglass',
    'Warm',
    'Spring',
    true
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    onboarding_completed = EXCLUDED.onboarding_completed;
*/

-- Step 5: Create Test Wardrobe Items (for YOUR_USER_UUID)
-- ================================================

/* Uncomment and replace YOUR_USER_UUID:

INSERT INTO wardrobe_items (user_id, image_url, category, color, style, fabric, laundry_status, times_worn) VALUES
    ('YOUR_USER_UUID', 'https://example.com/shirt1.jpg', 'T-shirts', 'Blauw', 'Casual', 'Katoen', 'clean', 5),
    ('YOUR_USER_UUID', 'https://example.com/jeans1.jpg', 'Jeans', 'Blauw', 'Casual', 'Denim', 'clean', 3),
    ('YOUR_USER_UUID', 'https://example.com/sneakers1.jpg', 'Schoenen', 'Wit', 'Sportief', 'Canvas', 'clean', 10),
    ('YOUR_USER_UUID', 'https://example.com/dress1.jpg', 'Jurken', 'Rood', 'Formeel', 'Zijde', 'clean', 2),
    ('YOUR_USER_UUID', 'https://example.com/jacket1.jpg', 'Jassen', 'Zwart', 'Casual', 'Leder', 'clean', 7),
    ('YOUR_USER_UUID', 'https://example.com/pants1.jpg', 'Broeken', 'Grijs', 'Business', 'Wol', 'clean', 4),
    ('YOUR_USER_UUID', 'https://example.com/shirt2.jpg', 'Overhemden', 'Wit', 'Business', 'Linnen', 'clean', 6),
    ('YOUR_USER_UUID', 'https://example.com/skirt1.jpg', 'Roken', 'Zwart', 'Feest', 'Satijn', 'clean', 1);
*/

-- Step 6: Create Test Planned Outfits (for YOUR_USER_UUID)
-- ================================================

/* Uncomment and replace YOUR_USER_UUID and item IDs:

-- Get the item IDs you just created:
-- SELECT id FROM wardrobe_items WHERE user_id = 'YOUR_USER_UUID';

-- Create test outfits
INSERT INTO planned_outfits (user_id, date, occasion, notes, weather_condition) VALUES
    ('YOUR_USER_UUID', '2025-06-23', 'Business', 'Presentatie meeting', 'Zonnig'),
    ('YOUR_USER_UUID', '2025-06-24', 'Casual', 'Dagje uit met vrienden', 'Bewolkt'),
    ('YOUR_USER_UUID', '2025-06-25', 'Formeel', 'Avondeten restaurant', 'Helder');

-- Link items to outfits (replace with actual item IDs)
INSERT INTO outfit_items (outfit_id, item_id) VALUES
    -- Get outfit IDs: SELECT id FROM planned_outfits WHERE user_id = 'YOUR_USER_UUID';
    (outfit_id_1, item_id_1), -- Example: (uuid1, uuid2)
    (outfit_id_1, item_id_2),
    (outfit_id_1, item_id_3),
    (outfit_id_2, item_id_4),
    (outfit_id_2, item_id_5),
    (outfit_id_3, item_id_6),
    (outfit_id_3, item_id_7),
    (outfit_id_3, item_id_8);
*/

-- Step 7: Create Storage Bucket for wardrobe photos
-- ================================================

-- Insert storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES
('wardrobe-photos', 'wardrobe-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own photos" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'wardrobe-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own photos" ON storage.objects FOR SELECT USING (
    bucket_id = 'wardrobe-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE WITH CHECK (
    bucket_id = 'wardrobe-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 8: Create Edge Functions placeholders
-- ================================================

-- These should be created via Supabase Dashboard -> Edge Functions
-- Function names: user-analyzer, clothing-analyzer

-- Step 9: Verification Queries
-- ================================================

-- Check if tables exist
SELECT 
    tablename as table_name
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'wardrobe_items', 'planned_outfits', 'outfit_items', 'occasion_templates');

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Check occasion templates
SELECT * FROM occasion_templates;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'wardrobe-photos';

-- ================================================
-- INSTRUCTIONS:
-- 1. Run steps 1-2 to create tables and RLS policies
-- 2. Sign up a test user in your Android app
-- 3. Get the user UUID from auth.users table
-- 4. Replace 'YOUR_USER_UUID' in steps 4-6
-- 5. Uncomment and run steps 4-6 for test data
-- 6. Create storage bucket via Dashboard if needed
-- 7. Create Edge Functions via Dashboard
-- ================================================
