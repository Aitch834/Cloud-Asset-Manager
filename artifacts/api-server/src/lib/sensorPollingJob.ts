/**
 * Background job: poll sensor providers every 30 minutes for all connected farms.
 * Providers: FieldClimate (Pessl/METOS), Davis WeatherLink, METER ZENTRA Cloud, Sencrop
 *
 * 30-minute interval is appropriate for sensor data — readings update at this
 * cadence or slower, unlike GPS which needs 5-minute position refreshes.
 */

import { db } from "@workspace/db";
import { sensorIntegrationsTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { pollFieldClimateFarm } from "./fieldclimate";
import { pollDavisFarm } from "./davis";
import { pollZentraFarm } from "./zentra";
import { pollSencropFarm } from "./sencrop";

const SENSOR_PROVIDERS = ["fieldclimate", "davis", "zentra", "sencrop"] as const;
type SensorProvider = typeof SENSOR_PROVIDERS[number];

export function startSensorPollingJob(): void {
  const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

  async function runPoll(): Promise<void> {
    try {
      const rows = await db.select({
        id:                     sensorIntegrationsTable.id,
        farmId:                 sensorIntegrationsTable.farmId,
        provider:               sensorIntegrationsTable.provider,
        status:                 sensorIntegrationsTable.status,
        apiKeyEncrypted:        sensorIntegrationsTable.apiKeyEncrypted,
        apiKey2Encrypted:       sensorIntegrationsTable.apiKey2Encrypted,
        accessTokenEncrypted:   sensorIntegrationsTable.accessTokenEncrypted,
        refreshTokenEncrypted:  sensorIntegrationsTable.refreshTokenEncrypted,
        tokenExpiresAt:         sensorIntegrationsTable.tokenExpiresAt,
      }).from(sensorIntegrationsTable)
        .where(inArray(sensorIntegrationsTable.provider, [...SENSOR_PROVIDERS]));

      const connected = rows.filter(r => r.status === "connected");
      if (connected.length === 0) return;

      console.log(`[SENSOR-POLL] Polling ${connected.length} sensor integration(s)...`);

      await Promise.allSettled(connected.map(row => {
        if (row.provider === "fieldclimate") {
          if (!row.apiKeyEncrypted || !row.apiKey2Encrypted) {
            console.warn(`[SENSOR-POLL] Farm ${row.farmId} / fieldclimate: missing credentials, skipping`);
            return Promise.resolve();
          }
          return pollFieldClimateFarm(row.farmId, row.id, row.apiKeyEncrypted, row.apiKey2Encrypted);
        }

        if (row.provider === "davis") {
          if (!row.apiKeyEncrypted || !row.apiKey2Encrypted) {
            console.warn(`[SENSOR-POLL] Farm ${row.farmId} / davis: missing credentials, skipping`);
            return Promise.resolve();
          }
          return pollDavisFarm(row.farmId, row.id, row.apiKeyEncrypted, row.apiKey2Encrypted);
        }

        if (row.provider === "zentra") {
          if (!row.apiKeyEncrypted) {
            console.warn(`[SENSOR-POLL] Farm ${row.farmId} / zentra: missing API token, skipping`);
            return Promise.resolve();
          }
          return pollZentraFarm(row.farmId, row.id, row.apiKeyEncrypted);
        }

        if (row.provider === "sencrop") {
          if (!row.accessTokenEncrypted || !row.refreshTokenEncrypted || !row.tokenExpiresAt) {
            console.warn(`[SENSOR-POLL] Farm ${row.farmId} / sencrop: missing OAuth tokens, skipping`);
            return Promise.resolve();
          }
          return pollSencropFarm(
            row.farmId, row.id,
            row.accessTokenEncrypted, row.refreshTokenEncrypted, row.tokenExpiresAt,
          );
        }

        return Promise.resolve();
      }));
    } catch (err) {
      console.error("[SENSOR-POLL] Error:", err);
    }
  }

  runPoll();
  setInterval(runPoll, INTERVAL_MS);
  console.log("[SENSOR-POLL] Sensor polling job started (every 30 minutes) — providers: FieldClimate, Davis WeatherLink, METER ZENTRA, Sencrop");
}
