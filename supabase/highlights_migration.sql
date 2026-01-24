-- ============================================================================
-- Highlights Migration - Migrate Hardcoded Highlights to Supabase
-- ============================================================================
-- This migration:
-- 1. Adds highlights_data JSONB column to destinations table
-- 2. Populates highlights for Mallorca, Ibiza, Formentera, Menorca, Costa Blanca
-- 3. Makes highlights editable via Admin Panel
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: Add highlights_data column if it doesn't exist
-- ============================================================================

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS highlights_data JSONB DEFAULT '[]'::jsonb;

-- Add gallery_images column if it doesn't exist
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Add coordinates column if it doesn't exist
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS coordinates JSONB DEFAULT NULL;

-- Add name column if it doesn't exist (some destinations use title only)
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add ready_to_explore titles for i18n
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS ready_to_explore_title_en TEXT,
ADD COLUMN IF NOT EXISTS ready_to_explore_title_es TEXT,
ADD COLUMN IF NOT EXISTS ready_to_explore_title_de TEXT;

-- Create index for highlights_data
CREATE INDEX IF NOT EXISTS idx_destinations_highlights 
ON destinations USING GIN (highlights_data);

-- Add column comments
COMMENT ON COLUMN destinations.highlights_data IS 'JSONB array of highlights/attractions for this destination';
COMMENT ON COLUMN destinations.gallery_images IS 'JSONB array of gallery image URLs';
COMMENT ON COLUMN destinations.coordinates IS 'JSONB object with lat/lng for destination center';

-- ============================================================================
-- PART 2: Update Mallorca with highlights
-- ============================================================================

UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'mallorca'),
  coordinates = '{"lat": 39.5696, "lng": 2.6502}'::jsonb,
  highlights_data = '[
    {
      "id": "mallorca-1",
      "name": "Cathedral La Seu",
      "name_en": "Cathedral La Seu",
      "name_es": "Catedral de La Seu",
      "name_de": "Kathedrale La Seu",
      "description": "Gothic masterpiece overlooking the bay, a symbol of Palma",
      "description_en": "Gothic masterpiece overlooking the bay, a symbol of Palma with stunning architecture dating back to the 13th century",
      "description_es": "Obra maestra gótica con vistas a la bahía, símbolo de Palma con impresionante arquitectura del siglo XIII",
      "description_de": "Gotisches Meisterwerk mit Blick auf die Bucht, ein Symbol Palmas mit beeindruckender Architektur aus dem 13. Jahrhundert",
      "category": "landmark",
      "coordinates": {"lat": 39.5675, "lng": 2.6476}
    },
    {
      "id": "mallorca-2",
      "name": "Es Trenc Beach",
      "name_en": "Es Trenc Beach",
      "name_es": "Playa Es Trenc",
      "name_de": "Es Trenc Strand",
      "description": "Pristine white sand beach, best accessed by boat for ultimate privacy",
      "description_en": "Pristine white sand beach stretching for miles, best accessed by boat for ultimate privacy and crystal-clear turquoise waters",
      "description_es": "Playa de arena blanca prístina que se extiende por kilómetros, mejor accesible en barco para máxima privacidad y aguas cristalinas",
      "description_de": "Unberührter weißer Sandstrand, der sich kilometerweit erstreckt, am besten per Boot erreichbar für ultimative Privatsphäre und kristallklares türkisfarbenes Wasser",
      "category": "beach",
      "coordinates": {"lat": 39.3547, "lng": 2.9789}
    },
    {
      "id": "mallorca-3",
      "name": "Port de Sóller",
      "name_en": "Port de Sóller",
      "name_es": "Puerto de Sóller",
      "name_de": "Port de Sóller",
      "description": "Charming fishing port with excellent restaurants and historic tram",
      "description_en": "Charming horseshoe-shaped harbor surrounded by mountains, featuring excellent seafood restaurants and a historic wooden tram connecting to Sóller village",
      "description_es": "Encantador puerto en forma de herradura rodeado de montañas, con excelentes restaurantes de mariscos y un tranvía histórico de madera que conecta con el pueblo de Sóller",
      "description_de": "Charmanter hufeisenförmiger Hafen umgeben von Bergen, mit ausgezeichneten Meeresfrüchte-Restaurants und einer historischen Holzstraßenbahn, die das Dorf Sóller verbindet",
      "category": "marina",
      "coordinates": {"lat": 39.7950, "lng": 2.6917}
    },
    {
      "id": "mallorca-4",
      "name": "Cala Deià",
      "name_en": "Cala Deià",
      "name_es": "Cala Deià",
      "name_de": "Cala Deià",
      "description": "Secluded pebble cove nestled beneath the Serra de Tramuntana mountains",
      "description_en": "Secluded pebble cove nestled beneath the dramatic Serra de Tramuntana mountains, a favorite anchorage for yachts seeking tranquility",
      "description_es": "Cala de guijarros aislada bajo las dramáticas montañas de la Serra de Tramuntana, un fondeadero favorito para yates que buscan tranquilidad",
      "description_de": "Abgelegene Kieselbucht eingebettet unter den dramatischen Serra de Tramuntana Bergen, ein beliebter Ankerplatz für Yachten, die Ruhe suchen",
      "category": "beach",
      "coordinates": {"lat": 39.7478, "lng": 2.6328}
    }
  ]'::jsonb
