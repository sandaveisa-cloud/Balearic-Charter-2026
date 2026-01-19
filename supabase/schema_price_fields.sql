-- Add price calculation fields to fleet table
-- Run this after the main schema.sql

ALTER TABLE fleet 
ADD COLUMN IF NOT EXISTS apa_percentage DECIMAL(5, 2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS crew_service_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5, 2) DEFAULT 21.00;

-- Add comments for documentation
COMMENT ON COLUMN fleet.apa_percentage IS 'Advance Provisioning Allowance percentage (default 30%)';
COMMENT ON COLUMN fleet.crew_service_fee IS 'Fixed crew service fee in currency';
COMMENT ON COLUMN fleet.cleaning_fee IS 'Fixed cleaning fee in currency';
COMMENT ON COLUMN fleet.tax_percentage IS 'Tax (IVA) percentage (default 21%)';
