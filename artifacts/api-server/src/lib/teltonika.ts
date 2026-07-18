/**
 * Teltonika RMS OAuth 2.0 integration helpers.
 *
 * Flow:
 *   1. User clicks "Connect" → we redirect to Teltonika RMS OAuth authorize URL
 *      (state = HMAC-signed farmId so we know which farm to associate on callback)
 *   2. User grants access in Teltonika RMS
 *   3. Teltonika redirects back to our /api/gps/teltonika/callback
 *   4. We exchange the code for access + refresh tokens, store encrypted
 *   5. Background job polls /api/v1/devices and /api/v1/devices/:id/location every 5 min
 *
 * Env vars required:
 *   TELTONIKA_CLIENT_ID     — from Teltonika RMS "Create application"
 *   TELTONIKA_CLIENT_SECRET — from Teltonika RMS "Create application"
 *
 * Redirect URI to register in Teltonika RMS:
 *   https://api.bdefarmtrac.co.uk/api/gps/teltonika/callback
 */

import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@workspace/db";
import { gpsIntegrationsTable, gpsAssetPositionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { encryptCredential, decryptCredential } from "./encrypt";

const RMS_BASE = "https://rms.teltonika-networks.com";
const RMS_API = `${RMS_BASE}/api/v1`;

export const TELTONIKA_REDIRECT_URI = "https://api.bdefarmtrac.co.uk/api/gps/teltonika/callback";

function stateSecret(): string {
  return process.env.CREDENTIAL_ENCRYPTION_KEY?.slice(0, 32) ?? "fallback-state-secret-32-chars!!";
}

// ─── HMAC state (CSRF protection, encodes farmId) ─────────────────────────

export function signTeltonikaState(farmId: number): string {
  const ts = Date.now();
  const payload = `${farmId}:${ts}`;
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyTeltonikaState(state: string): number | null {
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
    if (Date.now() - ts > 15 * 60 * 1000) return null; // 15 min window
    const farmId = parseInt(farmIdStr, 10);
    if (isNaN(farmId) || farmId <= 0) return null;
    return farmId;
  } catch {
    return null;
  }
}

// ─── OAuth authorize URL ──────────────────────────────────────────────────

export function buildTeltonikaAuthUrl(farmId: number): string {
  const clientId = process.env.TELTONIKA_CLIENT_ID;
  if (!clientId) throw new Error("TELTONIKA_CLIENT_ID env var is not set");

  const state = signTeltonikaState(farmId);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: TELTONIKA_REDIRECT_URI,
    scope: "devices:read device_location:read",
    state,
  });
  return `${RMS_BASE}/account/oauth2/authorization?${params.toString()}`;
}

// ─── Token exchange ───────────────────────────────────────────────────────

export interface TeltonikaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export async function exchangeTeltonikaCode(code: string): Promise<TeltonikaTokens> {
  const clientId = process.env.TELTONIKA_CLIENT_ID;
  const clientSecret = process.env.TELTONIKA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("TELTONIKA_CLIENT_ID / TELTONIKA_CLIENT_SECRET not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: TELTONIKA_REDIRECT_URI,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${RMS_BASE}/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

// ─── Token refresh ────────────────────────────────────────────────────────

export async function refreshTeltonikaToken(oldAccessToken: string, refreshToken: string): Promise<TeltonikaTokens> {
  const clientId = process.env.TELTONIKA_CLIENT_ID;
  const clientSecret = process.env.TELTONIKA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("TELTONIKA_CLIENT_ID / TELTONIKA_CLIENT_SECRET not configured");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${RMS_BASE}/account/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${oldAccessToken}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

// ─── Teltonika RMS API calls ──────────────────────────────────────────────

interface RmsDevice {
  id: number;
  name: string;
  model?: string;
  serial?: string;
}

interface RmsLocation {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp?: string;
  ignition?: boolean;
}

async function fetchRmsDevices(accessToken: string): Promise<RmsDevice[]> {
  const res = await fetch(`${RMS_API}/devices?limit=100`, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Devices fetch failed: ${res.status}`);
  const json = await res.json() as { data?: RmsDevice[] };
  return json.data ?? [];
}

async function fetchDeviceLocation(accessToken: string, deviceId: number): Promise<RmsLocation | null> {
  const res = await fetch(`${RMS_API}/devices/${deviceId}/location`, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const json = await res.json() as { data?: RmsLocation };
  return json.data ?? null;
}

// ─── Main poll function ───────────────────────────────────────────────────

export async function pollTeltonikaFarm(
  farmId: number,
  integrationId: number,
  encAccessToken: string,
  encRefreshToken: string,
  tokenExpiresAt: Date,
): Promise<void> {
  let accessToken = decryptCredential(encAccessToken);
  let refreshToken = decryptCredential(encRefreshToken);

  // Refresh if expiring within 5 minutes
  if (tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    try {
      const refreshed = await refreshTeltonikaToken(accessToken, refreshToken);
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;

      await db.update(gpsIntegrationsTable).set({
        accessTokenEncrypted: encryptCredential(accessToken),
        refreshTokenEncrypted: encryptCredential(refreshToken),
        tokenExpiresAt: refreshed.expiresAt,
        updatedAt: new Date(),
      }).where(eq(gpsIntegrationsTable.id, integrationId));
    } catch (err) {
      console.error(`[GPS-TELTONIKA] Token refresh failed for farm ${farmId}:`, err);
      await db.update(gpsIntegrationsTable).set({
        status: "error",
        lastError: `Token refresh failed: ${String(err)}`,
        updatedAt: new Date(),
      }).where(eq(gpsIntegrationsTable.id, integrationId));
      return;
    }
  }

  try {
    const devices = await fetchRmsDevices(accessToken);

    for (const device of devices) {
      const loc = await fetchDeviceLocation(accessToken, device.id);
      if (!loc || loc.lat == null || loc.lng == null) continue;

      const lastSeenAt = loc.timestamp ? new Date(loc.timestamp) : new Date();

      await db.execute(drizzleSql`
        INSERT INTO gps_asset_positions
          (farm_id, integration_id, provider, external_asset_id, asset_name, asset_type,
           latitude, longitude, speed_kph, heading_deg, altitude_m, ignition_on,
           last_seen_at, updated_at)
        VALUES (
          ${farmId}, ${integrationId}, 'teltonika',
          ${String(device.id)}, ${device.name ?? String(device.id)}, 'vehicle',
          ${loc.lat}, ${loc.lng},
          ${loc.speed ?? null}, ${loc.heading ?? null}, ${loc.altitude ?? null},
          ${loc.ignition ?? null},
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
          ignition_on  = EXCLUDED.ignition_on,
          last_seen_at = EXCLUDED.last_seen_at,
          updated_at   = NOW()
      `);
    }

    await db.update(gpsIntegrationsTable).set({
      status: "connected",
      lastSyncAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));

    console.log(`[GPS-TELTONIKA] Farm ${farmId}: polled ${devices.length} device(s)`);
  } catch (err) {
    console.error(`[GPS-TELTONIKA] Poll failed for farm ${farmId}:`, err);
    await db.update(gpsIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));
  }
}
