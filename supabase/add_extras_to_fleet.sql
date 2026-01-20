-- Add extras field to fleet table for yacht features/extras
-- This allows storing an array of features like 'WiFi', 'Snorkeling', 'Towels', etc.

-- Add extras as JSONB array column
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT '[]'::jsonb;

-- Create GIN index for better query performance on JSONB column
CREATE INDEX IF NOT EXISTS idx_fleet_extras 
ON fleet USING GIN (extras);

-- Add comment to explain the column
COMMENT ON COLUMN fleet.extras IS 'Array of extra features/services: ["WiFi", "Snorkeling", "Towels", "Audio System", etc.]';

-- Update Simona yacht to have year 2014
UPDATE fleet 
SET year = 2014 
WHERE slug = 'simona' AND (year IS NULL OR year != 2014);

-- Example: Add some default extras to Simona (optional - can be managed via admin panel)
-- UPDATE fleet 
-- SET extras = '["WiFi", "Snorkeling Equipment", "Towels", "Beach Towels", "Audio System"]'::jsonb
-- WHERE slug = 'simona' AND extras = '[]'::jsonb;
