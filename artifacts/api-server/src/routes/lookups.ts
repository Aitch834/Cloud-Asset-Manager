import { Router, type IRouter, type Request, type Response } from "express";
import { db, lookupItemsTable, lookupReviewLogTable } from "@workspace/db";
import { eq, and, isNull, or, asc } from "drizzle-orm";
import { requireAuth, requireTenant } from "../middlewares/roleMiddleware";
import { LOOKUP_DEFINITIONS } from "../lib/seedLookups";

const router: IRouter = Router();

async function checkPlatformAdminForLookups(req: Request, res: Response): Promise<boolean> {
  if (req.isSuperAdmin) return true;
  res.status(403).json({ error: "Admin access required" });
  return false;
}

router.get("/lookups/definitions", async (_req: Request, res: Response): Promise<void> => {
  const defs = Object.entries(LOOKUP_DEFINITIONS).map(([key, def]) => ({
    key,
    label: def.label,
    description: def.description,
    authority: def.authority,
    authorityUrl: def.authorityUrl,
    reviewFrequency: def.reviewFrequency,
  }));
  res.json({ definitions: defs });
});

router.get("/lookups/summary", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.tenantId!;
  const rows = await db
    .select({ lookupKey: lookupItemsTable.lookupKey, tenantId: lookupItemsTable.tenantId })
    .from(lookupItemsTable)
    .where(
      and(
        eq(lookupItemsTable.isActive, true),
        or(isNull(lookupItemsTable.tenantId), eq(lookupItemsTable.tenantId, tenantId)),
      ),
    );

  const counts: Record<string, { standard: number; custom: number }> = {};
  for (const r of rows) {
    if (!counts[r.lookupKey]) counts[r.lookupKey] = { standard: 0, custom: 0 };
    if (r.tenantId === null) counts[r.lookupKey].standard++;
    else counts[r.lookupKey].custom++;
  }

  const definitions = Object.entries(LOOKUP_DEFINITIONS).map(([key, def]) => ({
    key,
    label: def.label,
    description: def.description,
    authority: def.authority,
    standardCount: counts[key]?.standard ?? 0,
    customCount: counts[key]?.custom ?? 0,
  }));

  res.json({ definitions });
});

router.get("/lookups/:key", requireTenant, async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params as { key: string };
  if (!LOOKUP_DEFINITIONS[key]) {
    res.status(404).json({ error: "Unknown lookup key" });
    return;
  }
  const tenantId = req.tenantId!;
  const rows = await db
    .select()
    .from(lookupItemsTable)
    .where(
      and(
        eq(lookupItemsTable.lookupKey, key),
        eq(lookupItemsTable.isActive, true),
        or(isNull(lookupItemsTable.tenantId), eq(lookupItemsTable.tenantId, tenantId)),
      ),
    )
    .orderBy(asc(lookupItemsTable.displayOrder), asc(lookupItemsTable.id));

  res.json({
    key,
    items: rows.map((r) => ({
      id: r.id,
      value: r.value,
      label: r.label,
      groupLabel: r.groupLabel,
      isBdeManaged: r.isBdeManaged,
      isCustom: r.tenantId !== null,
    })),
  });
});

router.post("/farms/:farmId/lookups/:key", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const farmId = parseInt(req.params.farmId as string, 10);
  const { key } = req.params as { key: string };
  if (!LOOKUP_DEFINITIONS[key]) {
    res.status(404).json({ error: "Unknown lookup key" });
    return;
  }
  const { label } = req.body as { label?: string };
  if (!label?.trim()) {
    res.status(400).json({ error: "label is required" });
    return;
  }
  const value = label.trim();
  const existing = await db
    .select({ id: lookupItemsTable.id })
    .from(lookupItemsTable)
    .where(
      and(
        eq(lookupItemsTable.lookupKey, key),
        eq(lookupItemsTable.value, value),
        eq(lookupItemsTable.tenantId, req.tenantId!),
      ),
    )
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "This value already exists" });
    return;
  }
  const [item] = await db.insert(lookupItemsTable).values({
    lookupKey: key,
    value,
    label: value,
    isBdeManaged: false,
    tenantId: req.tenantId!,
    displayOrder: 9999,
  }).returning();
  res.json({ item, farmId });
});

router.delete("/farms/:farmId/lookups/:key/:itemId", requireAuth, requireTenant, async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params as { key: string };
  const itemId = parseInt(req.params.itemId as string, 10);
  const [item] = await db.select().from(lookupItemsTable).where(eq(lookupItemsTable.id, itemId)).limit(1);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  if (item.isBdeManaged) { res.status(403).json({ error: "BDE master items cannot be deleted by farms" }); return; }
  if (item.tenantId !== req.tenantId!) { res.status(403).json({ error: "Not your item" }); return; }
  await db.delete(lookupItemsTable).where(eq(lookupItemsTable.id, itemId));
  res.json({ success: true, key });
});

