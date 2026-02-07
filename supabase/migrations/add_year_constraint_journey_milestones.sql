-- Add CHECK constraint for year column in journey_milestones table
-- Ensures year values are between 2000 and 2030

-- First, drop existing constraint if it exists (in case it was added before)
ALTER TABLE journey_milestones 
DROP CONSTRAINT IF EXISTS journey_milestones_year_check;

-- Add CHECK constraint for year range
ALTER TABLE journey_milestones 
ADD CONSTRAINT journey_milestones_year_check 
CHECK (year >= 2000 AND year <= 2030);

-- Add comment to document the constraint
COMMENT ON COLUMN journey_milestones.year IS 'Year must be between 2000 and 2030';
