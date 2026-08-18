/**
 * Trade Body Levies & Subscriptions API
 *
 * Covers: NFU, WineGB, British Wool, QMS (Scotland), HCC (Wales), Red Tractor.
 *
 * Routes:
 *   GET    /farms/:farmId/trade-levies/bodies
 *   GET    /farms/:farmId/trade-levies/registrations
 *   PUT    /farms/:farmId/trade-levies/registrations/:body
 *   GET    /farms/:farmId/trade-levies/records?body=&year=&quarter=
 *   POST   /farms/:farmId/trade-levies/records
 *   PUT    /farms/:farmId/trade-levies/records/:id
 *   DELETE /farms/:farmId/trade-levies/records/:id
 *   GET    /farms/:farmId/trade-levies/summary?year=
 *   GET    /farms/:farmId/trade-levies/return.html?body=&year=
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db, farmsTable } from "@workspace/db";
import { sql, eq, and } from "drizzle-orm";
import { requireAuth, requireTenant } from "../middlewares/roleMiddleware";

const router: IRouter = Router();

// ─── Body catalogue ──────────────────────────────────────────────────────────

interface BodyCategory {
  key: string;
  unit: string;
  /** Indicative rate in pence. null = always use custom_rate_pence. */
  ratePence: number | null;
  note?: string;
}

interface BodyConfig {
  body: string;
  label: string;
  shortLabel: string;
  type: "membership" | "levy" | "statutory" | "assurance";
  description: string;
  website: string;
  rateYear: string;
  disclaimer: string;
  /** Whether records use quarterly periods (true) or annual-only (false). */
  quarterly: boolean;
  categories: BodyCategory[];
}