WHERE LOWER(title) LIKE '%mallorca%' OR LOWER(name) LIKE '%mallorca%' OR LOWER(title) LIKE '%palma%';

-- ============================================================================
-- PART 3: Update Ibiza with highlights
-- ============================================================================

UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'ibiza'),
  coordinates = '{"lat": 38.9067, "lng": 1.4206}'::jsonb,
  highlights_data = '[
    {
      "id": "ibiza-1",
      "name": "Es Vedrà",
      "name_en": "Es Vedrà",
      "name_es": "Es Vedrà",
      "name_de": "Es Vedrà",
      "description": "Mystical rock island rising 400m from the sea, shrouded in legend",
      "description_en": "Mystical limestone rock island rising dramatically 400 meters from the sea, shrouded in legends of sirens and magnetic anomalies. Best viewed at sunset from your yacht deck.",
      "description_es": "Isla rocosa mística de piedra caliza que se eleva dramáticamente 400 metros desde el mar, envuelta en leyendas de sirenas y anomalías magnéticas. Mejor vista al atardecer desde la cubierta de su yate.",
      "description_de": "Mystische Kalksteininsel, die sich dramatisch 400 Meter aus dem Meer erhebt, umgeben von Legenden über Sirenen und magnetische Anomalien. Am besten bei Sonnenuntergang von Ihrem Yachtdeck aus zu sehen.",
      "category": "landmark",
      "coordinates": {"lat": 38.8667, "lng": 1.2000}
    },
    {
      "id": "ibiza-2",
      "name": "Dalt Vila",
      "name_en": "Dalt Vila (Ibiza Old Town)",
      "name_es": "Dalt Vila (Ciudad Vieja de Ibiza)",
      "name_de": "Dalt Vila (Ibiza Altstadt)",
      "description": "UNESCO World Heritage fortified old town with stunning harbor views",
      "description_en": "UNESCO World Heritage Site featuring Renaissance-era walls encircling a medieval old town. Wander cobblestone streets to the castle with panoramic harbor views.",
      "description_es": "Patrimonio de la Humanidad de la UNESCO con murallas renacentistas que rodean un casco antiguo medieval. Pasee por calles empedradas hasta el castillo con vistas panorámicas al puerto.",
      "description_de": "UNESCO-Weltkulturerbe mit Renaissance-Mauern, die eine mittelalterliche Altstadt umgeben. Wandern Sie durch Kopfsteinpflasterstraßen zur Burg mit Panoramablick auf den Hafen.",
      "category": "landmark",
      "coordinates": {"lat": 38.9089, "lng": 1.4350}
    },
    {
      "id": "ibiza-3",
      "name": "Playa de Ses Illetes",
      "name_en": "Ses Illetes Beach (Formentera)",
      "name_es": "Playa de Ses Illetes (Formentera)",
      "name_de": "Ses Illetes Strand (Formentera)",
      "description": "Caribbean-like turquoise waters just a short sail from Ibiza",
      "description_en": "Often ranked among Europe''s finest beaches, this Formentera gem features Caribbean-like turquoise waters and white sand. Just a short sail from Ibiza - anchor and swim ashore.",
      "description_es": "Frecuentemente clasificada entre las mejores playas de Europa, esta joya de Formentera presenta aguas turquesas tipo Caribe y arena blanca. A corta navegación de Ibiza - ancle y nade hasta la orilla.",
      "description_de": "Oft als einer der schönsten Strände Europas eingestuft, bietet dieses Formentera-Juwel karibische türkisfarbene Gewässer und weißen Sand. Nur eine kurze Segelfahrt von Ibiza - ankern und an Land schwimmen.",
      "category": "beach",
      "coordinates": {"lat": 38.7500, "lng": 1.4333}
    },
    {
      "id": "ibiza-4",
      "name": "Cala Comte",
      "name_en": "Cala Comte",
      "name_es": "Cala Comte",
      "name_de": "Cala Comte",
      "description": "Famous sunset spot with multiple sandy coves and crystal waters",
      "description_en": "Famous sunset spot featuring multiple sandy coves, crystal-clear waters perfect for snorkeling, and legendary views of the setting sun. A must-anchor destination.",
      "description_es": "Famoso lugar para ver el atardecer con múltiples calas de arena, aguas cristalinas perfectas para bucear y vistas legendarias de la puesta de sol. Un destino imprescindible para fondear.",
      "description_de": "Berühmter Sonnenuntergangsort mit mehreren Sandbuchten, kristallklarem Wasser perfekt zum Schnorcheln und legendären Blicken auf die untergehende Sonne. Ein Muss-Ankerziel.",
      "category": "beach",
      "coordinates": {"lat": 38.9536, "lng": 1.2197}
    },
    {
      "id": "ibiza-5",
      "name": "Marina Botafoch",
      "name_en": "Marina Botafoch",
      "name_es": "Marina Botafoch",
      "name_de": "Marina Botafoch",
      "description": "Exclusive superyacht marina with world-class dining and nightlife",
      "description_en": "Ibiza''s premier superyacht marina featuring exclusive restaurants, chic beach clubs, and vibrant nightlife. Perfect for an evening ashore or provisioning stop.",
      "description_es": "La principal marina de superyates de Ibiza con restaurantes exclusivos, elegantes beach clubs y vibrante vida nocturna. Perfecto para una noche en tierra o parada de aprovisionamiento.",
      "description_de": "Ibizas führende Superyacht-Marina mit exklusiven Restaurants, schicken Beachclubs und lebendigem Nachtleben. Perfekt für einen Abend an Land oder einen Versorgungsstopp.",
      "category": "marina",
      "coordinates": {"lat": 38.9128, "lng": 1.4458}
    }
  ]'::jsonb
