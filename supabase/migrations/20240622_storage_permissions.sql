-- Ensure wardrobe-photos bucket exists and has correct RLS policies
-- Note: This SQL should be run in the Supabase Dashboard SQL Editor if not using CLI migrations

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-photos', 'wardrobe-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read files (necessary for displaying in WebView)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'wardrobe-photos' );

-- 3. Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'wardrobe-photos' );

-- 4. Allow users to manage their own files (delete/update)
CREATE POLICY "User Manage Own Files"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'wardrobe-photos' AND (storage.foldername(name))[1] = auth.uid()::text );

-- 5. Special policy for onboarding (anonymous/unauthenticated upload)
-- WARNING: Use with caution in production. For onboarding without account,
-- we allow inserts but files are "orphaned" until linked.
CREATE POLICY "Onboarding Upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK ( bucket_id = 'wardrobe-photos' );
