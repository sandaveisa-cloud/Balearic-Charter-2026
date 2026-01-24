-- ============================================================================
-- Migration 004: Add Missing Fleet Columns
-- ============================================================================
-- Created: 2026-01-24
-- Description: Adds all columns that might be missing from the fleet table
--              to fix 500 errors during save operations
-- ============================================================================

-- Short description i18n columns (CRITICAL - these were missing!)
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS short_description_en TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS short_description_es TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS short_description_de TEXT;

-- Refit details (may be missing)
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS refit_details TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS refit_year INTEGER;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS recently_refitted BOOLEAN DEFAULT false;

-- Technical specifications (individual columns)
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS engines TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS fuel_capacity INTEGER;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS water_capacity INTEGER;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS cruising_speed DECIMAL(5, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS max_speed DECIMAL(5, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS beam DECIMAL(5, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS draft DECIMAL(5, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb;

-- Pricing columns (both naming conventions)
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS low_season_price DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS medium_season_price DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS high_season_price DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS price_low_season DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS price_mid_season DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS price_high_season DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS price_per_day DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS price_per_week DECIMAL(10, 2);
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Fee columns
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS apa_percentage DECIMAL(5, 2) DEFAULT 30.00;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS crew_service_fee DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 21.00;

-- Description columns
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS description_es TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS description_de TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}'::jsonb;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS short_description_i18n JSONB DEFAULT '{}'::jsonb;

-- Image columns
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Features columns
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}'::jsonb;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::jsonb;

-- Visibility columns
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT true;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Specification columns
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS toilets INTEGER;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS crew_count INTEGER;

-- Refresh schema cache so PostgREST picks up the new columns
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- MIGRATION 004 COMPLETE
-- ============================================================================
-- After running this, go to Supabase Dashboard → Settings → API → Reload Schema Cache
-- ============================================================================
