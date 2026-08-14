import { Router, type IRouter, type Request, type Response } from "express";
import { ObjectStorageService } from "../lib/objectStorage";
import { Readable } from "stream";
import {
  db,
  vineyardBlocksTable,
  vineyardBlockPlantingsTable,
  vineyardBlockBoundariesTable,
  vineyardBlockPhotosTable,
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
  organicCertificationTable,
  farmRecordAttachmentsTable,
  wineryLicencesTable,
  wineryExciseReturnsTable,
  wineryTastingSessionsTable,
  wineryAgeVerificationTable,
  vineyardSprayDiaryTable,
  vineyardSoilAnalysisTable,
  vineyardSoilSamplePointsTable,
  suppliersTable,
  wineGiDesignationsTable,
  wineGiCertificationsTable,
  wineGiHarvestDeclarationsTable,
  vineyardScoutingPhotosTable,
  vineyardSprayDiaryPhotosTable,
  vineyardFrostEventsTable,
  vineyardCaneWeightsTable,
} from "@workspace/db";
import { eq, and, desc, asc, isNull, inArray, sql, getTableColumns } from "drizzle-orm";
import { requireAuth, requireTenant, requireModuleByKey } from "../middlewares/roleMiddleware";
import { createScoutingAlerts } from "../lib/alertingJob";
import { sanitiseBody } from "../lib/sanitise";

const router: IRouter = Router();

// Shared storage instance used by enrichBlocks for cover photo URL generation
const _enrichBlocksStorage = new ObjectStorageService();

// ─── Helper: enrich blocks with current planting data ────────────────────────

async function enrichBlocks(farmId: number) {
  const [blocks, plantings, photos] = await Promise.all([
    db.select().from(vineyardBlocksTable).where(eq(vineyardBlocksTable.farmId, farmId)).orderBy(vineyardBlocksTable.blockName),
    db.select().from(vineyardBlockPlantingsTable).where(eq(vineyardBlockPlantingsTable.farmId, farmId)).orderBy(vineyardBlockPlantingsTable.id),
    db.select().from(vineyardBlockPhotosTable).where(eq(vineyardBlockPhotosTable.farmId, farmId)).orderBy(desc(vineyardBlockPhotosTable.isCover), sql`${vineyardBlockPhotosTable.sortOrder} ASC NULLS LAST`, asc(vineyardBlockPhotosTable.uploadedAt)),
  ]);

  // Generate cover photo presigned URLs for all blocks in one parallel pass (5-minute TTL)
  const coverPhotoUrlMap = new Map<number, string | null>();
  await Promise.all(
    blocks.map(async block => {
      const blockPhotos = photos.filter(ph => ph.blockId === block.id);
      const coverPhoto = blockPhotos.find(ph => ph.isCover) ?? blockPhotos[0] ?? null;
      if (coverPhoto?.objectPath) {
        try {
          const url = await _enrichBlocksStorage.getPresignedDownloadUrl(coverPhoto.objectPath, 300);
          coverPhotoUrlMap.set(block.id, url);
        } catch {
          coverPhotoUrlMap.set(block.id, null);
        }
      } else {
        coverPhotoUrlMap.set(block.id, null);
      }
    })
  );

  return blocks.map(block => {
    const blockPlantings = plantings
      .filter(p => p.blockId === block.id)
      .sort((a, b) => b.id - a.id);
    const current =
      blockPlantings.find(p => p.status === "active") ??
      blockPlantings.find(p => p.status === "suspended") ??
      blockPlantings[0] ??
      null;

    const blockPhotos = photos.filter(ph => ph.blockId === block.id);

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
      // Photo gallery — ordered by cover first, then sort order, then upload time
      photos: blockPhotos,
      // Presigned URL for the cover photo (or first photo); null if no photos
      coverPhotoUrl: coverPhotoUrlMap.get(block.id) ?? null,
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
  const body = sanitiseBody(req.body as Record<string, unknown>);
  // Keep plantingId consistent with blockId whenever blockId is being updated
  if ("blockId" in body) {
    if (body.blockId) {
      const [active] = await db.select({ id: vineyardBlockPlantingsTable.id })
        .from(vineyardBlockPlantingsTable)
        .where(and(eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId)), eq(vineyardBlockPlantingsTable.farmId, farmId), eq(vineyardBlockPlantingsTable.status, "active")))
        .limit(1);
      body.plantingId = active ? active.id : null;
    } else {
      // Unlinking block — clear the planting association too
      body.plantingId = null;
    }
  }
  const [record] = await (db.update(vineyardOperationsTable) as any).set(body).where(and(eq(vineyardOperationsTable.id, id), eq(vineyardOperationsTable.farmId, farmId))).returning();
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
  const body = sanitiseBody(req.body as Record<string, unknown>);
  // Keep plantingId consistent with blockId whenever blockId is being updated
  if ("blockId" in body) {
    if (body.blockId) {
      const [active] = await db.select({ id: vineyardBlockPlantingsTable.id })
        .from(vineyardBlockPlantingsTable)
        .where(and(eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId)), eq(vineyardBlockPlantingsTable.farmId, farmId), eq(vineyardBlockPlantingsTable.status, "active")))
        .limit(1);
      body.plantingId = active ? active.id : null;
    } else {
      // Unlinking block — clear the planting association too
      body.plantingId = null;
    }
  }
  const [record] = await (db.update(vineyardHarvestTable) as any).set(body).where(and(eq(vineyardHarvestTable.id, id), eq(vineyardHarvestTable.farmId, farmId))).returning();
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
  const records = await db
    .select({
      ...getTableColumns(vineyardScoutingTable),
      photoCount: sql<number>`count(${vineyardScoutingPhotosTable.id})::int`,
    })
    .from(vineyardScoutingTable)
    .leftJoin(
      vineyardScoutingPhotosTable,
      and(
        eq(vineyardScoutingPhotosTable.scoutingId, vineyardScoutingTable.id),
        eq(vineyardScoutingPhotosTable.farmId, vineyardScoutingTable.farmId),
      ),
    )
    .where(eq(vineyardScoutingTable.farmId, farmId))
    .groupBy(vineyardScoutingTable.id)
    .orderBy(desc(vineyardScoutingTable.scoutDate));
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

