/**
 * Background job: poll GPS providers every 5 minutes for all connected farms.
 * Currently supports: Teltonika RMS, John Deere Operations Center, Webfleet.connect, AGCO Connect
 */

import { db } from "@workspace/db";
import { gpsIntegrationsTable, farmsTable, tenantsTable } from "@workspace/db";
import { inArray, eq, and } from "drizzle-orm";
import { pollTeltonikaFarm } from "./teltonika";
import { pollJdFarm } from "./john_deere";
import { pollWebfleetFarm } from "./webfleet";
import { pollAgcoFarm } from "./agco";

export function startGpsPollingJob(): void {
  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  async function runPoll(): Promise<void> {
    try {
      const rows = await db.select({
        id:                    gpsIntegrationsTable.id,
        farmId:                gpsIntegrationsTable.farmId,
        provider:              gpsIntegrationsTable.provider,
        status:                gpsIntegrationsTable.status,
        apiKeyEncrypted:       gpsIntegrationsTable.apiKeyEncrypted,
        accessTokenEncrypted:  gpsIntegrationsTable.accessTokenEncrypted,
        refreshTokenEncrypted: gpsIntegrationsTable.refreshTokenEncrypted,
        tokenExpiresAt:        gpsIntegrationsTable.tokenExpiresAt,
      }).from(gpsIntegrationsTable)
        .innerJoin(farmsTable, eq(gpsIntegrationsTable.farmId, farmsTable.id))
        .innerJoin(tenantsTable, and(eq(farmsTable.tenantId, tenantsTable.id), eq(tenantsTable.isSandbox, false)))
        .where(
          inArray(gpsIntegrationsTable.provider, ["teltonika", "john_deere", "webfleet", "agco"]),
        );

      const connected = rows.filter(r => r.status === "connected");
      if (connected.length === 0) return;

      console.log(`[GPS-POLL] Polling ${connected.length} integration(s)...`);

      await Promise.allSettled(connected.map(row => {
        if (row.provider === "teltonika") {
          if (!row.accessTokenEncrypted || !row.refreshTokenEncrypted || !row.tokenExpiresAt) {
            console.warn(`[GPS-POLL] Farm ${row.farmId} / teltonika: missing OAuth tokens, skipping`);
            return Promise.resolve();
          }
          return pollTeltonikaFarm(
            row.farmId, row.id,
            row.accessTokenEncrypted, row.refreshTokenEncrypted, row.tokenExpiresAt,
          );
        }

        if (row.provider === "john_deere") {
          if (!row.accessTokenEncrypted || !row.refreshTokenEncrypted || !row.tokenExpiresAt) {
            console.warn(`[GPS-POLL] Farm ${row.farmId} / john_deere: missing OAuth tokens, skipping`);
            return Promise.resolve();
          }
          return pollJdFarm(
            row.farmId, row.id,
            row.accessTokenEncrypted, row.refreshTokenEncrypted, row.tokenExpiresAt,
          );
        }

        if (row.provider === "webfleet") {
          if (!row.apiKeyEncrypted) {
            console.warn(`[GPS-POLL] Farm ${row.farmId} / webfleet: missing credentials, skipping`);
            return Promise.resolve();
          }
          return pollWebfleetFarm(row.farmId, row.id, row.apiKeyEncrypted);
        }

        if (row.provider === "agco") {
          if (!row.accessTokenEncrypted || !row.refreshTokenEncrypted || !row.tokenExpiresAt) {
            console.warn(`[GPS-POLL] Farm ${row.farmId} / agco: missing OAuth tokens, skipping`);
            return Promise.resolve();
          }
          return pollAgcoFarm(
            row.farmId, row.id,
            row.accessTokenEncrypted, row.refreshTokenEncrypted, row.tokenExpiresAt,
          );
        }

        return Promise.resolve();
      }));
    } catch (err) {
      console.error("[GPS-POLL] Error:", err);
    }
  }

  // Run immediately on startup, then every 5 minutes
  runPoll();
  setInterval(runPoll, INTERVAL_MS);
  console.log("[GPS-POLL] GPS polling job started (every 5 minutes) — providers: Teltonika, John Deere, Webfleet, AGCO Connect");
}
