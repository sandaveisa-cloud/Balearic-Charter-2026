-- ============================================================================
-- Migration 001: Add Highlights Support to Destinations
-- ============================================================================
-- Created: 2026-01-24
-- Description: Adds highlights_data JSONB column to destinations table
--              and populates initial data for all destinations
-- ============================================================================

-- Add new columns to destinations
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS highlights_data JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS ready_to_explore_title_en TEXT,
ADD COLUMN IF NOT EXISTS ready_to_explore_title_es TEXT,
ADD COLUMN IF NOT EXISTS ready_to_explore_title_de TEXT;

-- Create index for highlights
CREATE INDEX IF NOT EXISTS idx_destinations_highlights 
ON destinations USING GIN (highlights_data);

-- Update Mallorca with highlights
UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'mallorca'),
  coordinates = '{"lat": 39.5696, "lng": 2.6502}'::jsonb,
  highlights_data = '[
    {"id": "mallorca-1", "name": "Cathedral La Seu", "name_en": "Cathedral La Seu", "name_es": "Catedral de La Seu", "name_de": "Kathedrale La Seu", "description": "Gothic masterpiece overlooking the bay", "category": "landmark", "coordinates": {"lat": 39.5675, "lng": 2.6476}},
    {"id": "mallorca-2", "name": "Es Trenc Beach", "name_en": "Es Trenc Beach", "name_es": "Playa Es Trenc", "name_de": "Es Trenc Strand", "description": "Pristine white sand beach, best accessed by boat", "category": "beach", "coordinates": {"lat": 39.3547, "lng": 2.9789}},
    {"id": "mallorca-3", "name": "Port de Sóller", "name_en": "Port de Sóller", "name_es": "Puerto de Sóller", "name_de": "Port de Sóller", "description": "Charming fishing port with excellent restaurants", "category": "marina", "coordinates": {"lat": 39.7950, "lng": 2.6917}},
    {"id": "mallorca-4", "name": "Cala Deià", "name_en": "Cala Deià", "name_es": "Cala Deià", "name_de": "Cala Deià", "description": "Secluded pebble cove beneath Serra de Tramuntana", "category": "beach", "coordinates": {"lat": 39.7478, "lng": 2.6328}}
  ]'::jsonb
WHERE LOWER(title) LIKE '%mallorca%' OR LOWER(name) LIKE '%mallorca%' OR LOWER(title) LIKE '%palma%';

-- Update Ibiza with highlights
UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'ibiza'),
  coordinates = '{"lat": 38.9067, "lng": 1.4206}'::jsonb,
  highlights_data = '[
    {"id": "ibiza-1", "name": "Es Vedrà", "name_en": "Es Vedrà", "name_es": "Es Vedrà", "name_de": "Es Vedrà", "description": "Mystical rock island rising 400m from the sea", "category": "landmark", "coordinates": {"lat": 38.8667, "lng": 1.2000}},
    {"id": "ibiza-2", "name": "Dalt Vila", "name_en": "Dalt Vila (Ibiza Old Town)", "name_es": "Dalt Vila (Ciudad Vieja)", "name_de": "Dalt Vila (Altstadt)", "description": "UNESCO World Heritage fortified old town", "category": "landmark", "coordinates": {"lat": 38.9089, "lng": 1.4350}},
    {"id": "ibiza-3", "name": "Playa de Ses Illetes", "name_en": "Ses Illetes Beach", "name_es": "Playa de Ses Illetes", "name_de": "Ses Illetes Strand", "description": "Caribbean-like turquoise waters", "category": "beach", "coordinates": {"lat": 38.7500, "lng": 1.4333}},
    {"id": "ibiza-4", "name": "Cala Comte", "name_en": "Cala Comte", "name_es": "Cala Comte", "name_de": "Cala Comte", "description": "Famous sunset spot with crystal waters", "category": "beach", "coordinates": {"lat": 38.9536, "lng": 1.2197}},
    {"id": "ibiza-5", "name": "Marina Botafoch", "name_en": "Marina Botafoch", "name_es": "Marina Botafoch", "name_de": "Marina Botafoch", "description": "Exclusive superyacht marina with world-class dining", "category": "marina", "coordinates": {"lat": 38.9128, "lng": 1.4458}}
  ]'::jsonb
