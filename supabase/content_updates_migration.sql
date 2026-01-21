-- ============================================================================
-- Content Updates Migration
-- ============================================================================
-- This migration updates:
-- 1. Simona yacht details (year, amenities)
-- 2. Destinations content (Mallorca, Ibiza & Formentera, Costa Blanca)
-- 3. Culinary experiences (3 specific options)
-- ============================================================================
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: UPDATE SIMONA YACHT DETAILS
-- ============================================================================

-- Update Simona's year to 2014
UPDATE fleet
SET year = 2014
WHERE slug = 'simona' AND (year IS NULL OR year != 2014);

-- Update Simona's amenities
-- Note: amenities is a JSONB column with boolean flags
-- Merge with existing amenities to preserve other values
UPDATE fleet
SET amenities = COALESCE(amenities, '{}'::jsonb) || jsonb_build_object(
  'flybridge', true,
  'sunbathing_deck', true,
  'paddleboards', true,
  'snorkeling_gear', true,
  'dinghy', true,
  'ac', true,
  'premium_sound_system', true
),
updated_at = NOW()
WHERE slug = 'simona';

-- Also update extras array (for display purposes)
-- Note: extras is a JSONB array column
UPDATE fleet
SET extras = '["Spacious Flybridge", "Sunbathing Deck", "Paddleboards (SUP)", "Snorkeling Gear", "Dinghy for Beach Access", "Air Conditioning", "Premium Sound System"]'::jsonb,
updated_at = NOW()
WHERE slug = 'simona';

-- ============================================================================
-- PART 2: UPDATE DESTINATIONS CONTENT
-- ============================================================================

-- Update Mallorca description
-- Note: destinations table supports both description and description_en/description_es/description_de
-- Supports both 'name' and 'title' fields (name is primary, title is legacy)
UPDATE destinations
SET 
  description = 'Discover hidden calas and the vibrant culture of Palma.',
  description_en = 'Discover hidden calas and the vibrant culture of Palma.',
  description_es = 'Descubre calas ocultas y la vibrante cultura de Palma.',
  description_de = 'Entdecken Sie versteckte Buchten und die lebendige Kultur von Palma.',
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(name, title, '')) = 'mallorca' 
  OR LOWER(COALESCE(slug, '')) = 'mallorca'
)
  AND is_active = true;

-- Update Ibiza description
UPDATE destinations
SET 
  description = 'Experience world-famous beach clubs and crystal-clear turquoise waters.',
  description_en = 'Experience world-famous beach clubs and crystal-clear turquoise waters.',
  description_es = 'Experimenta los famosos clubes de playa y las aguas turquesas cristalinas.',
  description_de = 'Erleben Sie weltberühmte Strandclubs und kristallklares türkisfarbenes Wasser.',
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(name, title, '')) = 'ibiza' 
  OR LOWER(COALESCE(slug, '')) = 'ibiza'
)
  AND is_active = true;

-- Update Formentera description
UPDATE destinations
SET 
  description = 'Experience world-famous beach clubs and crystal-clear turquoise waters.',
  description_en = 'Experience world-famous beach clubs and crystal-clear turquoise waters.',
  description_es = 'Experimenta los famosos clubes de playa y las aguas turquesas cristalinas.',
  description_de = 'Erleben Sie weltberühmte Strandclubs und kristallklares türkisfarbenes Wasser.',
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(name, title, '')) = 'formentera' 
  OR LOWER(COALESCE(slug, '')) = 'formentera'
)
  AND is_active = true;

-- Update Costa Blanca description (Denia/Javea)
UPDATE destinations
SET 
  description = 'Stunning coastline views, perfect for day trips and sunset cruises.',
  description_en = 'Stunning coastline views, perfect for day trips and sunset cruises.',
  description_es = 'Vistas impresionantes de la costa, perfectas para excursiones de un día y cruceros al atardecer.',
  description_de = 'Atemberaubende Küstenblicke, perfekt für Tagesausflüge und Sonnenuntergangskreuzfahrten.',
  updated_at = NOW()
WHERE (
  LOWER(COALESCE(name, title, '')) LIKE '%costa blanca%' 
  OR LOWER(COALESCE(slug, '')) LIKE '%costa-blanca%'
  OR LOWER(COALESCE(name, title, '')) LIKE '%denia%' 
  OR LOWER(COALESCE(name, title, '')) LIKE '%javea%'
)
  AND is_active = true;

-- ============================================================================
-- PART 3: UPDATE CULINARY EXPERIENCES
-- ============================================================================

