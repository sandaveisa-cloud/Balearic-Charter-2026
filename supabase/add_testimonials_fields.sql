-- Add enhanced fields to reviews table for testimonials section
-- These fields support the new high-converting testimonials component

-- Add rental_date field (date when the yacht was rented/chartered)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS rental_date DATE;

-- Add published_date field (date when review was published)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS published_date DATE;

-- Add category field (e.g., 'With Captain', 'Catamarans', 'Bareboat', etc.)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add original_language field (language code: 'en', 'es', 'lv', 'de', etc.)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS original_language TEXT DEFAULT 'en';

-- Add translated_text field (pre-translated English version)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS translated_text TEXT;

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_reviews_category ON reviews(category) WHERE category IS NOT NULL;

-- Create index on rental_date for sorting
CREATE INDEX IF NOT EXISTS idx_reviews_rental_date ON reviews(rental_date) WHERE rental_date IS NOT NULL;

-- Add comment to table
COMMENT ON COLUMN reviews.rental_date IS 'Date when the yacht was rented/chartered';
COMMENT ON COLUMN reviews.published_date IS 'Date when the review was published';
COMMENT ON COLUMN reviews.category IS 'Category of the review (e.g., With Captain, Catamarans, Bareboat)';
COMMENT ON COLUMN reviews.original_language IS 'Language code of the original review text';
COMMENT ON COLUMN reviews.translated_text IS 'Pre-translated English version of the review';
