-- ============================================
-- Add missing indexes for performance
-- calendar_events: staff_id, start_datetime
-- staff: user_id
-- sessions: expires_at
-- ============================================

-- UP
CREATE INDEX IF NOT EXISTS calendar_events_staff_id_idx ON calendar_events(staff_id);
CREATE INDEX IF NOT EXISTS calendar_events_start_datetime_idx ON calendar_events(start_datetime);
CREATE INDEX IF NOT EXISTS staff_user_id_idx ON staff(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

-- DOWN (rollback)
-- DROP INDEX IF EXISTS calendar_events_staff_id_idx;
-- DROP INDEX IF EXISTS calendar_events_start_datetime_idx;
-- DROP INDEX IF EXISTS staff_user_id_idx;
-- DROP INDEX IF EXISTS sessions_expires_at_idx;
