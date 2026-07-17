/**
 * AGCO Connect OAuth 2.0 integration helpers.
 *
 * Flow:
 *   1. User clicks "Connect" → redirect to AGCO Connect OAuth authorize URL
 *      (state = HMAC-signed farmId)
 *   2. User grants access in AGCO Connect
 *   3. AGCO redirects to /api/gps/agco/callback
 *   4. We exchange code for tokens (client_credentials in body), store encrypted
 *   5. Background job polls organizations → machines → telemetry every 5 min
 *
 * Env vars required:
 *   AGCO_CLIENT_ID     — from AGCO Connect developer programme
 *   AGCO_CLIENT_SECRET — from AGCO Connect developer programme
 *
 * Redirect URI registered in AGCO developer portal:
 *   https://bdefarmtrac.co.uk/api/gps/agco/callback
 *
 * Scopes: openid offline_access
 *
 * AGCO Connect uses Okta as the authorization server.
 * API base: https://api.agconet.com/v1
 */

import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@workspace/db";
import { gpsIntegrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { encryptCredential, decryptCredential } from "./encrypt";

const AGCO_AUTH_BASE  = "https://id.agconet.com/oauth2/ausde7tkyIXBBuaLb357/v1";
const AGCO_API_BASE   = "https://api.agconet.com/v1";

export const AGCO_REDIRECT_URI = "https://bdefarmtrac.co.uk/api/gps/agco/callback";

function stateSecret(): string {
  return process.env.CREDENTIAL_ENCRYPTION_KEY?.slice(0, 32) ?? "fallback-state-secret-32-chars!!";
}

// ─── HMAC state (CSRF protection, encodes farmId) ─────────────────────────

export function signAgcoState(farmId: number): string {
  const ts = Date.now();
  const payload = `${farmId}:${ts}`;
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyAgcoState(state: string): number | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [farmIdStr, tsStr, sig] = parts;
    const payload = `${farmIdStr}:${tsStr}`;
    const expected = createHmac("sha256", stateSecret()).update(payload).digest("hex");
    const sigBuf      = Buffer.from(sig.padEnd(64, "0").slice(0, 64), "hex");
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

// ─── OAuth authorize URL ──────────────────────────────────────────────────

export function buildAgcoAuthUrl(farmId: number): string {
  const clientId = process.env.AGCO_CLIENT_ID;
  if (!clientId) throw new Error("AGCO_CLIENT_ID env var is not set");

  const state = signAgcoState(farmId);
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    redirect_uri:  AGCO_REDIRECT_URI,
    scope:         "openid offline_access",
    state,
  });
  return `${AGCO_AUTH_BASE}/authorize?${params.toString()}`;
}

// ─── Token helpers ────────────────────────────────────────────────────────

export interface AgcoTokens {
  accessToken:  string;
  refreshToken: string;
  expiresAt:    Date;
}

function agcoClientCreds(): { clientId: string; clientSecret: string } {
  const clientId     = process.env.AGCO_CLIENT_ID;
  const clientSecret = process.env.AGCO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AGCO_CLIENT_ID / AGCO_CLIENT_SECRET not configured");
  }
  return { clientId, clientSecret };
}

