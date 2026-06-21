# Database Test Setup Guide

## Overview
This guide explains how to set up your Supabase database for testing the YourClothes Android app connection.

## Prerequisites
- Supabase project created (your project: lqttwjkmzrlqolapcsol)
- Supabase Dashboard access
- SQL Editor access in Supabase

## Step-by-Step Setup

### Step 1: Database Schema Setup

#### Option A: Full Setup (Recommended for new projects)
Run the complete setup script `TEST_DATA_SETUP.sql`:

1. Open Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire content of `TEST_DATA_SETUP.sql`
5. **Skip steps 4-6** (test user data) - we'll do that after sign-up
6. Run steps 1-3 and 7-8 (tables, RLS, storage)

#### Option B: Quick Setup (If tables already exist)
1. Check if tables exist:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```
2. If tables exist, skip to **Step 2: User Sign-Up**

### Step 2: Sign Up Test User

1. Run the Android app with your configured credentials
2. Complete the onboarding flow
3. Sign up with a test email/password
4. Complete the onboarding (or skip AI analysis)

### Step 3: Get User ID

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query to get your user ID:
```sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 1;
```
3. Copy the UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Step 4: Add Test Data

#### Option A: Use Quick Test Script
1. Open `QUICK_TEST_DATA.sql`
2. Replace `YOUR_USER_ID_HERE` with your actual UUID
3. Copy the modified script
4. Run it in Supabase SQL Editor
5. Follow the inline comments for item linking

#### Option B: Manual Test Data Entry
Run these queries one by one:

**Create Profile:**
```sql
INSERT INTO profiles (id, first_name, last_name, date_of_birth, body_shape, skin_undertone, color_season, onboarding_completed)
VALUES (
    'YOUR_USER_ID',
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
```

**Add Wardrobe Items:**
```sql
INSERT INTO wardrobe_items (user_id, image_url, category, color, style, fabric, laundry_status, times_worn) VALUES
    ('YOUR_USER_ID', 'https://via.placeholder.com/400x400/2196F3/FFFFFF?text=Blauw+T-shirt', 'T-shirts', 'Blauw', 'Casual', 'Katoen', 'clean', 5),
    ('YOUR_USER_ID', 'https://via.placeholder.com/400x400/1976D2/FFFFFF?text=Donkere+Jeans', 'Jeans', 'Blauw', 'Casual', 'Denim', 'clean', 3),
    ('YOUR_USER_ID', 'https://via.placeholder.com/400x400/FFFFFF/000000?text=Witte+Sneakers', 'Schoenen', 'Wit', 'Sportief', 'Canvas', 'clean', 10);
```

**Add Planned Outfits:**
```sql
INSERT INTO planned_outfits (user_id, date, occasion, notes, weather_condition) VALUES
    ('YOUR_USER_ID', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'), 'Business', 'Werk dag', 'Zonnig'),
    ('YOUR_USER_ID', TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYY-MM-DD'), 'Casual', 'Vrije dag', 'Bewolkt');
```

### Step 5: Storage Bucket Setup

#### Create Storage Bucket via Dashboard:
1. Go to **Storage** in Supabase Dashboard
2. Click **Create a new bucket**
3. Name it: `wardrobe-photos`
4. Make it **Public**
5. Click **Create bucket**

#### Alternative: Create via SQL:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES
('wardrobe-photos', 'wardrobe-photos', true)
ON CONFLICT (id) DO NOTHING;
```

### Step 6: Edge Functions Setup

#### Create Edge Functions via Dashboard:
1. Go to **Edge Functions** in Supabase Dashboard
2. Click **New Edge Function**
3. Create function `user-analyzer`
4. Create function `clothing-analyzer`

**user-analyzer function template:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { firstName, lastName, dateOfBirth, fullBodyImageUrl } = await req.json()
    
    // Mock AI analysis for testing
    const result = {
      bodyShape: "Hourglass",
      skinUndertone: "Warm",
      colorSeason: "Spring"
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

**clothing-analyzer function template:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { imageUrl } = await req.json()
    
    // Mock AI analysis for testing
    const result = {
      category: "T-shirts",
      color: "Blauw",
      style: "Casual",
      fabric: "Katoen"
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

## Verification

### Check Database Schema
```sql
SELECT 
    tablename as table_name
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'wardrobe_items', 'planned_outfits', 'outfit_items', 'occasion_templates');
```

### Check RLS Policies
```sql
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public';
```

### Check Test Data
```sql
-- Check profile
SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- Check wardrobe items
SELECT COUNT(*) as wardrobe_count FROM wardrobe_items WHERE user_id = 'YOUR_USER_ID';

-- Check planned outfits
SELECT COUNT(*) as outfit_count FROM planned_outfits WHERE user_id = 'YOUR_USER_ID';

-- Check occasion templates
SELECT * FROM occasion_templates;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'wardrobe-photos';
```

## Test the App Connection

### 1. Authentication Test
- Open the Android app
- Try to sign in with your test user
- Verify successful login
- Check that onboarding works

### 2. Wardrobe Test
- Navigate to the "Kast" tab
- Verify test items appear
- Try uploading a new photo
- Check that AI analysis works (or shows error if Edge Functions not set up)

### 3. Planner Test
- Navigate to the "Planner" tab
- Verify test outfits appear
- Try creating a new outfit
- Try editing an existing outfit
- Try deleting an outfit
- Test week navigation

### 4. Settings Test
- Navigate to the "Profiel" tab
- Try changing the theme
- Try changing the color scheme
- Verify settings persist

## Common Issues & Solutions

### Issue: Permission Denied
**Error:** `permission denied for table profiles`
**Solution:** Ensure RLS policies are set up correctly. Re-run the RLS section of `TEST_DATA_SETUP.sql`.

### Issue: User Not Found
**Error:** `User not found in profiles table`
**Solution:** Make sure you created the profile entry with the correct user UUID from auth.users.

### Issue: Storage Access Denied
**Error:** `permission denied for storage.objects`
**Solution:** Create storage bucket and set up storage policies as shown in Step 5.

### Issue: Edge Function Not Found
**Error:** `Edge function not found`
**Solution:** Create the required Edge Functions (user-analyzer, clothing-analyzer) in Supabase Dashboard.

### Issue: Connection Timeout
**Error:** `Connection timeout to Supabase`
**Solution:** Check your internet connection and verify that SUPABASE_URL is correct in `local.properties`.

## Database Schema Reference

### Tables

#### **profiles**
- `id` (UUID, PRIMARY KEY) - User ID from auth.users
- `first_name` (TEXT) - User's first name
- `last_name` (TEXT) - User's last name
- `date_of_birth` (DATE) - User's date of birth
- `body_shape` (TEXT) - AI-determined body shape
- `skin_undertone` (TEXT) - AI-determined skin undertone
- `color_season` (TEXT) - AI-determined color season
- `onboarding_completed` (BOOLEAN) - Onboarding completion status
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

#### **wardrobe_items**
- `id` (UUID, PRIMARY KEY) - Item ID
- `user_id` (UUID, FOREIGN KEY) - Reference to profiles.id
- `image_url` (TEXT) - URL to image in storage
- `category` (TEXT) - Item category (T-shirts, Jeans, etc.)
- `color` (TEXT) - Item color
- `style` (TEXT) - Item style (Casual, Business, etc.)
- `fabric` (TEXT) - Item fabric type
- `laundry_status` (TEXT) - Clean/Dirty status
- `times_worn` (INTEGER) - Number of times worn
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

#### **planned_outfits**
- `id` (UUID, PRIMARY KEY) - Outfit ID
- `user_id` (UUID, FOREIGN KEY) - Reference to profiles.id
- `date` (TEXT) - Planned date (ISO format)
- `occasion` (TEXT) - Occasion type
- `notes` (TEXT) - Personal notes
- `weather_condition` (TEXT) - Weather condition
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

#### **outfit_items**
- `outfit_id` (UUID, FOREIGN KEY) - Reference to planned_outfits.id
- `item_id` (UUID, FOREIGN KEY) - Reference to wardrobe_items.id
- PRIMARY KEY (outfit_id, item_id)

#### **occasion_templates**
- `id` (UUID, PRIMARY KEY) - Template ID
- `name` (TEXT, UNIQUE) - Occasion name
- `description` (TEXT) - Occasion description
- `suggested_categories` (TEXT[]) - Suggested clothing categories
- `created_at` (TIMESTAMP) - Creation timestamp

## Clean Up (Optional)

### Remove Test Data
```sql
-- Delete test data (be careful!)
DELETE FROM outfit_items WHERE outfit_id IN (SELECT id FROM planned_outfits WHERE user_id = 'YOUR_USER_ID');
DELETE FROM planned_outfits WHERE user_id = 'YOUR_USER_ID';
DELETE FROM wardrobe_items WHERE user_id = 'YOUR_USER_ID';
DELETE FROM profiles WHERE id = 'YOUR_USER_ID';
-- Delete user from auth (careful!)
-- DELETE FROM auth.users WHERE id = 'YOUR_USER_ID';
```

## Next Steps

1. ✅ **Database Setup** - Complete schema and RLS setup
2. ✅ **Test Data** - Add test user and sample data
3. ✅ **Storage Setup** - Create wardrobe-photos bucket
4. ✅ **Edge Functions** - Create AI analysis functions
5. 🎯 **Test App** - Run Android app and verify all features work
6. 🎯 **Production** - Remove test data and go live

## Support

If you encounter any issues:
1. Check Supabase logs in Dashboard
2. Verify database connection in local.properties
3. Ensure all tables have proper RLS policies
4. Check that storage bucket exists and is public
5. Verify Edge Functions are deployed

The test data setup should enable you to fully test all Android app features including authentication, wardrobe management, outfit planning, and settings customization.
