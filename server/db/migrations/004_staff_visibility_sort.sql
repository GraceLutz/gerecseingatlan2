-- Migration: Add showEmail, showPhone, sortOrder columns to staff table
-- These support public team page display control and ordering

ALTER TABLE staff ADD COLUMN IF NOT EXISTS show_email BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS show_phone BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Rollback:
-- ALTER TABLE staff DROP COLUMN IF EXISTS show_email;
-- ALTER TABLE staff DROP COLUMN IF EXISTS show_phone;
-- ALTER TABLE staff DROP COLUMN IF EXISTS sort_order;
