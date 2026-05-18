import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  vineyardBlocksTable,
  vineyardBlockPlantingsTable,
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
  wineryLicencesTable,
  wineryExciseReturnsTable,
  wineryTastingSessionsTable,
  wineryAgeVerificationTable,
  vineyardSprayDiaryTable,
  vineyardSoilAnalysisTable,
  suppliersTable,
} from "@workspace/db";
import { eq, and, desc, isNull } from "drizzle-orm";
import { requireAuth, requireTenant, requireModuleByKey } from "../middlewares/roleMiddleware";
import { createScoutingAlerts } from "../lib/alertingJob";
import { sanitiseBody } from "../lib/sanitise";

const router: IRouter = Router();

// ─── Helper: enrich blocks with current planting data ────────────────────────

async function enrichBlocks(farmId: number) {
  const blocks = await db
    .select()
    .from(vineyardBlocksTable)
    .where(eq(vineyardBlocksTable.farmId, farmId))
    .orderBy(vineyardBlocksTable.blockName);

  const plantings = await db
    .select()
    .from(vineyardBlockPlantingsTable)
    .where(eq(vineyardBlockPlantingsTable.farmId, farmId))
    .orderBy(vineyardBlockPlantingsTable.id);

  return blocks.map(block => {
    const blockPlantings = plantings
      .filter(p => p.blockId === block.id)
      .sort((a, b) => b.id - a.id);
    const current =
      blockPlantings.find(p => p.status === "active") ??
      blockPlantings.find(p => p.status === "suspended") ??
      blockPlantings[0] ??
      null;

    return {
      ...block,
      // Flatten current planting fields — keeps all consumer tabs backward-compatible
      variety: current?.variety ?? null,
      clone: current?.clone ?? null,
      rootstock: current?.rootstock ?? null,
      plantingYear: current?.plantingYear ?? null,
      plantedDate: current?.plantedDate ?? null,
      numberOfVines: current?.numberOfVines ?? null,
      rowSpacingM: current?.rowSpacingM ?? null,
      vineSpacingM: current?.vineSpacingM ?? null,
      trainingSystem: current?.trainingSystem ?? null,
      trellisType: current?.trellisType ?? null,
      areaHa: current?.areaHa ?? null,
      isOrganicBlock: current?.isOrganic ?? false,
      isActive: current?.status === "active",
      plantingId: current?.id ?? null,
      plantingStatus: current?.status ?? "no_planting",
      plantings: blockPlantings,
    };
  });
}