WHERE LOWER(title) LIKE '%ibiza%' OR LOWER(name) LIKE '%ibiza%';

-- Update Formentera with highlights
UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'formentera'),
  coordinates = '{"lat": 38.7050, "lng": 1.4500}'::jsonb,
  highlights_data = '[
    {"id": "formentera-1", "name": "Playa de Ses Illetes", "name_en": "Ses Illetes Beach", "name_es": "Playa de Ses Illetes", "name_de": "Ses Illetes Strand", "description": "One of the best beaches in the world", "category": "beach", "coordinates": {"lat": 38.7500, "lng": 1.4333}},
    {"id": "formentera-2", "name": "La Savina Harbor", "name_en": "La Savina Harbor", "name_es": "Puerto de La Savina", "name_de": "Hafen La Savina", "description": "Main port with excellent provisioning", "category": "marina", "coordinates": {"lat": 38.7333, "lng": 1.4167}},
    {"id": "formentera-3", "name": "Cala Saona", "name_en": "Cala Saona", "name_es": "Cala Saona", "name_de": "Cala Saona", "description": "Stunning west-facing cove perfect for sunset", "category": "beach", "coordinates": {"lat": 38.6833, "lng": 1.3833}}
  ]'::jsonb
WHERE LOWER(title) LIKE '%formentera%' OR LOWER(name) LIKE '%formentera%';

-- Update Menorca with highlights
UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'menorca'),
  coordinates = '{"lat": 39.9375, "lng": 4.0000}'::jsonb,
  highlights_data = '[
    {"id": "menorca-1", "name": "Cala Macarella", "name_en": "Cala Macarella", "name_es": "Cala Macarella", "name_de": "Cala Macarella", "description": "Iconic turquoise cove surrounded by pine-covered cliffs", "category": "beach", "coordinates": {"lat": 39.9350, "lng": 3.9333}},
    {"id": "menorca-2", "name": "Port de Maó", "name_en": "Port of Mahón", "name_es": "Puerto de Mahón", "name_de": "Hafen von Mahón", "description": "One of the deepest natural harbors in the world", "category": "marina", "coordinates": {"lat": 39.8833, "lng": 4.2667}},
    {"id": "menorca-3", "name": "Ciudadela", "name_en": "Ciutadella", "name_es": "Ciudadela", "name_de": "Ciutadella", "description": "Historic old capital with stunning Gothic architecture", "category": "landmark", "coordinates": {"lat": 40.0000, "lng": 3.8333}}
  ]'::jsonb
WHERE LOWER(title) LIKE '%menorca%' OR LOWER(name) LIKE '%menorca%';

-- Update Costa Blanca with highlights
UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'costa-blanca'),
  coordinates = '{"lat": 38.3452, "lng": -0.4810}'::jsonb,
  highlights_data = '[
    {"id": "costa-blanca-1", "name": "Calpe Rock", "name_en": "Peñón de Ifach", "name_es": "Peñón de Ifach", "name_de": "Peñón de Ifach", "description": "Dramatic 332m limestone outcrop rising from the sea", "category": "landmark", "coordinates": {"lat": 38.6333, "lng": 0.0667}},
    {"id": "costa-blanca-2", "name": "Altea Old Town", "name_en": "Altea Old Town", "name_es": "Casco Antiguo de Altea", "name_de": "Altea Altstadt", "description": "Whitewashed village with blue-domed church", "category": "landmark", "coordinates": {"lat": 38.5986, "lng": -0.0519}},
    {"id": "costa-blanca-3", "name": "Marina de Dénia", "name_en": "Dénia Marina", "name_es": "Marina de Dénia", "name_de": "Marina Dénia", "description": "Premier sailing destination with ferry links to Ibiza", "category": "marina", "coordinates": {"lat": 38.8403, "lng": 0.1056}}
  ]'::jsonb
WHERE LOWER(title) LIKE '%costa blanca%' OR LOWER(name) LIKE '%costa blanca%' OR LOWER(slug) = 'costa-blanca';

-- ============================================================================
-- MIGRATION 001 COMPLETE
-- ============================================================================
