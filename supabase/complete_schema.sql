-- ============================================================================
-- Balearic & Costa Blanca Charters - Complete Database Schema
-- ============================================================================
-- This is a complete schema file that includes all tables, indexes, triggers,
-- and migrations. Run this entire file in Supabase SQL Editor.
-- ============================================================================

-- ============================================================================
-- PART 1: Core Tables
-- ============================================================================

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fleet Table
CREATE TABLE IF NOT EXISTS fleet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  year INTEGER,
  technical_specs JSONB DEFAULT '{}',
  description TEXT,
  short_description TEXT,
  main_image_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  low_season_price DECIMAL(10, 2),
  medium_season_price DECIMAL(10, 2),
  high_season_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  capacity INTEGER,
  length DECIMAL(5, 2),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_urls JSONB DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  guest_location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  yacht_id UUID REFERENCES fleet(id),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats Table (Journey in Numbers)
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Culinary Experiences Table
CREATE TABLE IF NOT EXISTS culinary_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew Members Table
CREATE TABLE IF NOT EXISTS crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking Inquiries Table
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  yacht_id UUID REFERENCES fleet(id),
  start_date DATE,
  end_date DATE,
  guests INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Assets Table (for admin media center)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  mime_type TEXT,
  alt_text TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking Availability Table
CREATE TABLE IF NOT EXISTS booking_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yacht_id UUID REFERENCES fleet(id) NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price_override DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(yacht_id, date)
);

-- ============================================================================
-- PART 2: Fleet Table Upgrades (Technical Specs & Amenities)
-- ============================================================================

-- Add new columns to fleet table for detailed specifications
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS cabins INTEGER,
ADD COLUMN IF NOT EXISTS toilets INTEGER,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '{}';

-- Initialize amenities for existing records
UPDATE fleet 
SET amenities = '{}'::jsonb 
WHERE amenities IS NULL;

