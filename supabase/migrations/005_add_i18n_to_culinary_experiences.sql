-- ============================================================================
-- Add i18n columns to culinary_experiences table
-- ============================================================================
-- This migration adds localized title and description fields to support
-- English, Spanish, and German translations directly in the database

ALTER TABLE culinary_experiences 
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Migrate existing data: copy title/description to title_en/description_en
UPDATE culinary_experiences
SET 
  title_en = COALESCE(title_en, title),
  description_en = COALESCE(description_en, description)
WHERE title_en IS NULL OR description_en IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN culinary_experiences.title_en IS 'English title';
COMMENT ON COLUMN culinary_experiences.title_es IS 'Spanish title (Título en español)';
COMMENT ON COLUMN culinary_experiences.title_de IS 'German title (Deutscher Titel)';
COMMENT ON COLUMN culinary_experiences.description_en IS 'English description';
COMMENT ON COLUMN culinary_experiences.description_es IS 'Spanish description (Descripción en español)';
COMMENT ON COLUMN culinary_experiences.description_de IS 'German description (Deutsche Beschreibung)';
