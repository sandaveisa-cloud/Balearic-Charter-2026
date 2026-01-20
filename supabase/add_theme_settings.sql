-- ============================================================================
-- Add Theme Settings to site_settings table
-- ============================================================================
-- This migration adds theme color settings that can be controlled from Admin Panel
-- ============================================================================

-- Insert default theme colors (luxury nautical palette)
INSERT INTO site_settings (key, value, updated_at) 
VALUES 
  ('theme_primary_color', '#1B263B', NOW()),
  ('theme_secondary_color', '#C5A059', NOW()),
  ('theme_background_color', '#FFFFFF', NOW())
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value, updated_at = NOW();

-- Verify the insert
SELECT key, value FROM site_settings 
WHERE key IN ('theme_primary_color', 'theme_secondary_color', 'theme_background_color')
ORDER BY key;
