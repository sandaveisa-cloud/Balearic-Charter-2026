-- Contact Persons Table
-- This table stores contact information for the charter business

CREATE TABLE IF NOT EXISTS contact_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT, -- e.g., "Owner", "Operations Manager", "Sales Director"
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  locations TEXT[], -- Array of location strings (e.g., ['Ibiza', 'Palma', 'Torrevieja'])
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0, -- For ordering multiple contacts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active contacts
CREATE INDEX IF NOT EXISTS idx_contact_persons_active ON contact_persons(is_active) WHERE is_active = true;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_contact_persons_order ON contact_persons(order_index);

-- Add comments
COMMENT ON TABLE contact_persons IS 'Contact persons for the charter business';
COMMENT ON COLUMN contact_persons.locations IS 'Array of locations where this contact person operates (e.g., ["Ibiza", "Palma", "Torrevieja"])';

-- Insert default contact person
INSERT INTO contact_persons (name, role, phone, email, locations, is_active, order_index) VALUES
  ('Peter Sutter', 'Operations Manager', '+34 680 957 096', 'peter.sutter@gmail.com', ARRAY['Ibiza', 'Palma', 'Torrevieja'], true, 0)
ON CONFLICT DO NOTHING;