// ─── Vineyard Scouting Photos ─────────────────────────────────────────────────
// Photo evidence attached to individual disease scouting observations.

const _scoutingPhotoStorage = new ObjectStorageService();

// ── List photos for a scouting record ────────────────────────────────────────
router.get("/farms/:farmId/vineyard-scouting/:id/photos", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const scoutingId = Number(req.params.id);

  // Verify scouting record ownership
  const [record] = await db.select({ id: vineyardScoutingTable.id })
    .from(vineyardScoutingTable)
    .where(and(eq(vineyardScoutingTable.id, scoutingId), eq(vineyardScoutingTable.farmId, farmId)))
    .limit(1);
  if (!record) { res.status(404).json({ error: "Scouting record not found" }); return; }

  const rows = await db
    .select()
    .from(vineyardScoutingPhotosTable)
    .where(and(eq(vineyardScoutingPhotosTable.scoutingId, scoutingId), eq(vineyardScoutingPhotosTable.farmId, farmId)))
    .orderBy(sql`${vineyardScoutingPhotosTable.sortOrder} ASC NULLS LAST`, asc(vineyardScoutingPhotosTable.uploadedAt));

  // Generate presigned download URLs concurrently (5-minute TTL)
  const photos = await Promise.all(
    rows.map(async (photo) => ({
      ...photo,
      downloadUrl: await _scoutingPhotoStorage.getPresignedDownloadUrl(photo.objectPath, 300),
    }))
  );

  res.json({ photos });
});

// ── Add a photo to a scouting record ─────────────────────────────────────────
router.post("/farms/:farmId/vineyard-scouting/:id/photos", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const scoutingId = Number(req.params.id);
  const { objectPath, fileName, caption } = req.body as { objectPath?: string; fileName?: string; caption?: string };

  if (!objectPath || typeof objectPath !== "string" || !objectPath.startsWith("/objects/")) {
    res.status(400).json({ error: "objectPath required and must be a valid upload path" });
    return;
  }

  // Verify scouting record ownership
  const [record] = await db.select({ id: vineyardScoutingTable.id })
    .from(vineyardScoutingTable)
    .where(and(eq(vineyardScoutingTable.id, scoutingId), eq(vineyardScoutingTable.farmId, farmId)))
    .limit(1);
  if (!record) { res.status(404).json({ error: "Scouting record not found" }); return; }

  // Register in farm_record_attachments for storage ACL
  await db.insert(farmRecordAttachmentsTable).values({
    farmId,
    recordType: "vineyard_scouting_photo",
    recordId: scoutingId,
    fileUrl: objectPath,
    fileKey: objectPath,
    fileName: fileName || "scouting-photo",
  });

  const [photo] = await db.insert(vineyardScoutingPhotosTable).values({
    scoutingId,
    farmId,
    objectPath,
    fileName: fileName || null,
    caption: caption || null,
  }).returning();

  res.status(201).json({ photo });
});

// ── Delete a scouting photo ───────────────────────────────────────────────────
router.delete("/farms/:farmId/vineyard-scouting/:id/photos/:photoId", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const scoutingId = Number(req.params.id);
  const photoId = Number(req.params.photoId);

  const [photo] = await db.select()
    .from(vineyardScoutingPhotosTable)
    .where(and(
      eq(vineyardScoutingPhotosTable.id, photoId),
      eq(vineyardScoutingPhotosTable.scoutingId, scoutingId),
      eq(vineyardScoutingPhotosTable.farmId, farmId),
    ))
    .limit(1);
  if (!photo) { res.status(404).json({ error: "Photo not found" }); return; }

  // Soft-delete the storage ACL record
  await db.update(farmRecordAttachmentsTable)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(farmRecordAttachmentsTable.farmId, farmId),
      eq(farmRecordAttachmentsTable.recordType, "vineyard_scouting_photo"),
      eq(farmRecordAttachmentsTable.recordId, scoutingId),
      eq(farmRecordAttachmentsTable.fileKey, photo.objectPath),
      isNull(farmRecordAttachmentsTable.deletedAt),
    ));

  await db.delete(vineyardScoutingPhotosTable)
    .where(and(
      eq(vineyardScoutingPhotosTable.id, photoId),
      eq(vineyardScoutingPhotosTable.farmId, farmId),
    ));

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
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const [certRow] = await db.select({ certifier: organicCertificationTable.certifier }).from(organicCertificationTable).where(eq(organicCertificationTable.farmId, farmId)).limit(1);
  const [record] = await (db.insert(organicVitBlockStatusTable) as any).values({ ...body, farmId, certifyingBody: (body as any).certifyingBody || certRow?.certifier || null }).returning();
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
  const records = await db.select({
    ...getTableColumns(vineyardSprayDiaryTable),
    photoCount: sql<number>`(SELECT COUNT(*) FROM vineyard_spray_diary_photos WHERE spray_diary_id = ${vineyardSprayDiaryTable.id})::int`,
  }).from(vineyardSprayDiaryTable).where(eq(vineyardSprayDiaryTable.farmId, farmId)).orderBy(desc(vineyardSprayDiaryTable.applicationDate));
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

