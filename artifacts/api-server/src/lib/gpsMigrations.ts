import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function runGpsMigrations(): Promise<void> {
  console.log("[GPS-MIGRATE] Running GPS tracking schema migrations...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS gps_integrations (
      id              SERIAL PRIMARY KEY,
      farm_id         INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      provider        VARCHAR(50) NOT NULL,
      status          VARCHAR(20) NOT NULL DEFAULT 'disconnected',
      api_key_encrypted        TEXT,
      webhook_secret_encrypted TEXT,
      last_sync_at    TIMESTAMPTZ,
      last_error      TEXT,
      display_name    VARCHAR(100),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(farm_id, provider)
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS gps_asset_positions (
      id                 SERIAL PRIMARY KEY,
      farm_id            INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      integration_id     INTEGER REFERENCES gps_integrations(id) ON DELETE CASCADE,
      provider           VARCHAR(50) NOT NULL,
      external_asset_id  VARCHAR(200) NOT NULL,
      asset_name         VARCHAR(200),
      asset_type         VARCHAR(50),
      latitude           NUMERIC(10,7) NOT NULL,
      longitude          NUMERIC(10,7) NOT NULL,
      speed_kph          NUMERIC(6,1),
      heading_deg        INTEGER,
      accuracy_m         NUMERIC(8,1),
      altitude_m         NUMERIC(8,1),
      ignition_on        BOOLEAN,
      last_seen_at       TIMESTAMPTZ NOT NULL,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(farm_id, provider, external_asset_id)
    );
  `);

  // OAuth token columns added for Teltonika (and future OAuth providers)
  await db.execute(sql`
    ALTER TABLE gps_integrations
      ADD COLUMN IF NOT EXISTS access_token_encrypted  TEXT,
      ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
      ADD COLUMN IF NOT EXISTS token_expires_at        TIMESTAMPTZ;
  `);

  console.log("[GPS-MIGRATE] Done.");
}