const BODY_CONFIGS: BodyConfig[] = [
  {
    body: "nfu",
    label: "NFU — National Farmers Union",
    shortLabel: "NFU",
    type: "membership",
    description:
      "Voluntary annual membership subscription for farmers and growers in England and Wales. " +
      "The fee is income-banded and varies by farm type, enterprise mix, and NFU membership grade.",
    website: "nfuonline.com",
    rateYear: "Current year",
    disclaimer:
      "NFU membership is a voluntary contribution, not a statutory levy. " +
      "Enter your actual annual subscription fee. Verify your band at nfuonline.com.",
    quarterly: false,
    categories: [
      {
        key: "Annual Membership Subscription",
        unit: "year",
        ratePence: null,
        note:
          "Fee varies by income band and farm type. Enter 1 in Quantity and your actual annual " +
          "fee (in pence) in Custom Rate. Verify your rate at nfuonline.com.",
      },
    ],
  },
  {
    body: "winegb",
    label: "WineGB — English & Welsh Wine Producers",
    shortLabel: "WineGB",
    type: "membership",
    description:
      "Annual membership for English and Welsh wine growers and producers. " +
      "Grower fees are based on hectares of vines; producer fees on annual production volume.",
    website: "winegb.co.uk",
    rateYear: "Current year",
    disclaimer:
      "WineGB membership is a voluntary industry contribution, not a statutory levy. " +
      "Rates change periodically — verify current fees at winegb.co.uk/membership before recording.",
    quarterly: false,
    categories: [
      {
        key: "Grower Membership",
        unit: "ha",
        ratePence: null,
        note:
          "Annual membership fee per hectare of vines. Enter hectares in Quantity and the per-hectare " +
          "rate (pence) in Custom Rate. Verify current rate at winegb.co.uk/membership.",
      },
      {
        key: "Producer Membership",
        unit: "year",
        ratePence: null,
        note:
          "Annual membership for winery producers, banded by production volume. Enter 1 in Quantity " +
          "and your actual annual fee (pence) in Custom Rate. Verify at winegb.co.uk/membership.",
      },
    ],
  },
  {
    body: "british_wool",
    label: "British Wool (BWMB)",
    shortLabel: "British Wool",
    type: "statutory",
    description:
      "Statutory wool marketing scheme administered by the British Wool Marketing Board (BWMB). " +
      "Registration is compulsory for producers with 4 or more sheep. All wool must be sold " +
      "through BWMB, which deducts a marketing levy before paying the net wool price to producers.",
    website: "britishwool.org.uk",
    rateYear: "Variable — set at auction",
    disclaimer:
      "British Wool payments are net auction proceeds after BWMB deductions — not a fixed statutory levy rate. " +
      "Enter wool sold (kg) and the net pence per kg received from BWMB. " +
      "Verify actual payments on your BWMB remittance. Registration required for 4+ sheep: gov.uk/find-licences/wool-marketing-board-registration",
    quarterly: true,
    categories: [
      {
        key: "Wool Sold",
        unit: "kg",
        ratePence: null,
        note:
          "Enter kg of wool submitted to BWMB in Quantity and the net pence per kg received from BWMB " +
          "in Custom Rate. The net price varies by grade and auction. " +
          "Use your BWMB remittance advice for the actual figures.",
      },
    ],
  },
  {
    body: "qms",
    label: "Quality Meat Scotland (QMS)",
    shortLabel: "QMS",
    type: "levy",
    description:
      "Statutory levy on cattle, sheep, and pigs slaughtered or exported live from Scotland. " +
      "Paid by both the producer (at point of sale) and the slaughterer/exporter. " +
      "Record the producer (vendor) portion of the levy here.",
    website: "qmscotland.co.uk",
    rateYear: "2026/27",
    disclaimer:
      "QMS rates shown are producer (vendor) rates for 2026/27 (April 2026 – March 2027). " +
      "Slaughterer rates are separate and not included here. " +
      "Verify current rates at qmscotland.co.uk/levy-rates before submitting returns.",
    quarterly: true,
    categories: [
      {
        key: "Cattle",
        unit: "head",
        ratePence: 484,
        note: "Producer rate: £4.84/head (2026/27). Total levy £6.34/head (slaughterer also pays £1.50/head).",
      },
      {
        key: "Calves (up to 68 kg)",
        unit: "head",
        ratePence: 7,
        note: "Producer rate: £0.07/head (2026/27). Total levy £0.15/head.",
      },
      {
        key: "Sheep & Lambs",
        unit: "head",
        ratePence: 69,
        note: "Producer rate: £0.69/head (2026/27). Total levy £0.92/head (slaughterer also pays £0.23/head).",
      },
      {
        key: "Pigs",
        unit: "head",
        ratePence: 117,
        note: "Producer rate: £1.17/head (2026/27). Total levy £1.45/head (slaughterer also pays £0.28/head).",
      },
    ],
  },
  {
    body: "hcc",
    label: "Hybu Cig Cymru (HCC) — Meat Promotion Wales",
    shortLabel: "HCC",
    type: "levy",
    description:
      "Statutory levy on cattle, sheep, and pigs slaughtered in Wales. " +
      "Paid equally by producers and processors. Rates are indexed to CPI and reviewed annually each April.",
    website: "meatpromotion.wales",
    rateYear: "Indicative — verify annually",
    disclaimer:
      "HCC rates shown are indicative producer rates only. HCC levies are indexed to CPI each April. " +
      "Always verify current rates at meatpromotion.wales before recording or submitting returns. " +
      "Override the rate with Custom Rate if you know your exact figure.",
    quarterly: true,
    categories: [
      {
        key: "Cattle",
        unit: "head",
        ratePence: 143,
        note:
          "Indicative producer rate ~£1.43/head. Verify current rate at meatpromotion.wales — " +
          "increases with CPI annually from 1 April.",
      },
      {
        key: "Calves",
        unit: "head",
        ratePence: 23,
        note:
          "Indicative producer rate ~£0.23/head. Verify current rate at meatpromotion.wales.",
      },
      {
        key: "Sheep & Lambs",
        unit: "head",
        ratePence: 25,
        note:
          "Indicative producer rate ~£0.25/head. Verify current rate at meatpromotion.wales.",
      },
      {
        key: "Pigs",
        unit: "head",
        ratePence: 22,
        note:
          "Indicative producer rate ~£0.22/head. Verify current rate at meatpromotion.wales.",
      },
    ],
  },
  {
    body: "red_tractor",
    label: "Red Tractor Assurance",
    shortLabel: "Red Tractor",
    type: "assurance",
    description:
      "UK's largest farm assurance and certification scheme. Annual fee paid to your chosen " +
      "certification body (not directly to Red Tractor). Fee is banded by farm area. " +
      "Membership renews annually (1 April – 31 March).",
    website: "redtractor.org.uk",
    rateYear: "2024/25 indicative",
    disclaimer:
      "Red Tractor fees are paid to your certification body, not to Red Tractor directly. " +
      "Fees shown are indicative base rates — your actual fee may differ based on your certification body " +
      "and scheme (Combinable Crops, Beef & Lamb, Dairy, Fresh Produce, Poultry etc.). " +
      "Confirm your exact annual fee with your certification body.",
    quarterly: false,
    categories: [
      {
        key: "Band A — 1 to 80 Ha",
        unit: "year",
        ratePence: 5460,
        note: "Indicative annual base fee for farms 1–80 ha. Confirm with your certification body.",
      },
      {
        key: "Band B — 81 to 200 Ha",
        unit: "year",
        ratePence: 5460,
        note: "Indicative annual base fee for farms 81–200 ha. Confirm with your certification body.",
      },
      {
        key: "Band C — 201 to 300 Ha",
        unit: "year",
        ratePence: 5460,
        note: "Indicative annual base fee for farms 201–300 ha. Confirm with your certification body.",
      },
      {
        key: "Band D — 301 to 600 Ha",
        unit: "year",
        ratePence: 5460,
        note: "Indicative annual base fee for farms 301–600 ha. Confirm with your certification body.",
      },
      {
        key: "Band E — 601 to 900 Ha",
        unit: "year",
        ratePence: 6530,
        note: "Indicative annual base fee for farms 601–900 ha. Confirm with your certification body.",
      },
      {
        key: "Band F — over 900 Ha",
        unit: "year",
        ratePence: 9430,
        note: "Indicative annual base fee for farms over 900 ha. Confirm with your certification body.",
      },
    ],
  },
];

