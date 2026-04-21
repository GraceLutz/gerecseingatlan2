-- Migration: Create newsletter_campaigns table and campaign_status enum

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('draft', 'sent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(500) NOT NULL,
  preheader VARCHAR(255),
  body TEXT NOT NULL,
  campaign_status campaign_status NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  sent_by UUID,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rollback:
-- DROP TABLE IF EXISTS newsletter_campaigns;
-- DROP TYPE IF EXISTS campaign_status;
