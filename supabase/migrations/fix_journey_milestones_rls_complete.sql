-- Complete RLS Policy Fix for journey_milestones table
-- Run this in Supabase SQL Editor to ensure INSERT and UPDATE policies are correctly set

-- Step 1: Enable RLS if not already enabled
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated select on journey_milestones" ON journey_milestones;
DROP POLICY IF EXISTS "Allow authenticated insert on journey_milestones" ON journey_milestones;
DROP POLICY IF EXISTS "Allow authenticated update on journey_milestones" ON journey_milestones;
DROP POLICY IF EXISTS "Allow authenticated delete on journey_milestones" ON journey_milestones;
DROP POLICY IF EXISTS "Allow public select on journey_milestones" ON journey_milestones;

-- Step 3: Create INSERT policy for authenticated users
CREATE POLICY "Allow authenticated insert on journey_milestones"
ON journey_milestones
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 4: Create UPDATE policy for authenticated users
CREATE POLICY "Allow authenticated update on journey_milestones"
ON journey_milestones
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 5: Create SELECT policy for authenticated users
CREATE POLICY "Allow authenticated select on journey_milestones"
ON journey_milestones
FOR SELECT
TO authenticated
USING (true);

-- Step 6: Create DELETE policy for authenticated users
CREATE POLICY "Allow authenticated delete on journey_milestones"
ON journey_milestones
FOR DELETE
TO authenticated
USING (true);

-- Step 7: Create public SELECT policy (for frontend display)
CREATE POLICY "Allow public select on journey_milestones"
ON journey_milestones
FOR SELECT
TO public
USING (is_active = true);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'journey_milestones'
ORDER BY policyname;
