/**
 * John Deere Operations Center OAuth 2.0 integration helpers.
 *
 * Flow:
 *   1. User clicks "Connect" → redirect to JD OAuth authorize URL
 *      (state = HMAC-signed farmId)
 *   2. User grants access in John Deere Operations Center
 *   3. JD redirects to /api/gps/john_deere/callback
 *   4. We exchange code for tokens (Basic Auth client credentials), store encrypted
 *   5. Background job polls organisations → machines → breadcrumbs every 5 min
 *
 * Env vars required:
 *   JD_CLIENT_ID     — from developer.deere.com application
 *   JD_CLIENT_SECRET — from developer.deere.com application
 *
 * Redirect URI registered in JD developer portal:
 *   https://api.bdefarmtrac.co.uk/api/gps/john_deere/callback
 *
 * Scopes: openid  offline_access
 *   (JD controls API access at client-ID approval level in developer.deere.com,
 *    not through OAuth scope strings. ag1/eq1 are NOT valid scope names.)
 *
 * Auth server: johndeerecustomer.okta.com (NOT signin.johndeere.com which is
 *   the employee SSO and only accepts standard OIDC scopes).
 */

import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@workspace/db";
import { gpsIntegrationsTable, gpsAssetPositionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { encryptCredential, decryptCredential } from "./encrypt";

const JD_AUTH_BASE  = "https://johndeerecustomer.okta.com/oauth2/default/v1";
const JD_API_BASE   = "https://partnerapi.deere.com/platforms";
const JD_ACCEPT     = "application/vnd.deere.axiom.v3+json";

export const JD_REDIRECT_URI = "https://api.bdefarmtrac.co.uk/api/gps/john_deere/callback";

function stateSecret(): string {
  return process.env.CREDENTIAL_ENCRYPTION_KEY?.slice(0, 32) ?? "fallback-state-secret-32-chars!!";
}

// ─── HMAC state (CSRF protection, encodes farmId) ─────────────────────────

export function signJdState(farmId: number): string {
  const ts = Date.now();
  const payload = `${farmId}:${ts}`;
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyJdState(state: string): number | null {
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

export function buildJdAuthUrl(farmId: number): string {
  const clientId = process.env.JD_CLIENT_ID;
  if (!clientId) throw new Error("JD_CLIENT_ID env var is not set");

  const state = signJdState(farmId);
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    redirect_uri:  JD_REDIRECT_URI,
    scope:         "openid offline_access",
    state,
  });
  return `${JD_AUTH_BASE}/authorize?${params.toString()}`;
}

// ─── Token helpers ────────────────────────────────────────────────────────

export interface JdTokens {
  accessToken:  string;
  refreshToken: string;
  expiresAt:    Date;
}

function basicAuthHeader(): string {
  const clientId     = process.env.JD_CLIENT_ID;
  const clientSecret = process.env.JD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("JD_CLIENT_ID / JD_CLIENT_SECRET not configured");
  }
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

export async function exchangeJdCode(code: string): Promise<JdTokens> {
  const body = new URLSearchParams({
    grant_type:   "authorization_code",
    code,
    redirect_uri: JD_REDIRECT_URI,
  });

  const res = await fetch(`${JD_AUTH_BASE}/token`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": basicAuthHeader(),
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    throw new Error(`JD token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    new Date(Date.now() + data.expires_in * 1000),
  };
}

export async function refreshJdToken(refreshToken: string): Promise<JdTokens> {
  const body = new URLSearchParams({
    grant_type:    "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${JD_AUTH_BASE}/token`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": basicAuthHeader(),
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    throw new Error(`JD token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token,
    expiresAt:    new Date(Date.now() + data.expires_in * 1000),
  };
}

// ─── JD Operations Center API helpers ────────────────────────────────────

function jdHeaders(accessToken: string): Record<string, string> {
  return {
    "Authorization": `Bearer ${accessToken}`,
    "Accept":        JD_ACCEPT,
  };
}

interface JdOrg {
  id:   string;
  name: string;
}

interface JdMachine {
  id:   string;
  name?: string;
  modelYear?: number;
  type?: string;
}

interface JdBreadcrumb {
  point?:     { lat?: number; lon?: number };
  timestamp?: string;
  speed?:     number;
  heading?:   number;
  altitude?:  number;
}

async function fetchJdOrgs(accessToken: string): Promise<JdOrg[]> {
  const res = await fetch(`${JD_API_BASE}/organizations`, {
    headers: jdHeaders(accessToken),
  });
  if (!res.ok) throw new Error(`JD orgs fetch failed: ${res.status}`);
  const json = await res.json() as { values?: JdOrg[] };
  return json.values ?? [];
}

async function fetchJdMachines(accessToken: string, orgId: string): Promise<JdMachine[]> {
  const res = await fetch(`${JD_API_BASE}/organizations/${orgId}/machines`, {
    headers: jdHeaders(accessToken),
  });
  if (!res.ok) return [];
  const json = await res.json() as { values?: JdMachine[] };
  return json.values ?? [];
}

async function fetchJdBreadcrumbs(accessToken: string, machineId: string): Promise<JdBreadcrumb | null> {
  const res = await fetch(`${JD_API_BASE}/machines/${machineId}/breadcrumbs`, {
    headers: jdHeaders(accessToken),
  });
  if (!res.ok) return null;
  const json = await res.json() as { values?: JdBreadcrumb[] };
  const crumbs = json.values ?? [];
  return crumbs.length > 0 ? crumbs[0] : null;
}

// ─── Main poll function ───────────────────────────────────────────────────

export async function pollJdFarm(
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
      const refreshed = await refreshJdToken(refreshToken);
      accessToken  = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;

      await db.update(gpsIntegrationsTable).set({
        accessTokenEncrypted:  encryptCredential(accessToken),
        refreshTokenEncrypted: encryptCredential(refreshToken),
        tokenExpiresAt:        refreshed.expiresAt,
        updatedAt:             new Date(),
      }).where(eq(gpsIntegrationsTable.id, integrationId));
    } catch (err) {
      console.error(`[GPS-JD] Token refresh failed for farm ${farmId}:`, err);
      await db.update(gpsIntegrationsTable).set({
        status:    "error",
        lastError: `Token refresh failed: ${String(err)}`,
        updatedAt: new Date(),
      }).where(eq(gpsIntegrationsTable.id, integrationId));
      return;
    }
  }

  try {
    const orgs = await fetchJdOrgs(accessToken);
    let totalMachines = 0;

    for (const org of orgs) {
      const machines = await fetchJdMachines(accessToken, org.id);

      for (const machine of machines) {
        const crumb = await fetchJdBreadcrumbs(accessToken, machine.id);
        if (!crumb?.point?.lat || !crumb?.point?.lon) continue;

        const lastSeenAt = crumb.timestamp ? new Date(crumb.timestamp) : new Date();
        const machineName = machine.name ?? machine.id;

        await db.execute(drizzleSql`
          INSERT INTO gps_asset_positions
            (farm_id, integration_id, provider, external_asset_id, asset_name, asset_type,
             latitude, longitude, speed_kph, heading_deg, altitude_m, ignition_on,
             last_seen_at, updated_at)
          VALUES (
            ${farmId}, ${integrationId}, 'john_deere',
            ${machine.id}, ${machineName}, 'vehicle',
            ${crumb.point.lat}, ${crumb.point.lon},
            ${crumb.speed ?? null}, ${crumb.heading ?? null}, ${crumb.altitude ?? null},
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

    console.log(`[GPS-JD] Farm ${farmId}: polled ${totalMachines} machine(s) across ${orgs.length} org(s)`);
  } catch (err) {
    console.error(`[GPS-JD] Poll failed for farm ${farmId}:`, err);
    await db.update(gpsIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(gpsIntegrationsTable.id, integrationId));
  }
}
