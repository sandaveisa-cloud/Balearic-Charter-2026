-- ============================================================================
-- Ensure Admin Full Access to All Tables
-- ============================================================================
-- This script ensures that authenticated users (admins) have full access
-- to all tables. This is used by admin API routes that use SERVICE_ROLE_KEY.
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Atļaut visu darbību veikšanu visām tabulām autentificētiem lietotājiem (adminam)
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE '_prisma%'
    ) 
    LOOP
        -- Drop existing policy if it exists
        EXECUTE format('DROP POLICY IF EXISTS "Admin Full Access" ON public.%I', t);
        
        -- Create new policy for full access
        EXECUTE format(
            'CREATE POLICY "Admin Full Access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', 
            t
        );
        
        RAISE NOTICE 'Created admin policy for table: %', t;
    END LOOP;
END $$;

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname = 'Admin Full Access'
ORDER BY tablename;

-- ============================================================================
-- Note: This script creates policies for authenticated users.
-- Admin API routes use SERVICE_ROLE_KEY which bypasses RLS entirely,
-- so these policies are for additional safety and direct admin access.
-- ============================================================================
