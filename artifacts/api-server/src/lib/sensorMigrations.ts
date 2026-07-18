import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function runSensorMigrations(): Promise<void> {
  console.log("[SENSOR-MIGRATE] Running sensor integration schema migrations...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sensor_integrations (
      id               SERIAL PRIMARY KEY,
      farm_id          INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      provider         VARCHAR(50) NOT NULL,
      status           VARCHAR(20) NOT NULL DEFAULT 'disconnected',
      api_key_encrypted  TEXT,
      api_key2_encrypted TEXT,
      access_token_encrypted  TEXT,
      refresh_token_encrypted TEXT,
      token_expires_at TIMESTAMPTZ,
      last_sync_at     TIMESTAMPTZ,
      last_error       TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(farm_id, provider)
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS api_sensor_readings (
      id              SERIAL PRIMARY KEY,
      farm_id         INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      integration_id  INTEGER REFERENCES sensor_integrations(id) ON DELETE CASCADE,
      provider        VARCHAR(50) NOT NULL,
      station_id      VARCHAR(200) NOT NULL,
      station_name    VARCHAR(200),
      sensor_category VARCHAR(20) NOT NULL,
      parameter       VARCHAR(50) NOT NULL,
      value           NUMERIC(10,3),
      unit            VARCHAR(20),
      depth_cm        INTEGER,
      latitude        NUMERIC(10,7),
      longitude       NUMERIC(10,7),
      recorded_at     TIMESTAMPTZ NOT NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS api_sensor_readings_farm_recorded
      ON api_sensor_readings(farm_id, recorded_at DESC);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS api_sensor_readings_integration_param
      ON api_sensor_readings(integration_id, station_id, parameter, recorded_at DESC);
  `);

  console.log("[SENSOR-MIGRATE] Done.");
}