const VALID_BODIES = BODY_CONFIGS.map((b) => b.body);

// ─── Helper: resolve & authorise farm ────────────────────────────────────────

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

// ─── GET /farms/:farmId/trade-levies/bodies ───────────────────────────────────

router.get(
  "/farms/:farmId/trade-levies/bodies",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }
    res.json({ bodies: BODY_CONFIGS });
  },
);

// ─── GET /farms/:farmId/trade-levies/registrations ───────────────────────────

router.get(
  "/farms/:farmId/trade-levies/registrations",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const result = await db.execute(sql`
      SELECT id, farm_id, body, membership_number, registered_since, notes,
             created_at, updated_at
      FROM trade_body_registrations
      WHERE farm_id = ${farmId}
      ORDER BY body
    `);
    res.json({ registrations: result.rows });
  },
);

// ─── PUT /farms/:farmId/trade-levies/registrations/:body ─────────────────────

router.put(
  "/farms/:farmId/trade-levies/registrations/:body",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const body = String(req.params.body);

    if (!VALID_BODIES.includes(body)) {
      res.status(400).json({ error: "Unknown trade body" }); return;
    }
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { membership_number, registered_since, notes } = req.body as Record<string, string>;

    await db.execute(sql`
      INSERT INTO trade_body_registrations
        (farm_id, body, membership_number, registered_since, notes, updated_at)
      VALUES
        (${farmId}, ${body},
         ${membership_number ?? null},
         ${registered_since ?? null},
         ${notes ?? null},
         now())
      ON CONFLICT (farm_id, body) DO UPDATE
        SET membership_number = EXCLUDED.membership_number,
            registered_since  = EXCLUDED.registered_since,
            notes             = EXCLUDED.notes,
            updated_at        = now()
    `);

    const updated = await db.execute(sql`
      SELECT * FROM trade_body_registrations
      WHERE farm_id = ${farmId} AND body = ${body}
    `);
    res.json({ registration: updated.rows[0] });
  },
);

