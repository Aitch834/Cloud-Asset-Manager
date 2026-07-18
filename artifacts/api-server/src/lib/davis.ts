/**
 * Davis WeatherLink v2 API integration helper.
 *
 * Davis weather stations are very common on UK farms. The WeatherLink Live
 * hub connects the physical station to the WeatherLink cloud.
 *
 * Auth: API key + API secret → HMAC-SHA256 signature
 *   - API Key    → stored as api_key_encrypted
 *   - API Secret → stored as api_key2_encrypted
 *
 * Registration: https://www.weatherlink.com/account → API Keys section
 * API docs:     https://weatherlink.github.io/v2-api/
 *
 * Signing: HMAC-SHA256 of concatenated sorted parameter string
 *   Parameters: api-key={apiKey}&t={unixTimestamp}
 *   Signature:  HMAC-SHA256(above string, apiSecret) → hex digest
 *   All three params appended to every request URL.
 */

import crypto from "crypto";
import { db } from "@workspace/db";
import { sensorIntegrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { decryptCredential } from "./encrypt";

const DAVIS_BASE = "https://api.weatherlink.com/v2";

function buildDavisSignature(apiKey: string, apiSecret: string, timestamp: number): string {
  const dataToSign = `api-key${apiKey}t${timestamp}`;
  return crypto.createHmac("sha256", apiSecret).update(dataToSign).digest("hex");
}

function davisUrl(path: string, apiKey: string, apiSecret: string): string {
  const t = Math.floor(Date.now() / 1000);
  const sig = buildDavisSignature(apiKey, apiSecret, t);
  return `${DAVIS_BASE}${path}?api-key=${apiKey}&t=${t}&api-signature=${sig}`;
}

async function davisGet<T>(path: string, apiKey: string, apiSecret: string): Promise<T> {
  const url = davisUrl(path, apiKey, apiSecret);
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Davis WeatherLink GET ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

interface DavisStationsResponse {
  stations?: Array<{
    station_id: number;
    station_name: string;
    latitude: number;
    longitude: number;
    elevation?: number;
    gateway_id_hex?: string;
    recording_interval?: number;
  }>;
}

interface DavisCurrentResponse {
  sensors?: Array<{
    lsid: number;
    sensor_type: number;
    data_structure_type: number;
    data?: Array<Record<string, number | string | null>>;
  }>;
}

const DAVIS_PARAM_MAP: Record<string, { param: string; unit: string; category: string }> = {
  temp:         { param: "air_temperature",  unit: "°C", category: "weather" },
  temp_in:      { param: "temp_indoor",      unit: "°C", category: "weather" },
  hum:          { param: "humidity",         unit: "%",  category: "weather" },
  wind_speed_avg: { param: "wind_speed",     unit: "km/h", category: "weather" },
  wind_dir_scalar_avg: { param: "wind_direction", unit: "°", category: "weather" },
  rainfall_mm:  { param: "rainfall",         unit: "mm", category: "weather" },
  rain_rate_mm_last_1_min: { param: "rain_rate", unit: "mm/h", category: "weather" },
  bar_sea_level: { param: "pressure",        unit: "hPa", category: "weather" },
  solar_rad:    { param: "solar_radiation",  unit: "W/m²", category: "weather" },
  uv_index:     { param: "uv_index",         unit: "",   category: "weather" },
  dew_point:    { param: "dew_point",        unit: "°C", category: "weather" },
  wet_bulb:     { param: "wet_bulb_temp",    unit: "°C", category: "weather" },
  moist_soil_1: { param: "soil_moisture_1",  unit: "cb", category: "soil" },
  moist_soil_2: { param: "soil_moisture_2",  unit: "cb", category: "soil" },
  moist_soil_3: { param: "soil_moisture_3",  unit: "cb", category: "soil" },
  moist_soil_4: { param: "soil_moisture_4",  unit: "cb", category: "soil" },
  temp_soil_1:  { param: "soil_temperature_1", unit: "°C", category: "soil" },
  temp_soil_2:  { param: "soil_temperature_2", unit: "°C", category: "soil" },
  temp_soil_3:  { param: "soil_temperature_3", unit: "°C", category: "soil" },
  temp_soil_4:  { param: "soil_temperature_4", unit: "°C", category: "soil" },
  leaf_wet_1:   { param: "leaf_wetness_1",   unit: "",   category: "weather" },
  leaf_wet_2:   { param: "leaf_wetness_2",   unit: "",   category: "weather" },
};

function celsiusFromF(f: number): number {
  return Math.round(((f - 32) * 5) / 9 * 10) / 10;
}

function toKmhFromMph(mph: number): number {
  return Math.round(mph * 1.60934 * 10) / 10;
}

function mmFromIn(inches: number): number {
  return Math.round(inches * 25.4 * 100) / 100;
}

function convertDavisValue(key: string, raw: number): number {
  if (key.startsWith("temp") && !key.includes("soil")) return celsiusFromF(raw);
  if (key === "temp_soil_1" || key === "temp_soil_2" || key === "temp_soil_3" || key === "temp_soil_4") return celsiusFromF(raw);
  if (key === "wind_speed_avg") return toKmhFromMph(raw);
  if (key === "rainfall_mm" || key === "rain_rate_mm_last_1_min") return mmFromIn(raw);
  return raw;
}

export async function pollDavisFarm(
  farmId: number,
  integrationId: number,
  apiKeyEncrypted: string,
  apiKey2Encrypted: string,
): Promise<void> {
  const apiKey = decryptCredential(apiKeyEncrypted);
  const apiSecret = decryptCredential(apiKey2Encrypted);

  try {
    const stationsRes = await davisGet<DavisStationsResponse>("/stations", apiKey, apiSecret);
    const stations = stationsRes.stations ?? [];

    let totalReadings = 0;
    const now = new Date();

    for (const station of stations) {
      const stationId = String(station.station_id);
      const stationName = station.station_name;
      const lat = station.latitude ?? null;
      const lng = station.longitude ?? null;

      let currentRes: DavisCurrentResponse;
      try {
        currentRes = await davisGet<DavisCurrentResponse>(
          `/current/${stationId}`, apiKey, apiSecret,
        );
      } catch (err) {
        console.warn(`[DAVIS] Station ${stationId}: failed to get current data —`, err);
        continue;
      }

      for (const sensor of currentRes.sensors ?? []) {
        const dataRow = sensor.data?.[0];
        if (!dataRow) continue;

        for (const [key, meta] of Object.entries(DAVIS_PARAM_MAP)) {
          const rawVal = dataRow[key];
          if (rawVal === null || rawVal === undefined) continue;
          const numVal = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal));
          if (isNaN(numVal)) continue;

          const value = convertDavisValue(key, numVal);
          const recordedAt = dataRow.ts
            ? new Date(Number(dataRow.ts) * 1000)
            : now;

          await db.execute(drizzleSql`
            INSERT INTO api_sensor_readings
              (farm_id, integration_id, provider, station_id, station_name,
               sensor_category, parameter, value, unit, depth_cm,
               latitude, longitude, recorded_at)
            VALUES (
              ${farmId}, ${integrationId}, 'davis',
              ${stationId}, ${stationName},
              ${meta.category}, ${meta.param},
              ${value}, ${meta.unit},
              ${null},
              ${lat}, ${lng},
              ${recordedAt}
            )
          `);
          totalReadings++;
        }
      }
    }

    await db.update(sensorIntegrationsTable).set({
      status: "connected",
      lastSyncAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));

    console.log(`[DAVIS] Farm ${farmId}: stored ${totalReadings} reading(s) from ${stations.length} station(s)`);
  } catch (err) {
    console.error(`[DAVIS] Poll failed for farm ${farmId}:`, err);
    await db.update(sensorIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));
  }
}

export async function testDavisCredentials(
  apiKeyEncrypted: string,
  apiKey2Encrypted: string,
): Promise<{ ok: boolean; stationCount?: number; error?: string }> {
  try {
    const apiKey = decryptCredential(apiKeyEncrypted);
    const apiSecret = decryptCredential(apiKey2Encrypted);
    const res = await davisGet<DavisStationsResponse>("/stations", apiKey, apiSecret);
    return { ok: true, stationCount: (res.stations ?? []).length };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
