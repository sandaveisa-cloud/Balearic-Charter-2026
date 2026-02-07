-- Add yacht_id column to journey_milestones table for vessel-specific milestones
-- This allows milestones to be linked to specific yachts (nullable for company-wide milestones)

ALTER TABLE journey_milestones 
ADD COLUMN IF NOT EXISTS yacht_id UUID REFERENCES fleet(id) ON DELETE CASCADE;

-- Create index for better query performance when filtering by yacht
CREATE INDEX IF NOT EXISTS idx_journey_milestones_yacht_id ON journey_milestones(yacht_id);

-- Create composite index for active yacht-specific milestones
CREATE INDEX IF NOT EXISTS idx_journey_milestones_yacht_active ON journey_milestones(yacht_id, is_active) 
WHERE yacht_id IS NOT NULL AND is_active = true;
