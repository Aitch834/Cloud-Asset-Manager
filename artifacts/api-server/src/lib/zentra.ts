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
 * API docs: https://zentracloud.com/api/v4/documentation/
 *
 * Endpoints used:
 *   GET /devices/               → list registered devices
 *   GET /readings/?device_sn={sn}&type=json&start_mrid=0
 *                               → latest readings per device
 */

import { db } from "@workspace/db";
import { sensorIntegrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql as drizzleSql } from "drizzle-orm";
import { decryptCredential } from "./encrypt";

const ZENTRA_BASE = "https://zentracloud.com/api/v4";

async function zentraGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${ZENTRA_BASE}${path}`, {
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

interface ZentraDevicesResponse {
  data?: Array<{
    device?: {
      name?: string;
      serial_number?: string;
      description?: string;
      latitude?: number;
      longitude?: number;
    };
  }>;
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
    const devicesRes = await zentraGet<ZentraDevicesResponse>("/devices/", token);
    const devices = devicesRes.data ?? [];

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
    const res = await zentraGet<ZentraDevicesResponse>("/devices/", token);
    return { ok: true, deviceCount: (res.data ?? []).length };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