WHERE LOWER(title) LIKE '%ibiza%' OR LOWER(name) LIKE '%ibiza%';

-- ============================================================================
-- PART 4: Update Formentera with highlights
-- ============================================================================

UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'formentera'),
  coordinates = '{"lat": 38.7050, "lng": 1.4500}'::jsonb,
  highlights_data = '[
    {
      "id": "formentera-1",
      "name": "Playa de Ses Illetes",
      "name_en": "Ses Illetes Beach",
      "name_es": "Playa de Ses Illetes",
      "name_de": "Ses Illetes Strand",
      "description": "Consistently rated among the best beaches in the world",
      "description_en": "Consistently rated among the best beaches in the world, this narrow peninsula features powder-white sand and impossibly clear turquoise waters. Perfect for anchoring offshore.",
      "description_es": "Constantemente calificada entre las mejores playas del mundo, esta estrecha península presenta arena blanca como polvo y aguas turquesas increíblemente claras. Perfecta para fondear en alta mar.",
      "description_de": "Wird regelmäßig zu den besten Stränden der Welt gezählt, diese schmale Halbinsel bietet puderweißen Sand und unglaublich klares türkisfarbenes Wasser. Perfekt zum Ankern vor der Küste.",
      "category": "beach",
      "coordinates": {"lat": 38.7500, "lng": 1.4333}
    },
    {
      "id": "formentera-2",
      "name": "La Savina Harbor",
      "name_en": "La Savina Harbor",
      "name_es": "Puerto de La Savina",
      "name_de": "Hafen La Savina",
      "description": "Main port with excellent provisioning and charming waterfront cafés",
      "description_en": "Formentera''s main port offering excellent provisioning, yacht services, and charming waterfront cafés. The gateway to exploring this pristine island.",
      "description_es": "Puerto principal de Formentera que ofrece excelente aprovisionamiento, servicios de yates y encantadores cafés frente al mar. La puerta de entrada para explorar esta isla prístina.",
      "description_de": "Formenteras Haupthafen mit ausgezeichneter Versorgung, Yachtservices und charmanten Cafés am Wasser. Das Tor zur Erkundung dieser unberührten Insel.",
      "category": "marina",
      "coordinates": {"lat": 38.7333, "lng": 1.4167}
    },
    {
      "id": "formentera-3",
      "name": "Cala Saona",
      "name_en": "Cala Saona",
      "name_es": "Cala Saona",
      "name_de": "Cala Saona",
      "description": "Stunning west-facing cove perfect for sunset swims",
      "description_en": "Stunning west-facing cove with golden sand and calm waters, perfect for sunset swims and evening cocktails aboard your yacht.",
      "description_es": "Impresionante cala orientada al oeste con arena dorada y aguas tranquilas, perfecta para nadar al atardecer y cócteles nocturnos a bordo de su yate.",
      "description_de": "Atemberaubende nach Westen ausgerichtete Bucht mit goldenem Sand und ruhigem Wasser, perfekt für Sonnenuntergangsschwimmen und Abendcocktails an Bord Ihrer Yacht.",
      "category": "beach",
      "coordinates": {"lat": 38.6833, "lng": 1.3833}
    }
  ]'::jsonb