// ─── Vineyard Spray Diary Photos ─────────────────────────────────────────────
// Photo evidence attached to individual spray diary records.

const _sprayDiaryPhotoStorage = new ObjectStorageService();

// ── List photos for a spray diary record ──────────────────────────────────────
router.get("/farms/:farmId/vineyard-spray-diary/:id/photos", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const sprayDiaryId = Number(req.params.id);

  // Verify spray diary record ownership
  const [record] = await db.select({ id: vineyardSprayDiaryTable.id })
    .from(vineyardSprayDiaryTable)
    .where(and(eq(vineyardSprayDiaryTable.id, sprayDiaryId), eq(vineyardSprayDiaryTable.farmId, farmId)))
    .limit(1);
  if (!record) { res.status(404).json({ error: "Spray diary record not found" }); return; }

  const rows = await db
    .select()
    .from(vineyardSprayDiaryPhotosTable)
    .where(and(eq(vineyardSprayDiaryPhotosTable.sprayDiaryId, sprayDiaryId), eq(vineyardSprayDiaryPhotosTable.farmId, farmId)))
    .orderBy(sql`${vineyardSprayDiaryPhotosTable.sortOrder} ASC NULLS LAST`, asc(vineyardSprayDiaryPhotosTable.uploadedAt));

  // Generate presigned download URLs concurrently (5-minute TTL)
  const photos = await Promise.all(
    rows.map(async (photo) => ({
      ...photo,
      downloadUrl: await _sprayDiaryPhotoStorage.getPresignedDownloadUrl(photo.objectPath, 300),
    }))
  );

  res.json({ photos });
});

// ── Add a photo to a spray diary record ───────────────────────────────────────
router.post("/farms/:farmId/vineyard-spray-diary/:id/photos", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const sprayDiaryId = Number(req.params.id);
  const { objectPath, fileName, caption } = req.body as { objectPath?: string; fileName?: string; caption?: string };

  if (!objectPath || typeof objectPath !== "string" || !objectPath.startsWith("/objects/")) {
    res.status(400).json({ error: "objectPath required and must be a valid upload path" });
    return;
  }

  // Verify spray diary record ownership
  const [record] = await db.select({ id: vineyardSprayDiaryTable.id })
    .from(vineyardSprayDiaryTable)
    .where(and(eq(vineyardSprayDiaryTable.id, sprayDiaryId), eq(vineyardSprayDiaryTable.farmId, farmId)))
    .limit(1);
  if (!record) { res.status(404).json({ error: "Spray diary record not found" }); return; }

  // Register in farm_record_attachments for storage ACL
  await db.insert(farmRecordAttachmentsTable).values({
    farmId,
    recordType: "vineyard_spray_diary_photo",
    recordId: sprayDiaryId,
    fileUrl: objectPath,
    fileKey: objectPath,
    fileName: fileName || "spray-diary-photo",
  });

  const [photo] = await db.insert(vineyardSprayDiaryPhotosTable).values({
    sprayDiaryId,
    farmId,
    objectPath,
    fileName: fileName || null,
    caption: caption || null,
  }).returning();

  res.status(201).json({ photo });
});

// ── Delete a spray diary photo ─────────────────────────────────────────────────
router.delete("/farms/:farmId/vineyard-spray-diary/:id/photos/:photoId", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const sprayDiaryId = Number(req.params.id);
  const photoId = Number(req.params.photoId);

  const [photo] = await db.select()
    .from(vineyardSprayDiaryPhotosTable)
    .where(and(
      eq(vineyardSprayDiaryPhotosTable.id, photoId),
      eq(vineyardSprayDiaryPhotosTable.sprayDiaryId, sprayDiaryId),
      eq(vineyardSprayDiaryPhotosTable.farmId, farmId),
    ))
    .limit(1);
  if (!photo) { res.status(404).json({ error: "Photo not found" }); return; }

  // Soft-delete the storage ACL record
  await db.update(farmRecordAttachmentsTable)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(farmRecordAttachmentsTable.farmId, farmId),
      eq(farmRecordAttachmentsTable.recordType, "vineyard_spray_diary_photo"),
      eq(farmRecordAttachmentsTable.recordId, sprayDiaryId),
      eq(farmRecordAttachmentsTable.fileKey, photo.objectPath),
      isNull(farmRecordAttachmentsTable.deletedAt),
    ));

  await db.delete(vineyardSprayDiaryPhotosTable)
    .where(and(
      eq(vineyardSprayDiaryPhotosTable.id, photoId),
      eq(vineyardSprayDiaryPhotosTable.farmId, farmId),
    ));

  res.json({ success: true });
});

// ─── Vineyard Soil & Leaf Analysis ────────────────────────────────────────────

// External advisors (agronomists, consultants) for "Requested By" lookup
router.get("/farms/:farmId/vineyard-advisors", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const ADVISOR_TYPES = ["agronomist", "vineyard_consultant", "consultant", "advisor", "soil_consultant", "laboratory"];
  const advisors = await db.select({
    id: suppliersTable.id,
    name: suppliersTable.name,
    supplierType: suppliersTable.supplierType,
    contactName: suppliersTable.contactName,
    phone: suppliersTable.phone,
    email: suppliersTable.email,
  }).from(suppliersTable)
    .where(and(
      eq(suppliersTable.farmId, farmId),
      eq(suppliersTable.isActive, true),
      inArray(suppliersTable.supplierType, ADVISOR_TYPES),
    ))
    .orderBy(suppliersTable.name);
  res.json({ advisors });
});

