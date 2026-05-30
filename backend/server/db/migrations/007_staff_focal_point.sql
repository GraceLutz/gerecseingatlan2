-- Migration: Add focal point fields to staff table for avatar cropping

ALTER TABLE staff ADD COLUMN IF NOT EXISTS focal_point_x INTEGER NOT NULL DEFAULT 50;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS focal_point_y INTEGER NOT NULL DEFAULT 25;

-- Rollback:
-- ALTER TABLE staff DROP COLUMN IF EXISTS focal_point_x;
-- ALTER TABLE staff DROP COLUMN IF EXISTS focal_point_y;
