import { db, notificationsTable, farmsTable, inspectionRecordsTable, nonconformanceRecordsTable, subscriptionsTable, modulesTable } from "@workspace/db";
import { usersTable, userTenantsTable } from "@workspace/db/schema";
import { livestockMovementsTable, staffCertificatesTable, sprayApplicationsTable, sprayProductsTable, riskAssessmentsTable, pestControlRecordsTable, cleaningDisinfectionRecordsTable } from "@workspace/db/schema";
import { eq, and, lt, isNull, sql, gte, lte, or, ne, isNotNull } from "drizzle-orm";
import { sendSms } from "./sms";

const ESCALATION_DAYS = 7;

const CRITICAL_TYPES = new Set(["movement_unnotified", "certificate_expired", "nonconformance_escalated", "water_quality_fail", "pest_control_overdue", "cleaning_overdue"]);

async function tenantHasSmsModule(tenantId: number): Promise<boolean> {
  const [smsModule] = await db
    .select({ id: modulesTable.id })
    .from(modulesTable)
    .where(eq(modulesTable.key, "sms-alerts"))
    .limit(1);

  if (!smsModule) return false;

  const [sub] = await db
    .select({ id: subscriptionsTable.id })
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.tenantId, tenantId),
        eq(subscriptionsTable.moduleId, smsModule.id),
        eq(subscriptionsTable.status, "active"),
      )
    )
    .limit(1);

  return Boolean(sub);
}

async function dispatchSmsForCriticalAlert(tenantId: number, title: string, message: string) {
  const hasModule = await tenantHasSmsModule(tenantId);
  if (!hasModule) return;

  // Send to:
  //   (a) users designated as alert recipients (Farm Managers / receiveAlerts = true), OR
  //   (b) users who have explicitly opted in via their personal preference
  // In both cases: must have a phone number and must not have explicitly opted out.
  const smsUsers = await db
    .select({ phoneNumber: usersTable.phoneNumber, smsOptIn: usersTable.smsOptIn })
    .from(usersTable)
    .innerJoin(userTenantsTable, eq(userTenantsTable.userId, usersTable.id))
    .where(
      and(
        eq(userTenantsTable.tenantId, tenantId),
        eq(userTenantsTable.isActive, true),
        isNotNull(usersTable.phoneNumber),
        ne(usersTable.smsOptIn, "none"),
        or(
          eq(userTenantsTable.receiveAlerts, true),
          eq(usersTable.smsOptIn, "all"),
          eq(usersTable.smsOptIn, "critical"),
        ),
      )
    );

  const seen = new Set<string>();
  for (const user of smsUsers) {
    if (!user.phoneNumber || seen.has(user.phoneNumber)) continue;
    seen.add(user.phoneNumber);
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

export async function createFieldActionNotification(params: {
  tenantId: number;
  farmId: number;
  inspectionId: number;
  fieldName: string;
  action: string;
  observations: string;
  inspector: string;
}) {
  const severity = params.action === "urgent" ? "critical" : "warning";
  const title = params.action === "urgent"
    ? `Urgent Field Action Required — ${params.fieldName}`
    : `Treatment Required — ${params.fieldName}`;
  const message = `${params.inspector} has flagged ${params.fieldName} during a field inspection. Action: ${params.action === "urgent" ? "URGENT" : "treat"}. ${params.observations ? `Observations: ${params.observations.slice(0, 120)}` : ""}`.trim();

  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: params.action === "urgent" ? "field_action_urgent" : "field_action_treatment",
    severity,
    title,
    message,
    relatedModule: "field-crop-management",
    relatedId: params.inspectionId,
    dedupeKey: `field-action-${params.inspectionId}`,
  });

  if (params.action === "urgent") {
    await dispatchSmsForCriticalAlert(params.tenantId, title, message);
  }
}

export async function createCriticalRiskNotification(params: {
  tenantId: number;
  farmId: number;
  assessmentId: number;
  title: string;
  hazardDescription: string;
  riskLevel: string;
  assessedBy: string;
}) {
  const isCritical = params.riskLevel === "critical";
  const severity = isCritical ? "critical" : "warning";
  const notifTitle = isCritical
    ? `Critical Hazard Identified — ${params.title}`
    : `High-Risk Hazard Logged — ${params.title}`;
  const message = `${params.assessedBy ? params.assessedBy + " has" : "A new risk assessment has"} identified a ${params.riskLevel}-risk hazard: "${params.hazardDescription.slice(0, 140)}". Review control measures and ensure appropriate safeguards are in place.`;

  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: isCritical ? "risk_assessment_critical" : "risk_assessment_high",
    severity,
    title: notifTitle,
    message,
    relatedModule: "risk-waste",
    relatedId: params.assessmentId,
    dedupeKey: `risk-${isCritical ? "critical" : "high"}-${params.assessmentId}`,
  });

  if (isCritical) {
    await dispatchSmsForCriticalAlert(params.tenantId, notifTitle, message);
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

export async function createWaterFailureNotification(params: {
  tenantId: number;
  farmId: number;
  recordId: number;
  herdName: string;
  waterSource: string;
  testResult: string;
}) {
  const title = `Livestock Water Quality Failure — ${params.herdName}`;
  const message = `Water from ${params.waterSource} has been recorded as UNSUITABLE for ${params.herdName}. Test result: ${params.testResult.replace(/-/g, " ")}. Immediate action required — restrict access to this water source and arrange an alternative supply. Review and retest when remediated.`;

  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "water_quality_fail",
    severity: "critical",
    title,
    message,
    relatedModule: "livestock-management",
    relatedId: params.recordId,
    dedupeKey: `water-fail-${params.recordId}`,
  });

  await dispatchSmsForCriticalAlert(params.tenantId, title, message);
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