// ─── GET /farms/:farmId/trade-levies/records ─────────────────────────────────

router.get(
  "/farms/:farmId/trade-levies/records",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const body    = req.query.body    as string | undefined;
    const year    = req.query.year    ? Number(req.query.year)    : null;
    const quarter = req.query.quarter ? Number(req.query.quarter) : null;

    const result = await db.execute(sql`
      SELECT id, farm_id, body, period_year, period_quarter,
             category, quantity, unit, custom_rate_pence, notes,
             created_at, updated_at
      FROM trade_body_records
      WHERE farm_id = ${farmId}
        AND (${body ?? null} IS NULL OR body = ${body ?? null})
        AND (${year}    IS NULL OR period_year    = ${year})
        AND (${quarter} IS NULL OR period_quarter = ${quarter})
      ORDER BY period_year DESC, period_quarter DESC NULLS LAST, body, created_at DESC
    `);
    res.json({ records: result.rows });
  },
);

// ─── POST /farms/:farmId/trade-levies/records ────────────────────────────────

router.post(
  "/farms/:farmId/trade-levies/records",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { body, period_year, period_quarter, category, quantity, unit, custom_rate_pence, notes } =
      req.body as Record<string, string | number | null>;

    if (!VALID_BODIES.includes(String(body))) {
      res.status(400).json({ error: "Unknown trade body" }); return;
    }
    if (!period_year || !category || !quantity || !unit) {
      res.status(400).json({ error: "body, period_year, category, quantity and unit are required" }); return;
    }

    const result = await db.execute(sql`
      INSERT INTO trade_body_records
        (farm_id, body, period_year, period_quarter, category, quantity, unit, custom_rate_pence, notes)
      VALUES
        (${farmId}, ${body}, ${Number(period_year)},
         ${period_quarter ? Number(period_quarter) : null},
         ${String(category)}, ${Number(quantity)}, ${String(unit)},
         ${custom_rate_pence !== undefined && custom_rate_pence !== null && custom_rate_pence !== ""
             ? Number(custom_rate_pence) : null},
         ${notes ? String(notes) : null})
      RETURNING *
    `);
    res.status(201).json({ record: result.rows[0] });
  },
);

// ─── PUT /farms/:farmId/trade-levies/records/:id ─────────────────────────────

router.put(
  "/farms/:farmId/trade-levies/records/:id",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const id = Number(req.params.id);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const { body, period_year, period_quarter, category, quantity, unit, custom_rate_pence, notes } =
      req.body as Record<string, string | number | null>;

    if (!VALID_BODIES.includes(String(body))) {
      res.status(400).json({ error: "Unknown trade body" }); return;
    }

    const result = await db.execute(sql`
      UPDATE trade_body_records
      SET body              = ${body},
          period_year       = ${Number(period_year)},
          period_quarter    = ${period_quarter ? Number(period_quarter) : null},
          category          = ${String(category)},
          quantity          = ${Number(quantity)},
          unit              = ${String(unit)},
          custom_rate_pence = ${custom_rate_pence !== undefined && custom_rate_pence !== null && custom_rate_pence !== ""
              ? Number(custom_rate_pence) : null},
          notes             = ${notes ? String(notes) : null},
          updated_at        = now()
      WHERE id = ${id} AND farm_id = ${farmId}
      RETURNING *
    `);
    if (!result.rows.length) { res.status(404).json({ error: "Record not found" }); return; }
    res.json({ record: result.rows[0] });
  },
);

