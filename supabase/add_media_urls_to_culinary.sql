-- Add media_urls column to culinary_experiences table
-- This allows storing multiple images/videos per culinary experience

-- Add media_urls as JSONB array column
ALTER TABLE culinary_experiences 
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN culinary_experiences.media_urls IS 'Array of image/video URLs (images and YouTube URLs) for the culinary experience';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_culinary_experiences_media_urls 
ON culinary_experiences USING GIN (media_urls);
