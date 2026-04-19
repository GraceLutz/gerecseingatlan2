-- ============================================
-- Create featured_properties table
-- Tracks which XML feed properties are marked as featured
-- ============================================

-- UP
CREATE TABLE IF NOT EXISTS featured_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id VARCHAR(255) NOT NULL UNIQUE,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  featured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  featured_order INTEGER DEFAULT 0,
  featured_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS featured_properties_property_id_idx ON featured_properties(property_id);
CREATE INDEX IF NOT EXISTS featured_properties_featured_order_idx ON featured_properties(is_featured, featured_order);

-- DOWN (rollback)
-- DROP INDEX IF EXISTS featured_properties_featured_order_idx;
-- DROP INDEX IF EXISTS featured_properties_property_id_idx;
-- DROP TABLE IF EXISTS featured_properties;