// ─── DELETE /farms/:farmId/trade-levies/records/:id ──────────────────────────

router.delete(
  "/farms/:farmId/trade-levies/records/:id",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const id = Number(req.params.id);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    await db.execute(sql`
      DELETE FROM trade_body_records WHERE id = ${id} AND farm_id = ${farmId}
    `);
    res.json({ ok: true });
  },
);

// ─── GET /farms/:farmId/trade-levies/summary?year= ───────────────────────────

router.get(
  "/farms/:farmId/trade-levies/summary",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).json({ error: "Farm not found" }); return; }

    const year = Number(req.query.year ?? new Date().getFullYear());

    const result = await db.execute(sql`
      SELECT body, category, unit,
             SUM(quantity) AS total_quantity,
             AVG(COALESCE(custom_rate_pence, 0)) AS avg_rate_pence,
             SUM(quantity * COALESCE(custom_rate_pence, 0)) AS total_pence
      FROM trade_body_records
      WHERE farm_id = ${farmId} AND period_year = ${year}
      GROUP BY body, category, unit
      ORDER BY body, category
    `);

    // Build a per-body summary enriched with indicative rates
    type SummaryRow = {
      body: string;
      category: string;
      unit: string;
      total_quantity: string;
      avg_rate_pence: string;
      total_pence: string;
    };

    const rows = result.rows as SummaryRow[];

    // Attach indicative rates for categories that have null custom_rate_pence
    const enriched = rows.map((row) => {
      const cfg = BODY_CONFIGS.find((b) => b.body === row.body);
      const catCfg = cfg?.categories.find((c) => c.key === row.category);
      const indicativeRate = catCfg?.ratePence ?? 0;
      const totalQuantity = Number(row.total_quantity);
      const avgRate = Number(row.avg_rate_pence);
      const storedPence = Number(row.total_pence);
      // If all records for this category use custom rates, use storedPence;
      // otherwise fall back to indicative for display purposes.
      const displayPence = avgRate > 0 ? storedPence : totalQuantity * indicativeRate;
      return {
        body: row.body,
        bodyLabel: cfg?.shortLabel ?? row.body,
        category: row.category,
        unit: row.unit,
        totalQuantity,
        ratePence: avgRate > 0 ? avgRate : indicativeRate,
        totalPence: displayPence,
        usedIndicativeRate: avgRate === 0 && indicativeRate > 0,
      };
    });

    // Grand total per body
    const totalsPerBody: Record<string, number> = {};
    for (const row of enriched) {
      totalsPerBody[row.body] = (totalsPerBody[row.body] ?? 0) + row.totalPence;
    }

    res.json({ year, rows: enriched, totalsPerBody });
  },
);

// ─── GET /farms/:farmId/trade-levies/return.html?body=&year= ─────────────────

