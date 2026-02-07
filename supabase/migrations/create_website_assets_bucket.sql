-- Create website-assets storage bucket for universal image uploads
-- This bucket will be used for all admin panel image uploads (yachts, milestones, promises, etc.)

-- Note: Storage buckets are created via Supabase Dashboard or Storage API
-- This SQL file provides the RLS policies and configuration

-- Create bucket if it doesn't exist (run this in Supabase SQL Editor)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'website-assets',
--   'website-assets',
--   true, -- Public bucket so images can be accessed via public URLs
--   5242880, -- 5MB file size limit
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- RLS Policies for website-assets bucket
-- Allow authenticated users (admin) to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-assets' AND
  (storage.foldername(name))[1] IN ('milestones', 'promises', 'fleet', 'destinations', 'general')
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'website-assets')
WITH CHECK (bucket_id = 'website-assets');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'website-assets');

-- Allow public read access (so images can be displayed on the website)
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'website-assets');
