-- Migration 016: Add staff color column and calendar reminder tracking columns
-- UP

-- Staff color for calendar UI
ALTER TABLE staff ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';

-- Calendar event reminder tracking
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMPTZ;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS reminder_90min_sent_at TIMESTAMPTZ;

-- DOWN (rollback)
-- ALTER TABLE staff DROP COLUMN IF EXISTS color;
-- ALTER TABLE calendar_events DROP COLUMN IF EXISTS client_name;
-- ALTER TABLE calendar_events DROP COLUMN IF EXISTS reminder_24h_sent_at;
-- ALTER TABLE calendar_events DROP COLUMN IF EXISTS reminder_90min_sent_at;
