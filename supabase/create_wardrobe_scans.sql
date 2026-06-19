-- Create table to cache clothing scanner results
CREATE TABLE IF NOT EXISTS wardrobe_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text UNIQUE NOT NULL,
  response_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Recommended index for lookups
CREATE INDEX IF NOT EXISTS idx_wardrobe_scans_image_url ON wardrobe_scans (image_url);