// ─── Vineyard Blocks ──────────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-blocks", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await enrichBlocks(farmId);
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-blocks", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const body = sanitiseBody(req.body as Record<string, unknown>);

  // Split into block site fields and planting fields
  const {
    variety, clone, rootstock, plantingYear, plantedDate,
    numberOfVines, rowSpacingM, vineSpacingM,
    trainingSystem, trellisType, areaHa, isOrganicBlock,
    isActive, plantingNotes,
    ...blockBody
  } = body;

  const [block] = await (db.insert(vineyardBlocksTable) as any)
    .values({ farmId, blockName: blockBody.blockName, blockRef: blockBody.blockRef, fieldParcelRef: blockBody.fieldParcelRef, aspect: blockBody.aspect, soilType: blockBody.soilType, notes: blockBody.notes })
    .returning();

  const [planting] = await (db.insert(vineyardBlockPlantingsTable) as any)
    .values({
      blockId: block.id,
      farmId,
      variety: variety ?? "Unknown",
      clone: clone ?? null,
      rootstock: rootstock ?? null,
      plantingYear: plantingYear ?? null,
      plantedDate: plantedDate ?? null,
      numberOfVines: numberOfVines ?? null,
      rowSpacingM: rowSpacingM ?? null,
      vineSpacingM: vineSpacingM ?? null,
      trainingSystem: trainingSystem ?? null,
      trellisType: trellisType ?? null,
      areaHa: areaHa ?? null,
      isOrganic: isOrganicBlock ?? false,
      status: "active",
      notes: plantingNotes ?? null,
    })
    .returning();

  const record = {
    ...block,
    variety: planting.variety,
    clone: planting.clone,
    rootstock: planting.rootstock,
    plantingYear: planting.plantingYear,
    plantedDate: planting.plantedDate,
    numberOfVines: planting.numberOfVines,
    rowSpacingM: planting.rowSpacingM,
    vineSpacingM: planting.vineSpacingM,
    trainingSystem: planting.trainingSystem,
    trellisType: planting.trellisType,
    areaHa: planting.areaHa,
    isOrganicBlock: planting.isOrganic,
    isActive: true,
    plantingId: planting.id,
    plantingStatus: "active",
    plantings: [planting],
  };
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-blocks/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const body = sanitiseBody(req.body as Record<string, unknown>);

  const {
    plantingId,
    variety, clone, rootstock, plantingYear, plantedDate,
    numberOfVines, rowSpacingM, vineSpacingM,
    trainingSystem, trellisType, areaHa, isOrganicBlock,
    isActive, plantingNotes,
    ...blockBody
  } = body;

  // Update block site fields
  const [block] = await db
    .update(vineyardBlocksTable)
    .set({ blockName: blockBody.blockName as string, blockRef: blockBody.blockRef as string | null, fieldParcelRef: blockBody.fieldParcelRef as string | null, aspect: blockBody.aspect as string | null, soilType: blockBody.soilType as string | null, notes: blockBody.notes as string | null })
    .where(and(eq(vineyardBlocksTable.id, id), eq(vineyardBlocksTable.farmId, farmId)))
    .returning();

  // Update the current planting if plantingId provided
  let planting: Record<string, unknown> | null = null;
  if (plantingId) {
    const [p] = await (db.update(vineyardBlockPlantingsTable) as any)
      .set({
        variety: variety ?? undefined,
        clone: clone ?? null,
        rootstock: rootstock ?? null,
        plantingYear: plantingYear ?? null,
        plantedDate: plantedDate ?? null,
        numberOfVines: numberOfVines ?? null,
        rowSpacingM: rowSpacingM ?? null,
        vineSpacingM: vineSpacingM ?? null,
        trainingSystem: trainingSystem ?? null,
        trellisType: trellisType ?? null,
        areaHa: areaHa ?? null,
        isOrganic: isOrganicBlock ?? undefined,
        notes: plantingNotes ?? null,
      })
      .where(and(eq(vineyardBlockPlantingsTable.id, Number(plantingId)), eq(vineyardBlockPlantingsTable.farmId, farmId)))
      .returning();
    planting = p ?? null;
  }

  const record = {
    ...block,
    variety: planting ? (planting as any).variety : variety,
    clone: planting ? (planting as any).clone : clone,
    rootstock: planting ? (planting as any).rootstock : rootstock,
    plantingYear: planting ? (planting as any).plantingYear : plantingYear,
    numberOfVines: planting ? (planting as any).numberOfVines : numberOfVines,
    rowSpacingM: planting ? (planting as any).rowSpacingM : rowSpacingM,
    vineSpacingM: planting ? (planting as any).vineSpacingM : vineSpacingM,
    trainingSystem: planting ? (planting as any).trainingSystem : trainingSystem,
    trellisType: planting ? (planting as any).trellisType : trellisType,
    areaHa: planting ? (planting as any).areaHa : areaHa,
    isOrganicBlock: planting ? (planting as any).isOrganic : isOrganicBlock,
    isActive: true,
    plantingId,
  };
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-blocks/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardBlocksTable).where(and(eq(vineyardBlocksTable.id, id), eq(vineyardBlocksTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Block Plantings ─────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-block-plantings", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db
    .select()
    .from(vineyardBlockPlantingsTable)
    .where(eq(vineyardBlockPlantingsTable.farmId, farmId))
    .orderBy(desc(vineyardBlockPlantingsTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-block-plantings", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const [record] = await (db.insert(vineyardBlockPlantingsTable) as any)
    .values({ ...body, farmId, status: body.status ?? "active" })
    .returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/vineyard-block-plantings/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const [record] = await (db.update(vineyardBlockPlantingsTable) as any)
    .set(body)
    .where(and(eq(vineyardBlockPlantingsTable.id, id), eq(vineyardBlockPlantingsTable.farmId, farmId)))
    .returning();
  res.json({ record });
});

// PATCH status — retire (suspend/remove) or reactivate a planting
router.patch("/farms/:farmId/vineyard-block-plantings/:id/status", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const { status, deactivationType, deactivationReason, deactivationNotes, deactivatedBy, reactivatedReason } = req.body;

  let updateData: Record<string, unknown>;
  if (status === "active") {
    updateData = {
      status: "active",
      reactivatedAt: new Date(),
      reactivatedReason: reactivatedReason ?? null,
      deactivatedAt: null,
      deactivatedBy: null,
      deactivationType: null,
      deactivationReason: null,
      deactivationNotes: null,
    };
  } else {
    updateData = {
      status,
      deactivatedAt: new Date(),
      deactivatedBy: deactivatedBy ?? null,
      deactivationType: deactivationType ?? null,
      deactivationReason: deactivationReason ?? null,
      deactivationNotes: deactivationNotes ?? null,
    };
  }

  const [record] = await (db.update(vineyardBlockPlantingsTable) as any)
    .set(updateData)
    .where(and(eq(vineyardBlockPlantingsTable.id, id), eq(vineyardBlockPlantingsTable.farmId, farmId)))
    .returning();
  res.json({ record });
});

// POST replant — retire current planting and create new one
router.post("/farms/:farmId/vineyard-blocks/:blockId/replant", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const body = sanitiseBody(req.body as Record<string, unknown>);

  const { currentPlantingId, deactivationType, deactivationReason, deactivationNotes, deactivatedBy, ...newPlantingData } = body;

  // Retire the current planting
  if (currentPlantingId) {
    await (db.update(vineyardBlockPlantingsTable) as any)
      .set({
        status: "removed",
        deactivatedAt: new Date(),
        deactivatedBy: deactivatedBy ?? null,
        deactivationType: deactivationType ?? "replanting",
        deactivationReason: deactivationReason ?? null,
        deactivationNotes: deactivationNotes ?? null,
      })
      .where(and(eq(vineyardBlockPlantingsTable.id, Number(currentPlantingId)), eq(vineyardBlockPlantingsTable.farmId, farmId)));
  }

  // Create new planting
  const [newPlanting] = await (db.insert(vineyardBlockPlantingsTable) as any)
    .values({
      ...newPlantingData,
      blockId,
      farmId,
      status: "active",
      predecessorPlantingId: currentPlantingId ? Number(currentPlantingId) : null,
    })
    .returning();

  res.status(201).json({ record: newPlanting });
});

router.delete("/farms/:farmId/vineyard-block-plantings/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardBlockPlantingsTable).where(and(eq(vineyardBlockPlantingsTable.id, id), eq(vineyardBlockPlantingsTable.farmId, farmId)));
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
  const body = sanitiseBody(req.body as Record<string, unknown>);
  // Auto-resolve planting_id from block_id if not supplied
  if (body.blockId && !body.plantingId) {
    const [active] = await db.select({ id: vineyardBlockPlantingsTable.id }).from(vineyardBlockPlantingsTable).where(and(eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId)), eq(vineyardBlockPlantingsTable.farmId, farmId), eq(vineyardBlockPlantingsTable.status, "active"))).limit(1);
    if (active) body.plantingId = active.id;
  }
  const [record] = await (db.insert(vineyardPhenologyTable) as any).values({ ...body, farmId }).returning();
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
  const body = sanitiseBody(req.body as Record<string, unknown>);
  if (body.blockId && !body.plantingId) {
    const [active] = await db.select({ id: vineyardBlockPlantingsTable.id }).from(vineyardBlockPlantingsTable).where(and(eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId)), eq(vineyardBlockPlantingsTable.farmId, farmId), eq(vineyardBlockPlantingsTable.status, "active"))).limit(1);
    if (active) body.plantingId = active.id;
  }
  const [record] = await (db.insert(vineyardOperationsTable) as any).values({ ...body, farmId }).returning();
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
  const body = sanitiseBody(req.body as Record<string, unknown>);
  if (body.blockId && !body.plantingId) {
    const [active] = await db.select({ id: vineyardBlockPlantingsTable.id }).from(vineyardBlockPlantingsTable).where(and(eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId)), eq(vineyardBlockPlantingsTable.farmId, farmId), eq(vineyardBlockPlantingsTable.status, "active"))).limit(1);
    if (active) body.plantingId = active.id;
  }
  const [record] = await (db.insert(vineyardHarvestTable) as any).values({ ...body, farmId }).returning();
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

