import { db, notificationsTable, farmsTable, inspectionRecordsTable, nonconformanceRecordsTable, subscriptionsTable, modulesTable } from "@workspace/db";
import { usersTable, userTenantsTable } from "@workspace/db/schema";
import { livestockMovementsTable, staffCertificatesTable, sprayApplicationsTable, sprayProductsTable } from "@workspace/db/schema";
import { eq, and, lt, isNull, sql, gte, lte } from "drizzle-orm";
import { sendSms } from "./sms";

const ESCALATION_DAYS = 7;

const CRITICAL_TYPES = new Set(["movement_unnotified", "certificate_expired", "nonconformance_escalated"]);

async function dispatchSmsForCriticalAlert(tenantId: number, title: string, message: string) {
  const smsUsers = await db
    .select({ phoneNumber: usersTable.phoneNumber, smsOptIn: usersTable.smsOptIn })
    .from(usersTable)
    .innerJoin(userTenantsTable, eq(userTenantsTable.userId, usersTable.id))
    .where(
      and(
        eq(userTenantsTable.tenantId, tenantId),
        eq(userTenantsTable.isActive, true),
      )
    );

  for (const user of smsUsers) {
    if (!user.phoneNumber) continue;
    if (user.smsOptIn !== "all" && user.smsOptIn !== "critical") continue;
    const smsBody = `BDE Farm Trac Alert\n${title}\n${message.slice(0, 140)}`;
    await sendSms(user.phoneNumber, smsBody);
  }
}

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
    if (CRITICAL_TYPES.has(data.type)) {
      await dispatchSmsForCriticalAlert(data.tenantId, data.title, data.message);
    }
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

async function checkCertificateExpiry() {
  const WARN_DAYS = 30;
  const warnCutoff = new Date();
  warnCutoff.setDate(warnCutoff.getDate() + WARN_DAYS);
  const now = new Date();

  const certs = await db
    .select({
      id: staffCertificatesTable.id,
      farmId: staffCertificatesTable.farmId,
      certificateType: staffCertificatesTable.certificateType,
      certificateNumber: staffCertificatesTable.certificateNumber,
      expiryDate: staffCertificatesTable.expiryDate,
      userId: staffCertificatesTable.userId,
    })
    .from(staffCertificatesTable)
    .where(lt(staffCertificatesTable.expiryDate, warnCutoff));

  for (const cert of certs) {
    if (!cert.expiryDate) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, cert.farmId))
      .limit(1);

    if (!farm) continue;

    const expiryDate = new Date(cert.expiryDate);
    const expired = expiryDate < now;
    const daysUntil = Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000);
    const expiryStr = expiryDate.toLocaleDateString("en-GB");
    const certLabel = cert.certificateType || "Certificate";

    if (expired) {
      await upsertNotification({
        tenantId: farm.tenantId,
        farmId: cert.farmId,
        type: "certificate_expired",
        severity: "critical",
        title: `${certLabel} Certificate Expired`,
        message: `A ${certLabel} certificate (${cert.certificateNumber || "no number"}) expired on ${expiryStr}. This must be renewed immediately — applying pesticides without a valid PA1/PA6 certificate is illegal.`,
        relatedModule: "staff-training",
        relatedId: cert.id,
        dedupeKey: `cert-expired-${cert.id}`,
      });
    } else {
      await upsertNotification({
        tenantId: farm.tenantId,
        farmId: cert.farmId,
        type: "certificate_expiring",
        severity: "warning",
        title: `${certLabel} Certificate Expiring Soon`,
        message: `A ${certLabel} certificate (${cert.certificateNumber || "no number"}) expires on ${expiryStr} — ${daysUntil} day(s) remaining. Arrange renewal before expiry to remain Red Tractor compliant.`,
        relatedModule: "staff-training",
        relatedId: cert.id,
        dedupeKey: `cert-expiring-${cert.id}-days${Math.floor(daysUntil / 7)}`,
      });
    }
  }
}

async function checkWithholdingPeriods() {
  const now = new Date();

  const recentApplications = await db
    .select({
      id: sprayApplicationsTable.id,
      farmId: sprayApplicationsTable.farmId,
      applicationDate: sprayApplicationsTable.applicationDate,
      productId: sprayApplicationsTable.productId,
      fieldId: sprayApplicationsTable.fieldId,
    })
    .from(sprayApplicationsTable);

  for (const app of recentApplications) {
    if (!app.applicationDate) continue;

    const [product] = await db
      .select({
        productName: sprayProductsTable.productName,
        harvestInterval: sprayProductsTable.harvestInterval,
      })
      .from(sprayProductsTable)
      .where(eq(sprayProductsTable.id, app.productId))
      .limit(1);

    if (!product || !product.harvestInterval) continue;

    const appDate = new Date(app.applicationDate);
    const earliestHarvest = new Date(appDate);
    earliestHarvest.setDate(earliestHarvest.getDate() + product.harvestInterval);

    if (earliestHarvest <= now) continue;

    const daysRemaining = Math.ceil((earliestHarvest.getTime() - now.getTime()) / 86400000);
    const harvestDateStr = earliestHarvest.toLocaleDateString("en-GB");
    const appDateStr = appDate.toLocaleDateString("en-GB");

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, app.farmId))
      .limit(1);

    if (!farm) continue;

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: app.farmId,
      type: "withholding_period_active",
      severity: "warning",
      title: "Harvest Withholding Period Active",
      message: `${product.productName} was applied on ${appDateStr}. The ${product.harvestInterval}-day withholding period means this field must not be harvested before ${harvestDateStr} (${daysRemaining} day(s) remaining).`,
      relatedModule: "sprays-inputs",
      relatedId: app.id,
      dedupeKey: `withhold-${app.id}-${harvestDateStr}`,
    });
  }
}

export async function runAlertingJob() {
  try {
    await checkEscalations();
    await checkOverdueInspections();
    await checkUnnotifiedMovements();
    await checkCertificateExpiry();
    await checkWithholdingPeriods();
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
