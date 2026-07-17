/**
 * Background job: poll Teltonika RMS every 5 minutes for all connected farms.
 */

import { db } from "@workspace/db";
import { gpsIntegrationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { pollTeltonikaFarm } from "./teltonika";

export function startGpsPollingJob(): void {
  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  async function runPoll(): Promise<void> {
    try {
      const rows = await db.select({
        id: gpsIntegrationsTable.id,
        farmId: gpsIntegrationsTable.farmId,
        provider: gpsIntegrationsTable.provider,
        status: gpsIntegrationsTable.status,
        accessTokenEncrypted: gpsIntegrationsTable.accessTokenEncrypted,
        refreshTokenEncrypted: gpsIntegrationsTable.refreshTokenEncrypted,
        tokenExpiresAt: gpsIntegrationsTable.tokenExpiresAt,
      }).from(gpsIntegrationsTable)
        .where(and(
          eq(gpsIntegrationsTable.provider, "teltonika"),
          eq(gpsIntegrationsTable.status, "connected"),
        ));

      if (rows.length === 0) return;

      console.log(`[GPS-POLL] Polling ${rows.length} Teltonika integration(s)...`);

      await Promise.allSettled(rows.map(row => {
        if (!row.accessTokenEncrypted || !row.refreshTokenEncrypted || !row.tokenExpiresAt) {
          console.warn(`[GPS-POLL] Farm ${row.farmId}: missing OAuth tokens, skipping`);
          return Promise.resolve();
        }
        return pollTeltonikaFarm(
          row.farmId,
          row.id,
          row.accessTokenEncrypted,
          row.refreshTokenEncrypted,
          row.tokenExpiresAt,
        );
      }));
    } catch (err) {
      console.error("[GPS-POLL] Error:", err);
    }
  }

  // Run immediately on startup, then every 5 minutes
  runPoll();
  setInterval(runPoll, INTERVAL_MS);
  console.log("[GPS-POLL] Teltonika polling job started (every 5 minutes)");
}
