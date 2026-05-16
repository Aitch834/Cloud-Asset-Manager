import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  vineyardBlocksTable,
  vineyardBlockBoundariesTable,
  vineRegisterTable,
  vineyardPhenologyTable,
  vineyardOperationsTable,
  vineyardHarvestTable,
  vineyardScoutingTable,
  organicVitBlockStatusTable,
  organicVitInputLogTable,
  organicVitCopperLogTable,
  organicVitDerogationTable,
  organicVitDerogationCorrespondenceTable,
  organicVitCertificateTable,
  organicVitWineProductionTable,
  farmRecordAttachmentsTable,
} from "@workspace/db";
import { eq, and, desc, isNull } from "drizzle-orm";
import { requireAuth, requireTenant, requireModuleByKey } from "../middlewares/roleMiddleware";
import { createScoutingAlerts } from "../lib/alertingJob";
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

  // Fire-and-forget: create notifications based on scouting findings
  if (record) {
    (async () => {
      try {
        let blockLabel = "";
        if (record.blockId) {
          const [blk] = await db
            .select({ blockName: vineyardBlocksTable.blockName })
            .from(vineyardBlocksTable)
            .where(eq(vineyardBlocksTable.id, Number(record.blockId)))
            .limit(1);
          blockLabel = blk?.blockName ?? "";
        }
        await createScoutingAlerts({
          tenantId: req.tenantId!,
          farmId,
          recordId: record.id,
          blockName: blockLabel,
          scoutDate: String(record.scoutDate ?? ""),
          scoutedBy: String(record.scoutedBy ?? ""),
          downyMildewPressure: Number(record.downyMildewPressure ?? 0),
          powderyMildewPressure: Number(record.powderyMildewPressure ?? 0),
          botrytisPressure: Number(record.botrytisPressure ?? 0),
          phomopsisPressure: Number(record.phomopsisPressure ?? 0),
          leafhopperPressure: Number(record.leafhopperPressure ?? 0),
          spiderMitePressure: Number(record.spiderMitePressure ?? 0),
          vineWeevilSighted: Boolean(record.vineWeevilSighted),
          eutypaDiebackSighted: Boolean(record.eutypaDiebackSighted),
          xylellaFastidiosa: Boolean(record.xylellaFastidiosa),
          phytophthoraViticola: Boolean(record.phytophthoraViticola),
        });
      } catch (err) {
        console.error("[SCOUTING ALERTS]", err);
      }
    })();
  }
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

// ─── Organic Viticulture — Block Conversion Status ────────────────────────────

