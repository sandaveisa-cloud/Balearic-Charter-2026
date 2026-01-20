-- Fleet Management Upgrade: Technical Specs & Amenities
-- This migration adds new fields for detailed technical specifications and amenities

-- Add new columns to fleet table
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS cabins INTEGER,
ADD COLUMN IF NOT EXISTS toilets INTEGER,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}';

-- Update technical_specs JSONB structure to include length, beam, draft
-- Note: The length column already exists, but we'll also store it in technical_specs for consistency
-- The technical_specs JSONB can now include: length, beam, draft, engines, etc.

-- Example: Update existing records to have amenities structure
-- This is optional and can be done manually in the admin panel
UPDATE fleet 
SET amenities = '{}'::jsonb 
WHERE amenities IS NULL;

-- Create index for amenities queries (if needed for filtering)
CREATE INDEX IF NOT EXISTS idx_fleet_amenities ON fleet USING GIN (amenities);

-- Add comments for documentation
COMMENT ON COLUMN fleet.cabins IS 'Number of cabins on the yacht';
COMMENT ON COLUMN fleet.toilets IS 'Number of toilets/bathrooms on the yacht';
COMMENT ON COLUMN fleet.amenities IS 'JSONB object with boolean flags for amenities: ac, watermaker, generator, flybridge, heating, teak_deck, full_batten, folding_table, fridge, dinghy, water_entertainment';
