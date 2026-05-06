import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  vineyardBlocksTable,
  vineRegisterTable,
  vineyardPhenologyTable,
  vineyardOperationsTable,
  vineyardHarvestTable,
  vineyardScoutingTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireTenant, requireModuleByKey } from "../middlewares/roleMiddleware";
import { sanitiseBody } from "../lib/sanitise";

const router: IRouter = Router();

// ─── Vineyard Blocks ──────────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-blocks", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardBlocksTable).where(eq(vineyardBlocksTable.farmId, farmId)).orderBy(vineyardBlocksTable.blockName);
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-blocks", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineyardBlocksTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-blocks/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await db.update(vineyardBlocksTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardBlocksTable.id, id), eq(vineyardBlocksTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-blocks/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardBlocksTable).where(and(eq(vineyardBlocksTable.id, id), eq(vineyardBlocksTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vine Register ────────────────────────────────────────────────────────────

router.get("/farms/:farmId/vine-register", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineRegisterTable).where(eq(vineRegisterTable.farmId, farmId)).orderBy(desc(vineRegisterTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/vine-register", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineRegisterTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vine-register/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await db.update(vineRegisterTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineRegisterTable.id, id), eq(vineRegisterTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vine-register/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineRegisterTable).where(and(eq(vineRegisterTable.id, id), eq(vineRegisterTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Phenology ────────────────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-phenology", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardPhenologyTable).where(eq(vineyardPhenologyTable.farmId, farmId)).orderBy(desc(vineyardPhenologyTable.observationDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-phenology", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineyardPhenologyTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-phenology/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await (db.update(vineyardPhenologyTable) as any).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardPhenologyTable.id, id), eq(vineyardPhenologyTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-phenology/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardPhenologyTable).where(and(eq(vineyardPhenologyTable.id, id), eq(vineyardPhenologyTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Operations ──────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-operations", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardOperationsTable).where(eq(vineyardOperationsTable.farmId, farmId)).orderBy(desc(vineyardOperationsTable.operationDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-operations", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineyardOperationsTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-operations/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await (db.update(vineyardOperationsTable) as any).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardOperationsTable.id, id), eq(vineyardOperationsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-operations/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardOperationsTable).where(and(eq(vineyardOperationsTable.id, id), eq(vineyardOperationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Harvest / Vintage ────────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-harvest", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardHarvestTable).where(eq(vineyardHarvestTable.farmId, farmId)).orderBy(desc(vineyardHarvestTable.harvestDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-harvest", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineyardHarvestTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-harvest/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await db.update(vineyardHarvestTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardHarvestTable.id, id), eq(vineyardHarvestTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-harvest/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardHarvestTable).where(and(eq(vineyardHarvestTable.id, id), eq(vineyardHarvestTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Disease & Pest Scouting ──────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-scouting", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardScoutingTable).where(eq(vineyardScoutingTable.farmId, farmId)).orderBy(desc(vineyardScoutingTable.scoutDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-scouting", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineyardScoutingTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-scouting/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await db.update(vineyardScoutingTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardScoutingTable.id, id), eq(vineyardScoutingTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-scouting/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardScoutingTable).where(and(eq(vineyardScoutingTable.id, id), eq(vineyardScoutingTable.farmId, farmId)));
  res.json({ success: true });
});

export default router;