router.get("/farms/:farmId/organic-viticulture/block-status", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(organicVitBlockStatusTable).where(eq(organicVitBlockStatusTable.farmId, farmId)).orderBy(organicVitBlockStatusTable.blockName);
  res.json({ records });
});
router.post("/farms/:farmId/organic-viticulture/block-status", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(organicVitBlockStatusTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/organic-viticulture/block-status/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(organicVitBlockStatusTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(organicVitBlockStatusTable.id, id), eq(organicVitBlockStatusTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/organic-viticulture/block-status/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(organicVitBlockStatusTable).where(and(eq(organicVitBlockStatusTable.id, id), eq(organicVitBlockStatusTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Organic Viticulture — Input Log ─────────────────────────────────────────

router.get("/farms/:farmId/organic-viticulture/input-log", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(organicVitInputLogTable).where(eq(organicVitInputLogTable.farmId, farmId)).orderBy(desc(organicVitInputLogTable.dateApplied));
  res.json({ records });
});
router.post("/farms/:farmId/organic-viticulture/input-log", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(organicVitInputLogTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/organic-viticulture/input-log/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(organicVitInputLogTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(organicVitInputLogTable.id, id), eq(organicVitInputLogTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/organic-viticulture/input-log/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(organicVitInputLogTable).where(and(eq(organicVitInputLogTable.id, id), eq(organicVitInputLogTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Organic Viticulture — Copper Register ────────────────────────────────────

router.get("/farms/:farmId/organic-viticulture/copper-log", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(organicVitCopperLogTable).where(eq(organicVitCopperLogTable.farmId, farmId)).orderBy(desc(organicVitCopperLogTable.applicationDate));
  res.json({ records });
});
router.post("/farms/:farmId/organic-viticulture/copper-log", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(organicVitCopperLogTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/organic-viticulture/copper-log/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(organicVitCopperLogTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(organicVitCopperLogTable.id, id), eq(organicVitCopperLogTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/organic-viticulture/copper-log/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(organicVitCopperLogTable).where(and(eq(organicVitCopperLogTable.id, id), eq(organicVitCopperLogTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Organic Viticulture — Input Derogations ──────────────────────────────────

router.get("/farms/:farmId/organic-viticulture/input-derogations", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const cases = await db.select().from(organicVitDerogationTable).where(eq(organicVitDerogationTable.farmId, farmId)).orderBy(desc(organicVitDerogationTable.createdAt));
  res.json({ cases });
});
router.post("/farms/:farmId/organic-viticulture/input-derogations", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(organicVitDerogationTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/organic-viticulture/input-derogations/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(organicVitDerogationTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(organicVitDerogationTable.id, id), eq(organicVitDerogationTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/organic-viticulture/input-derogations/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(organicVitDerogationTable).where(and(eq(organicVitDerogationTable.id, id), eq(organicVitDerogationTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/organic-viticulture/input-derogations/:id/correspondence", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const items = await db.select().from(organicVitDerogationCorrespondenceTable).where(and(eq(organicVitDerogationCorrespondenceTable.farmId, farmId), eq(organicVitDerogationCorrespondenceTable.derogationId, id))).orderBy(desc(organicVitDerogationCorrespondenceTable.correspondenceDate));
  res.json({ items });
});
router.post("/farms/:farmId/organic-viticulture/input-derogations/:id/correspondence", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [item] = await (db.insert(organicVitDerogationCorrespondenceTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId, derogationId: id }).returning();
  res.status(201).json({ item });
});
router.put("/farms/:farmId/organic-viticulture/input-derogation-correspondence/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [item] = await db.update(organicVitDerogationCorrespondenceTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(organicVitDerogationCorrespondenceTable.id, id), eq(organicVitDerogationCorrespondenceTable.farmId, farmId))).returning();
  res.json({ item });
});
router.delete("/farms/:farmId/organic-viticulture/input-derogation-correspondence/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(organicVitDerogationCorrespondenceTable).where(and(eq(organicVitDerogationCorrespondenceTable.id, id), eq(organicVitDerogationCorrespondenceTable.farmId, farmId)));
  res.json({ success: true });
});

router.get("/farms/:farmId/organic-viticulture/input-derogations/:id/documents", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const items = await db.select().from(farmRecordAttachmentsTable).where(and(eq(farmRecordAttachmentsTable.farmId, farmId), eq(farmRecordAttachmentsTable.recordType, "organic_vit_derogation"), eq(farmRecordAttachmentsTable.recordId, id), isNull(farmRecordAttachmentsTable.deletedAt))).orderBy(farmRecordAttachmentsTable.uploadedAt);
  res.json({ items });
});
router.post("/farms/:farmId/organic-viticulture/input-derogations/:id/documents", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const { fileKey, fileName, fileSize, documentType, mimeType } = req.body;
  const fileUrl = fileKey;
  const [item] = await db.insert(farmRecordAttachmentsTable).values({ farmId, recordType: "organic_vit_derogation", recordId: id, fileUrl, fileKey, fileName, fileSize: fileSize ?? null, mimeType: mimeType ?? null, notes: documentType ?? null }).returning();
  res.status(201).json({ item });
});
router.delete("/farms/:farmId/organic-viticulture/input-derogation-documents/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.update(farmRecordAttachmentsTable).set({ deletedAt: new Date() }).where(and(eq(farmRecordAttachmentsTable.id, id), eq(farmRecordAttachmentsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Organic Viticulture — Certificates ──────────────────────────────────────

router.get("/farms/:farmId/organic-viticulture/certificates", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(organicVitCertificateTable).where(eq(organicVitCertificateTable.farmId, farmId)).orderBy(desc(organicVitCertificateTable.createdAt));
  res.json({ records });
});
router.post("/farms/:farmId/organic-viticulture/certificates", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(organicVitCertificateTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/organic-viticulture/certificates/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(organicVitCertificateTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(organicVitCertificateTable.id, id), eq(organicVitCertificateTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/organic-viticulture/certificates/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(organicVitCertificateTable).where(and(eq(organicVitCertificateTable.id, id), eq(organicVitCertificateTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Organic Viticulture — Wine Production Additives ─────────────────────────

router.get("/farms/:farmId/organic-viticulture/wine-production", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(organicVitWineProductionTable).where(eq(organicVitWineProductionTable.farmId, farmId)).orderBy(desc(organicVitWineProductionTable.vintageYear));
  res.json({ records });
});
router.post("/farms/:farmId/organic-viticulture/wine-production", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(organicVitWineProductionTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/organic-viticulture/wine-production/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(organicVitWineProductionTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(organicVitWineProductionTable.id, id), eq(organicVitWineProductionTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/organic-viticulture/wine-production/:id", requireAuth, requireTenant, requireModuleByKey("organic-viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(organicVitWineProductionTable).where(and(eq(organicVitWineProductionTable.id, id), eq(organicVitWineProductionTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Block Boundaries ────────────────────────────────────────────────
router.get("/farms/:farmId/vineyard-blocks/:blockId/boundary", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = parseInt(req.params.blockId as string, 10);
  if (isNaN(blockId)) { res.status(400).json({ error: "Invalid block ID" }); return; }
  const [block] = await db.select({ id: vineyardBlocksTable.id }).from(vineyardBlocksTable).where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId)));
  if (!block) { res.status(404).json({ error: "Block not found" }); return; }
  const [boundary] = await db.select().from(vineyardBlockBoundariesTable).where(eq(vineyardBlockBoundariesTable.blockId, blockId)).orderBy(desc(vineyardBlockBoundariesTable.capturedAt)).limit(1);
  res.json({ boundary: boundary ?? null });
});

router.post("/farms/:farmId/vineyard-blocks/:blockId/boundary", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = parseInt(req.params.blockId as string, 10);
  if (isNaN(blockId)) { res.status(400).json({ error: "Invalid block ID" }); return; }
  const [block] = await db.select({ id: vineyardBlocksTable.id }).from(vineyardBlocksTable).where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId)));
  if (!block) { res.status(404).json({ error: "Block not found" }); return; }
  const { polygonPoints, capturedBy, areaHectares } = req.body as { polygonPoints: unknown; capturedBy?: string; areaHectares?: number };
  if (!polygonPoints || !Array.isArray(polygonPoints) || polygonPoints.length < 3) {
    res.status(400).json({ error: "polygonPoints must be an array of at least 3 points" }); return;
  }
  const [boundary] = await db.insert(vineyardBlockBoundariesTable).values({ blockId, polygonPoints, capturedBy: capturedBy ?? null }).returning();
  if (areaHectares != null && !isNaN(areaHectares)) {
    await db.update(vineyardBlocksTable).set({ areaHa: String(areaHectares) }).where(eq(vineyardBlocksTable.id, blockId));
  }
  res.status(201).json({ boundary });
});

export default router;
