-- Expo push notification tokens for mobile workers
CREATE TABLE IF NOT EXISTS expo_push_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL,
  farm_id       INTEGER REFERENCES farms(id) ON DELETE SET NULL,
  expo_push_token TEXT NOT NULL UNIQUE,
  platform      TEXT,
  device_name   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expo_push_tokens_user_id_idx ON expo_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS expo_push_tokens_farm_id_idx  ON expo_push_tokens(farm_id);
