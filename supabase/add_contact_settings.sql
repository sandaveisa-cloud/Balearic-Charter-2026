-- ============================================================================
-- Add Contact Settings to site_settings table
-- ============================================================================
-- This migration adds the verified business contact information to site_settings
-- Run this in Supabase SQL Editor to populate the contact fields
-- ============================================================================

-- Insert or update contact phone
INSERT INTO site_settings (key, value, updated_at)
VALUES ('contact_phone', '+34 680 957 096', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Insert or update contact email
INSERT INTO site_settings (key, value, updated_at)
VALUES ('contact_email', 'peter.sutter@gmail.com', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Insert or update contact locations
INSERT INTO site_settings (key, value, updated_at)
VALUES ('contact_locations', 'Ibiza, Palma & Torrevieja, Spain', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Verify the settings were added
SELECT key, value FROM site_settings 
WHERE key IN ('contact_phone', 'contact_email', 'contact_locations')
ORDER BY key;
