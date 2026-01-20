-- Add i18n columns to fleet table for multi-language support
-- This allows storing descriptions in multiple languages (en, es, de)

-- Add description_i18n as JSONB column
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}'::jsonb;

-- Add short_description_i18n as JSONB column
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS short_description_i18n JSONB DEFAULT '{}'::jsonb;

-- Add comments to explain the columns
COMMENT ON COLUMN fleet.description_i18n IS 'Multi-language descriptions: {"en": "...", "es": "...", "de": "..."}';
COMMENT ON COLUMN fleet.short_description_i18n IS 'Multi-language short descriptions: {"en": "...", "es": "...", "de": "..."}';

-- Create GIN indexes for better query performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_fleet_description_i18n 
ON fleet USING GIN (description_i18n);

CREATE INDEX IF NOT EXISTS idx_fleet_short_description_i18n 
ON fleet USING GIN (short_description_i18n);
