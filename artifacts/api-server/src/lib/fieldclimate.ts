/**
 * FieldClimate (Pessl Instruments / METOS) API integration helper.
 *
 * FieldClimate covers BOTH soil sensors AND weather stations in one platform.
 * Very common in commercial UK/EU agriculture.
 *
 * Auth: HMAC-SHA256 signed requests (no OAuth required)
 *   - Public key  → stored as api_key_encrypted
 *   - Private key → stored as api_key2_encrypted
 *
 * Registration: https://fieldclimate.com (request API access via account manager)
 * API docs:     https://api.fieldclimate.com/v2/docs/
 *
 * Signing algorithm (FieldClimate v2):
 *   Date = RFC1123 formatted UTC date
 *   StringToSign = {publicKey} + {HTTP_METHOD} + {path} + {Date}
 *   HMAC = sha256(StringToSign, privateKey)
 *   Authorization: hmac {publicKey}:{base64(HMAC)}
 *
 * NOTE: Verify the exact StringToSign format with FieldClimate API docs when
 * credentials are first received — some versions of their SDK use a different
 * field order. The structure above matches their published v2 examples.
 */

import crypto from "crypto";
import { db } from "@workspace/db";
import { sensorIntegrationsTable, apiSensorReadingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { decryptCredential, encryptCredential } from "./encrypt";

const FC_BASE = "https://api.fieldclimate.com/v2";

function buildFcHeaders(publicKey: string, privateKey: string, method: string, path: string): Record<string, string> {
  const date = new Date().toUTCString();
  const stringToSign = publicKey + method.toUpperCase() + path + date;
  const hmac = crypto.createHmac("sha256", privateKey).update(stringToSign).digest("base64");
  return {
    "Authorization": `hmac ${publicKey}:${hmac}`,
    "Date": date,
    "Accept": "application/json",
  };
}

async function fcGet<T>(publicKey: string, privateKey: string, path: string): Promise<T> {
  const headers = buildFcHeaders(publicKey, privateKey, "GET", path);
  const res = await fetch(`${FC_BASE}${path}`, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`FieldClimate GET ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

interface FcStation {
  name: { custom?: string; original?: string };
  info?: { uid?: string; device_id?: string; timezone?: string };
  dates?: { min_date?: string; max_date?: string };
  position?: { geo?: { coordinates?: [number, number] } };
  sensors?: Array<{ code?: number; name?: string; unit?: string; group?: string; decimals?: number }>;
  last_communication?: string;
}

interface FcDataResponse {
  [sensorCode: string]: Array<{
    dt: number;
    [aggKey: string]: number;
  }>;
}

function extractFcReadings(
  stationId: string,
  stationName: string,
  data: FcDataResponse,
  sensors: FcStation["sensors"],
  lat: number | null,
  lng: number | null,
  farmId: number,
  integrationId: number,
): Array<{
  farmId: number; integrationId: number; provider: string;
  stationId: string; stationName: string; sensorCategory: string;
  parameter: string; value: string | null; unit: string | null;
  depthCm: number | null; latitude: string | null; longitude: string | null;
  recordedAt: Date;
}> {
  const rows: ReturnType<typeof extractFcReadings> = [];
  const sensorMeta = new Map((sensors ?? []).map(s => [String(s.code ?? ""), s]));

  for (const [codeStr, readings] of Object.entries(data)) {
    const meta = sensorMeta.get(codeStr);
    if (!meta || !readings?.length) continue;

    const name = meta.name ?? codeStr;
    const unit = meta.unit ?? null;
    const group = (meta.group ?? "").toLowerCase();

    const parameter = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const category = group.includes("soil") || group.includes("moisture") ? "soil" : "weather";

    const depthMatch = name.match(/(\d+)\s*cm/i);
    const depthCm = depthMatch ? parseInt(depthMatch[1], 10) : null;

    const latestReading = readings[readings.length - 1];
    if (!latestReading) continue;

    const valueKey = Object.keys(latestReading).find(k => k !== "dt");
    const rawValue = valueKey !== undefined ? latestReading[valueKey] : null;

    rows.push({
      farmId,
      integrationId,
      provider: "fieldclimate",
      stationId,
      stationName,
      sensorCategory: category,
      parameter,
      value: rawValue !== null && rawValue !== undefined ? String(rawValue) : null,
      unit,
      depthCm,
      latitude: lat !== null ? String(lat) : null,
      longitude: lng !== null ? String(lng) : null,
      recordedAt: new Date(latestReading.dt * 1000),
    });
  }
  return rows;
}

export async function pollFieldClimateFarm(
  farmId: number,
  integrationId: number,
  apiKeyEncrypted: string,
  apiKey2Encrypted: string,
): Promise<void> {
  const publicKey = decryptCredential(apiKeyEncrypted);
  const privateKey = decryptCredential(apiKey2Encrypted);

  try {
    const stations = await fcGet<Record<string, FcStation>>(publicKey, privateKey, "/user/stations");

    let totalReadings = 0;

    for (const [stationId, station] of Object.entries(stations)) {
      const stationName =
        station.name?.custom || station.name?.original || stationId;
      const coords = station.position?.geo?.coordinates;
      const lat = coords ? coords[1] : null;
      const lng = coords ? coords[0] : null;

      let data: FcDataResponse;
      try {
        data = await fcGet<FcDataResponse>(
          publicKey, privateKey,
          `/data/${stationId}/raw/last/1`,
        );
      } catch (err) {
        console.warn(`[FC] Station ${stationId}: failed to get data —`, err);
        continue;
      }

      const rows = extractFcReadings(
        stationId, stationName, data, station.sensors, lat, lng, farmId, integrationId,
      );

      for (const row of rows) {
        await db.execute(drizzleSql`
          INSERT INTO api_sensor_readings
            (farm_id, integration_id, provider, station_id, station_name,
             sensor_category, parameter, value, unit, depth_cm,
             latitude, longitude, recorded_at)
          VALUES (
            ${row.farmId}, ${row.integrationId}, ${row.provider},
            ${row.stationId}, ${row.stationName}, ${row.sensorCategory},
            ${row.parameter}, ${row.value !== null ? parseFloat(row.value) : null},
            ${row.unit}, ${row.depthCm},
            ${row.latitude !== null ? parseFloat(row.latitude) : null},
            ${row.longitude !== null ? parseFloat(row.longitude) : null},
            ${row.recordedAt}
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

    console.log(`[FC] Farm ${farmId}: stored ${totalReadings} reading(s) from ${Object.keys(stations).length} station(s)`);
  } catch (err) {
    console.error(`[FC] Poll failed for farm ${farmId}:`, err);
    await db.update(sensorIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));
  }
}

export async function testFieldClimateCredentials(
  apiKeyEncrypted: string,
  apiKey2Encrypted: string,
): Promise<{ ok: boolean; stationCount?: number; error?: string }> {
  try {
    const publicKey = decryptCredential(apiKeyEncrypted);
    const privateKey = decryptCredential(apiKey2Encrypted);
    const stations = await fcGet<Record<string, FcStation>>(publicKey, privateKey, "/user/stations");
    return { ok: true, stationCount: Object.keys(stations).length };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export { encryptCredential };
