import { db, notificationsTable, farmsTable, inspectionRecordsTable, nonconformanceRecordsTable, subscriptionsTable, modulesTable } from "@workspace/db";
import { livestockMovementsTable } from "@workspace/db/schema";
import { eq, and, lt, isNull, sql } from "drizzle-orm";

const ESCALATION_DAYS = 7;

async function upsertNotification(data: {
  tenantId: number;
  farmId: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  relatedModule?: string;
  relatedId?: number;
  dedupeKey: string;
}) {
  const existing = await db
    .select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(eq(notificationsTable.dedupeKey, data.dedupeKey))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(notificationsTable).values(data);
  }
}

export async function createNonconformanceNotification(params: {
  tenantId: number;
  farmId: number;
  ncId: number;
  description: string;
}) {
  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "nonconformance_raised",
    severity: "warning",
    title: "New Non-Conformance Raised",
    message: `A new compliance issue has been logged: "${params.description}". Please review and assign a corrective action.`,
    relatedModule: "inspections",
    relatedId: params.ncId,
    dedupeKey: `nc-raised-${params.ncId}`,
  });
}

async function checkEscalations() {
  const escalationCutoff = new Date();
  escalationCutoff.setDate(escalationCutoff.getDate() - ESCALATION_DAYS);

  const openNCs = await db
    .select({
      id: nonconformanceRecordsTable.id,
      farmId: nonconformanceRecordsTable.farmId,
      description: nonconformanceRecordsTable.description,
      identifiedDate: nonconformanceRecordsTable.identifiedDate,
    })
    .from(nonconformanceRecordsTable)
    .where(
      and(
        eq(nonconformanceRecordsTable.status, "open"),
        lt(nonconformanceRecordsTable.identifiedDate, escalationCutoff),
      ),
    );

  for (const nc of openNCs) {
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, nc.farmId))
      .limit(1);

    if (!farm) continue;

    const daysSince = Math.floor((Date.now() - new Date(nc.identifiedDate!).getTime()) / 86400000);

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: nc.farmId,
      type: "nonconformance_escalated",
      severity: "critical",
      title: "Unresolved Issue — Action Overdue",
      message: `A non-conformance raised ${daysSince} days ago is still open: "${nc.description}". This must be resolved before your next Red Tractor audit.`,
      relatedModule: "inspections",
      relatedId: nc.id,
      dedupeKey: `nc-escalated-${nc.id}-week${Math.floor(daysSince / 7)}`,
    });
  }
}

async function checkOverdueInspections() {
  const now = new Date();

  const overdueInspections = await db
    .select({
      id: inspectionRecordsTable.id,
      farmId: inspectionRecordsTable.farmId,
      inspectionType: inspectionRecordsTable.inspectionType,
      nextInspectionDue: inspectionRecordsTable.nextInspectionDue,
    })
    .from(inspectionRecordsTable)
    .where(lt(inspectionRecordsTable.nextInspectionDue, now));

  for (const insp of overdueInspections) {
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, insp.farmId))
      .limit(1);

    if (!farm) continue;

    const dueDate = new Date(insp.nextInspectionDue!).toLocaleDateString("en-GB");

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: insp.farmId,
      type: "inspection_overdue",
      severity: "warning",
      title: "Inspection Overdue",
      message: `Your ${insp.inspectionType || "inspection"} was due on ${dueDate}. Schedule this inspection to maintain your Red Tractor compliance record.`,
      relatedModule: "inspections",
      relatedId: insp.id,
      dedupeKey: `insp-overdue-${insp.id}-${dueDate}`,
    });
  }
}

async function checkUnnotifiedMovements() {
  const NOTIFY_DAYS = 3;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NOTIFY_DAYS);

  const unnotified = await db
    .select({
      id: livestockMovementsTable.id,
      farmId: livestockMovementsTable.farmId,
      movementType: livestockMovementsTable.movementType,
      movementDate: livestockMovementsTable.movementDate,
      numberOfAnimals: livestockMovementsTable.numberOfAnimals,
    })
    .from(livestockMovementsTable)
    .where(
      and(
        eq(livestockMovementsTable.legalNotificationSubmitted, false),
        lt(livestockMovementsTable.movementDate, cutoff),
      ),
    );

  for (const movement of unnotified) {
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, movement.farmId))
      .limit(1);

    if (!farm) continue;

    const typeLabel = movement.movementType === "on" ? "On (animals arriving)"
      : movement.movementType === "off" ? "Off (animals leaving)"
      : movement.movementType === "between" ? "Between holdings"
      : movement.movementType;

    const dateStr = new Date(movement.movementDate!).toLocaleDateString("en-GB");
    const daysSince = Math.floor((Date.now() - new Date(movement.movementDate!).getTime()) / 86400000);

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: movement.farmId,
      type: "movement_unnotified",
      severity: "critical",
      title: "BCMS/APHA Notification Outstanding",
      message: `A livestock movement recorded on ${dateStr} (${typeLabel}, ${movement.numberOfAnimals ?? 1} animal(s)) has not been marked as notified to BCMS/APHA. This is a legal requirement — movements must be reported within 3 days. ${daysSince} days have passed.`,
      relatedModule: "livestock-management",
      relatedId: movement.id,
      dedupeKey: `movement-unnotified-${movement.id}-day${daysSince}`,
    });
  }
}

export async function runAlertingJob() {
  try {
    await checkEscalations();
    await checkOverdueInspections();
    await checkUnnotifiedMovements();
    console.log("[ALERTS] Alerting job completed");
  } catch (err) {
    console.error("[ALERTS] Alerting job error:", err);
  }
}

export function startAlertingJob() {
  const INTERVAL_MS = 60 * 60 * 1000;

  runAlertingJob();
  setInterval(runAlertingJob, INTERVAL_MS);
  console.log("[ALERTS] Alerting job scheduled (runs every hour)");
}