router.get("/farms/:farmId/vineyard-soil-analysis", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardSoilAnalysisTable).where(eq(vineyardSoilAnalysisTable.farmId, farmId)).orderBy(desc(vineyardSoilAnalysisTable.createdAt));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-soil-analysis", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const [inserted] = await (db.insert(vineyardSoilAnalysisTable) as any).values({ ...sanitiseBody(req.body as Record<string, unknown>), farmId }).returning();
  // Generate a human-readable request reference from the DB id
  const year = new Date().getFullYear();
  const requestReference = `SLA-${year}-${String(inserted.id).padStart(4, "0")}`;
  const [record] = await db.update(vineyardSoilAnalysisTable)
    .set({ requestReference })
    .where(eq(vineyardSoilAnalysisTable.id, inserted.id))
    .returning();
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

// ─── Soil Analysis — lookup by request reference (used by mobile GPS flow) ────
router.get("/farms/:farmId/vineyard-soil-analysis/by-ref/:ref", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const ref = String(req.params.ref);
  const [record] = await db.select().from(vineyardSoilAnalysisTable)
    .where(and(eq(vineyardSoilAnalysisTable.farmId, farmId), eq(vineyardSoilAnalysisTable.requestReference, ref)))
    .limit(1);
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

// ─── Soil Analysis Sample Points (multi-point GPS collection) ─────────────────
router.get("/farms/:farmId/vineyard-soil-analysis/:id/sample-points", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const points = await db.select().from(vineyardSoilSamplePointsTable)
    .where(and(eq(vineyardSoilSamplePointsTable.soilAnalysisId, id), eq(vineyardSoilSamplePointsTable.farmId, farmId)))
    .orderBy(vineyardSoilSamplePointsTable.capturedAt);
  res.json({ points });
});

router.post("/farms/:farmId/vineyard-soil-analysis/:id/sample-points", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const soilAnalysisId = Number(req.params.id);
  const { lat, lng, label, capturedBy, accuracy, capturedAt } = req.body as Record<string, unknown>;
  if (!lat || !lng) { res.status(400).json({ error: "lat and lng are required" }); return; }
  const [point] = await db.insert(vineyardSoilSamplePointsTable).values({
    soilAnalysisId,
    farmId,
    lat: String(lat),
    lng: String(lng),
    label: label ? String(label) : null,
    capturedBy: capturedBy ? String(capturedBy) : null,
    accuracy: accuracy ? String(accuracy) : null,
    capturedAt: capturedAt ? new Date(String(capturedAt)) : new Date(),
  }).returning();
  res.status(201).json({ point });
});

router.delete("/farms/:farmId/vineyard-soil-analysis/:id/sample-points/:pointId", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const pointId = Number(req.params.pointId);
  await db.delete(vineyardSoilSamplePointsTable)
    .where(and(eq(vineyardSoilSamplePointsTable.id, pointId), eq(vineyardSoilSamplePointsTable.farmId, farmId)));
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

// ─── Vineyard Block Boundaries — path-style routes used by the draw dialog ───

// GET /farms/:farmId/vineyard-blocks/boundaries  — all latest boundaries for the farm (for block map overview)
router.get("/farms/:farmId/vineyard-blocks/boundaries", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const farmBlocks = await db.select({ id: vineyardBlocksTable.id }).from(vineyardBlocksTable).where(eq(vineyardBlocksTable.farmId, farmId));
  const blockIds = farmBlocks.map((b) => b.id);
  if (blockIds.length === 0) { res.json({ boundaries: [] }); return; }
  const all = await db.select().from(vineyardBlockBoundariesTable)
    .where(inArray(vineyardBlockBoundariesTable.blockId, blockIds))
    .orderBy(desc(vineyardBlockBoundariesTable.capturedAt));
  // Return only the most-recent boundary per block
  const seen = new Set<number>();
  const latest = all.filter((b) => { if (seen.has(b.blockId)) return false; seen.add(b.blockId); return true; });
  res.json({ boundaries: latest });
});

// GET /farms/:farmId/vineyard-blocks/:blockId/boundary  — latest boundary for one block
router.get("/farms/:farmId/vineyard-blocks/:blockId/boundary", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const blockId = Number(req.params.blockId);
  const [boundary] = await db.select().from(vineyardBlockBoundariesTable)
    .where(eq(vineyardBlockBoundariesTable.blockId, blockId))
    .orderBy(desc(vineyardBlockBoundariesTable.capturedAt))
    .limit(1);
  res.json({ boundary: boundary ?? null });
});

// POST /farms/:farmId/vineyard-blocks/:blockId/boundary  — save boundary for one block
router.post("/farms/:farmId/vineyard-blocks/:blockId/boundary", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const blockId = Number(req.params.blockId);
  const { polygonPoints, capturedBy } = req.body;
  const [record] = await db.insert(vineyardBlockBoundariesTable).values({ blockId, polygonPoints, capturedBy: capturedBy ?? null }).returning();
  res.status(201).json({ record });
});

// ─── Wine GI Designations ─────────────────────────────────────────────────────

