-- ============================================================================
-- Ensure All i18n Columns Exist
-- ============================================================================
-- This migration ensures all tables have the required i18n columns
-- Run this in Supabase SQL Editor to add any missing columns

-- ============================================================================
-- 1. Culinary Experiences (if migration 005 wasn't run)
-- ============================================================================
ALTER TABLE culinary_experiences 
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Migrate existing data
UPDATE culinary_experiences
SET 
  title_en = COALESCE(title_en, title),
  description_en = COALESCE(description_en, description)
WHERE title_en IS NULL OR description_en IS NULL;

-- ============================================================================
-- 2. Destinations (ensure all columns exist)
-- ============================================================================
ALTER TABLE destinations 
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Migrate existing data
UPDATE destinations
SET 
  description_en = COALESCE(description_en, description)
WHERE description_en IS NULL AND description IS NOT NULL;

-- ============================================================================
-- 3. Fleet (ensure all columns exist - should already be there from migration 004)
-- ============================================================================
ALTER TABLE fleet 
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS short_description_en TEXT,
  ADD COLUMN IF NOT EXISTS short_description_es TEXT,
  ADD COLUMN IF NOT EXISTS short_description_de TEXT,
  ADD COLUMN IF NOT EXISTS tagline_en TEXT,
  ADD COLUMN IF NOT EXISTS tagline_es TEXT,
  ADD COLUMN IF NOT EXISTS tagline_de TEXT;

-- Migrate existing data
UPDATE fleet
SET 
  description_en = COALESCE(description_en, description),
  short_description_en = COALESCE(short_description_en, short_description)
WHERE (description_en IS NULL AND description IS NOT NULL) 
   OR (short_description_en IS NULL AND short_description IS NOT NULL);

-- ============================================================================
-- 4. Journey Milestones (ensure all columns exist)
-- ============================================================================
ALTER TABLE journey_milestones 
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT;

-- ============================================================================
-- Verification Query (run this to check all columns exist)
-- ============================================================================
-- SELECT 
--   table_name,
--   column_name,
--   data_type
-- FROM information_schema.columns
-- WHERE table_name IN ('culinary_experiences', 'destinations', 'fleet', 'journey_milestones')
--   AND column_name LIKE '%_en' OR column_name LIKE '%_es' OR column_name LIKE '%_de'
-- ORDER BY table_name, column_name;
