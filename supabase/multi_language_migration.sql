-- ============================================================================
-- Multi-Language Support Migration for Fleet Table
-- ============================================================================
-- This migration converts the fleet.description and fleet.short_description
-- columns from TEXT to JSONB to support multiple languages (en, es, de).
-- ============================================================================

-- Step 1: Add new JSONB columns for multi-language descriptions
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS description_i18n JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS short_description_i18n JSONB DEFAULT '{}';

-- Step 2: Migrate existing data from TEXT to JSONB
-- This preserves existing descriptions in English
UPDATE fleet
SET 
  description_i18n = CASE 
    WHEN description IS NOT NULL THEN jsonb_build_object('en', description)
    ELSE '{}'::jsonb
  END,
  short_description_i18n = CASE 
    WHEN short_description IS NOT NULL THEN jsonb_build_object('en', short_description)
    ELSE '{}'::jsonb
  END
WHERE description IS NOT NULL OR short_description IS NOT NULL;

-- Step 3: Create helper functions to get localized content
CREATE OR REPLACE FUNCTION get_localized_description(
  description_json JSONB,
  locale TEXT DEFAULT 'en'
) RETURNS TEXT AS $$
BEGIN
  -- Try to get the requested locale, fallback to 'en', then to any available locale
  RETURN COALESCE(
    description_json->>locale,
    description_json->>'en',
    description_json->>jsonb_object_keys(description_json)::TEXT
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Create indexes for JSONB queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_fleet_description_i18n ON fleet USING GIN (description_i18n);
CREATE INDEX IF NOT EXISTS idx_fleet_short_description_i18n ON fleet USING GIN (short_description_i18n);

-- Step 5: (Optional) Keep old columns for backward compatibility during transition
-- You can drop them later after verifying everything works:
-- ALTER TABLE fleet DROP COLUMN description;
-- ALTER TABLE fleet DROP COLUMN short_description;

-- ============================================================================
-- Usage Examples:
-- ============================================================================
-- 
-- 1. Insert multi-language description:
--    INSERT INTO fleet (name, slug, description_i18n) VALUES (
--      'SIMONA',
--      'simona',
--      '{"en": "English description", "es": "Descripción en español", "de": "Deutsche Beschreibung"}'::jsonb
--    );
--
-- 2. Update description for a specific language:
--    UPDATE fleet 
--    SET description_i18n = jsonb_set(
--      COALESCE(description_i18n, '{}'::jsonb),
--      '{en}',
--      '"New English description"'::jsonb
--    )
--    WHERE slug = 'simona';
--
-- 3. Query with locale fallback:
--    SELECT 
--      name,
--      get_localized_description(description_i18n, 'es') as description
--    FROM fleet;
--
-- 4. Query specific language:
--    SELECT 
--      name,
--      description_i18n->>'es' as description_es
--    FROM fleet;
-- ============================================================================