export async function exchangeAgcoCode(code: string): Promise<AgcoTokens> {
  const { clientId, clientSecret } = agcoClientCreds();

  const body = new URLSearchParams({
    grant_type:    "authorization_code",
    code,
    redirect_uri:  AGCO_REDIRECT_URI,
    client_id:     clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${AGCO_AUTH_BASE}/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    throw new Error(`AGCO token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function refreshAgcoToken(refreshToken: string): Promise<AgcoTokens> {
  const { clientId, clientSecret } = agcoClientCreds();

  const body = new URLSearchParams({
    grant_type:    "refresh_token",
    refresh_token: refreshToken,
    client_id:     clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${AGCO_AUTH_BASE}/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    throw new Error(`AGCO token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    new Date(Date.now() + data.expires_in * 1000),
  };
}

// ─── AGCO Connect API helpers ─────────────────────────────────────────────

function agcoHeaders(accessToken: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${accessToken}`,
    "Accept":        "application/json",
  };
}

interface AgcoOrg {
  id:   string;
  name?: string;
}

interface AgcoMachineLocation {
  latitude?:  number;
  longitude?: number;
  altitude?:  number;
  heading?:   number;
  speed?:     number;
  timestamp?: string;
}

interface AgcoMachine {
  id:            string;
  serialNumber?: string;
  modelName?:    string;
  brandName?:    string;
  // Location data may be nested differently depending on API version
  location?:           AgcoMachineLocation;
  lastKnownLocation?:  AgcoMachineLocation;
  telemetry?: {
    location?: AgcoMachineLocation;
  };
}

async function fetchAgcoOrgs(accessToken: string): Promise<AgcoOrg[]> {
  const res = await fetch(`${AGCO_API_BASE}/organizations`, {
    headers: agcoHeaders(accessToken),
  });
  if (!res.ok) throw new Error(`AGCO orgs fetch failed: ${res.status}`);
  const json = await res.json() as { items?: AgcoOrg[]; value?: AgcoOrg[] } | AgcoOrg[];
  if (Array.isArray(json)) return json;
  return json.items ?? json.value ?? [];
}

async function fetchAgcoMachines(accessToken: string, orgId: string): Promise<AgcoMachine[]> {
  const res = await fetch(`${AGCO_API_BASE}/organizations/${orgId}/machines`, {
    headers: agcoHeaders(accessToken),
  });
  if (!res.ok) return [];
  const json = await res.json() as { items?: AgcoMachine[]; value?: AgcoMachine[] } | AgcoMachine[];
  if (Array.isArray(json)) return json;
  return json.items ?? json.value ?? [];
}

function extractLocation(machine: AgcoMachine): AgcoMachineLocation | null {
  // AGCO API may nest location differently; try all known shapes
  const loc = machine.location
    ?? machine.lastKnownLocation
    ?? machine.telemetry?.location
    ?? null;
  if (!loc) return null;
  if (loc.latitude == null || loc.longitude == null) return null;
  return loc;
}

// ─── Main poll function ───────────────────────────────────────────────────

export async function pollAgcoFarm(
  farmId:           number,
  integrationId:    number,
  encAccessToken:   string,
  encRefreshToken:  string,
  tokenExpiresAt:   Date,
): Promise<void> {
  let accessToken  = decryptCredential(encAccessToken);
  let refreshToken = decryptCredential(encRefreshToken);

  // Refresh if expiring within 5 minutes
  if (tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    try {
      const refreshed = await refreshAgcoToken(refreshToken);
      accessToken  = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;

      await db.update(gpsIntegrationsTable).set({
        accessTokenEncrypted:  encryptCredential(accessToken),
        refreshTokenEncrypted: encryptCredential(refreshToken),
        tokenExpiresAt:        refreshed.expiresAt,
        updatedAt:             new Date(),
      }).where(eq(gpsIntegrationsTable.id, integrationId));
    } catch (err) {
      console.error(`[GPS-AGCO] Token refresh failed for farm ${farmId}:`, err);
      await db.update(gpsIntegrationsTable).set({
        status:    "error",
        lastError: `Token refresh failed: ${String(err)}`,
        updatedAt: new Date(),
      }).where(eq(gpsIntegrationsTable.id, integrationId));
      return;
    }
  }

  try {
    const orgs = await fetchAgcoOrgs(accessToken);
    let totalMachines = 0;

    for (const org of orgs) {
      const machines = await fetchAgcoMachines(accessToken, org.id);

      for (const machine of machines) {
        const loc = extractLocation(machine);
        if (!loc) continue;

        const lastSeenAt = loc.timestamp ? new Date(loc.timestamp) : new Date();
        const brandPrefix = machine.brandName ? `${machine.brandName} ` : "";
        const machineName = machine.modelName
          ? `${brandPrefix}${machine.modelName}`
          : machine.serialNumber ?? machine.id;

        await db.execute(drizzleSql`
          INSERT INTO gps_asset_positions
            (farm_id, integration_id, provider, external_asset_id, asset_name, asset_type,
             latitude, longitude, speed_kph, heading_deg, altitude_m, ignition_on,
             last_seen_at, updated_at)
          VALUES (
            ${farmId}, ${integrationId}, 'agco',
            ${machine.id}, ${machineName}, 'vehicle',
            ${loc.latitude}, ${loc.longitude},
            ${loc.speed ?? null}, ${loc.heading ?? null}, ${loc.altitude ?? null},
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

        totalMachines++;
      }
    }

    await db.update(gpsIntegrationsTable).set({
      status:    "connected",
      lastSyncAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));

    console.log(`[GPS-AGCO] Farm ${farmId}: polled ${totalMachines} machine(s) across ${orgs.length} org(s)`);
  } catch (err) {
    console.error(`[GPS-AGCO] Poll failed for farm ${farmId}:`, err);
    await db.update(gpsIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));
  }
}