router.get("/farms/:farmId/wine-gi-designations", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const rows = await db.select().from(wineGiDesignationsTable).where(eq(wineGiDesignationsTable.farmId, farmId)).orderBy(wineGiDesignationsTable.designationName);
  res.json({ records: rows });
});

router.post("/farms/:farmId/wine-gi-designations", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const { designationName, designationType, aphaRef, competentAuthority, region, approvedVarieties, maxYieldKgPerHa, registrationDate, nextAssessmentDate, status, notes } = sanitiseBody(req.body as Record<string, unknown>);
  const [record] = await db.insert(wineGiDesignationsTable).values({ farmId, designationName: String(designationName), designationType: String(designationType), aphaRef: aphaRef ? String(aphaRef) : null, competentAuthority: competentAuthority ? String(competentAuthority) : null, region: region ? String(region) : null, approvedVarieties: approvedVarieties ?? null, maxYieldKgPerHa: maxYieldKgPerHa ? String(maxYieldKgPerHa) : null, registrationDate: registrationDate ? String(registrationDate) : null, nextAssessmentDate: nextAssessmentDate ? String(nextAssessmentDate) : null, status: status ? String(status) : "active", notes: notes ? String(notes) : null }).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/wine-gi-designations/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const { designationName, designationType, aphaRef, competentAuthority, region, approvedVarieties, maxYieldKgPerHa, registrationDate, nextAssessmentDate, status, notes } = sanitiseBody(req.body as Record<string, unknown>);
  const [record] = await db.update(wineGiDesignationsTable).set({ designationName: String(designationName), designationType: String(designationType), aphaRef: aphaRef ? String(aphaRef) : null, competentAuthority: competentAuthority ? String(competentAuthority) : null, region: region ? String(region) : null, approvedVarieties: approvedVarieties ?? null, maxYieldKgPerHa: maxYieldKgPerHa ? String(maxYieldKgPerHa) : null, registrationDate: registrationDate ? String(registrationDate) : null, nextAssessmentDate: nextAssessmentDate ? String(nextAssessmentDate) : null, status: status ? String(status) : "active", notes: notes ? String(notes) : null }).where(and(eq(wineGiDesignationsTable.id, id), eq(wineGiDesignationsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/wine-gi-designations/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(wineGiDesignationsTable).where(and(eq(wineGiDesignationsTable.id, id), eq(wineGiDesignationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Wine GI Certifications ───────────────────────────────────────────────────

router.get("/farms/:farmId/wine-gi-certifications", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const rows = await db.select().from(wineGiCertificationsTable).where(eq(wineGiCertificationsTable.farmId, farmId)).orderBy(desc(wineGiCertificationsTable.vintageYear));
  res.json({ records: rows });
});

router.post("/farms/:farmId/wine-gi-certifications", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const vals: Record<string, unknown> = { farmId };
  if (body.designationId != null) vals.designationId = Number(body.designationId);
  if (body.vintageYear != null) vals.vintageYear = Number(body.vintageYear);
  const dateFields = ["submissionDate", "assessmentDate", "certificateIssueDate", "certificateExpiryDate"];
  const textFields = ["assessmentType", "result", "certificateNumber", "assessorName", "assessorOrganisation", "sampleReference", "wineLotReference", "failureReason", "notes"];
  dateFields.forEach(f => { if (body[f]) vals[f] = String(body[f]); });
  textFields.forEach(f => { if (body[f] != null) vals[f] = body[f] ? String(body[f]) : null; });
  if (body.volumeAssessedL != null) vals.volumeAssessedL = String(body.volumeAssessedL);
  if (body.resubmissionRequired != null) vals.resubmissionRequired = Boolean(body.resubmissionRequired);
  const [record] = await db.insert(wineGiCertificationsTable).values(vals as any).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/wine-gi-certifications/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const vals: Record<string, unknown> = {};
  if (body.designationId != null) vals.designationId = Number(body.designationId);
  if (body.vintageYear != null) vals.vintageYear = Number(body.vintageYear);
  const dateFields = ["submissionDate", "assessmentDate", "certificateIssueDate", "certificateExpiryDate"];
  const textFields = ["assessmentType", "result", "certificateNumber", "assessorName", "assessorOrganisation", "sampleReference", "wineLotReference", "failureReason", "notes"];
  dateFields.forEach(f => { vals[f] = body[f] ? String(body[f]) : null; });
  textFields.forEach(f => { vals[f] = body[f] ? String(body[f]) : null; });
  if (body.volumeAssessedL != null) vals.volumeAssessedL = body.volumeAssessedL ? String(body.volumeAssessedL) : null;
  if (body.resubmissionRequired != null) vals.resubmissionRequired = Boolean(body.resubmissionRequired);
  const [record] = await db.update(wineGiCertificationsTable).set(vals as any).where(and(eq(wineGiCertificationsTable.id, id), eq(wineGiCertificationsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/wine-gi-certifications/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(wineGiCertificationsTable).where(and(eq(wineGiCertificationsTable.id, id), eq(wineGiCertificationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Wine GI Harvest Declarations ────────────────────────────────────────────

router.get("/farms/:farmId/wine-gi-harvest-declarations", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const rows = await db.select().from(wineGiHarvestDeclarationsTable).where(eq(wineGiHarvestDeclarationsTable.farmId, farmId)).orderBy(desc(wineGiHarvestDeclarationsTable.vintageYear));
  res.json({ records: rows });
});

router.post("/farms/:farmId/wine-gi-harvest-declarations", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const vals: Record<string, unknown> = { farmId };
  if (body.designationId != null) vals.designationId = Number(body.designationId);
  if (body.vintageYear != null) vals.vintageYear = Number(body.vintageYear);
  const numFields = ["totalRegisteredAreaHa", "totalYieldKg", "declaredYieldKgPerHa", "maxPermittedYieldKgPerHa"];
  const dateFields = ["submissionDate"];
  const textFields = ["declarationRef", "submittedBy", "status", "aphaAcknowledgementRef", "notes"];
  numFields.forEach(f => { if (body[f] != null) vals[f] = String(body[f]); });
  dateFields.forEach(f => { if (body[f]) vals[f] = String(body[f]); });
  textFields.forEach(f => { if (body[f] != null) vals[f] = body[f] ? String(body[f]) : null; });
  if (body.yieldWithinLimit != null) vals.yieldWithinLimit = Boolean(body.yieldWithinLimit);
  const [record] = await db.insert(wineGiHarvestDeclarationsTable).values(vals as any).returning();
  res.status(201).json({ record });
});

router.put("/farms/:farmId/wine-gi-harvest-declarations/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const vals: Record<string, unknown> = {};
  if (body.designationId != null) vals.designationId = Number(body.designationId);
  if (body.vintageYear != null) vals.vintageYear = Number(body.vintageYear);
  const numFields = ["totalRegisteredAreaHa", "totalYieldKg", "declaredYieldKgPerHa", "maxPermittedYieldKgPerHa"];
  const dateFields = ["submissionDate"];
  const textFields = ["declarationRef", "submittedBy", "status", "aphaAcknowledgementRef", "notes"];
  numFields.forEach(f => { vals[f] = body[f] ? String(body[f]) : null; });
  dateFields.forEach(f => { vals[f] = body[f] ? String(body[f]) : null; });
  textFields.forEach(f => { vals[f] = body[f] ? String(body[f]) : null; });
  if (body.yieldWithinLimit != null) vals.yieldWithinLimit = Boolean(body.yieldWithinLimit);
  const [record] = await db.update(wineGiHarvestDeclarationsTable).set(vals as any).where(and(eq(wineGiHarvestDeclarationsTable.id, id), eq(wineGiHarvestDeclarationsTable.farmId, farmId))).returning();
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ record });
});

router.delete("/farms/:farmId/wine-gi-harvest-declarations/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId); const id = Number(req.params.id);
  await db.delete(wineGiHarvestDeclarationsTable).where(and(eq(wineGiHarvestDeclarationsTable.id, id), eq(wineGiHarvestDeclarationsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Block Photos ────────────────────────────────────────────────────
// Photo gallery: each block can have multiple photos (vineyard_block_photos table).
// The legacy single photo_object_path on the block row is kept for back-compat.

const _blockPhotoStorage = new ObjectStorageService();

// ── List photos for a block ──────────────────────────────────────────────────
router.get("/farms/:farmId/vineyard-blocks/:blockId/photos", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const rows = await db
    .select()
    .from(vineyardBlockPhotosTable)
    .where(and(eq(vineyardBlockPhotosTable.blockId, blockId), eq(vineyardBlockPhotosTable.farmId, farmId)))
    .orderBy(desc(vineyardBlockPhotosTable.isCover), sql`${vineyardBlockPhotosTable.sortOrder} ASC NULLS LAST`, asc(vineyardBlockPhotosTable.uploadedAt));

  // Generate presigned download URLs concurrently (5-minute TTL)
  const photos = await Promise.all(
    rows.map(async (photo) => ({
      ...photo,
      downloadUrl: await _blockPhotoStorage.getPresignedDownloadUrl(photo.objectPath, 300),
    }))
  );

  res.json({ photos });
});

// ── Add a photo to the gallery ───────────────────────────────────────────────
router.post("/farms/:farmId/vineyard-blocks/:blockId/photos", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const { objectPath, fileName, caption } = req.body as { objectPath?: string; fileName?: string; caption?: string };

  if (!objectPath || typeof objectPath !== "string" || !objectPath.startsWith("/objects/")) {
    res.status(400).json({ error: "objectPath required and must be a valid upload path" });
    return;
  }
  // Verify block ownership
  const [block] = await db.select({ id: vineyardBlocksTable.id }).from(vineyardBlocksTable)
    .where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId))).limit(1);
  if (!block) { res.status(404).json({ error: "Block not found" }); return; }

  // Register in farm_record_attachments for storage ACL
  await db.insert(farmRecordAttachmentsTable).values({
    farmId,
    recordType: "vineyard_block_photo",
    recordId: blockId,
    fileUrl: objectPath,
    fileKey: objectPath,
    fileName: fileName || "block-photo",
  });

  const [photo] = await db.insert(vineyardBlockPhotosTable).values({
    blockId,
    farmId,
    objectPath,
    fileName: fileName || null,
    caption: caption || null,
  }).returning();

  res.status(201).json({ photo });
});

// ── Bulk reorder gallery photos ────────────────────────────────────────────────
// Accepts { photoIds: number[] } — the complete, ordered list of photo IDs for
// this block. Validates that the payload is exactly the block's current photo
// set (no extras, no omissions, no duplicates), then persists all sortOrder
// values atomically inside a single transaction.
router.put("/farms/:farmId/vineyard-blocks/:blockId/photos/reorder", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const { photoIds } = req.body as { photoIds?: unknown };

  if (!Array.isArray(photoIds) || photoIds.length === 0 || photoIds.some((id) => typeof id !== "number")) {
    res.status(400).json({ error: "photoIds must be a non-empty array of numbers" });
    return;
  }
  const ids = photoIds as number[];

  // Reject duplicates
  if (new Set(ids).size !== ids.length) {
    res.status(400).json({ error: "photoIds must not contain duplicates" });
    return;
  }

  // Verify block ownership and fetch the canonical photo set
  const [block] = await db.select({ id: vineyardBlocksTable.id }).from(vineyardBlocksTable)
    .where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId))).limit(1);
  if (!block) { res.status(404).json({ error: "Block not found" }); return; }

  const existingPhotos = await db
    .select({ id: vineyardBlockPhotosTable.id })
    .from(vineyardBlockPhotosTable)
    .where(and(eq(vineyardBlockPhotosTable.blockId, blockId), eq(vineyardBlockPhotosTable.farmId, farmId)));
  const existingIds = new Set(existingPhotos.map((p) => p.id));

  // Payload must be exactly the current photo set — no extras, no omissions
  if (ids.length !== existingIds.size || ids.some((id) => !existingIds.has(id))) {
    res.status(400).json({ error: "photoIds must exactly match the block's current photo set" });
    return;
  }

  // Persist all sortOrder values atomically
  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await (tx.update(vineyardBlockPhotosTable) as any)
        .set({ sortOrder: i })
        .where(and(
          eq(vineyardBlockPhotosTable.id, ids[i]),
          eq(vineyardBlockPhotosTable.blockId, blockId),
          eq(vineyardBlockPhotosTable.farmId, farmId),
        ));
    }
  });

  res.json({ success: true });
});

