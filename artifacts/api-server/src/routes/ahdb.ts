/**
 * AHDB Levy Management API
 *
 * Routes:
 *   GET    /farms/:farmId/ahdb/registrations
 *   PUT    /farms/:farmId/ahdb/registrations/:sector
 *   GET    /farms/:farmId/ahdb/records?year=&quarter=&sector=
 *   POST   /farms/:farmId/ahdb/records
 *   PUT    /farms/:farmId/ahdb/records/:id
 *   DELETE /farms/:farmId/ahdb/records/:id
 *   GET    /farms/:farmId/ahdb/summary?year=&quarter=
 *   GET    /farms/:farmId/ahdb/return.html?year=&quarter=
 *   GET    /farms/:farmId/ahdb/rates
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db, farmsTable } from "@workspace/db";
import { sql, eq, and } from "drizzle-orm";
import { requireAuth, requireTenant } from "../middlewares/roleMiddleware";

const router: IRouter = Router();

// ─── Supported sectors ────────────────────────────────────────────────────────

const VALID_SECTORS = ["cereals", "beef_lamb", "dairy", "pork", "horticulture", "potatoes"] as const;
type AhdbSector = typeof VALID_SECTORS[number];

const SECTOR_LABELS: Record<AhdbSector, string> = {
  cereals:      "Cereals & Oilseeds",
  beef_lamb:    "Beef & Lamb",
  dairy:        "Dairy",
  pork:         "Pork",
  horticulture: "Horticulture",
  potatoes:     "Potatoes",
};

// ─── Indicative levy rates (2024/25) ─────────────────────────────────────────
// Source: AHDB published rate schedule. Verify annually at ahdb.org.uk.
// Rates are in pence per unit. Use custom_rate_pence on individual records to override.

interface LevyRate {
  commodity: string;
  unit: string;
  ratePence: number;
  note?: string;
}

const LEVY_RATES: Record<AhdbSector, LevyRate[]> = {
  cereals: [
    { commodity: "Wheat",              unit: "tonnes", ratePence: 64  },
    { commodity: "Barley",             unit: "tonnes", ratePence: 64  },
    { commodity: "Oats",               unit: "tonnes", ratePence: 64  },
    { commodity: "Rye",                unit: "tonnes", ratePence: 64  },
    { commodity: "Triticale",          unit: "tonnes", ratePence: 64  },
    { commodity: "Grain Maize",        unit: "tonnes", ratePence: 64  },
    { commodity: "Oilseed Rape",       unit: "tonnes", ratePence: 151 },
    { commodity: "Linseed",            unit: "tonnes", ratePence: 151 },
    { commodity: "Sunflower Seed",     unit: "tonnes", ratePence: 151 },
    { commodity: "Field Peas",         unit: "tonnes", ratePence: 64  },
    { commodity: "Combining Peas",     unit: "tonnes", ratePence: 64  },
    { commodity: "Field Beans",        unit: "tonnes", ratePence: 64  },
  ],
  beef_lamb: [
    {
      commodity: "Cattle (over 6 months)",
      unit: "head",
      ratePence: 569,
      note: "Total levy per head collected at slaughter, split equally between vendor and buyer (£2.845 each).",
    },
    {
      commodity: "Calves (under 6 months)",
      unit: "head",
      ratePence: 132,
      note: "Total levy per head. Verify current rate with AHDB.",
    },
    {
      commodity: "Sheep & Lambs",
      unit: "head",
      ratePence: 48,
      note: "Total levy per head collected at slaughter, split equally between vendor and buyer.",
    },
  ],
  dairy: [
    {
      commodity: "Milk",
      unit: "thousand litres",
      ratePence: 1510,
      note: "Levy of £15.10 per 1,000 litres. Enter production in thousands of litres.",
    },
  ],
  pork: [
    {
      commodity: "Pigs",
      unit: "head",
      ratePence: 85,
      note: "Total levy per pig collected at slaughter. Verify current rate with AHDB Pork.",
    },
  ],
  horticulture: [
    {
      commodity: "Vegetables & Salads",
      unit: "£1,000 sales value",
      ratePence: 500,
      note: "0.5% of eligible gross sales. Enter sales value in thousands of pounds.",
    },
    {
      commodity: "Soft Fruit",
      unit: "£1,000 sales value",
      ratePence: 500,
      note: "0.5% of eligible gross sales.",
    },
    {
      commodity: "Top Fruit (Apples & Pears)",
      unit: "£1,000 sales value",
      ratePence: 500,
    },
    {
      commodity: "Ornamentals & Nursery Stock",
      unit: "£1,000 sales value",
      ratePence: 500,
    },
    {
      commodity: "Mushrooms",
      unit: "£1,000 sales value",
      ratePence: 500,
    },
    {
      commodity: "Protected Crops (Other)",
      unit: "£1,000 sales value",
      ratePence: 500,
    },
  ],
  potatoes: [],
};

// ─── Helper: verify farm belongs to the requesting tenant ────────────────────

async function resolveFarm(
  farmId: number,
  tenantId: number,
): Promise<{ id: number; name: string; address: string | null } | null> {
  if (isNaN(farmId)) return null;
  const rows = await db
    .select({ id: farmsTable.id, name: farmsTable.name, address: farmsTable.address })
    .from(farmsTable)
    .where(and(eq(farmsTable.id, farmId), eq(farmsTable.tenantId, tenantId)))
    .limit(1);
  return rows[0] ?? null;
}

// ─── GET /farms/:farmId/ahdb/rates ───────────────────────────────────────────

router.get(
  "/farms/:farmId/ahdb/rates",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    res.json({
      rates: LEVY_RATES,
      sectorLabels: SECTOR_LABELS,
      rateYear: "2024/25",
      disclaimer: "Indicative rates only. Verify current rates at ahdb.org.uk before submitting returns.",
    });
  },
);

// ─── GET /farms/:farmId/ahdb/registrations ───────────────────────────────────

router.get(
  "/farms/:farmId/ahdb/registrations",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const result = await db.execute(sql`
      SELECT id, farm_id, sector, membership_number, registered_since, notes,
             created_at, updated_at
      FROM ahdb_registrations
      WHERE farm_id = ${farmId}
      ORDER BY sector
    `);

    res.json({ registrations: result.rows });
  },
);

// ─── PUT /farms/:farmId/ahdb/registrations/:sector ───────────────────────────

router.put(
  "/farms/:farmId/ahdb/registrations/:sector",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const sector = req.params.sector as AhdbSector;

    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }
    if (!VALID_SECTORS.includes(sector)) { res.status(400).json({ error: "Invalid sector" }); return; }

    const { membershipNumber, registeredSince, notes } = req.body as {
      membershipNumber?: string;
      registeredSince?: string;
      notes?: string;
    };

    await db.execute(sql`
      INSERT INTO ahdb_registrations (farm_id, sector, membership_number, registered_since, notes, updated_at)
      VALUES (
        ${farmId}, ${sector},
        ${membershipNumber ?? null},
        ${registeredSince ?? null},
        ${notes ?? null},
        now()
      )
      ON CONFLICT (farm_id, sector) DO UPDATE SET
        membership_number = EXCLUDED.membership_number,
        registered_since  = EXCLUDED.registered_since,
        notes             = EXCLUDED.notes,
        updated_at        = now()
    `);

    res.json({ ok: true });
  },
);

// ─── GET /farms/:farmId/ahdb/records ─────────────────────────────────────────

router.get(
  "/farms/:farmId/ahdb/records",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { year, quarter, sector } = req.query as Record<string, string | undefined>;

    const conditions = [sql`farm_id = ${farmId}`];
    if (year)    conditions.push(sql`period_year = ${Number(year)}`);
    if (quarter) conditions.push(sql`period_quarter = ${Number(quarter)}`);
    if (sector)  conditions.push(sql`sector = ${sector}`);

    const whereClause = conditions.reduce((acc, c, i) =>
      i === 0 ? c : sql`${acc} AND ${c}`,
    );

    const result = await db.execute(sql`
      SELECT id, farm_id, sector, period_year, period_quarter, commodity,
             quantity, unit, custom_rate_pence, notes, created_at, updated_at
      FROM ahdb_levy_records
      WHERE ${whereClause}
      ORDER BY period_year DESC, period_quarter DESC, sector, commodity
    `);

    res.json({ records: result.rows });
  },
);

// ─── POST /farms/:farmId/ahdb/records ────────────────────────────────────────

router.post(
  "/farms/:farmId/ahdb/records",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { sector, periodYear, periodQuarter, commodity, quantity, unit, customRatePence, notes } =
      req.body as {
        sector: string;
        periodYear: number;
        periodQuarter: number;
        commodity: string;
        quantity: number;
        unit: string;
        customRatePence?: number | null;
        notes?: string;
      };

    if (!VALID_SECTORS.includes(sector as AhdbSector)) {
      res.status(400).json({ error: "Invalid sector" }); return;
    }
    if (!sector || !commodity || quantity == null || !unit) {
      res.status(400).json({ error: "sector, commodity, quantity and unit are required" }); return;
    }
    if (periodQuarter < 1 || periodQuarter > 4) {
      res.status(400).json({ error: "periodQuarter must be 1–4" }); return;
    }

    const result = await db.execute(sql`
      INSERT INTO ahdb_levy_records
        (farm_id, sector, period_year, period_quarter, commodity, quantity, unit, custom_rate_pence, notes)
      VALUES
        (${farmId}, ${sector}, ${Number(periodYear)}, ${Number(periodQuarter)},
         ${commodity}, ${Number(quantity)}, ${unit},
         ${customRatePence ?? null}, ${notes ?? null})
      RETURNING id
    `);

    res.status(201).json({ id: (result.rows[0] as { id: number }).id });
  },
);

// ─── PUT /farms/:farmId/ahdb/records/:id ─────────────────────────────────────

router.put(
  "/farms/:farmId/ahdb/records/:id",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const recordId = Number(req.params.id);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { sector, periodYear, periodQuarter, commodity, quantity, unit, customRatePence, notes } =
      req.body as {
        sector: string;
        periodYear: number;
        periodQuarter: number;
        commodity: string;
        quantity: number;
        unit: string;
        customRatePence?: number | null;
        notes?: string;
      };

    const updated = await db.execute(sql`
      UPDATE ahdb_levy_records
      SET sector = ${sector},
          period_year = ${Number(periodYear)},
          period_quarter = ${Number(periodQuarter)},
          commodity = ${commodity},
          quantity = ${Number(quantity)},
          unit = ${unit},
          custom_rate_pence = ${customRatePence ?? null},
          notes = ${notes ?? null},
          updated_at = now()
      WHERE id = ${recordId} AND farm_id = ${farmId}
      RETURNING id
    `);

    if (!updated.rows.length) { res.status(404).json({ error: "Record not found" }); return; }
    res.json({ ok: true });
  },
);

// ─── DELETE /farms/:farmId/ahdb/records/:id ──────────────────────────────────

router.delete(
  "/farms/:farmId/ahdb/records/:id",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const recordId = Number(req.params.id);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const deleted = await db.execute(sql`
      DELETE FROM ahdb_levy_records
      WHERE id = ${recordId} AND farm_id = ${farmId}
      RETURNING id
    `);

    if (!deleted.rows.length) { res.status(404).json({ error: "Record not found" }); return; }
    res.json({ ok: true });
  },
);

// ─── GET /farms/:farmId/ahdb/summary ─────────────────────────────────────────

function lookupRate(sector: AhdbSector, commodity: string): number | null {
  const rates = LEVY_RATES[sector];
  const match = rates?.find((r) => r.commodity === commodity);
  return match?.ratePence ?? null;
}

interface SummaryRow {
  sector: AhdbSector;
  commodity: string;
  unit: string;
  totalQuantity: number;
  ratePence: number;
  levyPence: number;
}

router.get(
  "/farms/:farmId/ahdb/summary",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { year, quarter } = req.query as Record<string, string | undefined>;

    const conditions = [sql`farm_id = ${farmId}`];
    if (year)    conditions.push(sql`period_year = ${Number(year)}`);
    if (quarter) conditions.push(sql`period_quarter = ${Number(quarter)}`);

    const whereClause = conditions.reduce((acc, c, i) =>
      i === 0 ? c : sql`${acc} AND ${c}`,
    );

    const result = await db.execute(sql`
      SELECT sector, commodity, unit,
             SUM(quantity)::float            AS total_quantity,
             MIN(custom_rate_pence)::float   AS custom_rate
      FROM ahdb_levy_records
      WHERE ${whereClause}
      GROUP BY sector, commodity, unit
      ORDER BY sector, commodity
    `);

    const rows: SummaryRow[] = (result.rows as {
      sector: string; commodity: string; unit: string;
      total_quantity: string; custom_rate: string | null;
    }[]).map((r) => {
      const qty  = parseFloat(r.total_quantity);
      const rate = r.custom_rate
        ? parseFloat(r.custom_rate)
        : (lookupRate(r.sector as AhdbSector, r.commodity) ?? 0);
      return {
        sector: r.sector as AhdbSector,
        commodity: r.commodity,
        unit: r.unit,
        totalQuantity: qty,
        ratePence: rate,
        levyPence: Math.round(qty * rate),
      };
    });

    const totalLevyPence = rows.reduce((s, r) => s + r.levyPence, 0);

    res.json({ summary: rows, totalLevyPence, farmName: farm.name });
  },
);

// ─── GET /farms/:farmId/ahdb/return.html ─────────────────────────────────────

router.get(
  "/farms/:farmId/ahdb/return.html",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { year, quarter } = req.query as Record<string, string | undefined>;
    const periodLabel = quarter ? `Q${quarter} ${year ?? ""}` : `Full Year ${year ?? ""}`;

    const conditions = [sql`r.farm_id = ${farmId}`];
    if (year)    conditions.push(sql`r.period_year = ${Number(year)}`);
    if (quarter) conditions.push(sql`r.period_quarter = ${Number(quarter)}`);

    const whereClause = conditions.reduce((acc, c, i) =>
      i === 0 ? c : sql`${acc} AND ${c}`,
    );

    const [recordsResult, regResult] = await Promise.all([
      db.execute(sql`
        SELECT r.sector, r.commodity, r.unit,
               SUM(r.quantity)::float            AS total_quantity,
               MIN(r.custom_rate_pence)::float   AS custom_rate
        FROM ahdb_levy_records r
        WHERE ${whereClause}
        GROUP BY r.sector, r.commodity, r.unit
        ORDER BY r.sector, r.commodity
      `),
      db.execute(sql`
        SELECT sector, membership_number
        FROM ahdb_registrations
        WHERE farm_id = ${farmId}
      `),
    ]);

    const regBysSector: Record<string, string> = {};
    (regResult.rows as { sector: string; membership_number: string | null }[]).forEach((r) => {
      regBysSector[r.sector] = r.membership_number ?? "—";
    });

    interface SRow {
      sector: string; commodity: string; unit: string;
      total_quantity: string; custom_rate: string | null;
    }

    // Group records by sector for rendering
    const bySector: Record<string, { commodity: string; unit: string; qty: number; rate: number; levy: number }[]> = {};
    let grandTotal = 0;

    (recordsResult.rows as unknown as SRow[]).forEach((r) => {
      const qty  = parseFloat(r.total_quantity);
      const rate = r.custom_rate
        ? parseFloat(r.custom_rate)
        : (lookupRate(r.sector as AhdbSector, r.commodity) ?? 0);
      const levy = Math.round(qty * rate);
      grandTotal += levy;
      if (!bySector[r.sector]) bySector[r.sector] = [];
      bySector[r.sector].push({ commodity: r.commodity, unit: r.unit, qty, rate, levy });
    });

    const fmt = (p: number) => `£${(p / 100).toFixed(2)}`;
    const fmtQty = (q: number, unit: string) => {
      const s = unit.includes("litre") || unit.includes("tonne") || unit.includes("sales")
        ? q.toFixed(3)
        : q.toFixed(0);
      return `${s} ${unit}`;
    };

    const sectorRows = Object.entries(bySector).map(([sector, rows]) => {
      const sectorLabel = SECTOR_LABELS[sector as AhdbSector] ?? sector;
      const sectorTotal = rows.reduce((s, r) => s + r.levy, 0);
      const memberNo = regBysSector[sector] ?? "Not registered";
      const rowHtml = rows.map((r) => `
        <tr>
          <td class="commodity">${r.commodity}</td>
          <td class="num">${fmtQty(r.qty, r.unit)}</td>
          <td class="num">${fmt(r.rate)} / ${r.unit}</td>
          <td class="num">${fmt(r.levy)}</td>
        </tr>`).join("");

      return `
        <div class="sector-block">
          <div class="sector-header">
            <span class="sector-name">${sectorLabel}</span>
            <span class="sector-member">AHDB No: ${memberNo}</span>
            <span class="sector-total">${fmt(sectorTotal)}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Commodity</th>
                <th class="num">Quantity</th>
                <th class="num">Rate</th>
                <th class="num">Levy</th>
              </tr>
            </thead>
            <tbody>${rowHtml}</tbody>
          </table>
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AHDB Levy Return — ${periodLabel}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #111; padding: 24px; max-width: 900px; margin: auto; }
  h1 { font-size: 18pt; margin-bottom: 4px; }
  .subtitle { color: #555; font-size: 10pt; margin-bottom: 20px; }
  .meta { display: flex; gap: 40px; margin-bottom: 24px; padding: 12px 16px; background: #f5f5f5; border-radius: 4px; }
  .meta-item label { font-size: 8pt; color: #888; display: block; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta-item span { font-size: 11pt; font-weight: 600; }
  .sector-block { margin-bottom: 24px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
  .sector-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #1a3a2a; color: #fff; font-size: 10pt; }
  .sector-name { font-weight: 700; font-size: 11pt; }
  .sector-member { color: #aed9b0; font-size: 9pt; }
  .sector-total { font-weight: 700; font-size: 12pt; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f0f4f1; text-align: left; padding: 6px 12px; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.04em; color: #444; }
  td { padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 10pt; }
  .num { text-align: right; }
  .grand-total { margin-top: 12px; text-align: right; font-size: 14pt; font-weight: 700; padding: 12px 16px; background: #1a3a2a; color: #fff; border-radius: 4px; }
  .disclaimer { margin-top: 24px; font-size: 8pt; color: #888; border-top: 1px solid #ddd; padding-top: 12px; }
  .empty { text-align: center; color: #888; padding: 24px; font-size: 10pt; }
  @media print { body { padding: 0; } @page { margin: 1.5cm; } }
</style>
</head>
<body>
<h1>AHDB Levy Summary</h1>
<p class="subtitle">Self-assessment record — verify with AHDB before submitting</p>

<div class="meta">
  <div class="meta-item"><label>Farm</label><span>${farm.name}</span></div>
  <div class="meta-item"><label>Period</label><span>${periodLabel}</span></div>
  <div class="meta-item"><label>Prepared</label><span>${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</span></div>
</div>

${sectorRows || '<p class="empty">No levy records found for this period.</p>'}

<div class="grand-total">Total Levy: ${fmt(grandTotal)}</div>

<div class="disclaimer">
  Rates shown are indicative 2024/25 AHDB published rates. Always verify the current rate schedule at ahdb.org.uk before completing official returns.
  The Beef &amp; Lamb levy is collected at slaughter and split equally between vendor and buyer; totals shown are the combined levy per head.
  This document is a management record only and does not constitute an official AHDB return.
</div>
</body>
</html>`;

    res.set("Content-Type", "text/html; charset=utf-8").send(html);
  },
);

export default router;
