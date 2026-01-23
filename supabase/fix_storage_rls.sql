-- Fix Storage RLS for fleet-images bucket
-- This allows authenticated users to upload, read, and manage images

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow authenticated users to SELECT (read) images
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read fleet-images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'fleet-images'
);

-- 3. Create policy to allow authenticated users to INSERT (upload) images
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload to fleet-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fleet-images'
);

-- 4. Create policy to allow authenticated users to UPDATE images
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update fleet-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fleet-images'
)
WITH CHECK (
  bucket_id = 'fleet-images'
);

-- 5. Create policy to allow authenticated users to DELETE images
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete from fleet-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'fleet-images'
);

-- 6. Also allow public read access (for displaying images on website)
CREATE POLICY IF NOT EXISTS "Allow public to read fleet-images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'fleet-images'
);

-- 7. Make sure the bucket exists and is public for reads
-- Note: Run this in Supabase Dashboard > Storage > fleet-images > Settings
-- Set "Public bucket" to true for public read access

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
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;