WHERE LOWER(title) LIKE '%formentera%' OR LOWER(name) LIKE '%formentera%';

-- ============================================================================
-- PART 5: Update Menorca with highlights
-- ============================================================================

UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'menorca'),
  coordinates = '{"lat": 39.9375, "lng": 4.0000}'::jsonb,
  highlights_data = '[
    {
      "id": "menorca-1",
      "name": "Cala Macarella",
      "name_en": "Cala Macarella",
      "name_es": "Cala Macarella",
      "name_de": "Cala Macarella",
      "description": "Iconic turquoise cove surrounded by pine-covered cliffs",
      "description_en": "Iconic turquoise cove surrounded by pine-covered limestone cliffs. One of the Mediterranean''s most photographed beaches, best reached by yacht.",
      "description_es": "Icónica cala turquesa rodeada de acantilados de piedra caliza cubiertos de pinos. Una de las playas más fotografiadas del Mediterráneo, mejor accesible en yate.",
      "description_de": "Ikonische türkisfarbene Bucht umgeben von kiefernbewachsenen Kalksteinklippen. Einer der meistfotografierten Strände des Mittelmeers, am besten per Yacht erreichbar.",
      "category": "beach",
      "coordinates": {"lat": 39.9350, "lng": 3.9333}
    },
    {
      "id": "menorca-2",
      "name": "Port de Maó",
      "name_en": "Port of Mahón",
      "name_es": "Puerto de Mahón",
      "name_de": "Hafen von Mahón",
      "description": "One of the deepest natural harbors in the world",
      "description_en": "One of the deepest natural harbors in the world, stretching 5km inland. Historic fortresses line the shores, and excellent marinas offer all services.",
      "description_es": "Uno de los puertos naturales más profundos del mundo, extendiéndose 5 km tierra adentro. Fortalezas históricas bordean las costas, y excelentes marinas ofrecen todos los servicios.",
      "description_de": "Einer der tiefsten natürlichen Häfen der Welt, der sich 5 km ins Landesinnere erstreckt. Historische Festungen säumen die Ufer, und ausgezeichnete Marinas bieten alle Services.",
      "category": "marina",
      "coordinates": {"lat": 39.8833, "lng": 4.2667}
    },
    {
      "id": "menorca-3",
      "name": "Ciudadela",
      "name_en": "Ciutadella",
      "name_es": "Ciudadela",
      "name_de": "Ciutadella",
      "description": "Historic old capital with stunning Gothic architecture",
      "description_en": "Historic old capital with stunning Gothic cathedral and aristocratic palaces. The picturesque harbor is perfect for an evening stroll and dinner ashore.",
      "description_es": "Antigua capital histórica con impresionante catedral gótica y palacios aristocráticos. El pintoresco puerto es perfecto para un paseo nocturno y cenar en tierra.",
      "description_de": "Historische alte Hauptstadt mit atemberaubender gotischer Kathedrale und aristokratischen Palästen. Der malerische Hafen ist perfekt für einen Abendspaziergang und Abendessen an Land.",
      "category": "landmark",
      "coordinates": {"lat": 40.0000, "lng": 3.8333}
    }
  ]'::jsonb
