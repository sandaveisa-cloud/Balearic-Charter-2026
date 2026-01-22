-- ============================================================================
-- Update Fleet Prices Migration
-- ============================================================================
-- Updates pricing for Simona and Wide Dream yachts
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Update Simona prices
UPDATE fleet
SET 
  low_season_price = 750,
  medium_season_price = 1100,
  high_season_price = 2000,
  updated_at = NOW()
WHERE slug = 'simona';

-- Update Wide Dream prices
UPDATE fleet
SET 
  low_season_price = 950,
  medium_season_price = 1300,
  high_season_price = 2400,
  updated_at = NOW()
WHERE slug = 'wide-dream';

-- Verify updates
SELECT 
  slug,
  name,
  low_season_price,
  medium_season_price,
  high_season_price,
  updated_at
FROM fleet
WHERE slug IN ('simona', 'wide-dream')
ORDER BY slug;
