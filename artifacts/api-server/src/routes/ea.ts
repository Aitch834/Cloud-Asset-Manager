import { Router } from "express";

const router = Router();

const EA_BASE = "https://environment.data.gov.uk/public-register";
const EA_HEADERS = { Accept: "application/json" };

// ─── Waste Carriers, Brokers & Dealers lookup ─────────────────────────────
// No API key required — EA open public register under EA Conditional Licence.
// GET /api/ea/carriers?q=<search term>
router.get("/ea/carriers", async (req, res): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) {
    res.json({ results: [] });
    return;
  }

  try {
    const url = new URL(`${EA_BASE}/waste-carriers-brokers/registration`);
    url.searchParams.set("name-search", q);
    url.searchParams.set("_limit", "20");

    const upstream = await fetch(url.toString(), {
      headers: EA_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      console.warn(`[EA carriers] upstream ${upstream.status}`);
      res.json({ results: [] });
      return;
    }

    const data = await upstream.json() as any;
    const raw: any[] = Array.isArray(data.items) ? data.items : [];

    const results = raw.map((item: any) => {
      const name = item.holder?.name ?? "";
      const regNumber = item.registrationNumber ?? "";
      const tier = String(item.tier?.label ?? "").toLowerCase();
      const type = item.registrationType?.label ?? item.regime?.prefLabel ?? "";
      const addr = item.site?.siteAddress;
      const address = addr?.address ?? [addr?.street_address, addr?.locality, addr?.postcode].filter(Boolean).join(", ");
      return { name, regNumber, tier, type, address };
    }).filter((r: any) => r.name);

    res.json({ results });
  } catch (err) {
    console.error("[EA carriers proxy]", err instanceof Error ? err.message : err);
    res.json({ results: [] });
  }
});

// ─── Waste Operations (Permitted Sites) lookup ────────────────────────────
// Searches by operator/site name against the EA Waste Operations register.
// GET /api/ea/permitted-sites?q=<search term>
router.get("/ea/permitted-sites", async (req, res): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) {
    res.json({ results: [] });
    return;
  }

  try {
    const url = new URL(`${EA_BASE}/waste-operations/registration`);
    url.searchParams.set("name-search", q);
    url.searchParams.set("_limit", "20");

    const upstream = await fetch(url.toString(), {
      headers: EA_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      console.warn(`[EA permitted-sites] upstream ${upstream.status}`);
      res.json({ results: [] });
      return;
    }

    const data = await upstream.json() as any;
    const raw: any[] = Array.isArray(data.items) ? data.items : [];

    const results = raw.map((item: any) => {
      const permitNumber = item.registrationNumber ?? "";
      const operator = item.holder?.name ?? "";
      const addr = item.site?.siteAddress;
      // premises is the named site (e.g. "Moorswater Depot"); fall back to operator name
      const siteName = item.site?.premises ?? operator;
      const postcode = addr?.postcode ?? "";
      const localAuthority = item.localAuthority?.label ?? "";
      const address = addr?.address ?? "";
      return { siteName, permitNumber, operator, postcode, localAuthority, address };
    }).filter((r: any) => r.siteName || r.operator);

    res.json({ results });
  } catch (err) {
    console.error("[EA permitted-sites proxy]", err instanceof Error ? err.message : err);
    res.json({ results: [] });
  }
});

export default router;
