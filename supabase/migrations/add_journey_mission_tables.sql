-- Create journey_milestones table
CREATE TABLE IF NOT EXISTS journey_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  title_de TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_de TEXT NOT NULL,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create mission_promises table
CREATE TABLE IF NOT EXISTS mission_promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  title_de TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_de TEXT NOT NULL,
  icon_name TEXT, -- Icon identifier (e.g., 'Ship', 'ShieldCheck', 'Utensils')
  icon_url TEXT, -- Custom icon image URL
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journey_milestones_year ON journey_milestones(year);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_order ON journey_milestones(order_index);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_active ON journey_milestones(is_active);
CREATE INDEX IF NOT EXISTS idx_mission_promises_order ON mission_promises(order_index);
CREATE INDEX IF NOT EXISTS idx_mission_promises_active ON mission_promises(is_active);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_journey_milestones_updated_at BEFORE UPDATE ON journey_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_promises_updated_at BEFORE UPDATE ON mission_promises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default mission promises (if table is empty)
INSERT INTO mission_promises (title_en, title_es, title_de, description_en, description_es, description_de, icon_name, order_index, is_active)
SELECT 
  'Seamless Coordination',
  'Coordinación Perfecta',
  'Nahtlose Koordination',
  'Expert planning and safe routes for every charter journey.',
  'Planificación experta y rutas seguras para cada viaje en charter.',
  'Expertenplanung und sichere Routen für jede Charterreise.',
  'Ship',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM mission_promises);

INSERT INTO mission_promises (title_en, title_es, title_de, description_en, description_es, description_de, icon_name, order_index, is_active)
SELECT 
  'Professional Crew',
  'Tripulación Profesional',
  'Professionelle Crew',
  'Experienced maritime experts dedicated to your safety and comfort.',
  'Expertos marítimos experimentados dedicados a su seguridad y comodidad.',
  'Erfahrene maritime Experten, die sich Ihrer Sicherheit und Ihrem Komfort widmen.',
  'ShieldCheck',
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM mission_promises WHERE icon_name = 'ShieldCheck');

INSERT INTO mission_promises (title_en, title_es, title_de, description_en, description_es, description_de, icon_name, order_index, is_active)
SELECT 
  'Gourmet Excellence',
  'Excelencia Gourmet',
  'Gourmet-Exzellenz',
  'Exquisite dining experiences crafted by expert chefs on board.',
  'Experiencias gastronómicas exquisitas elaboradas por chefs expertos a bordo.',
  'Exquisite kulinarische Erlebnisse, die von erfahrenen Köchen an Bord kreiert werden.',
  'Utensils',
  2,
  true
WHERE NOT EXISTS (SELECT 1 FROM mission_promises WHERE icon_name = 'Utensils');
