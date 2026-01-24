-- ============================================================================
-- Fleet Table Complete Schema Migration
-- ============================================================================
-- This migration ensures all fleet columns exist for the FleetEditor component.
-- Run this in Supabase SQL Editor to fix 500 errors when saving fleet data.
-- This script is idempotent - safe to run multiple times.
-- ============================================================================

-- ============================================================================
-- PART 1: Core Fleet Columns
-- ============================================================================

-- Ensure cabins and toilets columns exist
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS cabins INTEGER,
ADD COLUMN IF NOT EXISTS toilets INTEGER;

-- Ensure amenities JSONB column exists
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}'::jsonb;

-- Ensure extras JSONB array column exists
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::jsonb;

-- Ensure technical_specs JSONB column exists (for beam, draft, engines, etc.)
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- PART 2: Pricing Columns
-- ============================================================================

ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS apa_percentage DECIMAL(5, 2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS crew_service_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 21.00;

-- ============================================================================
-- PART 3: i18n Description Columns
-- ============================================================================

ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Add JSONB columns for short descriptions (per locale)
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS short_description_i18n JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- PART 4: Boat & Refit Columns
-- ============================================================================

ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS boat_name TEXT,
ADD COLUMN IF NOT EXISTS recently_refitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refit_details TEXT;

-- ============================================================================
-- PART 5: Visibility Column (show_on_home)
-- ============================================================================

ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT true;

-- ============================================================================
-- PART 6: Add Column Comments
-- ============================================================================

COMMENT ON COLUMN fleet.cabins IS 'Number of cabins on the yacht';
COMMENT ON COLUMN fleet.toilets IS 'Number of toilets/bathrooms on the yacht';
COMMENT ON COLUMN fleet.amenities IS 'JSONB object with boolean flags for amenities';
COMMENT ON COLUMN fleet.extras IS 'JSONB array of extra features/services';
COMMENT ON COLUMN fleet.technical_specs IS 'JSONB object with technical specifications: beam, draft, engines, fuel_capacity, water_capacity, cruising_speed, max_speed';
COMMENT ON COLUMN fleet.apa_percentage IS 'Advance Provisioning Allowance percentage';
COMMENT ON COLUMN fleet.crew_service_fee IS 'Fixed crew service fee in currency';
COMMENT ON COLUMN fleet.cleaning_fee IS 'Fixed cleaning fee in currency';
COMMENT ON COLUMN fleet.tax_percentage IS 'Tax (IVA) percentage';
COMMENT ON COLUMN fleet.description_en IS 'English description';
COMMENT ON COLUMN fleet.description_es IS 'Spanish description';
COMMENT ON COLUMN fleet.description_de IS 'German description';
COMMENT ON COLUMN fleet.description_i18n IS 'Multi-language descriptions: {"en": "...", "es": "...", "de": "..."}';
COMMENT ON COLUMN fleet.short_description_i18n IS 'Multi-language short descriptions';
COMMENT ON COLUMN fleet.boat_name IS 'Official name of the boat';
COMMENT ON COLUMN fleet.recently_refitted IS 'Whether the boat was recently refitted';
COMMENT ON COLUMN fleet.refit_details IS 'Description of refit work';
COMMENT ON COLUMN fleet.show_on_home IS 'Whether to show this yacht on the homepage';

-- ============================================================================
-- PART 7: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_fleet_extras ON fleet USING GIN (extras);
CREATE INDEX IF NOT EXISTS idx_fleet_amenities ON fleet USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_fleet_technical_specs ON fleet USING GIN (technical_specs);
CREATE INDEX IF NOT EXISTS idx_fleet_show_on_home ON fleet (show_on_home) WHERE show_on_home = true;
CREATE INDEX IF NOT EXISTS idx_fleet_recently_refitted ON fleet (recently_refitted) WHERE recently_refitted = true;

-- ============================================================================
-- PART 8: Verify columns exist (run this SELECT to check)
-- ============================================================================

-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'fleet' 
-- ORDER BY ordinal_position;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All fleet columns should now exist. Try saving a yacht in the admin panel.
-- ============================================================================
