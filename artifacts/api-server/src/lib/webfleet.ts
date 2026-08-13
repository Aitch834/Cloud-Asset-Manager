/**
 * Webfleet.connect integration helpers.
 *
 * Authentication model:
 *   NOT OAuth — each farmer uses their own Webfleet.connect credentials + per-fleet API key.
 *   No application-level API key or partner registration required.
 *
 * API endpoint: https://csv.webfleet.com/extern
 * Relevant action: showVehicleReport — returns all vehicles with current GPS positions
 *
 * No env vars required — all credentials are per-farm.
 *
 * Per-farm stored (encrypted JSON in api_key_encrypted):
 *   { account: string; username: string; password: string; apiKey: string }
 *
 * Farmers obtain their API key from their Webfleet account:
 *   Webfleet dashboard → Tools → Webfleet Integration → API key
 */

import { db } from "@workspace/db";
import { gpsIntegrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { decryptCredential } from "./encrypt";

const WEBFLEET_API_BASE = "https://csv.webfleet.com/extern";

export interface WebfleetCredentials {
  account:  string;
  username: string;
  password: string;
  apiKey:   string;
}

export function parseWebfleetCredentials(encrypted: string): WebfleetCredentials {
  const json = decryptCredential(encrypted);
  const parsed = JSON.parse(json) as { account?: string; username?: string; password?: string; apiKey?: string };
  if (!parsed.account || !parsed.username || !parsed.password || !parsed.apiKey) {
    throw new Error("Webfleet credentials missing account, username, password, or apiKey");
  }
  return { account: parsed.account, username: parsed.username, password: parsed.password, apiKey: parsed.apiKey };
}

interface WebfleetVehicle {
  objectno:    string;
  objectname?: string;
  latitude?:   number;
  longitude?:  number;
  speed?:      number;
  course?:     number;
  altitude?:   number;
  postime?:    string;
  posdatetime?: string;
}

interface WebfleetApiResponse {
  errorCode?: number;
  errorMsg?:  string;
}

async function fetchWebfleetVehicles(
  creds: WebfleetCredentials,
  appApiKey: string,
): Promise<WebfleetVehicle[]> {
  // Webfleet.connect migrated to HTTP Basic Authentication in June 2026.
  // username + password must no longer be sent as URL query parameters —
  // they must be Base64-encoded and sent in the Authorization header instead.
  // account and apikey remain as query parameters.
  const params = new URLSearchParams({
    lang:         "en",
    outputformat: "json",
    action:       "showVehicleReport",
    account:      creds.account,
    apikey:       appApiKey,
  });

  const basicCredential = Buffer.from(`${creds.username}:${creds.password}`).toString("base64");

  const res = await fetch(`${WEBFLEET_API_BASE}?${params.toString()}`, {
    headers: {
      Authorization: `Basic ${basicCredential}`,
    },
  });
  if (!res.ok) throw new Error(`Webfleet API HTTP error: ${res.status}`);

  const json = await res.json() as WebfleetVehicle[] | WebfleetApiResponse;

  // Error response has errorCode
  if (!Array.isArray(json)) {
    const err = json as WebfleetApiResponse;
    throw new Error(`Webfleet API error ${err.errorCode}: ${err.errorMsg}`);
  }

  return json;
}

// ─── Main poll function ───────────────────────────────────────────────────

export async function pollWebfleetFarm(
  farmId:        number,
  integrationId: number,
  encCredentials: string,
): Promise<void> {
  let creds: WebfleetCredentials;
  try {
    creds = parseWebfleetCredentials(encCredentials);
  } catch (err) {
    console.error(`[GPS-WEBFLEET] Invalid credentials for farm ${farmId}:`, err);
    await db.update(gpsIntegrationsTable).set({
      status:    "error",
      lastError: `Invalid credentials: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));
    return;
  }

  try {
    const vehicles = await fetchWebfleetVehicles(creds, creds.apiKey);

    for (const v of vehicles) {
      if (v.latitude == null || v.longitude == null) continue;

      const lastSeenAt = v.posdatetime
        ? new Date(v.posdatetime)
        : v.postime
          ? new Date(v.postime)
          : new Date();

      const assetName = v.objectname ?? v.objectno;

      await db.execute(drizzleSql`
        INSERT INTO gps_asset_positions
          (farm_id, integration_id, provider, external_asset_id, asset_name, asset_type,
           latitude, longitude, speed_kph, heading_deg, altitude_m, ignition_on,
           last_seen_at, updated_at)
        VALUES (
          ${farmId}, ${integrationId}, 'webfleet',
          ${v.objectno}, ${assetName}, 'vehicle',
          ${v.latitude}, ${v.longitude},
          ${v.speed ?? null}, ${v.course ?? null}, ${v.altitude ?? null},
          ${null},
          ${lastSeenAt}, NOW()
        )
        ON CONFLICT (farm_id, provider, external_asset_id)
        DO UPDATE SET
          asset_name   = EXCLUDED.asset_name,
          latitude     = EXCLUDED.latitude,
          longitude    = EXCLUDED.longitude,
          speed_kph    = EXCLUDED.speed_kph,
          heading_deg  = EXCLUDED.heading_deg,
          altitude_m   = EXCLUDED.altitude_m,
          last_seen_at = EXCLUDED.last_seen_at,
          updated_at   = NOW()
      `);
    }

    await db.update(gpsIntegrationsTable).set({
      status:    "connected",
      lastSyncAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));

    console.log(`[GPS-WEBFLEET] Farm ${farmId}: polled ${vehicles.length} vehicle(s)`);
  } catch (err) {
    console.error(`[GPS-WEBFLEET] Poll failed for farm ${farmId}:`, err);
    await db.update(gpsIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));
  }
}
