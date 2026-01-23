-- Fix RLS for destinations table to allow admin operations
-- Admin API routes use service_role key which bypasses RLS,
-- but we should ensure proper policies exist for authenticated users

-- 1. Enable RLS on destinations table (if not already enabled)
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- 2. Allow service_role (admin) to do everything (bypass RLS)
-- Note: service_role key already bypasses RLS, but this is explicit
-- This policy is mainly for documentation

-- 3. Allow authenticated users to SELECT (read) destinations
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read destinations"
ON public.destinations
FOR SELECT
TO authenticated
USING (true);

-- 4. Allow authenticated users to INSERT destinations
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert destinations"
ON public.destinations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Allow authenticated users to UPDATE destinations
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update destinations"
ON public.destinations
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Allow authenticated users to DELETE destinations
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete destinations"
ON public.destinations
FOR DELETE
TO authenticated
USING (true);

-- 7. Allow public to SELECT (read) active destinations for website display
CREATE POLICY IF NOT EXISTS "Allow public to read active destinations"
ON public.destinations
FOR SELECT
TO public
USING (is_active = true);

-- 8. Verify policies
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
WHERE tablename = 'destinations'
AND schemaname = 'public'
ORDER BY policyname;