// ── Serve a gallery photo by row id ──────────────────────────────────────────
router.get("/farms/:farmId/vineyard-blocks/:blockId/photos/:photoId", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const photoId = Number(req.params.photoId);
  const [photo] = await db.select().from(vineyardBlockPhotosTable)
    .where(and(eq(vineyardBlockPhotosTable.id, photoId), eq(vineyardBlockPhotosTable.blockId, blockId), eq(vineyardBlockPhotosTable.farmId, farmId))).limit(1);
  if (!photo) { res.status(404).json({ error: "Photo not found" }); return; }
  try {
    const objectFile = await _blockPhotoStorage.getObjectEntityFile(photo.objectPath);
    const response = await _blockPhotoStorage.downloadObject(objectFile, 300);
    res.status(response.status);
    response.headers.forEach((value: string, key: string) => res.setHeader(key, value));
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else { res.end(); }
  } catch { res.status(404).json({ error: "Photo not found in storage" }); }
});

// ── Update caption / cover status for a gallery photo ────────────────────────
router.patch("/farms/:farmId/vineyard-blocks/:blockId/photos/:photoId", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const photoId = Number(req.params.photoId);
  const { caption, isCover, sortOrder } = req.body as { caption?: string | null; isCover?: boolean; sortOrder?: number | null };

  // Verify ownership
  const [existing] = await db.select({ id: vineyardBlockPhotosTable.id })
    .from(vineyardBlockPhotosTable)
    .where(and(eq(vineyardBlockPhotosTable.id, photoId), eq(vineyardBlockPhotosTable.blockId, blockId), eq(vineyardBlockPhotosTable.farmId, farmId)))
    .limit(1);
  if (!existing) { res.status(404).json({ error: "Photo not found" }); return; }

  // If setting as cover, unset all other covers for this block first
  if (isCover === true) {
    await (db.update(vineyardBlockPhotosTable) as any)
      .set({ isCover: false })
      .where(and(eq(vineyardBlockPhotosTable.blockId, blockId), eq(vineyardBlockPhotosTable.farmId, farmId)));
  }

  const updateFields: Record<string, unknown> = {};
  if (caption !== undefined) updateFields.caption = caption ?? null;
  if (isCover !== undefined) updateFields.isCover = isCover;
  if (sortOrder !== undefined) updateFields.sortOrder = sortOrder ?? null;

  const [photo] = await (db.update(vineyardBlockPhotosTable) as any)
    .set(updateFields)
    .where(and(eq(vineyardBlockPhotosTable.id, photoId), eq(vineyardBlockPhotosTable.farmId, farmId)))
    .returning();

  res.json({ photo });
});

