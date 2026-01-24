-- ============================================================================
-- Migration: Add order_index column to fleet table
-- Version: 005
-- Description: Adds display order functionality to fleet items
-- ============================================================================

-- Add order_index column to fleet table if it doesn't exist
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Update existing rows to have sequential order_index based on current order
-- This preserves the is_featured ordering as the initial order_index
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY is_featured DESC, created_at ASC) - 1 AS rn
  FROM fleet
)
UPDATE fleet 
SET order_index = numbered.rn
FROM numbered
WHERE fleet.id = numbered.id
AND fleet.order_index IS NULL OR fleet.order_index = 0;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_fleet_order_index ON fleet(order_index);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verification
-- ============================================================================
-- After running, verify with:
-- SELECT id, name, order_index, is_featured FROM fleet ORDER BY order_index;
