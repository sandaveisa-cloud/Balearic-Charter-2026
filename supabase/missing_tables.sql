-- ============================================================================
-- Missing Tables - Quick Fix
-- ============================================================================
-- Run this if you're getting 404 errors for these tables:
-- - booking_inquiries
-- - culinary_experiences  
-- - crew
-- ============================================================================

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status ON booking_inquiries(status);

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (drop first if exists to avoid errors)
DROP TRIGGER IF EXISTS update_booking_inquiries_updated_at ON booking_inquiries;
CREATE TRIGGER update_booking_inquiries_updated_at 
  BEFORE UPDATE ON booking_inquiries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_culinary_experiences_updated_at ON culinary_experiences;
CREATE TRIGGER update_culinary_experiences_updated_at 
  BEFORE UPDATE ON culinary_experiences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crew_updated_at ON crew;
CREATE TRIGGER update_crew_updated_at 
  BEFORE UPDATE ON crew 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO culinary_experiences (title, description, order_index) VALUES
  ('Authentic Paella', 'Traditional Spanish paella prepared fresh on board by our master chef, using the finest local ingredients.', 1),
  ('Premium Steaks', 'Grilled to perfection, our selection of premium steaks is paired with exquisite wines and stunning sea views.', 2),
  ('Mediterranean Cuisine', 'Fresh seafood, local produce, and Mediterranean flavors curated by our experienced culinary team.', 3),
  ('Sunset Dining', 'A romantic dining experience as the sun sets over the Mediterranean, featuring gourmet dishes and fine wines.', 4)
ON CONFLICT DO NOTHING;

INSERT INTO crew (name, role, bio, order_index) VALUES
  ('Captain James Martinez', 'Master Captain', 'With over 20 years of experience navigating the Mediterranean, Captain Martinez ensures every voyage is safe, smooth, and memorable.', 1),
  ('Chef Maria Rodriguez', 'Head Chef', 'Chef Rodriguez brings 15 years of culinary excellence, specializing in Mediterranean and international cuisine with locally sourced ingredients.', 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Done! These tables should now exist.
-- ============================================================================