// Winery contacts lookup for harvest destination picker (viticulture-gated)
router.get("/farms/:farmId/vineyard-harvest/winery-contacts", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select({
    id: suppliersTable.id,
    name: suppliersTable.name,
    supplierType: suppliersTable.supplierType,
    contactName: suppliersTable.contactName,
  }).from(suppliersTable)
    .where(and(eq(suppliersTable.farmId, farmId), eq(suppliersTable.isActive, true)))
    .orderBy(suppliersTable.name);
  res.json({ records });
});

// ─── Disease & Pest Scouting ──────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-scouting", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardScoutingTable).where(eq(vineyardScoutingTable.farmId, farmId)).orderBy(desc(vineyardScoutingTable.scoutDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-scouting", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  if (body.blockId && !body.plantingId) {
    const [active] = await db.select({ id: vineyardBlockPlantingsTable.id }).from(vineyardBlockPlantingsTable).where(and(eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId)), eq(vineyardBlockPlantingsTable.farmId, farmId), eq(vineyardBlockPlantingsTable.status, "active"))).limit(1);
    if (active) body.plantingId = active.id;
  }
  const [record] = await (db.insert(vineyardScoutingTable) as any).values({ ...body, farmId }).returning();
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

// ─── Winery: Licensing ────────────────────────────────────────────────────────
router.get("/farms/:farmId/winery-licences", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(wineryLicencesTable).where(eq(wineryLicencesTable.farmId, farmId)).orderBy(desc(wineryLicencesTable.createdAt));
  res.json({ records });
});
router.post("/farms/:farmId/winery-licences", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(wineryLicencesTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/winery-licences/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(wineryLicencesTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(wineryLicencesTable.id, id), eq(wineryLicencesTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/winery-licences/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(wineryLicencesTable).where(and(eq(wineryLicencesTable.id, id), eq(wineryLicencesTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Winery: Excise & Duty Returns ────────────────────────────────────────────
router.get("/farms/:farmId/winery-excise-returns", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(wineryExciseReturnsTable).where(eq(wineryExciseReturnsTable.farmId, farmId)).orderBy(desc(wineryExciseReturnsTable.periodEnd));
  res.json({ records });
});
router.post("/farms/:farmId/winery-excise-returns", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(wineryExciseReturnsTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/winery-excise-returns/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(wineryExciseReturnsTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(wineryExciseReturnsTable.id, id), eq(wineryExciseReturnsTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/winery-excise-returns/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(wineryExciseReturnsTable).where(and(eq(wineryExciseReturnsTable.id, id), eq(wineryExciseReturnsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Winery: Tasting Sessions & Tours ─────────────────────────────────────────
router.get("/farms/:farmId/winery-tasting-sessions", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(wineryTastingSessionsTable).where(eq(wineryTastingSessionsTable.farmId, farmId)).orderBy(desc(wineryTastingSessionsTable.sessionDate));
  res.json({ records });
});
router.post("/farms/:farmId/winery-tasting-sessions", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(wineryTastingSessionsTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/winery-tasting-sessions/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(wineryTastingSessionsTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(wineryTastingSessionsTable.id, id), eq(wineryTastingSessionsTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/winery-tasting-sessions/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(wineryTastingSessionsTable).where(and(eq(wineryTastingSessionsTable.id, id), eq(wineryTastingSessionsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Winery: Age Verification (Challenge 25) ──────────────────────────────────
router.get("/farms/:farmId/winery-age-verification", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(wineryAgeVerificationTable).where(eq(wineryAgeVerificationTable.farmId, farmId)).orderBy(desc(wineryAgeVerificationTable.recordDate));
  res.json({ records });
});
router.post("/farms/:farmId/winery-age-verification", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(wineryAgeVerificationTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});
router.put("/farms/:farmId/winery-age-verification/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(wineryAgeVerificationTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(wineryAgeVerificationTable.id, id), eq(wineryAgeVerificationTable.farmId, farmId))).returning();
  res.json({ record });
});
router.delete("/farms/:farmId/winery-age-verification/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(wineryAgeVerificationTable).where(and(eq(wineryAgeVerificationTable.id, id), eq(wineryAgeVerificationTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Spray Diary ─────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-spray-diary", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardSprayDiaryTable).where(eq(vineyardSprayDiaryTable.farmId, farmId)).orderBy(desc(vineyardSprayDiaryTable.applicationDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-spray-diary", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineyardSprayDiaryTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/vineyard-spray-diary/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(vineyardSprayDiaryTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardSprayDiaryTable.id, id), eq(vineyardSprayDiaryTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-spray-diary/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(vineyardSprayDiaryTable).where(and(eq(vineyardSprayDiaryTable.id, id), eq(vineyardSprayDiaryTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Soil & Leaf Analysis ────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-soil-analysis", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardSoilAnalysisTable).where(eq(vineyardSoilAnalysisTable.farmId, farmId)).orderBy(desc(vineyardSoilAnalysisTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-soil-analysis", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [record] = await (db.insert(vineyardSoilAnalysisTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/vineyard-soil-analysis/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const [record] = await db.update(vineyardSoilAnalysisTable).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardSoilAnalysisTable.id, id), eq(vineyardSoilAnalysisTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-soil-analysis/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(vineyardSoilAnalysisTable).where(and(eq(vineyardSoilAnalysisTable.id, id), eq(vineyardSoilAnalysisTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Block Boundaries ────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-block-boundaries/:blockId", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const blockId = Number(req.params.blockId);
  const records = await db.select().from(vineyardBlockBoundariesTable).where(eq(vineyardBlockBoundariesTable.blockId, blockId)).orderBy(desc(vineyardBlockBoundariesTable.capturedAt));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-block-boundaries", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const { blockId, polygonPoints, capturedBy } = req.body;
  const [record] = await db.insert(vineyardBlockBoundariesTable).values({ blockId: Number(blockId), polygonPoints, capturedBy: capturedBy ?? null }).returning();
  res.status(201).json({ record });
});

export default router;
