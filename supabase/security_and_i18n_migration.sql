-- ============================================================================
-- Security and Internationalization Migration
-- ============================================================================
-- This migration addresses:
-- 1. Row Level Security (RLS) policies for critical tables
-- 2. Internationalization (i18n) columns for fleet table
-- 3. Storage bucket policies for public read access
-- ============================================================================
-- Run this entire script in Supabase SQL Editor
-- ============================================================================
-- This script is idempotent - safe to run multiple times
-- ============================================================================

-- ============================================================================
-- PART 0: CLEANUP - Drop existing policies if they exist (for clean migration)
-- ============================================================================

-- Drop existing policies to avoid conflicts (optional - comment out if you want to keep existing policies)
-- Fleet policies
DROP POLICY IF EXISTS "fleet_public_read" ON fleet;
DROP POLICY IF EXISTS "fleet_authenticated_all" ON fleet;

-- Booking Inquiries policies
DROP POLICY IF EXISTS "booking_inquiries_public_insert" ON booking_inquiries;
DROP POLICY IF EXISTS "booking_inquiries_authenticated_all" ON booking_inquiries;

-- Booking Availability policies
DROP POLICY IF EXISTS "booking_availability_public_read" ON booking_availability;
DROP POLICY IF EXISTS "booking_availability_authenticated_all" ON booking_availability;

-- Crew policies
DROP POLICY IF EXISTS "crew_public_read" ON crew;
DROP POLICY IF EXISTS "crew_authenticated_all" ON crew;

-- Site Settings policies
DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
DROP POLICY IF EXISTS "site_settings_authenticated_all" ON site_settings;

-- ============================================================================
-- PART 1: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all critical tables
ALTER TABLE fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: CREATE RLS POLICIES - PUBLIC READ ACCESS
-- ============================================================================

-- Fleet: Public read access (SELECT) for anonymous users
CREATE POLICY "fleet_public_read" ON fleet
  FOR SELECT
  USING (true);

-- Crew: Public read access (SELECT) for anonymous users
CREATE POLICY "crew_public_read" ON crew
  FOR SELECT
  USING (true);

-- Site Settings: Public read access (SELECT) for anonymous users
CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT
  USING (true);

-- Booking Availability: Public read access (SELECT) for anonymous users
CREATE POLICY "booking_availability_public_read" ON booking_availability
  FOR SELECT
  USING (true);

-- ============================================================================
-- PART 3: CREATE RLS POLICIES - PUBLIC INSERT ACCESS
-- ============================================================================

-- Booking Inquiries: Public insert access (INSERT) for anonymous users
CREATE POLICY "booking_inquiries_public_insert" ON booking_inquiries
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- PART 4: CREATE RLS POLICIES - AUTHENTICATED FULL ACCESS
-- ============================================================================

-- Note: Service role (admin) bypasses RLS automatically, so these policies
-- are for regular authenticated users. Use auth.uid() IS NOT NULL to check
-- if a user is authenticated.

-- Fleet: Full access (ALL) for authenticated users
CREATE POLICY "fleet_authenticated_all" ON fleet
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Booking Inquiries: Full access (ALL) for authenticated users
CREATE POLICY "booking_inquiries_authenticated_all" ON booking_inquiries
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Booking Availability: Full access (ALL) for authenticated users
CREATE POLICY "booking_availability_authenticated_all" ON booking_availability
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Crew: Full access (ALL) for authenticated users
CREATE POLICY "crew_authenticated_all" ON crew
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Site Settings: Full access (ALL) for authenticated users
CREATE POLICY "site_settings_authenticated_all" ON site_settings
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- PART 5: INTERNATIONALIZATION (i18n) - ADD COLUMNS TO FLEET TABLE
-- ============================================================================

-- Add i18n description columns (matching destinations table structure)
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Add boat_name column if missing
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS boat_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN fleet.description_en IS 'English description of the yacht';
COMMENT ON COLUMN fleet.description_es IS 'Spanish description of the yacht (Descripción en español)';
COMMENT ON COLUMN fleet.description_de IS 'German description of the yacht (Deutsche Beschreibung)';
COMMENT ON COLUMN fleet.boat_name IS 'Official name of the boat/yacht';

-- Migrate existing description data to description_en if description_en is NULL
-- This preserves existing data during migration
UPDATE fleet
SET description_en = description
WHERE description_en IS NULL 
  AND description IS NOT NULL;

-- ============================================================================
-- PART 6: STORAGE BUCKET POLICIES - PUBLIC READ ACCESS
-- ============================================================================

-- Note: Storage buckets must exist before policies can be created
-- This script will attempt to create policies for common bucket names
-- Adjust bucket names ('fleet' and 'media') based on your actual bucket names

-- Enable RLS on storage.objects (safe to run even if already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for 'fleet' bucket: Public read access
-- Replace 'fleet' with your actual bucket name if different
-- Drop policy if it exists, then create it (to avoid conflicts)
DROP POLICY IF EXISTS "fleet_public_read" ON storage.objects;
CREATE POLICY "fleet_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'fleet');

-- Policy for 'media' bucket: Public read access (alternative bucket name)
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

-- Note: If your bucket names are different, you can:
-- 1. Check existing buckets: SELECT name FROM storage.buckets;
-- 2. Update the bucket_id in the policies above
-- 3. Or create additional policies for your specific bucket names

-- ============================================================================
-- VERIFICATION QUERIES (Optional - Run separately to verify)
-- ============================================================================

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('fleet', 'booking_inquiries', 'booking_availability', 'crew', 'site_settings');

-- Verify policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('fleet', 'booking_inquiries', 'booking_availability', 'crew', 'site_settings')
-- ORDER BY tablename, policyname;

-- Verify i18n columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'fleet' 
--   AND column_name IN ('description_en', 'description_es', 'description_de', 'boat_name');

-- Verify storage buckets exist
-- SELECT name, public FROM storage.buckets WHERE name IN ('fleet', 'media');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
-- ✅ RLS enabled on: fleet, booking_inquiries, booking_availability, crew, site_settings
-- ✅ Public read policies created for: fleet, crew, site_settings, booking_availability
-- ✅ Public insert policy created for: booking_inquiries
-- ✅ Authenticated full access policies created for all tables
-- ✅ i18n columns added to fleet: description_en, description_es, description_de
-- ✅ boat_name column added to fleet
-- ✅ Storage bucket policies created for 'fleet' and 'media' buckets (if they exist)
-- ============================================================================