router.get(
  "/farms/:farmId/trade-levies/return.html",
  requireAuth,
  requireTenant,
  async (req: Request, res: Response): Promise<void> => {
    const farmId = Number(req.params.farmId);
    const farm = await resolveFarm(farmId, req.tenantId!);
    if (!farm) { res.status(404).send("<h1>Farm not found</h1>"); return; }

    const body = String(req.query.body ?? "");
    const year = Number(req.query.year ?? new Date().getFullYear());

    const cfg = BODY_CONFIGS.find((b) => b.body === body);
    if (!cfg) { res.status(400).send("<h1>Unknown trade body</h1>"); return; }

    // Fetch registration
    const regResult = await db.execute(sql`
      SELECT membership_number, registered_since, notes
      FROM trade_body_registrations
      WHERE farm_id = ${farmId} AND body = ${body}
    `);
    const reg = (regResult.rows[0] ?? {}) as { membership_number?: string; registered_since?: string; notes?: string };

    // Fetch records for this body + year
    const recResult = await db.execute(sql`
      SELECT period_year, period_quarter, category, quantity, unit, custom_rate_pence, notes
      FROM trade_body_records
      WHERE farm_id = ${farmId} AND body = ${body} AND period_year = ${year}
      ORDER BY period_quarter NULLS FIRST, category
    `);

    type RecordRow = {
      period_year: number;
      period_quarter: number | null;
      category: string;
      quantity: string;
      unit: string;
      custom_rate_pence: string | null;
      notes: string | null;
    };
    const records = recResult.rows as RecordRow[];

    // Calculate totals
    let grandTotalPence = 0;
    const tableRows = records.map((r) => {
      const catCfg = cfg.categories.find((c) => c.key === r.category);
      const rate = r.custom_rate_pence !== null ? Number(r.custom_rate_pence) : (catCfg?.ratePence ?? 0);
      const qty = Number(r.quantity);
      const linePence = qty * rate;
      grandTotalPence += linePence;
      const quarterLabel = r.period_quarter ? `Q${r.period_quarter}` : "Annual";
      return { quarterLabel, category: r.category, qty, unit: r.unit, rate, linePence };
    });

    const formatPounds = (pence: number) =>
      (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

    const printDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    });

    const trRows = tableRows
      .map(
        (r) => `
      <tr>
        <td>${r.quarterLabel}</td>
        <td>${r.category}</td>
        <td class="num">${r.qty.toLocaleString("en-GB", { maximumFractionDigits: 3 })}</td>
        <td>${r.unit}</td>
        <td class="num">${formatPounds(r.rate)}</td>
        <td class="num">${formatPounds(r.linePence)}</td>
      </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${cfg.label} — ${year} Return</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; margin: 30px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 14px; color: #555; font-weight: normal; margin: 0 0 20px; }
  .meta { display: flex; gap: 40px; margin-bottom: 24px; }
  .meta div { display: flex; flex-direction: column; }
  .meta label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.04em; }
  .meta strong { font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #1a3a2a; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }
  td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) { background: #f8f8f8; }
  .num { text-align: right; }
  .total-row td { font-weight: bold; border-top: 2px solid #1a3a2a; }
  .disclaimer { font-size: 11px; color: #888; margin-top: 24px; border-top: 1px solid #ddd; padding-top: 12px; line-height: 1.6; }
  .empty { color: #999; font-style: italic; padding: 20px 0; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>${cfg.label}</h1>
<h2>Levy / Contribution Summary — ${year}</h2>

<div class="meta">
  <div><label>Farm</label><strong>${farm.name}</strong></div>
  ${reg.membership_number ? `<div><label>Membership / Ref No.</label><strong>${reg.membership_number}</strong></div>` : ""}
  ${reg.registered_since ? `<div><label>Member Since</label><strong>${new Date(reg.registered_since).toLocaleDateString("en-GB")}</strong></div>` : ""}
  <div><label>Print Date</label><strong>${printDate}</strong></div>
</div>

${
  tableRows.length > 0
    ? `<table>
  <thead>
    <tr>
      <th>Period</th>
      <th>Category</th>
      <th class="num">Quantity</th>
      <th>Unit</th>
      <th class="num">Rate</th>
      <th class="num">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${trRows}
    <tr class="total-row">
      <td colspan="5">Total ${year}</td>
      <td class="num">${formatPounds(grandTotalPence)}</td>
    </tr>
  </tbody>
</table>`
    : `<p class="empty">No records entered for ${year}.</p>`
}

${reg.notes ? `<p><strong>Notes:</strong> ${reg.notes}</p>` : ""}

<div class="disclaimer">
  <strong>Important:</strong> ${cfg.disclaimer}<br />
  Printed from BDE Farm Trac on ${printDate}. This document is for record-keeping only.
  Always verify levy obligations with ${cfg.website} before making payments.
</div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  },
);

export default router;
