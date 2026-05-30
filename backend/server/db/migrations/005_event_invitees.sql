-- Migration: Create event_invitees table for calendar invite feature

CREATE TABLE IF NOT EXISTS event_invitees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  email VARCHAR(320) NOT NULL,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS event_invitees_event_id_idx ON event_invitees(event_id);
CREATE INDEX IF NOT EXISTS event_invitees_staff_id_idx ON event_invitees(staff_id);

-- Rollback:
-- DROP TABLE IF EXISTS event_invitees;
