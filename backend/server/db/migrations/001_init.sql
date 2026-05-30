-- ============================================
-- Gerecse Ingatlan — Supabase adatbázis inicializálás
-- Futtasd sorrendben a Supabase SQL Editorban
-- ============================================

-- 1. ENUM típusok
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE subscriber_status AS ENUM ('pending', 'confirmed', 'unsubscribed');
CREATE TYPE event_type AS ENUM ('ingatlan_megtekintes', 'ugyfel_talalkozo', 'belso_megbeszeles', 'szabadsag', 'egyeb');

-- 2. Users (admin felhasználók)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'viewer',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Sessions (bejelentkezési munkamenetek)
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Activity Log (admin tevékenység napló)
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Newsletter Subscribers (hírlevél feliratkozók)
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  name VARCHAR(255),
  status subscriber_status NOT NULL DEFAULT 'pending',
  confirmation_token UUID DEFAULT gen_random_uuid(),
  confirmed_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX newsletter_subscribers_email_idx ON newsletter_subscribers(email);

-- 6. Staff (munkatársak)
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(50),
  role_title VARCHAR(255) NOT NULL DEFAULT 'Ingatlanközvetítő',
  photo_url TEXT,
  bio TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Content Blocks (CMS tartalomblokkok)
CREATE TABLE content_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  block_key VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  content_type VARCHAR(20) NOT NULL DEFAULT 'text',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX content_blocks_page_block_idx ON content_blocks(page_path, block_key);

-- 8. Content Block Versions (tartalom verziókövetés)
CREATE TABLE content_block_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  version INTEGER NOT NULL,
  edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Calendar Events (naptár események)
CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type event_type NOT NULL DEFAULT 'egyeb',
  location VARCHAR(500),
  property_id TEXT,
  color VARCHAR(7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Első admin felhasználó (info@gerecseingatlan.hu / Martin001)
INSERT INTO users (email, password_hash, name, role, active)
VALUES (
  'info@gerecseingatlan.hu',
  '$2b$10$O.21OBo29LH9kl3y.4hD.Ole1Andc/ha.//nzL/qtEDK.Lhu3uysm',
  'Admin',
  'admin',
  true
);
