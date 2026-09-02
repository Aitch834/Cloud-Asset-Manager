/**
 * API-level regression test for scouting photo URL ownership.
 *
 * The test calls the production Express app over HTTP, while replacing only
 * the object-storage signer with a call-counting test double. This keeps the
 * valid request deterministic and proves rejected requests never reach URL
 * generation.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:scouting-photo-access
 */

import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { ObjectStorageService } from "../src/lib/objectStorage";

type IdRow = { id: number };
type TenantRow = { id: number; slug: string };

const suffix = `${Date.now()}-${process.pid}`;
const tenantASlug = `scouting-photo-access-a-${suffix}`;
const tenantBSlug = `scouting-photo-access-b-${suffix}`;
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

let tenantAId: number | undefined;
let tenantBId: number | undefined;
let farmAId: number | undefined;
let farmBId: number | undefined;
let scoutingAId: number | undefined;
let scoutingOtherRecordId: number | undefined;
let scoutingOtherFarmId: number | undefined;
let validPhotoId: number | undefined;
let otherRecordPhotoId: number | undefined;
let otherFarmPhotoId: number | undefined;

const signerCalls: Array<{ objectPath: string; ttlSec: number }> = [];
const originalSigner = ObjectStorageService.prototype.getPresignedDownloadUrl;
ObjectStorageService.prototype.getPresignedDownloadUrl = async function (
  objectPath: string,
  ttlSec = 300,
): Promise<string> {
  signerCalls.push({ objectPath, ttlSec });
  return `https://storage.test/signed/${signerCalls.length}`;
};

function idFrom(result: { rows: unknown[] }, label: string): number {
  const row = result.rows[0] as IdRow | undefined;
  assert(row?.id, `${label} did not return an id`);
  return row.id;
}

async function createFixtures(): Promise<void> {
  const tenantA = await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (${`Scouting photo access A ${suffix}`}, ${tenantASlug}, ${`scouting-photo-a-${suffix}@example.test`})
    RETURNING id, slug
  `);
  const tenantARow = tenantA.rows[0] as TenantRow;
  tenantAId = tenantARow.id;

  const tenantB = await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (${`Scouting photo access B ${suffix}`}, ${tenantBSlug}, ${`scouting-photo-b-${suffix}@example.test`})
    RETURNING id, slug
  `);
  const tenantBRow = tenantB.rows[0] as TenantRow;
  tenantBId = tenantBRow.id;

  farmAId = idFrom(await db.execute(sql`
    INSERT INTO farms (tenant_id, name, sector_viticulture)
    VALUES (${tenantAId}, ${`Scouting photo farm A ${suffix}`}, true)
    RETURNING id
  `), "farm A");

  farmBId = idFrom(await db.execute(sql`
    INSERT INTO farms (tenant_id, name, sector_viticulture)
    VALUES (${tenantBId}, ${`Scouting photo farm B ${suffix}`}, true)
    RETURNING id
  `), "farm B");

  scoutingAId = idFrom(await db.execute(sql`
    INSERT INTO vineyard_scouting (farm_id, scout_date, scouted_by)
    VALUES (${farmAId}, '2026-09-01', 'scouting-photo-access-test')
    RETURNING id
  `), "scouting record A");

  scoutingOtherRecordId = idFrom(await db.execute(sql`
    INSERT INTO vineyard_scouting (farm_id, scout_date, scouted_by)
    VALUES (${farmAId}, '2026-09-01', 'scouting-photo-access-test')
    RETURNING id
  `), "second scouting record");

  scoutingOtherFarmId = idFrom(await db.execute(sql`
    INSERT INTO vineyard_scouting (farm_id, scout_date, scouted_by)
    VALUES (${farmBId}, '2026-09-01', 'scouting-photo-access-test')
    RETURNING id
  `), "scouting record on second farm");

  validPhotoId = idFrom(await db.execute(sql`
    INSERT INTO vineyard_scouting_photos (scouting_id, farm_id, object_path, file_name)
    VALUES (${scoutingAId}, ${farmAId}, ${`/objects/scouting/${suffix}/valid.jpg`}, 'valid.jpg')
    RETURNING id
  `), "valid photo");

  otherRecordPhotoId = idFrom(await db.execute(sql`
    INSERT INTO vineyard_scouting_photos (scouting_id, farm_id, object_path, file_name)
    VALUES (${scoutingOtherRecordId}, ${farmAId}, ${`/objects/scouting/${suffix}/other-record.jpg`}, 'other-record.jpg')
    RETURNING id
  `), "other-record photo");

  otherFarmPhotoId = idFrom(await db.execute(sql`
    INSERT INTO vineyard_scouting_photos (scouting_id, farm_id, object_path, file_name)
    VALUES (${scoutingOtherFarmId}, ${farmBId}, ${`/objects/scouting/${suffix}/other-farm.jpg`}, 'other-farm.jpg')
    RETURNING id
  `), "other-farm photo");
}