async function checkOverdueRiskReviews() {
  const now = new Date();

  const overdueAssessments = await db
    .select({
      id: riskAssessmentsTable.id,
      farmId: riskAssessmentsTable.farmId,
      title: riskAssessmentsTable.title,
      riskLevel: riskAssessmentsTable.riskLevel,
      reviewDate: riskAssessmentsTable.reviewDate,
    })
    .from(riskAssessmentsTable)
    .where(
      and(
        eq(riskAssessmentsTable.status, "active"),
        lt(riskAssessmentsTable.reviewDate, now),
      ),
    );

  for (const assessment of overdueAssessments) {
    if (!assessment.reviewDate) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, assessment.farmId))
      .limit(1);

    if (!farm) continue;

    const dueDateStr = new Date(assessment.reviewDate).toLocaleDateString("en-GB");
    const daysSince = Math.floor((now.getTime() - new Date(assessment.reviewDate).getTime()) / 86400000);
    const riskLabel = assessment.riskLevel ? `${assessment.riskLevel}-risk ` : "";

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: assessment.farmId,
      type: "risk_review_overdue",
      severity: "warning",
      title: `Risk Assessment Review Overdue — ${assessment.title}`,
      message: `The ${riskLabel}risk assessment "${assessment.title}" was due for review on ${dueDateStr} (${daysSince} day${daysSince !== 1 ? "s" : ""} ago). Review and update this assessment to maintain Red Tractor compliance.`,
      relatedModule: "risk-waste",
      relatedId: assessment.id,
      dedupeKey: `risk-review-overdue-${assessment.id}-week${Math.floor(daysSince / 7)}`,
    });
  }
}

async function checkOverduePestControl() {
  const now = new Date();

  const overdueRecords = await db
    .select({
      id: pestControlRecordsTable.id,
      farmId: pestControlRecordsTable.farmId,
      pestType: pestControlRecordsTable.pestType,
      location: pestControlRecordsTable.location,
      followUpDate: pestControlRecordsTable.followUpDate,
    })
    .from(pestControlRecordsTable)
    .where(
      and(
        isNotNull(pestControlRecordsTable.followUpDate),
        lt(pestControlRecordsTable.followUpDate, now),
      ),
    );

  for (const record of overdueRecords) {
    if (!record.followUpDate) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, record.farmId))
      .limit(1);

    if (!farm) continue;

    const dueDateStr = new Date(record.followUpDate).toLocaleDateString("en-GB");
    const daysSince = Math.floor((now.getTime() - new Date(record.followUpDate).getTime()) / 86400000);
    const locationStr = record.location ? ` at ${record.location}` : "";
    const weekNum = Math.floor(daysSince / 7);

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: record.farmId,
      type: "pest_control_overdue",
      severity: "critical",
      title: `Pest Control Follow-Up Overdue${locationStr}`,
      message: `A pest control follow-up visit${locationStr} (${record.pestType}) was due on ${dueDateStr} — ${daysSince} day${daysSince !== 1 ? "s" : ""} ago. Log the next visit in Biosecurity → Pest Control to maintain your Red Tractor biosecurity record.`,
      relatedModule: "biosecurity",
      relatedId: record.id,
      dedupeKey: `pest-control-overdue-${record.id}-week${weekNum}`,
    });
  }
}

async function checkOverdueCleaningSchedules() {
  const now = new Date();

  const overdueRecords = await db
    .select({
      id: cleaningDisinfectionRecordsTable.id,
      farmId: cleaningDisinfectionRecordsTable.farmId,
      area: cleaningDisinfectionRecordsTable.area,
      cleaningType: cleaningDisinfectionRecordsTable.cleaningType,
      nextDueDate: cleaningDisinfectionRecordsTable.nextDueDate,
    })
    .from(cleaningDisinfectionRecordsTable)
    .where(
      and(
        isNotNull(cleaningDisinfectionRecordsTable.nextDueDate),
        lt(cleaningDisinfectionRecordsTable.nextDueDate, now),
      ),
    );

  for (const record of overdueRecords) {
    if (!record.nextDueDate) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, record.farmId))
      .limit(1);

    if (!farm) continue;

    const dueDateStr = new Date(record.nextDueDate).toLocaleDateString("en-GB");
    const daysSince = Math.floor((now.getTime() - new Date(record.nextDueDate).getTime()) / 86400000);
    const weekNum = Math.floor(daysSince / 7);
    const areaLabel = record.area || "building/area";
    const typeLabel = record.cleaningType ? ` (${record.cleaningType})` : "";

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: record.farmId,
      type: "cleaning_overdue",
      severity: "critical",
      title: `Cleaning & Disinfection Overdue — ${areaLabel}`,
      message: `A cleaning & disinfection schedule${typeLabel} for ${areaLabel} was due on ${dueDateStr} — ${daysSince} day${daysSince !== 1 ? "s" : ""} ago. Log the next clean in Biosecurity → Cleaning & Disinfection to satisfy Red Tractor requirements.`,
      relatedModule: "biosecurity",
      relatedId: record.id,
      dedupeKey: `cleaning-overdue-${record.id}-week${weekNum}`,
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
    await checkOverdueRiskReviews();
    await checkOverduePestControl();
    await checkOverdueCleaningSchedules();
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
