-- ============================================================================
-- Comprehensive RLS Policy Setup
-- ============================================================================
-- This script sets up Row Level Security policies for all public tables:
-- 1. Admin full access for authenticated users
-- 2. Public read access for anonymous users (for website display)
-- 3. Public insert access for booking_inquiries (for booking form)
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Pilna piekļuve ielogotam adminam visās tabulās
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') LOOP
        -- Enable RLS on all tables
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop existing admin policy if it exists
        EXECUTE format('DROP POLICY IF EXISTS "Admin full access" ON public.%I;', t);
        
        -- Create admin full access policy for authenticated users
        EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
        
        -- Drop existing public read policy if it exists
        EXECUTE format('DROP POLICY IF EXISTS "Public read access" ON public.%I;', t);
        
        -- Atļaujam arī publisku lasīšanu visam (mājas lapai)
        EXECUTE format('CREATE POLICY "Public read access" ON public.%I FOR SELECT TO anon USING (true);', t);
    END LOOP;
END $$;

-- 2. Speciāla atļauja pieteikumu sūtīšanai (lai mājas lapā nebūtu 'Permission denied')
DROP POLICY IF EXISTS "Enable insert for public" ON public.booking_inquiries;
CREATE POLICY "Enable insert for public" ON public.booking_inquiries FOR INSERT WITH CHECK (true);

-- 3. Verify policies were created
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected result:
-- All tables should have:
--   - "Admin full access" policy for authenticated users (ALL operations)
--   - "Public read access" policy for anon users (SELECT only)
--   - booking_inquiries should also have "Enable insert for public" (INSERT for anon)