// ── Delete a gallery photo ────────────────────────────────────────────────────
router.delete("/farms/:farmId/vineyard-blocks/:blockId/photos/:photoId", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const photoId = Number(req.params.photoId);

  const [photo] = await db.select().from(vineyardBlockPhotosTable)
    .where(and(eq(vineyardBlockPhotosTable.id, photoId), eq(vineyardBlockPhotosTable.blockId, blockId), eq(vineyardBlockPhotosTable.farmId, farmId))).limit(1);
  if (!photo) { res.status(404).json({ error: "Photo not found" }); return; }

  // Soft-delete the storage ACL record
  await db.update(farmRecordAttachmentsTable)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(farmRecordAttachmentsTable.farmId, farmId),
      eq(farmRecordAttachmentsTable.recordType, "vineyard_block_photo"),
      eq(farmRecordAttachmentsTable.recordId, blockId),
      eq(farmRecordAttachmentsTable.fileKey, photo.objectPath),
      isNull(farmRecordAttachmentsTable.deletedAt),
    ));

  await db.delete(vineyardBlockPhotosTable)
    .where(and(eq(vineyardBlockPhotosTable.id, photoId), eq(vineyardBlockPhotosTable.farmId, farmId)));

  res.json({ success: true });
});

// ── Legacy single-photo routes (kept for backward compatibility) ──────────────
router.get("/farms/:farmId/vineyard-blocks/:blockId/photo", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const [block] = await db.select({ photoObjectPath: vineyardBlocksTable.photoObjectPath }).from(vineyardBlocksTable).where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId))).limit(1);
  if (!block || !block.photoObjectPath) { res.status(404).json({ error: "No photo" }); return; }
  try {
    const objectFile = await _blockPhotoStorage.getObjectEntityFile(block.photoObjectPath);
    const response = await _blockPhotoStorage.downloadObject(objectFile, 300);
    res.status(response.status);
    response.headers.forEach((value: string, key: string) => res.setHeader(key, value));
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else { res.end(); }
  } catch { res.status(404).json({ error: "Photo not found" }); }
});