-- Delete existing culinary experiences to start fresh (optional - comment out if you want to keep existing ones)
-- DELETE FROM culinary_experiences;

-- Update or Insert: Authentic Paella
-- First, try to update existing entry with matching title
UPDATE culinary_experiences
SET 
  description = 'Freshly cooked onboard using local seafood and traditional saffron recipes.',
  order_index = 1,
  is_active = true,
  updated_at = NOW()
WHERE LOWER(title) = 'authentic paella';

-- If no row was updated, insert new one
INSERT INTO culinary_experiences (title, description, order_index, is_active)
SELECT 
  'Authentic Paella',
  'Freshly cooked onboard using local seafood and traditional saffron recipes.',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM culinary_experiences WHERE LOWER(title) = 'authentic paella'
);

-- Update or Insert: Premium BBQ & Steaks
UPDATE culinary_experiences
SET 
  description = 'High-quality cuts grilled to perfection on the open deck.',
  order_index = 2,
  is_active = true,
  updated_at = NOW()
WHERE LOWER(title) IN ('premium bbq & steaks', 'premium steaks', 'premium bbq');

-- If no row was updated, insert new one
INSERT INTO culinary_experiences (title, description, order_index, is_active)
SELECT 
  'Premium BBQ & Steaks',
  'High-quality cuts grilled to perfection on the open deck.',
  2,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM culinary_experiences WHERE LOWER(title) IN ('premium bbq & steaks', 'premium steaks', 'premium bbq')
);

-- Update or Insert: Local Tapas & Wines
-- Update existing entries that match tapas or wines (update first matching one)
UPDATE culinary_experiences
SET 
  title = 'Local Tapas & Wines',
  description = 'A curated selection of Spanish cheeses, hams, and regional wines.',
  order_index = 3,
  is_active = true,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM culinary_experiences 
  WHERE (LOWER(title) LIKE '%tapas%' OR LOWER(title) LIKE '%wines%')
  LIMIT 1
);

-- If no row was updated, insert new one
INSERT INTO culinary_experiences (title, description, order_index, is_active)
SELECT 
  'Local Tapas & Wines',
  'A curated selection of Spanish cheeses, hams, and regional wines.',
  3,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM culinary_experiences 
  WHERE LOWER(title) = 'local tapas & wines' 
     OR (LOWER(title) LIKE '%tapas%' AND LOWER(title) LIKE '%wines%')
);

-- Deactivate old culinary experiences that are not in the new list
-- (Optional - uncomment if you want to hide old entries)
-- UPDATE culinary_experiences
-- SET is_active = false
-- WHERE title NOT IN ('Authentic Paella', 'Premium BBQ & Steaks', 'Local Tapas & Wines')
--   AND is_active = true;

-- ============================================================================
-- PART 4: ADD 2 MORE POSITIVE REVIEWS
-- ============================================================================

-- Insert 2 additional generic positive reviews
INSERT INTO reviews (guest_name, guest_location, rating, review_text, is_featured, is_approved)
VALUES 
  (
    'David Anderson',
    'London, UK',
    5,
    'Amazing experience on Simona! The yacht exceeded all our expectations. The crew was incredibly professional and the destinations we visited were absolutely stunning. We will definitely be back!',
    true,
    true
  ),
  (
    'Sophie Laurent',
    'Paris, France',
    5,
    'Best paella ever! The culinary experience on board was outstanding. Fresh seafood, perfectly cooked, and served with such elegance. Combined with the beautiful Mediterranean views, this was an unforgettable journey.',
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - Run separately to verify)
-- ============================================================================

-- Verify Simona updates
-- SELECT name, year, amenities, extras FROM fleet WHERE slug = 'simona';

-- Verify destinations updates
-- SELECT name, title, slug, description, description_en FROM destinations WHERE is_active = true ORDER BY order_index;

-- Verify culinary experiences
-- SELECT title, description, order_index, is_active FROM culinary_experiences WHERE is_active = true ORDER BY order_index;

-- Verify reviews count
-- SELECT COUNT(*) as total_reviews, COUNT(*) FILTER (WHERE is_approved = true) as approved_reviews FROM reviews;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- ✅ Simona yacht: Year updated to 2014, amenities updated
-- ✅ Destinations: Mallorca, Ibiza, Formentera, Costa Blanca descriptions updated
-- ✅ Culinary: 3 experiences updated/inserted (Authentic Paella, Premium BBQ & Steaks, Local Tapas & Wines)
-- ============================================================================
