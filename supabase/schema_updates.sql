-- Performance Optimization Schema Updates
-- Run this after the main schema.sql

-- Add metadata columns to media_assets table for image optimization
ALTER TABLE media_assets 
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS blur_hash TEXT,
ADD COLUMN IF NOT EXISTS file_format TEXT,
ADD COLUMN IF NOT EXISTS optimized_url TEXT;

-- Create index on media_assets category for faster queries
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON media_assets(category);

-- Create index on media_assets file_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_media_assets_file_type ON media_assets(file_type);

-- Add comments for documentation
COMMENT ON COLUMN media_assets.width IS 'Image width in pixels';
COMMENT ON COLUMN media_assets.height IS 'Image height in pixels';
COMMENT ON COLUMN media_assets.blur_hash IS 'Blur hash string for placeholder images';
COMMENT ON COLUMN media_assets.file_format IS 'File format (webp, avif, jpg, png)';
COMMENT ON COLUMN media_assets.optimized_url IS 'URL to optimized/compressed version of the image';