router.get("/admin/lookups", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdminForLookups(req, res))) return;
  const allItems = await db
    .select()
    .from(lookupItemsTable)
    .orderBy(asc(lookupItemsTable.lookupKey), asc(lookupItemsTable.displayOrder), asc(lookupItemsTable.id));

  const lastReviews = await db
    .select()
    .from(lookupReviewLogTable)
    .orderBy(asc(lookupReviewLogTable.lookupKey));

  const byKey: Record<string, typeof allItems> = {};
  for (const item of allItems) {
    if (!byKey[item.lookupKey]) byKey[item.lookupKey] = [];
    byKey[item.lookupKey].push(item);
  }

  const latestReview: Record<string, (typeof lastReviews)[0]> = {};
  for (const r of lastReviews) {
    if (!latestReview[r.lookupKey] || r.reviewedAt > latestReview[r.lookupKey].reviewedAt) {
      latestReview[r.lookupKey] = r;
    }
  }

  const groups = Object.entries(LOOKUP_DEFINITIONS).map(([key, def]) => {
    const items = byKey[key] ?? [];
    const masterItems = items.filter((i) => i.isBdeManaged && i.tenantId === null);
    const customCount = items.filter((i) => !i.isBdeManaged).length;
    const review = latestReview[key] ?? null;
    return {
      key,
      label: def.label,
      description: def.description,
      authority: def.authority,
      authorityUrl: def.authorityUrl,
      reviewFrequency: def.reviewFrequency,
      masterItems: masterItems.map((i) => ({
        id: i.id,
        value: i.value,
        label: i.label,
        groupLabel: i.groupLabel,
        displayOrder: i.displayOrder,
        isActive: i.isActive,
      })),
      customCount,
      lastReview: review ? {
        id: review.id,
        reviewedBy: review.reviewedBy,
        notes: review.notes,
        nextReviewDue: review.nextReviewDue,
        reviewedAt: review.reviewedAt,
      } : null,
    };
  });

  res.json({ groups });
});

router.post("/admin/lookups/:key", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdminForLookups(req, res))) return;
  const { key } = req.params as { key: string };
  if (!LOOKUP_DEFINITIONS[key]) { res.status(404).json({ error: "Unknown lookup key" }); return; }
  const { label, groupLabel } = req.body as { label?: string; groupLabel?: string };
  if (!label?.trim()) { res.status(400).json({ error: "label is required" }); return; }
  const existing = await db.select({ id: lookupItemsTable.id })
    .from(lookupItemsTable)
    .where(and(eq(lookupItemsTable.lookupKey, key), eq(lookupItemsTable.value, label.trim()), isNull(lookupItemsTable.tenantId)))
    .limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Value already exists in master list" }); return; }
  const maxOrder = await db.select({ displayOrder: lookupItemsTable.displayOrder })
    .from(lookupItemsTable)
    .where(and(eq(lookupItemsTable.lookupKey, key), isNull(lookupItemsTable.tenantId)))
    .orderBy(asc(lookupItemsTable.displayOrder));
  const nextOrder = (maxOrder.at(-1)?.displayOrder ?? -1) + 1;
  const [item] = await db.insert(lookupItemsTable).values({
    lookupKey: key,
    value: label.trim(),
    label: label.trim(),
    groupLabel: groupLabel?.trim() || null,
    displayOrder: nextOrder,
    isBdeManaged: true,
    tenantId: null,
  }).returning();
  res.json({ item });
});

router.put("/admin/lookups/:key/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdminForLookups(req, res))) return;
  const id = parseInt(req.params.id as string, 10);
  const { label, isActive, displayOrder, groupLabel } = req.body as { label?: string; isActive?: boolean; displayOrder?: number; groupLabel?: string };
  const updates: Partial<{ label: string; value: string; isActive: boolean; displayOrder: number; groupLabel: string | null; updatedAt: Date }> = { updatedAt: new Date() };
  if (label !== undefined) { updates.label = label.trim(); updates.value = label.trim(); }
  if (isActive !== undefined) updates.isActive = isActive;
  if (displayOrder !== undefined) updates.displayOrder = displayOrder;
  if (groupLabel !== undefined) updates.groupLabel = groupLabel?.trim() || null;
  const [updated] = await db.update(lookupItemsTable).set(updates).where(eq(lookupItemsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ item: updated });
});

router.delete("/admin/lookups/:key/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdminForLookups(req, res))) return;
  const id = parseInt(req.params.id as string, 10);
  await db.delete(lookupItemsTable).where(eq(lookupItemsTable.id, id));
  res.json({ success: true });
});

router.post("/admin/lookups/:key/reorder", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdminForLookups(req, res))) return;
  const { orderedIds } = req.body as { orderedIds?: number[] };
  if (!Array.isArray(orderedIds)) { res.status(400).json({ error: "orderedIds required" }); return; }
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(lookupItemsTable).set({ displayOrder: i, updatedAt: new Date() }).where(eq(lookupItemsTable.id, orderedIds[i]));
  }
  res.json({ success: true });
});

router.get("/admin/lookups/:key/review", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdminForLookups(req, res))) return;
  const { key } = req.params as { key: string };
  const reviews = await db.select().from(lookupReviewLogTable)
    .where(eq(lookupReviewLogTable.lookupKey, key))
    .orderBy(asc(lookupReviewLogTable.reviewedAt));
  res.json({ reviews });
});

router.post("/admin/lookups/:key/review", requireAuth, async (req: Request, res: Response): Promise<void> => {
  if (!(await checkPlatformAdminForLookups(req, res))) return;
  const { key } = req.params as { key: string };
  const { reviewedBy, notes, nextReviewDue } = req.body as { reviewedBy?: string; notes?: string; nextReviewDue?: string };
  if (!reviewedBy?.trim()) { res.status(400).json({ error: "reviewedBy is required" }); return; }
  const [log] = await db.insert(lookupReviewLogTable).values({
    lookupKey: key,
    reviewedBy: reviewedBy.trim(),
    notes: notes?.trim() ?? null,
    nextReviewDue: nextReviewDue ? new Date(nextReviewDue) : null,
  }).returning();
  res.json({ log });
});

export default router;
