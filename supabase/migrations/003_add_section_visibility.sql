-- ============================================================================
-- Migration 003: Add Section Visibility Settings
-- ============================================================================
-- Created: 2026-01-24
-- Description: Adds section visibility controls to site_settings
-- ============================================================================

-- Insert default section visibility settings
INSERT INTO site_settings (key, value) VALUES
  ('section_journey_visible', 'true'),
  ('section_mission_visible', 'true'),
  ('section_crew_visible', 'true'),
  ('section_culinary_visible', 'true'),
  ('section_contact_visible', 'true'),
  ('section_fleet_visible', 'true'),
  ('section_destinations_visible', 'true'),
  ('section_reviews_visible', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- MIGRATION 003 COMPLETE
-- ============================================================================