async function main(): Promise<void> {
  await createFixtures();

  // Import after the signer replacement so the route's storage instance uses
  // the deterministic test double through the shared class prototype.
  const { default: app } = await import("../src/app");
  const server = http.createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  try {
    const address = server.address();
    assert(address && typeof address !== "string", "API test server did not open a port");
    const apiBase = `http://127.0.0.1:${address.port}/api`;

    const headers = {
      "x-dev-bypass": devBypass,
      "x-tenant-slug": tenantASlug,
    };
    const requestUrl = (farmId: number, scoutingId: number, photoId: number) =>
      `${apiBase}/farms/${farmId}/vineyard-scouting/${scoutingId}/photos/${photoId}/url`;

    const validResponse = await fetch(requestUrl(farmAId!, scoutingAId!, validPhotoId!), { headers });
    assert.equal(validResponse.status, 200, "a photo belonging to the requested record and farm should be accessible");
    assert.deepEqual(await validResponse.json(), {
      downloadUrl: "https://storage.test/signed/1",
    });
    assert.deepEqual(signerCalls, [{
      objectPath: `/objects/scouting/${suffix}/valid.jpg`,
      ttlSec: 300,
    }]);

    const otherRecordResponse = await fetch(
      requestUrl(farmAId!, scoutingAId!, otherRecordPhotoId!),
      { headers },
    );
    assert.equal(otherRecordResponse.status, 404, "a photo from another scouting record must return 404");

    const otherFarmResponse = await fetch(
      requestUrl(farmAId!, scoutingAId!, otherFarmPhotoId!),
      { headers },
    );
    assert.equal(otherFarmResponse.status, 404, "a photo from another farm must return 404");

    const tenantBoundaryResponse = await fetch(
      requestUrl(farmBId!, scoutingOtherFarmId!, otherFarmPhotoId!),
      { headers },
    );
    assert.equal(tenantBoundaryResponse.status, 404, "a farm outside the caller tenant must return 404");

    assert.equal(
      signerCalls.length,
      1,
      "rejected cross-record, cross-farm, and cross-tenant requests must not generate storage URLs",
    );

    console.log("Scouting photo access regression passed.");
    console.log("  valid request: 200 and one storage URL generated");
    console.log("  other record: 404 without storage access");
    console.log("  other farm: 404 without storage access");
    console.log("  other tenant: 404 without storage access");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch((error) => {
    console.error("Scouting photo access regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    ObjectStorageService.prototype.getPresignedDownloadUrl = originalSigner;

    if (validPhotoId !== undefined || otherRecordPhotoId !== undefined || otherFarmPhotoId !== undefined) {
      await db.execute(sql`
        DELETE FROM vineyard_scouting_photos
        WHERE id IN (${validPhotoId ?? -1}, ${otherRecordPhotoId ?? -1}, ${otherFarmPhotoId ?? -1})
      `);
    }
    if (scoutingAId !== undefined || scoutingOtherRecordId !== undefined || scoutingOtherFarmId !== undefined) {
      await db.execute(sql`
        DELETE FROM vineyard_scouting
        WHERE id IN (${scoutingAId ?? -1}, ${scoutingOtherRecordId ?? -1}, ${scoutingOtherFarmId ?? -1})
      `);
    }
    if (farmAId !== undefined || farmBId !== undefined) {
      await db.execute(sql`
        DELETE FROM farms
        WHERE id IN (${farmAId ?? -1}, ${farmBId ?? -1})
      `);
    }
    if (tenantAId !== undefined || tenantBId !== undefined) {
      await db.execute(sql`
        DELETE FROM tenants
        WHERE id IN (${tenantAId ?? -1}, ${tenantBId ?? -1})
      `);
    }
    await pool.end();
  });