WHERE LOWER(title) LIKE '%menorca%' OR LOWER(name) LIKE '%menorca%';

-- ============================================================================
-- PART 6: Update Costa Blanca with highlights
-- ============================================================================

UPDATE destinations 
SET 
  name = COALESCE(name, title),
  slug = COALESCE(slug, 'costa-blanca'),
  coordinates = '{"lat": 38.3452, "lng": -0.4810}'::jsonb,
  highlights_data = '[
    {
      "id": "costa-blanca-1",
      "name": "Calpe Rock",
      "name_en": "Peñón de Ifach (Calpe Rock)",
      "name_es": "Peñón de Ifach",
      "name_de": "Peñón de Ifach (Calpe Felsen)",
      "description": "Dramatic 332m limestone outcrop rising from the sea",
      "description_en": "Dramatic 332-meter limestone outcrop rising from the sea, a natural park and iconic landmark of the Costa Blanca. Perfect backdrop for yacht photos.",
      "description_es": "Dramático afloramiento de piedra caliza de 332 metros que se eleva desde el mar, un parque natural e icónico punto de referencia de la Costa Blanca. Telón de fondo perfecto para fotos de yates.",
      "description_de": "Dramatischer 332 Meter hoher Kalksteinvorsprung, der aus dem Meer ragt, ein Naturpark und ikonisches Wahrzeichen der Costa Blanca. Perfekte Kulisse für Yachtfotos.",
      "category": "landmark",
      "coordinates": {"lat": 38.6333, "lng": 0.0667}
    },
    {
      "id": "costa-blanca-2",
      "name": "Altea Old Town",
      "name_en": "Altea Old Town",
      "name_es": "Casco Antiguo de Altea",
      "name_de": "Altea Altstadt",
      "description": "Whitewashed village with blue-domed church and artist galleries",
      "description_en": "Charming whitewashed village with iconic blue-domed church, winding cobblestone streets, and numerous artist galleries. A cultural gem on the coast.",
      "description_es": "Encantador pueblo encalado con icónica iglesia de cúpula azul, calles empedradas sinuosas y numerosas galerías de artistas. Una joya cultural en la costa.",
      "description_de": "Charmantes weiß getünchtes Dorf mit ikonischer blauer Kuppelkirche, gewundenen Kopfsteinpflasterstraßen und zahlreichen Künstlergalerien. Ein kulturelles Juwel an der Küste.",
      "category": "landmark",
      "coordinates": {"lat": 38.5986, "lng": -0.0519}
    },
    {
      "id": "costa-blanca-3",
      "name": "Marina de Dénia",
      "name_en": "Dénia Marina",
      "name_es": "Marina de Dénia",
      "name_de": "Marina Dénia",
      "description": "Premier sailing destination with ferry links to Ibiza and Mallorca",
      "description_en": "Premier sailing destination with excellent marina facilities, ferry links to Ibiza and Mallorca, and a historic castle overlooking the town.",
      "description_es": "Destino de navegación premier con excelentes instalaciones de marina, conexiones de ferry a Ibiza y Mallorca, y un castillo histórico con vistas a la ciudad.",
      "description_de": "Erstklassiges Segelziel mit ausgezeichneten Marina-Einrichtungen, Fährverbindungen nach Ibiza und Mallorca und einer historischen Burg mit Blick auf die Stadt.",
      "category": "marina",
      "coordinates": {"lat": 38.8403, "lng": 0.1056}
    }
  ]'::jsonb
WHERE LOWER(title) LIKE '%costa blanca%' OR LOWER(name) LIKE '%costa blanca%' OR LOWER(slug) = 'costa-blanca';

-- ============================================================================
-- PART 7: Verification Query (Run separately to check results)
-- ============================================================================

-- SELECT 
--   id, 
--   title, 
--   name, 
--   slug,
--   jsonb_array_length(highlights_data) as highlight_count,
--   coordinates
-- FROM destinations 
-- WHERE is_active = true 
-- ORDER BY order_index;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All destinations now have:
-- ✅ highlights_data with localized content
-- ✅ coordinates for map display
-- ✅ name field populated
-- ✅ slug field for URL routing
--
-- You can now:
-- 1. View and edit highlights in Admin Panel → Destinations → [Destination] → Highlights tab
-- 2. Add images to each highlight using Supabase Storage URLs
-- 3. Add/remove highlights dynamically
-- ============================================================================
