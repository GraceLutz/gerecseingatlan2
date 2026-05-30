-- Migration: Create AI agent tables (chat, caching, usage tracking)

-- 1. ENUM for chat message roles
DO $$ BEGIN
  CREATE TYPE chat_message_role AS ENUM ('user', 'assistant', 'tool');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id VARCHAR(255) NOT NULL,
  property_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS chat_sessions_user_session_id_idx
  ON chat_sessions(user_session_id);
CREATE INDEX IF NOT EXISTS chat_sessions_property_id_idx
  ON chat_sessions(property_id);

-- 3. Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role chat_message_role NOT NULL,
  content TEXT,
  tool_calls JSONB,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx
  ON chat_messages(session_id);

-- 4. Places cache (Google Places API results, 30-day TTL)
CREATE TABLE IF NOT EXISTS places_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(128) NOT NULL,
  result JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS places_cache_query_hash_idx
  ON places_cache(query_hash);

-- 5. Distance cache (Google Distance Matrix results, 7-day TTL)
CREATE TABLE IF NOT EXISTS distance_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  dest_place_id VARCHAR(255) NOT NULL,
  mode VARCHAR(20) NOT NULL,
  distance_m INTEGER NOT NULL,
  duration_s INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS distance_cache_origin_dest_mode_idx
  ON distance_cache(origin_lat, origin_lng, dest_place_id, mode);

-- 6. API usage log (cost tracking per call)
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  tokens_or_units INTEGER,
  estimated_cost_eur NUMERIC(10, 6) NOT NULL,
  user_session_id VARCHAR(255),
  property_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_usage_log_service_idx
  ON api_usage_log(service);
CREATE INDEX IF NOT EXISTS api_usage_log_created_at_idx
  ON api_usage_log(created_at);
CREATE INDEX IF NOT EXISTS api_usage_log_user_session_id_idx
  ON api_usage_log(user_session_id);

-- Rollback:
-- DROP TABLE IF EXISTS api_usage_log;
-- DROP TABLE IF EXISTS distance_cache;
-- DROP TABLE IF EXISTS places_cache;
-- DROP TABLE IF EXISTS chat_messages;
-- DROP TABLE IF EXISTS chat_sessions;
-- DROP TYPE IF EXISTS chat_message_role;
