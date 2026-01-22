-- ============================================================================
-- RLS STATUS CHECK - Run this FIRST to diagnose the problem
-- ============================================================================
-- This script checks the current RLS status and policies for all tables
-- ============================================================================

-- ============================================================================
-- PART 1: Check RLS Status for All Tables
-- ============================================================================
SELECT 
    tablename,
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity THEN '✅ RLS ON'
        ELSE '❌ RLS OFF'
    END as "Status"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'booking_inquiries',
    'fleet',
    'crew',
    'booking_availability',
    'site_settings',
    'culinary_experiences',
    'destinations',
    'media_assets',
    'reviews',
    'stats'
  )
ORDER BY tablename;

-- ============================================================================
-- PART 2: Check Existing Policies for booking_inquiries
-- ============================================================================
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    permissive as "Permissive",
    roles as "Roles",
    qual as "USING Clause",
    with_check as "WITH CHECK Clause"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'booking_inquiries'
ORDER BY policyname;

-- ============================================================================
-- PART 3: Check Current User Session
-- ============================================================================
-- This shows your current authentication status
SELECT 
    auth.uid() as "User ID",
    auth.email() as "Email",
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Authenticated'
        ELSE '❌ Not Authenticated'
    END as "Auth Status";

-- ============================================================================
-- PART 4: Test Query (Should work if RLS is configured correctly)
-- ============================================================================
-- Try to select from booking_inquiries
-- If this fails, RLS policies are blocking access
SELECT 
    COUNT(*) as "Total Inquiries",
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as "Pending",
    COUNT(CASE WHEN status = 'contacted' THEN 1 END) as "Contacted",
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as "Confirmed"
FROM booking_inquiries;

-- ============================================================================
-- PART 5: Check All Policies for Critical Tables
-- ============================================================================
SELECT 
    tablename,
    policyname,
    cmd as "Command",
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN '✅ Uses auth.uid()'
        WHEN qual LIKE '%true%' THEN '✅ Public Access'
        ELSE '⚠️ Check Policy'
    END as "Policy Type"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'booking_inquiries',
    'fleet',
    'crew',
    'booking_availability',
    'site_settings'
  )
ORDER BY tablename, policyname;

-- ============================================================================
-- INTERPRETATION GUIDE
-- ============================================================================
-- 
-- If PART 1 shows "RLS Enabled = true" for booking_inquiries:
--   → RLS is ON, need to check policies
--
-- If PART 2 shows NO policies for booking_inquiries:
--   → This is the problem! No policies = no access
--   → Run fix_booking_inquiries_rls.sql
--
-- If PART 3 shows "User ID = NULL":
--   → You're not authenticated in SQL Editor
--   → This is normal - SQL Editor uses postgres role
--   → But your app needs authenticated session
--
-- If PART 4 fails with "permission denied":
--   → RLS policies are blocking access
--   → Run fix_booking_inquiries_rls.sql
--
-- If PART 5 shows policies without auth.uid():
--   → Policies might be too restrictive
--   → Check if they allow authenticated users
--
-- ============================================================================
