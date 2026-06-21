-- Expand profiles table with more user details
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS location text;

-- Add a comment for better documentation
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
