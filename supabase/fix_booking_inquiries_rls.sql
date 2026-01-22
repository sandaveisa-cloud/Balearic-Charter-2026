-- ============================================================================
-- FIX BOOKING_INQUIRIES RLS POLICIES
-- ============================================================================
-- This script fixes the RLS policies for booking_inquiries table
-- to ensure authenticated users can read inquiries in the admin panel
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Check current RLS status
-- (This is just for verification - you can run this separately)
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename = 'booking_inquiries';

-- STEP 2: Drop existing policies to start fresh
DROP POLICY IF EXISTS "booking_inquiries_public_insert" ON booking_inquiries;
DROP POLICY IF EXISTS "booking_inquiries_authenticated_all" ON booking_inquiries;
DROP POLICY IF EXISTS "booking_inquiries_authenticated_read" ON booking_inquiries;
DROP POLICY IF EXISTS "booking_inquiries_authenticated_write" ON booking_inquiries;

-- STEP 3: Ensure RLS is enabled
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create PUBLIC INSERT policy (anyone can create inquiries)
CREATE POLICY "booking_inquiries_public_insert" 
ON booking_inquiries
FOR INSERT
WITH CHECK (true);

-- STEP 5: Create AUTHENTICATED READ policy (authenticated users can read)
-- This is CRITICAL for admin panel to work
CREATE POLICY "booking_inquiries_authenticated_read" 
ON booking_inquiries
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- STEP 6: Create AUTHENTICATED WRITE policy (authenticated users can update/delete)
CREATE POLICY "booking_inquiries_authenticated_write" 
ON booking_inquiries
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- STEP 7: Verify policies were created
-- (Run this separately to verify)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'booking_inquiries'
-- ORDER BY policyname;

-- ============================================================================
-- VERIFICATION TEST
-- ============================================================================
-- After running this script, test in Supabase SQL Editor with:
-- 
-- 1. As authenticated user (you need to be logged in):
--    SELECT * FROM booking_inquiries;
--    (Should return all inquiries)
--
-- 2. Check your session:
--    SELECT auth.uid(), auth.email();
--    (Should return your user ID and email)
-- ============================================================================
