/**
 * METER Group ZENTRA Cloud API integration helper.
 *
 * ZENTRA Cloud is the data platform for METER/Decagon soil sensors —
 * the most widely deployed research-grade soil monitoring equipment
 * in UK commercial agriculture.
 *
 * Auth: API token (Bearer)
 *   - API Token → stored as api_key_encrypted
 *   - Obtain from: ZENTRA Cloud account → Settings → API Access
 *   - Authorization: Token {apiToken}   (note: "Token" not "Bearer")
 *
 * API docs: https://zentracloud.com/api/v5/documentation/
 *
 * Endpoints used:
 *   GET /devices/               → list registered devices (paginated via next_url in v5)
 *   GET /readings/?device_sn={sn}&type=json&start_mrid=0
 *                               → latest readings per device
 *
 * Upgraded from v4 → v5 (July 2026):
 *   - v5 is the current API version; v4 returns 404 after ZENTRA Cloud 2.0 release
 *   - /devices/ now paginates via next_url; getAllDevices() follows pages to completion
 */

import { db } from "@workspace/db";
import { sensorIntegrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { decryptCredential } from "./encrypt";

const ZENTRA_BASE = "https://zentracloud.com/api/v5";

async function zentraGet<T>(path: string, token: string): Promise<T> {
  // path may be a full URL (next_url from pagination) or a relative path
  const url = path.startsWith("http") ? path : `${ZENTRA_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ZENTRA GET ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

interface ZentraDeviceEntry {
  device?: {
    name?: string;
    serial_number?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface ZentraDevicesResponse {
  data?: ZentraDeviceEntry[];
  next_url?: string | null;   // v5 pagination
}

interface ZentraReadingsResponse {
  data?: Record<string, Array<{
    datetime_utc?: string;
    readings?: Array<{
      port_name?: string;
      sensor_name?: string;
      measurement?: string;
      units?: string;
      values?: Array<{ timestamp_utc?: string; value?: number; error?: boolean }>;
    }>;
  }>>;
}

/**
 * Fetch all devices, following next_url pagination introduced in v5.
 * Guards against runaway loops with a 50-page hard cap (more than enough for
 * any real-world ZENTRA account).
 */
async function getAllZentraDevices(token: string): Promise<ZentraDeviceEntry[]> {
  const all: ZentraDeviceEntry[] = [];
  let nextPath: string | null | undefined = "/devices/";
  let pages = 0;
  const MAX_PAGES = 50;

  while (nextPath && pages < MAX_PAGES) {
    const page: ZentraDevicesResponse = await zentraGet<ZentraDevicesResponse>(nextPath, token);
    all.push(...(page.data ?? []));
    nextPath = page.next_url ?? null;
    pages++;
  }

  return all;
}

const ZENTRA_CATEGORY_MAP: Record<string, string> = {
  "Water Content": "soil",
  "Soil Temperature": "soil",
  "Bulk EC": "soil",
  "Apparent Dielectric Permittivity": "soil",
  "Electrical Conductivity": "soil",
  "Air Temperature": "weather",
  "Relative Humidity": "weather",
  "Atmospheric Pressure": "weather",
  "Solar Radiation": "weather",
  "Precipitation": "weather",
  "Wind Speed": "weather",
  "Wind Direction": "weather",
  "Lightning Activity": "weather",
  "Lightning Distance": "weather",
  "Leaf Wetness": "weather",
};

function parameterFromMeasurement(measurement: string): string {
  return measurement.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export async function pollZentraFarm(
  farmId: number,
  integrationId: number,
  apiKeyEncrypted: string,
): Promise<void> {
  const token = decryptCredential(apiKeyEncrypted);

  try {
    const devices = await getAllZentraDevices(token);

    let totalReadings = 0;

    for (const deviceEntry of devices) {
      const device = deviceEntry.device;
      if (!device?.serial_number) continue;

      const sn = device.serial_number;
      const stationName = device.name ?? sn;
      const lat = device.latitude ?? null;
      const lng = device.longitude ?? null;

      let readingsRes: ZentraReadingsResponse;
      try {
        readingsRes = await zentraGet<ZentraReadingsResponse>(
          `/readings/?device_sn=${sn}&type=json&start_mrid=0`,
          token,
        );
      } catch (err) {
        console.warn(`[ZENTRA] Device ${sn}: failed to get readings —`, err);
        continue;
      }

      const portsMap = readingsRes.data ?? {};

      for (const portReadings of Object.values(portsMap)) {
        for (const portData of portReadings) {
          for (const reading of portData.readings ?? []) {
            const measurement = reading.measurement ?? reading.sensor_name ?? "";
            const category = ZENTRA_CATEGORY_MAP[measurement] ?? "soil";
            const parameter = parameterFromMeasurement(measurement);
            const unit = reading.units ?? null;

            const latestValue = (reading.values ?? [])
              .filter(v => !v.error && v.value !== undefined && v.value !== null)
              .pop();

            if (!latestValue) continue;

            const recordedAt = latestValue.timestamp_utc
              ? new Date(latestValue.timestamp_utc)
              : new Date();

            await db.execute(drizzleSql`
              INSERT INTO api_sensor_readings
                (farm_id, integration_id, provider, station_id, station_name,
                 sensor_category, parameter, value, unit, depth_cm,
                 latitude, longitude, recorded_at)
              VALUES (
                ${farmId}, ${integrationId}, 'zentra',
                ${sn}, ${stationName},
                ${category}, ${parameter},
                ${latestValue.value}, ${unit},
                ${null},
                ${lat}, ${lng},
                ${recordedAt}
              )
            `);
            totalReadings++;
          }
        }
      }
    }

    await db.update(sensorIntegrationsTable).set({
      status: "connected",
      lastSyncAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));

    console.log(`[ZENTRA] Farm ${farmId}: stored ${totalReadings} reading(s) from ${devices.length} device(s)`);
  } catch (err) {
    console.error(`[ZENTRA] Poll failed for farm ${farmId}:`, err);
    await db.update(sensorIntegrationsTable).set({
      lastError: `Poll failed: ${String(err)}`,
      updatedAt: new Date(),
    }).where(eq(sensorIntegrationsTable.id, integrationId));
  }
}

export async function testZentraCredentials(
  apiKeyEncrypted: string,
): Promise<{ ok: boolean; deviceCount?: number; error?: string }> {
  try {
    const token = decryptCredential(apiKeyEncrypted);
    // Only fetch the first page for a credentials test — we just need to confirm auth works
    const res = await zentraGet<ZentraDevicesResponse>("/devices/", token);
    return { ok: true, deviceCount: (res.data ?? []).length };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
