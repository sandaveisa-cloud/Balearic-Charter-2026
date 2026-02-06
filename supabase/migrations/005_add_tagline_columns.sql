-- ============================================================================
-- Migration 005: Add Tagline Columns to Fleet Table
-- ============================================================================
-- Created: 2026-01-XX
-- Description: Adds tagline columns for multi-language support (en, es, de)
--              Taglines are short marketing phrases displayed on yacht detail pages
-- ============================================================================

-- Add tagline columns for each language
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS tagline_en TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS tagline_es TEXT;
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS tagline_de TEXT;

-- Add JSONB column for tagline i18n (for future flexibility)
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS tagline_i18n JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN fleet.tagline_en IS 'English tagline - short marketing phrase for the yacht';
COMMENT ON COLUMN fleet.tagline_es IS 'Spanish tagline - short marketing phrase for the yacht';
COMMENT ON COLUMN fleet.tagline_de IS 'German tagline - short marketing phrase for the yacht';
COMMENT ON COLUMN fleet.tagline_i18n IS 'Multi-language taglines: {"en": "...", "es": "...", "de": "..."}';

-- Refresh schema cache so PostgREST picks up the new columns
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- MIGRATION 005 COMPLETE
-- ============================================================================
-- After running this, go to Supabase Dashboard → Settings → API → Reload Schema Cache
-- ============================================================================
