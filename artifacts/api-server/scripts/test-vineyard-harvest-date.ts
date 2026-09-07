import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";

const farmId = 5;
const tenantSlug = "oakfield-farms";
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const harvestDate = "2026-07-15";
const invalidHarvestDate = "2026-02-30";
const yieldKg = "2293.50";
let harvestId: number | undefined;

async function main(): Promise<void> {
  const { default: app } = await import("../src/app");
  const server = http.createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert(address && typeof address !== "string", "API test server did not open a port");
    const url = `http://127.0.0.1:${address.port}/api/farms/${farmId}/vineyard-harvest`;
    const headers = {
      "content-type": "application/json",
      "x-dev-bypass": devBypass,
      "x-tenant-slug": tenantSlug,
    };

    const createResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        vintageYear: 2026,
        harvestDate,
        yieldKg,
        notes: "Vineyard harvest date regression test",
      }),
    });
    const createText = await createResponse.text();
    assert.equal(createResponse.status, 200, createText);
    const created = JSON.parse(createText) as {
      record?: { id?: number; harvestDate?: string; yieldKg?: string };
    };
    assert(created.record?.id, "Harvest create response did not include an id");
    harvestId = Number(created.record.id);
    assert.equal(created.record.harvestDate, harvestDate);
    assert.equal(created.record.yieldKg, yieldKg);

    const listResponse = await fetch(url, { headers });
    const listText = await listResponse.text();
    assert.equal(listResponse.status, 200, listText);
    const listed = JSON.parse(listText) as {
      records?: Array<{ id?: number; harvestDate?: string; yieldKg?: string }>;
    };
    const returned = listed.records?.find(record => Number(record.id) === harvestId);
    assert(returned, "Inserted harvest was not returned by the harvest endpoint");
    assert.equal(returned.harvestDate, harvestDate);
    assert.equal(returned.yieldKg, yieldKg);

    const invalidResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        vintageYear: 2026,
        harvestDate: invalidHarvestDate,
        yieldKg: "10.00",
      }),
    });
    const invalidText = await invalidResponse.text();
    assert.equal(invalidResponse.status, 400, invalidText);
    const invalidBody = JSON.parse(invalidText) as { field?: string };
    assert.equal(invalidBody.field, "harvestDate");

    console.log("Vineyard harvest date regression passed.");
    console.log("  valid ISO date: inserted and returned");
    console.log("  invalid calendar date: rejected with 400");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch(error => {
    console.error("Vineyard harvest date regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (harvestId !== undefined) {
      await db.execute(sql`DELETE FROM vineyard_harvest WHERE id = ${harvestId}`);
    }
    await pool.end();
  });