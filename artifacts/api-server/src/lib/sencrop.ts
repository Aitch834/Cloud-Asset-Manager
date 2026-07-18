/**
 * Sencrop API integration helper.
 *
 * Sencrop is an agricultural weather sensor network with strong UK presence.
 * Sensors measure rainfall, temperature, humidity, wind, and leaf wetness.
 *
 * Auth: OAuth 2.0 Authorization Code
 *   - Registered via Sencrop partner/developer programme
 *   - SENCROP_CLIENT_ID + SENCROP_CLIENT_SECRET env vars required
 *   - Redirect URI: https://api.bdefarmtrac.co.uk/api/sensors/sencrop/callback
 *   - Scopes: read:measurements read:devices
 *
 * Token storage:
 *   - access_token_encrypted  → sensorIntegrationsTable.accessTokenEncrypted
 *   - refresh_token_encrypted → sensorIntegrationsTable.refreshTokenEncrypted
 *   - tokenExpiresAt          → sensorIntegrationsTable.tokenExpiresAt
 *
 * API base: https://api.sencrop.com/v1
 *
 * NOTE: Sencrop's partner API programme requires a formal application at
 * https://sencrop.com (contact hello@sencrop.com for partner access).
 * The OAuth flow below will become active once SENCROP_CLIENT_ID and
 * SENCROP_CLIENT_SECRET are set in the project secrets.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@workspace/db";
import { sensorIntegrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { encryptCredential, decryptCredential } from "./encrypt";

const SENCROP_BASE = "https://api.sencrop.com/v1";
const SENCROP_AUTH_BASE = "https://api.sencrop.com/v1";
export const SENCROP_REDIRECT_URI = "https://api.bdefarmtrac.co.uk/api/sensors/sencrop/callback";

function stateSecret(): string {
  return process.env.CREDENTIAL_ENCRYPTION_KEY?.slice(0, 32) ?? "fallback-state-secret-32-chars!!";
}

export function signSencropState(farmId: number): string {
  const ts = Date.now();
  const payload = `${farmId}:${ts}`;
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifySencropState(state: string): number | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [farmIdStr, tsStr, sig] = parts;
    const payload = `${farmIdStr}:${tsStr}`;
    const expected = createHmac("sha256", stateSecret()).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig.padEnd(64, "0").slice(0, 64), "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
    const ts = parseInt(tsStr, 10);
    if (Date.now() - ts > 15 * 60 * 1000) return null;
    const farmId = parseInt(farmIdStr, 10);
    if (isNaN(farmId) || farmId <= 0) return null;
    return farmId;
  } catch {
    return null;
  }
}

export function buildSencropAuthUrl(farmId: number): string {
  const clientId = process.env.SENCROP_CLIENT_ID;
  if (!clientId) throw new Error("SENCROP_CLIENT_ID env var is not set");
  const state = signSencropState(farmId);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: SENCROP_REDIRECT_URI,
    scope: "read:measurements read:devices",
    state,
  });
  return `${SENCROP_AUTH_BASE}/oauth2/authorize?${params.toString()}`;
}

interface SencropTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export async function exchangeSencropCode(code: string): Promise<SencropTokenResponse> {
  const clientId = process.env.SENCROP_CLIENT_ID;
  const clientSecret = process.env.SENCROP_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Sencrop credentials not configured");

  const res = await fetch(`${SENCROP_AUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SENCROP_REDIRECT_URI,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sencrop token exchange failed ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<SencropTokenResponse>;
}

async function refreshSencropTokens(
  refreshTokenEncrypted: string,
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
  const clientId = process.env.SENCROP_CLIENT_ID;
  const clientSecret = process.env.SENCROP_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Sencrop credentials not configured");

  const refreshToken = decryptCredential(refreshTokenEncrypted);
  const res = await fetch(`${SENCROP_AUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sencrop token refresh failed ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json() as SencropTokenResponse;
  if (!data.access_token) throw new Error("Sencrop token refresh: no access_token in response");

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + ((data.expires_in ?? 3600) - 60) * 1000),
  };
}

async function sencropGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${SENCROP_BASE}${path}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sencrop GET ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

interface SencropMeResponse {
  id?: number;
  userId?: number;
}

interface SencropDevicesResponse {
  total?: number;
  items?: Array<{
    id?: number;
    serial?: string;
    type?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
    lastMeasureAt?: string;
    measures?: {
      TH?: { value?: number };
      HH?: { value?: number };
      P1?: { value?: number };
      FD?: { value?: number };
      MH?: { value?: number };
      UD?: { value?: number };
      UV?: { value?: number };
    };
  }>;
}

const SENCROP_PARAM_MAP: Record<string, { param: string; unit: string; category: string }> = {
  TH: { param: "air_temperature",  unit: "°C",   category: "weather" },
  HH: { param: "humidity",         unit: "%",    category: "weather" },
  P1: { param: "rainfall",         unit: "mm",   category: "weather" },
  FD: { param: "wind_speed",       unit: "km/h", category: "weather" },
  MH: { param: "wind_gust",        unit: "km/h", category: "weather" },
  UD: { param: "wind_direction",   unit: "°",    category: "weather" },
  UV: { param: "uv_index",         unit: "",     category: "weather" },
};

export async function pollSencropFarm(
  farmId: number,
  integrationId: number,
  accessTokenEncrypted: string,
  refreshTokenEncrypted: string,
  tokenExpiresAt: Date,
): Promise<void> {
  let accessToken = decryptCredential(accessTokenEncrypted);

  if (new Date() >= tokenExpiresAt) {
    const refreshed = await refreshSencropTokens(refreshTokenEncrypted);
    accessToken = refreshed.accessToken;
    await db.update(sensorIntegrationsTable).set({
      accessTokenEncrypted: encryptCredential(refreshed.accessToken),
      refreshTokenEncrypted: encryptCredential(refreshed.refreshToken),
      tokenExpiresAt: refreshed.expiresAt,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));
  }

  try {
    const me = await sencropGet<SencropMeResponse>("/me", accessToken);
    const userId = me.id ?? me.userId;
    if (!userId) throw new Error("Could not determine Sencrop user ID from /me response");

    const devicesRes = await sencropGet<SencropDevicesResponse>(
      `/users/${userId}/devices?limit=100`, accessToken,
    );
    const devices = devicesRes.items ?? [];

    let totalReadings = 0;
    const now = new Date();

    for (const device of devices) {
      const stationId = String(device.id ?? device.serial ?? "unknown");
      const stationName = device.name ?? device.serial ?? stationId;
      const lat = device.latitude ?? null;
      const lng = device.longitude ?? null;
      const recordedAt = device.lastMeasureAt ? new Date(device.lastMeasureAt) : now;
      const measures = device.measures ?? {};

      for (const [key, meta] of Object.entries(SENCROP_PARAM_MAP)) {
        const measureEntry = measures[key as keyof typeof measures];
        if (!measureEntry || measureEntry.value === undefined || measureEntry.value === null) continue;

        await db.execute(drizzleSql`
          INSERT INTO api_sensor_readings
            (farm_id, integration_id, provider, station_id, station_name,
             sensor_category, parameter, value, unit, depth_cm,
             latitude, longitude, recorded_at)
          VALUES (
            ${farmId}, ${integrationId}, 'sencrop',
            ${stationId}, ${stationName},
            ${meta.category}, ${meta.param},
            ${measureEntry.value}, ${meta.unit},
            ${null},
            ${lat}, ${lng},
            ${recordedAt}
          )
        `);
        totalReadings++;
      }
    }

    await db.update(sensorIntegrationsTable).set({
      status: "connected",
      lastSyncAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));

    console.log(`[SENCROP] Farm ${farmId}: stored ${totalReadings} reading(s) from ${devices.length} device(s)`);
  } catch (err) {
    console.error(`[SENCROP] Poll failed for farm ${farmId}:`, err);
    await db.update(sensorIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));
  }
}

export { encryptCredential };
