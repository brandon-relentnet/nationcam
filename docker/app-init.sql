-- NationCam — App Database Schema

-- ────────────────────────────────────────────────
-- Functions
-- ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_slug(input TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(trim(input), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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

-- ────────────────────────────────────────────────
-- Tables
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS states (
  state_id    SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  slug        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sublocations (
  sublocation_id SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  state_id       INTEGER NOT NULL REFERENCES states(state_id) ON DELETE CASCADE,
  slug           TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(state_id, slug)
);

CREATE TABLE IF NOT EXISTS videos (
  video_id       SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  src            TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'application/x-mpegURL',
  state_id       INTEGER NOT NULL REFERENCES states(state_id) ON DELETE CASCADE,
  sublocation_id INTEGER REFERENCES sublocations(sublocation_id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by     TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_states_slug ON states(slug);
CREATE INDEX IF NOT EXISTS idx_sublocations_state_id ON sublocations(state_id);
CREATE INDEX IF NOT EXISTS idx_videos_state_id ON videos(state_id);
CREATE INDEX IF NOT EXISTS idx_videos_sublocation_id ON videos(sublocation_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- ────────────────────────────────────────────────
-- Triggers
-- ────────────────────────────────────────────────

CREATE OR REPLACE TRIGGER trg_states_slug
  BEFORE INSERT OR UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION set_slug_from_name();

CREATE OR REPLACE TRIGGER trg_states_updated
  BEFORE UPDATE ON states
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_sublocations_slug
  BEFORE INSERT OR UPDATE ON sublocations
  FOR EACH ROW EXECUTE FUNCTION set_slug_from_name();

CREATE OR REPLACE TRIGGER trg_sublocations_updated
  BEFORE UPDATE ON sublocations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_videos_updated
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
