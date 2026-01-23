-- Add missing columns to destinations table
-- Run this in Supabase SQL Editor if columns don't exist

-- Add name column (if using name instead of just title)
ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Update name from title if name is null
UPDATE public.destinations 
SET name = title 
WHERE name IS NULL;

-- Add region column
ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS region TEXT;

-- Add slug column
ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add multi-language description columns
ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS description_es TEXT;

ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Add YouTube video URL column
ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS youtube_video_url TEXT;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.destinations(slug);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'destinations' 
ORDER BY ordinal_position;
