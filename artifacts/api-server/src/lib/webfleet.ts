/**
 * Webfleet.connect integration helpers.
 *
 * Authentication model:
 *   NOT OAuth — uses a credential-based model:
 *     - WEBFLEET_API_KEY (env var) — our application API key issued by Webfleet
 *     - Per-farm: account name, username, password — stored as encrypted JSON in api_key_encrypted
 *
 * API endpoint: https://csv.webfleet.com/extern
 * Relevant action: showVehicleReport — returns all vehicles with current GPS positions
 *
 * Env vars required:
 *   WEBFLEET_API_KEY — from Webfleet developer registration (developer.webfleet.com)
 *
 * Per-farm stored (encrypted JSON in api_key_encrypted):
 *   { account: string; username: string; password: string }
 *
 * Registration: https://developer.webfleet.com — apply for a developer/partner account.
 *   Once approved, Webfleet issues an API key specific to BDE Farm Trac.
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
}

export function parseWebfleetCredentials(encrypted: string): WebfleetCredentials {
  const json = decryptCredential(encrypted);
  const parsed = JSON.parse(json) as { account?: string; username?: string; password?: string };
  if (!parsed.account || !parsed.username || !parsed.password) {
    throw new Error("Webfleet credentials missing account, username, or password");
  }
  return { account: parsed.account, username: parsed.username, password: parsed.password };
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
  const params = new URLSearchParams({
    lang:         "en",
    outputformat: "json",
    action:       "showVehicleReport",
    account:      creds.account,
    username:     creds.username,
    password:     creds.password,
    apikey:       appApiKey,
  });

  const res = await fetch(`${WEBFLEET_API_BASE}?${params.toString()}`);
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
  const appApiKey = process.env.WEBFLEET_API_KEY;
  if (!appApiKey) {
    console.warn(`[GPS-WEBFLEET] WEBFLEET_API_KEY not set — skipping farm ${farmId}`);
    return;
  }

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
    const vehicles = await fetchWebfleetVehicles(creds, appApiKey);

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
