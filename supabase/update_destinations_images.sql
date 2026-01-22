-- ============================================================================
-- Update Destinations Images Migration
-- ============================================================================
-- This migration updates image URLs for existing destinations and ensures
-- Costa Blanca is properly configured with an Unsplash image.
-- ============================================================================
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: UPDATE EXISTING DESTINATIONS IMAGE URLS
-- ============================================================================

-- Update Ibiza image to dest-ibiza-es-vedra.jpg
UPDATE destinations
SET 
  image_urls = '["/images/dest-ibiza-es-vedra.jpg"]'::jsonb,
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(title, name, '')) = 'ibiza' 
  OR LOWER(COALESCE(slug, '')) = 'ibiza'
)
AND is_active = true;

-- Update Formentera image to formentera-calla.jpg
UPDATE destinations
SET 
  image_urls = '["/images/formentera-calla.jpg"]'::jsonb,
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(title, name, '')) = 'formentera' 
  OR LOWER(COALESCE(slug, '')) = 'formentera'
)
AND is_active = true;

-- Update Mallorca image to dest-mallorca-bay.jpg
UPDATE destinations
SET 
  image_urls = '["/images/dest-mallorca-bay.jpg"]'::jsonb,
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(title, name, '')) = 'mallorca' 
  OR LOWER(COALESCE(slug, '')) = 'mallorca'
)
AND is_active = true;

-- ============================================================================
-- PART 2: UPDATE/INSERT COSTA BLANCA DESTINATION
-- ============================================================================

-- First, try to update existing Costa Blanca entry
UPDATE destinations
SET 
  image_urls = '["https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1000"]'::jsonb,
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(title, name, '')) LIKE '%costa blanca%' 
  OR LOWER(COALESCE(slug, '')) LIKE '%costa-blanca%'
  OR LOWER(COALESCE(slug, '')) = 'costa-blanca'
)
AND is_active = true;

-- If no Costa Blanca exists, insert a new one
-- Check if slug column exists first (it should based on schema)
INSERT INTO destinations (title, description, description_en, description_es, description_de, image_urls, slug, order_index, is_active, region)
SELECT 
  'Costa Blanca',
  'The sun-drenched Costa Blanca offers golden beaches, vibrant marinas, and charming coastal towns along Spain''s eastern coast.',
  'The sun-drenched Costa Blanca offers golden beaches, vibrant marinas, and charming coastal towns along Spain''s eastern coast.',
  'La soleada Costa Blanca ofrece playas doradas, puertos deportivos vibrantes y encantadores pueblos costeros a lo largo de la costa este de España.',
  'Die sonnenverwöhnte Costa Blanca bietet goldene Strände, lebendige Yachthäfen und charmante Küstenstädte entlang der Ostküste Spaniens.',
  '["https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=1000"]'::jsonb,
  'costa-blanca',
  5,
  true,
  'Costa Blanca'
WHERE NOT EXISTS (
  SELECT 1 FROM destinations 
  WHERE (
    LOWER(COALESCE(title, name, '')) LIKE '%costa blanca%' 
    OR LOWER(COALESCE(slug, '')) LIKE '%costa-blanca%'
  )
  AND is_active = true
);

-- ============================================================================
-- VERIFICATION QUERIES (Optional - Run separately to verify)
-- ============================================================================

-- Verify all destination images are updated
-- SELECT 
--   title,
--   slug,
--   image_urls,
--   order_index
-- FROM destinations 
-- WHERE is_active = true 
-- ORDER BY order_index;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- ✅ Ibiza: Updated to /images/dest-ibiza-es-vedra.jpg
-- ✅ Formentera: Updated to /images/formentera-calla.jpg
-- ✅ Mallorca: Updated to /images/dest-mallorca-bay.jpg
-- ✅ Costa Blanca: Updated/Inserted with Unsplash image URL
-- ============================================================================
