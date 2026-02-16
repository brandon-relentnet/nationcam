-- NationCam PostgreSQL Schema
-- This file initializes the database for use with PostgREST.

-- ────────────────────────────────────────────────
-- Roles
-- ────────────────────────────────────────────────

-- Anonymous role (read-only for public data)
DO $$ BEGIN
  CREATE ROLE web_anon NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin role (full CRUD for authenticated requests)
DO $$ BEGIN
  CREATE ROLE web_admin NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticator role (login role used by PostgREST, switches to web_anon or web_admin)
DO $$ BEGIN
  CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'CHANGE_ME';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT web_anon TO authenticator;
GRANT web_admin TO authenticator;

-- ────────────────────────────────────────────────
-- Schema: public
-- ────────────────────────────────────────────────

-- Slug generation function
CREATE OR REPLACE FUNCTION generate_slug(name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ────────────────────────────────────────────────
-- Tables
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS states (
  state_id    SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  slug        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sublocations (
  sublocation_id SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT,
  state_id       INTEGER NOT NULL REFERENCES states(state_id) ON DELETE CASCADE,
  slug           TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videos (
  video_id       SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  src            TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'video/mp4',
  state_id       INTEGER NOT NULL REFERENCES states(state_id) ON DELETE CASCADE,
  sublocation_id INTEGER REFERENCES sublocations(sublocation_id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  user_id    SERIAL PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_states_slug ON states(slug);
CREATE INDEX IF NOT EXISTS idx_sublocations_slug ON sublocations(slug);
CREATE INDEX IF NOT EXISTS idx_sublocations_state_id ON sublocations(state_id);
CREATE INDEX IF NOT EXISTS idx_videos_state_id ON videos(state_id);
CREATE INDEX IF NOT EXISTS idx_videos_sublocation_id ON videos(sublocation_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- ────────────────────────────────────────────────
-- Triggers: auto-generate slug from name
-- ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_slug_from_name() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- States triggers
DROP TRIGGER IF EXISTS trg_states_slug ON states;
CREATE TRIGGER trg_states_slug
  BEFORE INSERT OR UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION set_slug_from_name();

DROP TRIGGER IF EXISTS trg_states_updated ON states;
CREATE TRIGGER trg_states_updated
  BEFORE UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Sublocations triggers
DROP TRIGGER IF EXISTS trg_sublocations_slug ON sublocations;
CREATE TRIGGER trg_sublocations_slug
  BEFORE INSERT OR UPDATE ON sublocations
  FOR EACH ROW EXECUTE FUNCTION set_slug_from_name();

DROP TRIGGER IF EXISTS trg_sublocations_updated ON sublocations;
CREATE TRIGGER trg_sublocations_updated
  BEFORE UPDATE ON sublocations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Videos triggers
DROP TRIGGER IF EXISTS trg_videos_updated ON videos;
CREATE TRIGGER trg_videos_updated
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Users triggers
DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ────────────────────────────────────────────────
-- Permissions
-- ────────────────────────────────────────────────

-- web_anon: read-only access to public tables
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT ON states, sublocations, videos TO web_anon;

-- web_admin: full CRUD on all tables
GRANT USAGE ON SCHEMA public TO web_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON states, sublocations, videos, users TO web_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO web_admin;