-- ============================================================================
-- PART 3: Fleet Price Calculation Fields
-- ============================================================================

ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS apa_percentage DECIMAL(5, 2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS crew_service_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 21.00;

-- ============================================================================
-- PART 4: Media Assets Optimization Fields
-- ============================================================================

ALTER TABLE media_assets 
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS blur_hash TEXT,
ADD COLUMN IF NOT EXISTS file_format TEXT,
ADD COLUMN IF NOT EXISTS optimized_url TEXT;

-- ============================================================================
-- PART 5: Indexes for Performance
-- ============================================================================

-- Fleet indexes
CREATE INDEX IF NOT EXISTS idx_fleet_slug ON fleet(slug);
CREATE INDEX IF NOT EXISTS idx_fleet_active ON fleet(is_active);
CREATE INDEX IF NOT EXISTS idx_fleet_amenities ON fleet USING GIN (amenities);

-- Destinations indexes
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_booking_availability_yacht_date ON booking_availability(yacht_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status ON booking_inquiries(status);

-- Media assets indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);
CREATE INDEX IF NOT EXISTS idx_media_assets_file_type ON media_assets(file_type);

-- ============================================================================
-- PART 6: Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at on all tables (drop first if exists to avoid errors)
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at 
  BEFORE UPDATE ON site_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fleet_updated_at ON fleet;
CREATE TRIGGER update_fleet_updated_at 
  BEFORE UPDATE ON fleet 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_destinations_updated_at ON destinations;
CREATE TRIGGER update_destinations_updated_at 
  BEFORE UPDATE ON destinations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stats_updated_at ON stats;
CREATE TRIGGER update_stats_updated_at 
  BEFORE UPDATE ON stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_culinary_experiences_updated_at ON culinary_experiences;
CREATE TRIGGER update_culinary_experiences_updated_at 
  BEFORE UPDATE ON culinary_experiences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crew_updated_at ON crew;
CREATE TRIGGER update_crew_updated_at 
  BEFORE UPDATE ON crew 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_inquiries_updated_at ON booking_inquiries;
CREATE TRIGGER update_booking_inquiries_updated_at 
  BEFORE UPDATE ON booking_inquiries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_assets_updated_at ON media_assets;
CREATE TRIGGER update_media_assets_updated_at 
  BEFORE UPDATE ON media_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_availability_updated_at ON booking_availability;
CREATE TRIGGER update_booking_availability_updated_at 
  BEFORE UPDATE ON booking_availability 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 7: Default Data (Sample Records)
-- ============================================================================

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_title', 'Experience Luxury at Sea'),
  ('hero_subtitle', 'Premium Yacht Charters in the Balearic Islands & Costa Blanca'),
  ('hero_video_url', ''),
  ('contact_phone', '+34 123 456 789'),
  ('contact_email', 'info@baleariccharters.com'),
  ('whatsapp_link', 'https://wa.me/34123456789'),
  ('telegram_link', 'https://t.me/baleariccharters'),
  ('instagram_link', 'https://instagram.com/baleariccharters'),
  ('facebook_link', ''),
  ('company_name', 'Balearic & Costa Blanca Charters')
ON CONFLICT (key) DO NOTHING;

-- Insert sample fleet data
INSERT INTO fleet (name, slug, year, technical_specs, description, short_description, low_season_price, medium_season_price, high_season_price, capacity, length, is_featured) VALUES
  ('Simona', 'simona', 2020, 
   '{"engines": "Twin 1200hp", "cruising_speed": "25 knots", "max_speed": "30 knots", "fuel_capacity": "8000L", "water_capacity": "1500L"}',
   'SIMONA is a magnificent superyacht offering unparalleled luxury and comfort. Experience the Mediterranean in style with state-of-the-art amenities and exceptional service.',
   'Luxury superyacht for unforgettable Mediterranean experiences',
   12000.00, 15000.00, 18000.00, 12, 45.5, true),
  ('Wide Dream', 'wide-dream', 2019,
   '{"engines": "Twin 1400hp", "cruising_speed": "28 knots", "max_speed": "32 knots", "fuel_capacity": "9000L", "water_capacity": "1800L"}',
   'WIDE DREAM represents the pinnacle of yacht charter excellence. Spacious decks, luxurious interiors, and world-class amenities await you.',
   'Spacious luxury yacht designed for the ultimate charter experience',
   14000.00, 17000.00, 20000.00, 14, 52.0, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample destinations
INSERT INTO destinations (title, description, order_index) VALUES
  ('Ibiza', 'Experience the vibrant nightlife and pristine beaches of Ibiza. Discover hidden coves and enjoy the island''s legendary sunset views.', 1),
  ('Formentera', 'Crystal-clear waters and unspoiled beaches await in Formentera. A paradise for water sports enthusiasts and relaxation seekers.', 2),
  ('Mallorca', 'Explore the stunning coastline of Mallorca, from dramatic cliffs to secluded bays. Rich culture meets natural beauty.', 3),
  ('Menorca', 'Discover Menorca''s UNESCO Biosphere Reserve, pristine beaches, and charming fishing villages.', 4),
  ('Costa Blanca', 'The sun-drenched Costa Blanca offers golden beaches, vibrant marinas, and charming coastal towns along Spain''s eastern coast.', 5)
ON CONFLICT DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (guest_name, guest_location, rating, review_text, is_featured, is_approved) VALUES
  ('Sarah Mitchell', 'London, UK', 5, 'An absolutely unforgettable experience! The crew was exceptional, and every detail was perfect. We will definitely return!', true, true),
  ('Michael Chen', 'New York, USA', 5, 'The best vacation we''ve ever had. The yacht was immaculate, the food outstanding, and the service beyond compare.', true, true),
  ('Emma Thompson', 'Dubai, UAE', 5, 'Pure luxury from start to finish. The attention to detail and personalized service made this trip extraordinary.', true, true)
ON CONFLICT DO NOTHING;

-- Insert sample stats
INSERT INTO stats (label, value, order_index) VALUES
  ('Years of Excellence', '15+', 1),
  ('Satisfied Guests', '5000+', 2),
  ('Destinations', '50+', 3),
  ('5-Star Reviews', '98%', 4)
ON CONFLICT DO NOTHING;

-- Insert sample culinary experiences
INSERT INTO culinary_experiences (title, description, order_index) VALUES
  ('Authentic Paella', 'Traditional Spanish paella prepared fresh on board by our master chef, using the finest local ingredients.', 1),
  ('Premium Steaks', 'Grilled to perfection, our selection of premium steaks is paired with exquisite wines and stunning sea views.', 2),
  ('Mediterranean Cuisine', 'Fresh seafood, local produce, and Mediterranean flavors curated by our experienced culinary team.', 3),
  ('Sunset Dining', 'A romantic dining experience as the sun sets over the Mediterranean, featuring gourmet dishes and fine wines.', 4)
ON CONFLICT DO NOTHING;

-- Insert sample crew
INSERT INTO crew (name, role, bio, order_index) VALUES
  ('Captain James Martinez', 'Master Captain', 'With over 20 years of experience navigating the Mediterranean, Captain Martinez ensures every voyage is safe, smooth, and memorable.', 1),
  ('Chef Maria Rodriguez', 'Head Chef', 'Chef Rodriguez brings 15 years of culinary excellence, specializing in Mediterranean and international cuisine with locally sourced ingredients.', 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 8: Column Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN fleet.cabins IS 'Number of cabins on the yacht';
COMMENT ON COLUMN fleet.toilets IS 'Number of toilets/bathrooms on the yacht';
COMMENT ON COLUMN fleet.amenities IS 'JSONB object with boolean flags for amenities: ac, watermaker, generator, flybridge, heating, teak_deck, full_batten, folding_table, fridge, dinghy, water_entertainment';
COMMENT ON COLUMN fleet.apa_percentage IS 'Advance Provisioning Allowance percentage (default 30%)';
COMMENT ON COLUMN fleet.crew_service_fee IS 'Fixed crew service fee in currency';
COMMENT ON COLUMN fleet.cleaning_fee IS 'Fixed cleaning fee in currency';
COMMENT ON COLUMN fleet.tax_percentage IS 'Tax (IVA) percentage (default 21%)';
COMMENT ON COLUMN media_assets.width IS 'Image width in pixels';
COMMENT ON COLUMN media_assets.height IS 'Image height in pixels';
COMMENT ON COLUMN media_assets.blur_hash IS 'Blur hash string for placeholder images';
COMMENT ON COLUMN media_assets.file_format IS 'File format (webp, avif, jpg, png)';
COMMENT ON COLUMN media_assets.optimized_url IS 'URL to optimized/compressed version of the image';

-- ============================================================================
-- Schema Creation Complete!
-- ============================================================================
-- All tables, indexes, triggers, and sample data have been created.
-- You can now use the admin panel to manage your content.
-- ============================================================================