router.patch("/farms/:farmId/vineyard-blocks/:blockId/photo", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  const { objectPath } = req.body as { objectPath?: string };
  if (!objectPath || typeof objectPath !== "string" || !objectPath.startsWith("/objects/")) {
    res.status(400).json({ error: "objectPath required and must be a valid upload path" });
    return;
  }
  const [block] = await db.select({ id: vineyardBlocksTable.id, photoObjectPath: vineyardBlocksTable.photoObjectPath })
    .from(vineyardBlocksTable).where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId))).limit(1);
  if (!block) { res.status(404).json({ error: "Block not found" }); return; }
  if (block.photoObjectPath) {
    await db.update(farmRecordAttachmentsTable)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(farmRecordAttachmentsTable.farmId, farmId),
        eq(farmRecordAttachmentsTable.recordType, "vineyard_block_photo"),
        eq(farmRecordAttachmentsTable.recordId, blockId),
        isNull(farmRecordAttachmentsTable.deletedAt),
      ));
  }
  await db.insert(farmRecordAttachmentsTable).values({
    farmId,
    recordType: "vineyard_block_photo",
    recordId: blockId,
    fileUrl: objectPath,
    fileKey: objectPath,
    fileName: "block-photo",
  });
  await db.update(vineyardBlocksTable).set({ photoObjectPath: objectPath })
    .where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId)));
  res.json({ success: true });
});

router.delete("/farms/:farmId/vineyard-blocks/:blockId/photo", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const blockId = Number(req.params.blockId);
  await db.update(farmRecordAttachmentsTable)
    .set({ deletedAt: new Date() })
    .where(and(
      eq(farmRecordAttachmentsTable.farmId, farmId),
      eq(farmRecordAttachmentsTable.recordType, "vineyard_block_photo"),
      eq(farmRecordAttachmentsTable.recordId, blockId),
      isNull(farmRecordAttachmentsTable.deletedAt),
    ));
  await db.update(vineyardBlocksTable).set({ photoObjectPath: null })
    .where(and(eq(vineyardBlocksTable.id, blockId), eq(vineyardBlocksTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Frost Events ────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-frost-events", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardFrostEventsTable).where(eq(vineyardFrostEventsTable.farmId, farmId)).orderBy(desc(vineyardFrostEventsTable.frostDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-frost-events", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  const [record] = await (db.insert(vineyardFrostEventsTable) as any).values({ ...body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-frost-events/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await (db.update(vineyardFrostEventsTable) as any).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardFrostEventsTable.id, id), eq(vineyardFrostEventsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-frost-events/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardFrostEventsTable).where(and(eq(vineyardFrostEventsTable.id, id), eq(vineyardFrostEventsTable.farmId, farmId)));
  res.json({ success: true });
});

// ─── Vineyard Cane Weights ─────────────────────────────────────────────────────

router.get("/farms/:farmId/vineyard-cane-weights", requireAuth, requireTenant, requireModuleByKey("viticulture", "read"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const records = await db.select().from(vineyardCaneWeightsTable).where(eq(vineyardCaneWeightsTable.farmId, farmId)).orderBy(desc(vineyardCaneWeightsTable.measuredDate));
  res.json({ records });
});

router.post("/farms/:farmId/vineyard-cane-weights", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const body = sanitiseBody(req.body as Record<string, unknown>);
  if (body.blockId && !body.plantingId) {
    const [active] = await db.select({ id: vineyardBlockPlantingsTable.id }).from(vineyardBlockPlantingsTable).where(and(eq(vineyardBlockPlantingsTable.blockId, Number(body.blockId)), eq(vineyardBlockPlantingsTable.farmId, farmId), eq(vineyardBlockPlantingsTable.status, "active"))).limit(1);
    if (active) body.plantingId = active.id;
  }
  const [record] = await (db.insert(vineyardCaneWeightsTable) as any).values({ ...body, farmId }).returning();
  res.json({ record });
});

router.put("/farms/:farmId/vineyard-cane-weights/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "write"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  const [record] = await (db.update(vineyardCaneWeightsTable) as any).set(sanitiseBody(req.body as Record<string, unknown>)).where(and(eq(vineyardCaneWeightsTable.id, id), eq(vineyardCaneWeightsTable.farmId, farmId))).returning();
  res.json({ record });
});

router.delete("/farms/:farmId/vineyard-cane-weights/:id", requireAuth, requireTenant, requireModuleByKey("viticulture", "delete"), async (req: Request, res: Response): Promise<void> => {
  const farmId = Number(req.params.farmId);
  const id = Number(req.params.id);
  await db.delete(vineyardCaneWeightsTable).where(and(eq(vineyardCaneWeightsTable.id, id), eq(vineyardCaneWeightsTable.farmId, farmId)));
  res.json({ success: true });
});

export default router;
