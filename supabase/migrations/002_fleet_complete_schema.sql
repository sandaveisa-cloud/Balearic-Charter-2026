-- ============================================================================
-- Migration 002: Fleet Complete Schema
-- ============================================================================
-- Created: 2026-01-24
-- Description: Ensures all fleet columns exist for FleetEditor component
--              Fixes 500 errors when saving fleet data
-- ============================================================================

-- Core columns
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS cabins INTEGER,
ADD COLUMN IF NOT EXISTS toilets INTEGER,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb;

-- Pricing columns
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS apa_percentage DECIMAL(5, 2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS crew_service_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 21.00;

-- i18n description columns
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT,
ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS short_description_i18n JSONB DEFAULT '{}'::jsonb;

-- Boat & refit columns
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS boat_name TEXT,
ADD COLUMN IF NOT EXISTS recently_refitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refit_details TEXT;

-- Visibility columns
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT true;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fleet_extras ON fleet USING GIN (extras);
CREATE INDEX IF NOT EXISTS idx_fleet_amenities ON fleet USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_fleet_technical_specs ON fleet USING GIN (technical_specs);
CREATE INDEX IF NOT EXISTS idx_fleet_show_on_home ON fleet (show_on_home) WHERE show_on_home = true;
CREATE INDEX IF NOT EXISTS idx_fleet_recently_refitted ON fleet (recently_refitted) WHERE recently_refitted = true;

-- ============================================================================
-- MIGRATION 002 COMPLETE
-- ============================================================================
