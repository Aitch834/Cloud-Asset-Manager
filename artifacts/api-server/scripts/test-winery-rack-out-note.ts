import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:80/api";
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const fillNumber = 900_000_000 + Math.floor(Math.random() * 90_000_000);
const rackOutNote = `Rack-out integration ${unique}`;
const originalNotes = `Original fill notes ${unique}`;
const editedNotes = `Mobile-compatible edit ${unique}`;

const candidates = await db.execute(sql`
  SELECT v.id AS vessel_id, v.farm_id, t.slug AS tenant_slug
  FROM winery_vessels v
  JOIN farms f ON f.id = v.farm_id
  JOIN tenants t ON t.id = f.tenant_id
  WHERE LOWER(v.vessel_type) LIKE '%barrel%'
     OR LOWER(v.vessel_type) LIKE '%barrique%'
  ORDER BY v.id
  LIMIT 20
`);

if (!candidates.rows.length) {
  throw new Error("No barrel vessel is available for the rack-out integration test.");
}

let created: { id: number; farmId: number; vesselId: number; headers: Record<string, string> } | null = null;

async function fetchAfterCommit(url: string, init: RequestInit): Promise<Response> {
  let response = await fetch(url, init);
  for (let attempt = 0; response.status === 404 && attempt < 5; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    response = await fetch(url, init);
  }
  return response;
}

try {
  for (const candidate of candidates.rows as Array<{ vessel_id: number; farm_id: number; tenant_slug: string }>) {
    const headers = {
      "Content-Type": "application/json",
      "x-dev-bypass": devBypass,
      "x-tenant-slug": candidate.tenant_slug,
    };
    const response = await fetch(
      `${apiBase}/farms/${candidate.farm_id}/winery-vessels/${candidate.vessel_id}/fills`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          fillNumber,
          wineName: `Rack-out test ${unique}`,
          fillDate: "2026-09-01",
          notes: originalNotes,
        }),
      },
    );
    if (!response.ok) continue;
    const body = await response.json() as { record?: { id?: number } };
    if (!body.record?.id) throw new Error("Fill create response did not include an id.");
    created = {
      id: body.record.id,
      farmId: candidate.farm_id,
      vesselId: candidate.vessel_id,
      headers,
    };
    break;
  }

  if (!created) {
    throw new Error("No candidate barrel accepted the integration-test fill.");
  }

  const fillUrl = `${apiBase}/farms/${created.farmId}/winery-vessels/${created.vesselId}/fills`;
  const updateUrl = `${fillUrl}/${created.id}`;
  const rackOutResponse = await fetchAfterCommit(updateUrl, {
    method: "PUT",
    headers: created.headers,
    body: JSON.stringify({
      fillNumber,
      wineName: `Rack-out test ${unique}`,
      fillDate: "2026-09-01",
      rackOutDate: "2026-09-01",
      rackOutNote,
      notes: originalNotes,
    }),
  });
  if (!rackOutResponse.ok) {
    throw new Error(`Rack-out update failed (${rackOutResponse.status}).`);
  }

  const afterRackOut = await fetch(fillUrl, { headers: created.headers });
  const firstBody = await afterRackOut.json() as { records?: Array<Record<string, unknown>> };
  const firstRow = firstBody.records?.find(row => Number(row.id) === created?.id);
  if (firstRow?.rack_out_note !== rackOutNote || firstRow.notes !== originalNotes) {
    throw new Error("Rack-out reason was not returned separately from ordinary fill notes.");
  }

  const mobileCompatibleResponse = await fetch(updateUrl, {
    method: "PUT",
    headers: created.headers,
    body: JSON.stringify({
      fillNumber,
      wineName: `Rack-out test ${unique}`,
      fillDate: "2026-09-01",
      rackOutDate: "2026-09-01",
      notes: editedNotes,
    }),
  });
  if (!mobileCompatibleResponse.ok) {
    throw new Error(`Mobile-compatible update failed (${mobileCompatibleResponse.status}).`);
  }

  const afterMobileEdit = await fetch(fillUrl, { headers: created.headers });
  const secondBody = await afterMobileEdit.json() as { records?: Array<Record<string, unknown>> };
  const secondRow = secondBody.records?.find(row => Number(row.id) === created?.id);
  if (secondRow?.rack_out_note !== rackOutNote || secondRow.notes !== editedNotes) {
    throw new Error("An update that omitted rackOutNote did not preserve the stored reason.");
  }

  console.log("Rack-out note integration passed.");
} finally {
  if (created) {
    await fetch(
      `${apiBase}/farms/${created.farmId}/winery-vessels/${created.vesselId}/fills/${created.id}`,
      { method: "DELETE", headers: created.headers },
    ).catch(() => undefined);
  }
}