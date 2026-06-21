-- Create wardrobe_items table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  color text,
  style text,
  fabric text,
  brand text,
  cost numeric DEFAULT 0,
  times_worn int DEFAULT 0,
  last_worn timestamptz,
  laundry_status text DEFAULT 'clean' CHECK (laundry_status IN ('clean', 'dirty', 'washing')),
  created_at timestamptz DEFAULT now()
);

-- Create planned_outfits table
CREATE TABLE IF NOT EXISTS public.planned_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  occasion text,
  weather_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Junction table for items in an outfit
CREATE TABLE IF NOT EXISTS public.outfit_items (
  outfit_id uuid REFERENCES public.planned_outfits ON DELETE CASCADE,
  item_id uuid REFERENCES public.wardrobe_items ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, item_id)
);

-- Enable RLS
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own wardrobe" ON public.wardrobe_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own outfits" ON public.planned_outfits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own outfit items" ON public.outfit_items FOR ALL
USING (EXISTS (SELECT 1 FROM public.planned_outfits WHERE id = outfit_id AND user_id = auth.uid()));

-- Indexing
CREATE INDEX idx_wardrobe_user ON public.wardrobe_items(user_id);
CREATE INDEX idx_outfits_user_date ON public.planned_outfits(user_id, date);
