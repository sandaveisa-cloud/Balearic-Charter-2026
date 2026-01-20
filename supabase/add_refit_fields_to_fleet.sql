-- Add refit fields to fleet table
-- These fields allow marking boats that have been recently refitted

-- Add recently_refitted boolean field
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS recently_refitted BOOLEAN DEFAULT false;

-- Add refit_details text field for storing refit information
ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS refit_details TEXT;

-- Add comments to explain the columns
COMMENT ON COLUMN fleet.recently_refitted IS 'Boolean flag indicating if the boat was recently refitted';
COMMENT ON COLUMN fleet.refit_details IS 'Text description of refit details (e.g., "Complete interior renovation, new electronics, engine overhaul")';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_fleet_recently_refitted 
ON fleet (recently_refitted) 
WHERE recently_refitted = true;
