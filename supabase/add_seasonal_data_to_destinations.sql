-- ============================================================================
-- Add Seasonal Data to Destinations Table
-- ============================================================================
-- This migration adds a seasonal_data JSONB field to store sailing scores,
-- weather conditions, and seasonal information for destinations
-- ============================================================================

-- Add seasonal_data column to destinations table
ALTER TABLE destinations
ADD COLUMN IF NOT EXISTS seasonal_data JSONB DEFAULT '{}'::jsonb;

-- Create GIN index for better query performance on JSONB column
CREATE INDEX IF NOT EXISTS idx_destinations_seasonal_data
ON destinations USING GIN (seasonal_data);

-- Add comment to explain the column
COMMENT ON COLUMN destinations.seasonal_data IS 'JSONB object containing seasonal sailing data:
{
  "spring": {
    "sailing_score": 85,
    "avg_temp": 20,
    "conditions": "Mild winds, perfect for beginners",
    "tourist_level": "Moderate",
    "pros": ["Fewer crowds", "Pleasant temperatures", "Good wind conditions"]
  },
  "summer": {
    "sailing_score": 90,
    "avg_temp": 28,
    "conditions": "Strong consistent winds, ideal sailing",
    "tourist_level": "High",
    "pros": ["Best weather", "Vibrant atmosphere", "Long daylight hours"]
  },
  "earlyAutumn": {
    "sailing_score": 95,
    "avg_temp": 24,
    "conditions": "Perfect conditions, warm water, steady winds",
    "tourist_level": "Moderate",
    "pros": ["Optimal sailing", "Warm water", "Fewer tourists", "Best value"]
  },
  "lateAutumn": {
    "sailing_score": 80,
    "avg_temp": 18,
    "conditions": "Cooler but still sailable",
    "tourist_level": "Low",
    "pros": ["Peaceful", "Lower prices", "Authentic experience"]
  },
  "winter": {
    "sailing_score": 60,
    "avg_temp": 15,
    "conditions": "Challenging, for experienced sailors",
    "tourist_level": "Very Low",
    "pros": ["Exclusive", "Best prices", "Local culture"]
  }
}';

-- Example: Add seasonal data for Palma de Mallorca
UPDATE destinations
SET seasonal_data = '{
  "spring": {
    "sailing_score": 85,
    "avg_temp": 20,
    "conditions": "Mild winds, perfect for beginners",
    "tourist_level": "Moderate",
    "pros": ["Fewer crowds", "Pleasant temperatures", "Good wind conditions"]
  },
  "summer": {
    "sailing_score": 90,
    "avg_temp": 28,
    "conditions": "Strong consistent winds, ideal sailing",
    "tourist_level": "High",
    "pros": ["Best weather", "Vibrant atmosphere", "Long daylight hours"]
  },
  "earlyAutumn": {
    "sailing_score": 95,
    "avg_temp": 24,
    "conditions": "Perfect conditions, warm water, steady winds",
    "tourist_level": "Moderate",
    "pros": ["Optimal sailing", "Warm water", "Fewer tourists", "Best value"]
  },
  "lateAutumn": {
    "sailing_score": 80,
    "avg_temp": 18,
    "conditions": "Cooler but still sailable",
    "tourist_level": "Low",
    "pros": ["Peaceful", "Lower prices", "Authentic experience"]
  },
  "winter": {
    "sailing_score": 60,
    "avg_temp": 15,
    "conditions": "Challenging, for experienced sailors",
    "tourist_level": "Very Low",
    "pros": ["Exclusive", "Best prices", "Local culture"]
  }
}'::jsonb
WHERE slug = 'mallorca' OR name ILIKE '%mallorca%' OR name ILIKE '%palma%';

-- Verify the update
SELECT name, slug, seasonal_data FROM destinations 
WHERE seasonal_data IS NOT NULL AND seasonal_data != '{}'::jsonb;
