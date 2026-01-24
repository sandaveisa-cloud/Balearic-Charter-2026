-- ============================================================================
-- BALEARIC CHARTER 2026 - MASTER DATABASE SCHEMA
-- ============================================================================
-- Version: 1.1.0
-- Last Updated: 2026-01-24
-- 
-- This file contains the COMPLETE database schema for the Balearic Charter app.
-- It is the "source of truth" for the database structure.
-- 
-- Usage:
--   - For NEW databases: Run this entire file to set up everything
--   - For EXISTING databases: Run individual migration files (001_xxx, 002_xxx, etc.)
-- 
-- All migrations are IDEMPOTENT - safe to run multiple times.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 1: CORE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Site Settings Table (Key-Value Store)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Theme Settings Table (Dynamic Theme System)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Primary Colors
  primary_color TEXT DEFAULT '#1e3a5f',
  accent_color TEXT DEFAULT '#c9a227',
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#1a1a1a',
  
  -- Secondary Colors
  secondary_bg_color TEXT DEFAULT '#f8f9fa',
  border_color TEXT DEFAULT '#e5e7eb',
  muted_text_color TEXT DEFAULT '#6b7280',
  
  -- Component Colors
  header_bg_color TEXT DEFAULT '#1e3a5f',
  header_text_color TEXT DEFAULT '#ffffff',
  footer_bg_color TEXT DEFAULT '#1e3a5f',
  footer_text_color TEXT DEFAULT '#ffffff',
  button_bg_color TEXT DEFAULT '#c9a227',
  button_text_color TEXT DEFAULT '#ffffff',
  button_hover_color TEXT DEFAULT '#b8911f',
  
  -- Typography
  font_family TEXT DEFAULT 'Inter, system-ui, sans-serif',
  heading_font TEXT DEFAULT 'Playfair Display, serif',
  base_font_size TEXT DEFAULT '16px',
  
  -- Spacing & Layout
  border_radius TEXT DEFAULT '0.5rem',
  container_max_width TEXT DEFAULT '1280px',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Fleet Table (Yachts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fleet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Identification
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  boat_name TEXT,
  
  -- Specifications
  year INTEGER,
  length DECIMAL(5, 2),
  beam DECIMAL(5, 2),
  draft DECIMAL(5, 2),
  cabins INTEGER,
  toilets INTEGER,
  capacity INTEGER,
  crew_count INTEGER,
  technical_specs JSONB DEFAULT '{}'::jsonb,
  
  -- Engine & Performance
  engines TEXT,
  fuel_capacity INTEGER,
  water_capacity INTEGER,
  cruising_speed DECIMAL(5, 2),
  max_speed DECIMAL(5, 2),
  
  -- Descriptions (legacy single-language)
  description TEXT,
  short_description TEXT,
  
  -- Descriptions (i18n columns)
  description_en TEXT,
  description_es TEXT,
  description_de TEXT,
  short_description_en TEXT,
  short_description_es TEXT,
  short_description_de TEXT,
  description_i18n JSONB DEFAULT '{}'::jsonb,
  short_description_i18n JSONB DEFAULT '{}'::jsonb,
  
  -- Pricing (seasonal)
  price_low_season DECIMAL(10, 2),
  price_mid_season DECIMAL(10, 2),
  price_high_season DECIMAL(10, 2),
  low_season_price DECIMAL(10, 2),    -- Legacy alias
  medium_season_price DECIMAL(10, 2), -- Legacy alias  
  high_season_price DECIMAL(10, 2),   -- Legacy alias
  price_per_day DECIMAL(10, 2),
  price_per_week DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  
  -- Pricing (fees)
  apa_percentage DECIMAL(5, 2) DEFAULT 30.00,
  crew_service_fee DECIMAL(10, 2) DEFAULT 0.00,
  cleaning_fee DECIMAL(10, 2) DEFAULT 0.00,
  tax_percentage DECIMAL(5, 2) DEFAULT 21.00,
  
  -- Images
  image TEXT,                          -- Legacy main image
  main_image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  
  -- Features & Amenities
  amenities JSONB DEFAULT '{}'::jsonb,
  extras JSONB DEFAULT '[]'::jsonb,
  
  -- Refit & Condition
  recently_refitted BOOLEAN DEFAULT false,
  refit_year INTEGER,
  refit_details TEXT,
  
  -- Visibility & Status
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  show_on_home BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Destinations Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Identification
  title TEXT NOT NULL,
  name TEXT,
  slug TEXT UNIQUE,
  region TEXT,
  
  -- Descriptions (legacy)
  description TEXT,
  
  -- Descriptions (i18n columns)
  description_en TEXT,
  description_es TEXT,
  description_de TEXT,
  description_i18n JSONB DEFAULT '{}'::jsonb,
  
  -- Ready to Explore (i18n)
  ready_to_explore_title_en TEXT,
  ready_to_explore_title_es TEXT,
  ready_to_explore_title_de TEXT,
  
  -- Media
  image_urls JSONB DEFAULT '[]'::jsonb,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  youtube_video_url TEXT,
  
  -- Location
  coordinates JSONB DEFAULT NULL,
  
  -- Content
  highlights_data JSONB DEFAULT '[]'::jsonb,
  seasonal_data JSONB DEFAULT '{}'::jsonb,
  
  -- Visibility & Status
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Reviews Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  guest_location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  yacht_id UUID REFERENCES fleet(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Stats Table (Journey in Numbers)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Culinary Experiences Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS culinary_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Crew Members Table
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Contact Persons Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  locations TEXT[],
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Booking Inquiries Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  yacht_id UUID REFERENCES fleet(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  guests INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Media Assets Table
-- -----------------------------------------------------------------------------
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
  width INTEGER,
  height INTEGER,
  blur_hash TEXT,
  file_format TEXT,
  optimized_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Booking Availability Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yacht_id UUID REFERENCES fleet(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price_override DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(yacht_id, date)
);

-- ============================================================================
-- PART 2: INDEXES
-- ============================================================================

-- Fleet indexes
CREATE INDEX IF NOT EXISTS idx_fleet_slug ON fleet(slug);
CREATE INDEX IF NOT EXISTS idx_fleet_active ON fleet(is_active);
CREATE INDEX IF NOT EXISTS idx_fleet_featured ON fleet(is_featured);
CREATE INDEX IF NOT EXISTS idx_fleet_amenities ON fleet USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_fleet_extras ON fleet USING GIN (extras);
CREATE INDEX IF NOT EXISTS idx_fleet_technical_specs ON fleet USING GIN (technical_specs);
CREATE INDEX IF NOT EXISTS idx_fleet_show_on_home ON fleet(show_on_home) WHERE show_on_home = true;
CREATE INDEX IF NOT EXISTS idx_fleet_recently_refitted ON fleet(recently_refitted) WHERE recently_refitted = true;

-- Destinations indexes
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_destinations_highlights ON destinations USING GIN (highlights_data);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_booking_availability_yacht_date ON booking_availability(yacht_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status ON booking_inquiries(status);

-- Media assets indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);
CREATE INDEX IF NOT EXISTS idx_media_assets_file_type ON media_assets(file_type);

-- Contact persons indexes
CREATE INDEX IF NOT EXISTS idx_contact_persons_active ON contact_persons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_contact_persons_order ON contact_persons(order_index);

-- Site settings index
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- ============================================================================
-- PART 3: FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'site_settings', 'theme_settings', 'fleet', 'destinations', 'reviews', 'stats',
    'culinary_experiences', 'crew', 'contact_persons', 'booking_inquiries',
    'media_assets', 'booking_availability'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
    EXECUTE format('
      CREATE TRIGGER update_%s_updated_at 
      BEFORE UPDATE ON %s 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    ', t, t);
  END LOOP;
END $$;

-- ============================================================================
-- PART 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE culinary_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_availability ENABLE ROW LEVEL SECURITY;

-- Public read policies (for anon users viewing the website)
DO $$
DECLARE
  public_tables TEXT[] := ARRAY[
    'site_settings', 'theme_settings', 'fleet', 'destinations', 'reviews', 'stats',
    'culinary_experiences', 'crew', 'contact_persons'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY public_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_public_read" ON %s', t, t);
    EXECUTE format('
      CREATE POLICY "%s_public_read" ON %s
      FOR SELECT USING (true)
    ', t, t);
  END LOOP;
END $$;

-- Booking inquiries: public can insert, authenticated can read
DROP POLICY IF EXISTS "booking_inquiries_public_insert" ON booking_inquiries;
CREATE POLICY "booking_inquiries_public_insert" ON booking_inquiries
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "booking_inquiries_authenticated_read" ON booking_inquiries;
CREATE POLICY "booking_inquiries_authenticated_read" ON booking_inquiries
FOR SELECT USING (auth.role() = 'authenticated');

-- Service role has full access (for admin operations)
DO $$
DECLARE
  all_tables TEXT[] := ARRAY[
    'site_settings', 'theme_settings', 'fleet', 'destinations', 'reviews', 'stats',
    'culinary_experiences', 'crew', 'contact_persons', 'booking_inquiries',
    'media_assets', 'booking_availability'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY all_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_service_role_all" ON %s', t, t);
    EXECUTE format('
      CREATE POLICY "%s_service_role_all" ON %s
      FOR ALL USING (auth.jwt() ->> ''role'' = ''service_role'')
    ', t, t);
  END LOOP;
END $$;

-- ============================================================================
-- PART 5: DEFAULT DATA
-- ============================================================================

-- Insert default theme settings
INSERT INTO theme_settings (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert default section visibility settings
INSERT INTO site_settings (key, value) VALUES
  ('section_journey_visible', 'true'),
  ('section_mission_visible', 'true'),
  ('section_crew_visible', 'true'),
  ('section_culinary_visible', 'true'),
  ('section_contact_visible', 'true'),
  ('section_fleet_visible', 'true'),
  ('section_destinations_visible', 'true'),
  ('section_reviews_visible', 'true'),
  ('contact_email', 'peter.sutter@gmail.com'),
  ('contact_phone', '+34 680 957 096'),
  ('contact_whatsapp', '+34680957096'),
  ('manager_name', 'Peter Sutter')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- PART 6: COLUMN COMMENTS (Documentation)
-- ============================================================================

-- Fleet comments
COMMENT ON TABLE fleet IS 'Yacht/boat fleet available for charter';
COMMENT ON COLUMN fleet.technical_specs IS 'JSONB: beam, draft, engines, fuel_capacity, water_capacity, cruising_speed, max_speed';
COMMENT ON COLUMN fleet.amenities IS 'JSONB: boolean flags for amenities (ac, watermaker, generator, etc.)';
COMMENT ON COLUMN fleet.extras IS 'JSONB array: extra features/services available';
COMMENT ON COLUMN fleet.apa_percentage IS 'Advance Provisioning Allowance percentage (default 30%)';
COMMENT ON COLUMN fleet.recently_refitted IS 'Whether the boat was recently refitted';
COMMENT ON COLUMN fleet.refit_year IS 'Year of last refit';
COMMENT ON COLUMN fleet.show_on_home IS 'Whether to show on homepage fleet section';

-- Destinations comments
COMMENT ON TABLE destinations IS 'Charter destinations (Ibiza, Mallorca, etc.)';
COMMENT ON COLUMN destinations.highlights_data IS 'JSONB array: attractions/highlights with i18n support';
COMMENT ON COLUMN destinations.coordinates IS 'JSONB: {lat, lng} for map display';
COMMENT ON COLUMN destinations.seasonal_data IS 'JSONB: seasonal sailing information';

-- Theme settings comments
COMMENT ON TABLE theme_settings IS 'Dynamic theme configuration for the website';
COMMENT ON COLUMN theme_settings.primary_color IS 'Main brand color (navy blue)';
COMMENT ON COLUMN theme_settings.accent_color IS 'Accent/highlight color (gold)';

-- Contact persons comments
COMMENT ON TABLE contact_persons IS 'Business contact persons for charter inquiries';
COMMENT ON COLUMN contact_persons.locations IS 'Array of locations where this contact operates';

-- Booking inquiries comments
COMMENT ON TABLE booking_inquiries IS 'Customer booking requests and leads';
COMMENT ON COLUMN booking_inquiries.source IS 'Source of inquiry: website, chatbot, whatsapp, email';

-- ============================================================================
-- MASTER SCHEMA COMPLETE
-- ============================================================================
-- Run individual migration files (001_xxx.sql, 002_xxx.sql) for incremental updates.
-- ============================================================================
