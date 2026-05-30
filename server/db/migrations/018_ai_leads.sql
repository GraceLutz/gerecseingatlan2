-- Migration 018: ai_leads table + lead_status enum (chat lead capture)
-- Mirrors server/db/schema/agent.ts (aiLeads). Additive + idempotent.

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('uj', 'felhivva', 'nem_elerheto', 'lezart');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS ai_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  property_id TEXT,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  conversation_summary TEXT,
  current_path VARCHAR(500),
  ip_hash VARCHAR(64),
  status lead_status NOT NULL DEFAULT 'uj',
  called_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_leads_status_idx ON ai_leads(status);
CREATE INDEX IF NOT EXISTS ai_leads_created_at_idx ON ai_leads(created_at);

-- Rollback:
-- DROP TABLE IF EXISTS ai_leads;
-- DROP TYPE IF EXISTS lead_status;
