-- Quick Test Data Setup (After User Sign-Up)
-- ================================================
-- Use this script AFTER you have signed up a test user in the app
-- ================================================

-- Step 1: Get your user ID
-- Run this first and copy the UUID:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Step 2: Replace 'YOUR_USER_ID_HERE' with your actual UUID from step 1
-- Then run the following:

-- Create test profile
INSERT INTO profiles (id, first_name, last_name, date_of_birth, body_shape, skin_undertone, color_season, onboarding_completed)
VALUES (
    'YOUR_USER_ID_HERE',
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

-- Step 3: Add test wardrobe items
INSERT INTO wardrobe_items (user_id, image_url, category, color, style, fabric, laundry_status, times_worn) VALUES
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/2196F3/FFFFFF?text=Blauw+T-shirt', 'T-shirts', 'Blauw', 'Casual', 'Katoen', 'clean', 5),
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/1976D2/FFFFFF?text=Donkere+Jeans', 'Jeans', 'Blauw', 'Casual', 'Denim', 'clean', 3),
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/FFFFFF/000000?text=Witte+Sneakers', 'Schoenen', 'Wit', 'Sportief', 'Canvas', 'clean', 10),
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/F44336/FFFFFF?text=Rode+Jurk', 'Jurken', 'Rood', 'Formeel', 'Zijde', 'clean', 2),
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Zwarte+Jas', 'Jassen', 'Zwart', 'Casual', 'Leder', 'clean', 7),
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/9E9E9E/FFFFFF?text=Grijze+Broek', 'Broeken', 'Grijs', 'Business', 'Wol', 'clean', 4),
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/FFFFFF/000000?text=Wit+Overhemd', 'Overhemden', 'Wit', 'Business', 'Linnen', 'clean', 6),
    ('YOUR_USER_ID_HERE', 'https://via.placeholder.com/400x400/212121/FFFFFF?text=Zwarte+Rok', 'Roken', 'Zwart', 'Feest', 'Satijn', 'clean', 1);

-- Step 4: Create test planned outfits for this week
INSERT INTO planned_outfits (user_id, date, occasion, notes, weather_condition) VALUES
    ('YOUR_USER_ID_HERE', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'), 'Business', 'Werk dag', 'Zonnig'),
    ('YOUR_USER_ID_HERE', TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYY-MM-DD'), 'Casual', 'Vrije dag', 'Bewolkt'),
    ('YOUR_USER_ID_HERE', TO_CHAR(CURRENT_DATE + INTERVAL '2 days', 'YYYY-MM-DD'), 'Sport', 'Training', 'Helder');

-- Step 5: Link items to outfits (get the IDs first)
-- Get outfit IDs:
SELECT id, date, occasion FROM planned_outfits WHERE user_id = 'YOUR_USER_ID_HERE';

-- Get item IDs:
SELECT id, category, color FROM wardrobe_items WHERE user_id = 'YOUR_USER_ID_HERE';

-- Then manually link items (replace with actual UUIDs):
-- Example:
-- INSERT INTO outfit_items (outfit_id, item_id) VALUES
--     ('outfit-uuid-1', 'item-uuid-1'),
--     ('outfit-uuid-1', 'item-uuid-2'),
--     ('outfit-uuid-2', 'item-uuid-3'),
--     ('outfit-uuid-3', 'item-uuid-4');

-- Step 6: Verify test data
SELECT 'Profiles:' as section, COUNT(*) as count FROM profiles WHERE id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'Wardrobe Items:', COUNT(*) FROM wardrobe_items WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL  
SELECT 'Planned Outfits:', COUNT(*) FROM planned_outfits WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'Occasion Templates:', COUNT(*) FROM occasion_templates;

-- ================================================
-- INSTRUCTIONS:
-- 1. Copy the first SELECT query and run it
-- 2. Replace 'YOUR_USER_ID_HERE' with your actual UUID
-- 3. Uncomment and run all INSERT statements
-- 4. Verify data with the final SELECT query
-- 5. Test the Android app with this data
-- ================================================
