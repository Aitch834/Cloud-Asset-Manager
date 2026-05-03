import { db, notificationsTable, farmsTable, inspectionRecordsTable, nonconformanceRecordsTable, subscriptionsTable, modulesTable, poultryTreatmentsTable, poultrySchemeRecordsTable, poultryBroilerWelfareTable, pigMedicineTreatmentsTable, pigRedTractorChecklistTable, pigTailBitingRisksTable } from "@workspace/db";
import { usersTable, userTenantsTable } from "@workspace/db/schema";
import { livestockMovementsTable, staffCertificatesTable, sprayApplicationsTable, sprayProductsTable, riskAssessmentsTable, pestControlRecordsTable, cleaningDisinfectionRecordsTable } from "@workspace/db/schema";
import { feedContingencyPlansTable, feedStockLevelsTable, feedStockTargetsTable, feedPurchaseOrdersTable } from "@workspace/db/schema";
import { vetHealthPlanActionsTable, vetHealthPlansTable } from "@workspace/db/schema";
import { eq, and, lt, isNull, sql, gte, lte, or, ne, isNotNull } from "drizzle-orm";
import { sendSms } from "./sms";
import { sendWeeklyDigestEmail, type WeeklyDigestItem } from "./mailer";

const ESCALATION_DAYS = 7;

const CRITICAL_TYPES = new Set(["movement_unnotified", "certificate_expired", "nonconformance_escalated", "water_quality_fail", "pest_control_overdue", "cleaning_overdue", "shop_stock_out", "dairy_lab_concern", "dairy_abr_positive", "dairy_mobility_lameness"]);

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

export async function createDairyLabConcernNotification(params: {
  tenantId: number;
  farmId: number;
  recordId: number;
  recordDate: string;
  milkBuyer?: string | null;
  buyerLabRef?: string | null;
  buyerSccThousands?: number | null;
}) {
  const dateLabel = new Date(params.recordDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const buyerLabel = params.milkBuyer ? ` from ${params.milkBuyer}` : "";
  const refLabel = params.buyerLabRef ? ` (Ref: ${params.buyerLabRef})` : "";
  const sccLabel = params.buyerSccThousands ? ` Buyer SCC: ${params.buyerSccThousands.toLocaleString()} k/mL.` : "";
  const title = `Dairy Lab Results — Action Required (${dateLabel})`;
  const message = `Buyer lab results${buyerLabel}${refLabel} for milk collected on ${dateLabel} have been flagged as requiring action.${sccLabel} Review the Dairy → Milk Records tab and take appropriate remedial action. Contact your milk buyer if SCC is above threshold.`;

  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "dairy_lab_concern",
    severity: "critical",
    title,
    message,
    relatedModule: "dairy-management",
    relatedId: params.recordId,
    dedupeKey: `dairy-lab-concern-${params.recordId}`,
  });

  await dispatchSmsForCriticalAlert(params.tenantId, title, message);
}

export async function createDairyAbrPositiveNotification(params: {
  tenantId: number;
  farmId: number;
  recordId: number;
  recordDate: string;
  sessionType?: string | null;
  abrTestedBy?: string | null;
}) {
  const dateLabel = new Date(params.recordDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const sessionLabel = params.sessionType ? ` (${params.sessionType} session)` : "";
  const testerLabel = params.abrTestedBy ? ` Tested by: ${params.abrTestedBy}.` : "";
  const title = `ABR Test POSITIVE — Milk Load Rejected (${dateLabel})`;
  const message = `An antibiotic residue test on ${dateLabel}${sessionLabel} has returned a POSITIVE result.${testerLabel} The milk load must NOT be collected. Identify and isolate the treated animal, discard the affected milk, and retest before the next collection. Notify your milk buyer immediately.`;

  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "dairy_abr_positive",
    severity: "critical",
    title,
    message,
    relatedModule: "dairy-management",
    relatedId: params.recordId,
    dedupeKey: `dairy-abr-positive-${params.recordId}`,
  });

  await dispatchSmsForCriticalAlert(params.tenantId, title, message);
}

export async function createMobilityLamenessAlert(params: {
  tenantId: number;
  farmId: number;
  recordId: number;
  assessmentDate: string;
  lamenessPercent: number;
  score3Count: number;
  totalCowsScored: number;
  score3AnimalTags?: string | null;
}) {
  const dateLabel = new Date(params.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const tagsLabel = params.score3AnimalTags?.trim() ? ` Affected animals: ${params.score3AnimalTags.trim().slice(0, 100)}.` : "";
  const title = `Lameness Alert — ${params.lamenessPercent.toFixed(1)}% Prevalence (${dateLabel})`;
  const message = `Mobility assessment on ${dateLabel} recorded ${params.score3Count} of ${params.totalCowsScored} cows scoring 3 (lame) — ${params.lamenessPercent.toFixed(1)}% prevalence, above the Red Tractor 10% target.${tagsLabel} Review foot health and arrange a veterinary assessment. Record actions taken in Dairy → Mobility Scoring.`;

  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "dairy_mobility_lameness",
    severity: "critical",
    title,
    message,
    relatedModule: "dairy-management",
    relatedId: params.recordId,
    dedupeKey: `dairy-mobility-lameness-${params.recordId}`,
  });

  await dispatchSmsForCriticalAlert(params.tenantId, title, message);
}

export async function createMobilityScore2Advisory(params: {
  tenantId: number;
  farmId: number;
  recordId: number;
  assessmentDate: string;
  score2Percent: number;
  score2Count: number;
  totalCowsScored: number;
}) {
  const dateLabel = new Date(params.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const title = `Mobility Advisory — ${params.score2Percent.toFixed(1)}% Score 2 Impaired Gait (${dateLabel})`;
  const message = `Mobility assessment on ${dateLabel} found ${params.score2Count} of ${params.totalCowsScored} cows scoring 2 (impaired gait) — ${params.score2Percent.toFixed(1)}% of the herd. Monitor closely, review foot-bathing frequency, and consider early veterinary intervention for at-risk animals before scores worsen.`;

  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "dairy_mobility_score2",
    severity: "warning",
    title,
    message,
    relatedModule: "dairy-management",
    relatedId: params.recordId,
    dedupeKey: `dairy-mobility-score2-${params.recordId}`,
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

export async function createStockLowNotification(params: {
  tenantId: number;
  farmId: number;
  productId: number;
  productName: string;
  stock: number;
  reorderLevel: number;
}) {
  const today = new Date().toISOString().slice(0, 10);
  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "shop_stock_low",
    severity: "warning",
    title: `Farm Shop — Low Stock: ${params.productName}`,
    message: `${params.productName} has dropped to ${params.stock} unit(s) — at or below the reorder level of ${params.reorderLevel}. Consider ordering more stock soon.`,
    relatedModule: "farm-diversification",
    relatedId: params.productId,
    dedupeKey: `shop-stock-low-${params.productId}-${today}`,
  });
}

export async function createStockOutNotification(params: {
  tenantId: number;
  farmId: number;
  productId: number;
  productName: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const title = `Farm Shop — Out of Stock: ${params.productName}`;
  const message = `${params.productName} is now out of stock. Order or produce more to avoid lost sales.`;
  await upsertNotification({
    tenantId: params.tenantId,
    farmId: params.farmId,
    type: "shop_stock_out",
    severity: "critical",
    title,
    message,
    relatedModule: "farm-diversification",
    relatedId: params.productId,
    dedupeKey: `shop-stock-out-${params.productId}-${today}`,
  });
  await dispatchSmsForCriticalAlert(params.tenantId, title, message);
}

async function runWeeklyDigest() {
  console.log("[ALERTS] Running weekly compliance digest...");
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const farms = await db
    .select({ id: farmsTable.id, name: farmsTable.name, tenantId: farmsTable.tenantId })
    .from(farmsTable);

  for (const farm of farms) {
    const items: WeeklyDigestItem[] = [];

    const expiringCerts = await db
      .select({ certificateType: staffCertificatesTable.certificateType, expiryDate: staffCertificatesTable.expiryDate })
      .from(staffCertificatesTable)
      .where(
        and(
          eq(staffCertificatesTable.farmId, farm.id),
          isNotNull(staffCertificatesTable.expiryDate),
          gte(staffCertificatesTable.expiryDate, today),
          lte(staffCertificatesTable.expiryDate, in30Days),
        )
      );
    for (const cert of expiringCerts) {
      const daysDiff = Math.ceil((cert.expiryDate!.getTime() - today.getTime()) / 86_400_000);
      items.push({
        category: "Staff Certificate Expiry",
        label: cert.certificateType,
        dueDate: cert.expiryDate!.toISOString().slice(0, 10),
        severity: daysDiff <= 7 ? "critical" : "warning",
      });
    }

    const dueReviews = await db
      .select({ title: riskAssessmentsTable.title, reviewDate: riskAssessmentsTable.reviewDate })
      .from(riskAssessmentsTable)
      .where(
        and(
          eq(riskAssessmentsTable.farmId, farm.id),
          isNotNull(riskAssessmentsTable.reviewDate),
          lte(riskAssessmentsTable.reviewDate, in30Days),
        )
      );
    for (const review of dueReviews) {
      const isPast = review.reviewDate! < today;
      items.push({
        category: "Risk Assessment Review",
        label: review.title,
        dueDate: review.reviewDate!.toISOString().slice(0, 10),
        severity: isPast ? "critical" : "warning",
      });
    }

    const dueInspections = await db
      .select({ inspectionType: inspectionRecordsTable.inspectionType, nextInspectionDue: inspectionRecordsTable.nextInspectionDue })
      .from(inspectionRecordsTable)
      .where(
        and(
          eq(inspectionRecordsTable.farmId, farm.id),
          isNotNull(inspectionRecordsTable.nextInspectionDue),
          lte(inspectionRecordsTable.nextInspectionDue, in30Days),
        )
      );
    for (const inspection of dueInspections) {
      const isPast = inspection.nextInspectionDue! < today;
      items.push({
        category: "Inspection Due",
        label: inspection.inspectionType,
        dueDate: inspection.nextInspectionDue!.toISOString().slice(0, 10),
        severity: isPast ? "critical" : "warning",
      });
    }

    if (items.length === 0) continue;

    const managers = await db
      .select({
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      })
      .from(usersTable)
      .innerJoin(userTenantsTable, eq(userTenantsTable.userId, usersTable.id))
      .where(
        and(
          eq(userTenantsTable.tenantId, farm.tenantId),
          eq(userTenantsTable.isActive, true),
          isNotNull(usersTable.email),
        )
      );

    for (const manager of managers) {
      if (!manager.email) continue;
      const name = [manager.firstName, manager.lastName].filter(Boolean).join(" ") || "Farm Manager";
      await sendWeeklyDigestEmail({
        to: manager.email,
        toName: name,
        farmName: farm.name,
        items,
      }).catch((err) => console.error(`[ALERTS] Digest email error for ${manager.email}:`, err));
    }
  }
  console.log("[ALERTS] Weekly digest completed");
}

async function checkFeedStockLevels() {
  const plans = await db
    .select({
      id: feedContingencyPlansTable.id,
      farmId: feedContingencyPlansTable.farmId,
      minimumStockDaysTarget: feedContingencyPlansTable.minimumStockDaysTarget,
      dailyConsumptionKg: feedContingencyPlansTable.dailyConsumptionKg,
      alertThresholdKg: feedContingencyPlansTable.alertThresholdKg,
    })
    .from(feedContingencyPlansTable);

  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));

  for (const plan of plans) {
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId, name: farmsTable.name })
      .from(farmsTable)
      .where(eq(farmsTable.id, plan.farmId))
      .limit(1);
    if (!farm) continue;

    // ── Per-species targets (preferred) ──────────────────────
    const speciesTargets = await db
      .select()
      .from(feedStockTargetsTable)
      .where(eq(feedStockTargetsTable.farmId, plan.farmId));

    if (speciesTargets.length > 0) {
      const allStockRows = await db
        .select({ currentStockKg: feedStockLevelsTable.currentStockKg, speciesIntended: feedStockLevelsTable.speciesIntended })
        .from(feedStockLevelsTable)
        .where(eq(feedStockLevelsTable.farmId, plan.farmId));

      for (const target of speciesTargets) {
        const dailyKg = parseFloat(target.dailyConsumptionKg ?? "0");
        const minDays = target.minimumStockDaysTarget;
        if (!dailyKg || !minDays) continue;

        const speciesStock = target.species === "all"
          ? allStockRows
          : allStockRows.filter(r => r.speciesIntended === target.species);
        const totalKg = speciesStock.reduce((sum, r) => sum + parseFloat(r.currentStockKg ?? "0"), 0);
        const daysRemaining = Math.floor(totalKg / dailyKg);
        const speciesLabel = target.label ?? target.species;
        const threshKg = target.alertThresholdKg ? parseFloat(target.alertThresholdKg) : null;

        if (daysRemaining < minDays) {
          const isCritical = daysRemaining < Math.floor(minDays / 2);
          await upsertNotification({
            tenantId: farm.tenantId,
            farmId: plan.farmId,
            type: "feed_stock_low",
            severity: isCritical ? "critical" : "warning",
            title: isCritical
              ? `${speciesLabel} Feed — Critical: ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} Remaining`
              : `${speciesLabel} Feed — Below Target: ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} Remaining`,
            message: `${farm.name}: ${speciesLabel.toLowerCase()} feed stock is ${Math.round(totalKg).toLocaleString()} kg — approximately ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} at current usage (${dailyKg} kg/day). Minimum reserve target is ${minDays} days. ${isCritical ? "Order feed urgently and activate your contingency plan." : "Consider placing a feed order to restore stock above the minimum reserve."}`,
            relatedModule: "feed-management",
            dedupeKey: `feed-stock-low-farm${plan.farmId}-${target.species}-week${weekNum}`,
          });
        }

        if (threshKg && totalKg < threshKg) {
          await upsertNotification({
            tenantId: farm.tenantId,
            farmId: plan.farmId,
            type: "feed_stock_low",
            severity: "warning",
            title: `${speciesLabel} Feed — Below Alert Threshold`,
            message: `${farm.name}: ${speciesLabel.toLowerCase()} feed stock (${Math.round(totalKg).toLocaleString()} kg) has dropped below the alert threshold of ${Math.round(threshKg).toLocaleString()} kg. Check your feed bins and place an order if needed.`,
            relatedModule: "feed-management",
            dedupeKey: `feed-stock-threshold-farm${plan.farmId}-${target.species}-week${weekNum}`,
          });
        }
      }
      continue; // skip aggregate fallback when species targets exist
    }

    // ── Aggregate fallback (no species targets configured) ────
    const stockRows = await db
      .select({ currentStockKg: feedStockLevelsTable.currentStockKg })
      .from(feedStockLevelsTable)
      .where(eq(feedStockLevelsTable.farmId, plan.farmId));

    const totalKg = stockRows.reduce((sum, r) => sum + parseFloat(r.currentStockKg ?? "0"), 0);
    const dailyKg = plan.dailyConsumptionKg ? parseFloat(plan.dailyConsumptionKg) : null;
    const minDays = plan.minimumStockDaysTarget ?? null;
    const threshKg = plan.alertThresholdKg ? parseFloat(plan.alertThresholdKg) : null;

    if (dailyKg && dailyKg > 0 && minDays) {
      const daysRemaining = Math.floor(totalKg / dailyKg);
      if (daysRemaining < minDays) {
        const isCritical = daysRemaining < Math.floor(minDays / 2);
        await upsertNotification({
          tenantId: farm.tenantId,
          farmId: plan.farmId,
          type: "feed_stock_low",
          severity: isCritical ? "critical" : "warning",
          title: isCritical
            ? `Feed Stock Critical — ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} Remaining`
            : `Feed Stock Below Target — ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} Remaining`,
          message: `${farm.name}: total feed stock is ${Math.round(totalKg).toLocaleString()} kg — approximately ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} at current usage (${dailyKg} kg/day). Your contingency plan requires a minimum ${minDays}-day reserve. ${isCritical ? "Order feed urgently and activate your contingency plan." : "Consider placing a feed order to restore stock above the minimum reserve."}`,
          relatedModule: "feed-management",
          dedupeKey: `feed-stock-low-farm${plan.farmId}-week${weekNum}`,
        });
      }
    }

    if (threshKg && totalKg < threshKg) {
      await upsertNotification({
        tenantId: farm.tenantId,
        farmId: plan.farmId,
        type: "feed_stock_low",
        severity: "warning",
        title: `Feed Stock Below Alert Threshold`,
        message: `${farm.name}: total feed stock (${Math.round(totalKg).toLocaleString()} kg) has dropped below your alert threshold of ${Math.round(threshKg).toLocaleString()} kg. Check your feed management records and place an order if needed.`,
        relatedModule: "feed-management",
        dedupeKey: `feed-stock-threshold-farm${plan.farmId}-week${weekNum}`,
      });
    }
  }
}

async function checkOverdueFeedOrders() {
  const today = new Date().toISOString().substring(0, 10);
  const overdueOrders = await db
    .select({
      id: feedPurchaseOrdersTable.id,
      farmId: feedPurchaseOrdersTable.farmId,
      poNumber: feedPurchaseOrdersTable.poNumber,
      productName: feedPurchaseOrdersTable.productName,
      speciesIntended: feedPurchaseOrdersTable.speciesIntended,
      supplierName: feedPurchaseOrdersTable.supplierName,
      expectedDeliveryDate: feedPurchaseOrdersTable.expectedDeliveryDate,
    })
    .from(feedPurchaseOrdersTable)
    .where(
      and(
        lt(feedPurchaseOrdersTable.expectedDeliveryDate, today),
        sql`${feedPurchaseOrdersTable.status} NOT IN ('received', 'cancelled')`,
        isNotNull(feedPurchaseOrdersTable.expectedDeliveryDate),
      )
    );

  for (const order of overdueOrders) {
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId, name: farmsTable.name })
      .from(farmsTable)
      .where(eq(farmsTable.id, order.farmId))
      .limit(1);
    if (!farm) continue;

    const speciesPart = order.speciesIntended ? ` (for ${order.speciesIntended})` : "";
    const supplierPart = order.supplierName ? ` from ${order.supplierName}` : "";
    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: order.farmId,
      type: "feed_order_overdue",
      severity: "warning",
      title: `Feed Order Overdue: ${order.poNumber}`,
      message: `${farm.name}: feed order ${order.poNumber} for ${order.productName}${speciesPart}${supplierPart} was expected on ${order.expectedDeliveryDate} but has not been received. Chase the supplier and update the order status when the delivery arrives.`,
      relatedModule: "feed-management",
      dedupeKey: `feed-order-overdue-${order.id}-${order.expectedDeliveryDate}`,
    });
  }
}

async function checkOverdueVetPlanActions() {
  const today = new Date();
  const overdueActions = await db
    .select({
      actionId: vetHealthPlanActionsTable.id,
      farmId: vetHealthPlanActionsTable.farmId,
      description: vetHealthPlanActionsTable.description,
      category: vetHealthPlanActionsTable.category,
      nextDueDate: vetHealthPlanActionsTable.nextDueDate,
      planYear: vetHealthPlansTable.planYear,
      vetName: vetHealthPlansTable.vetName,
    })
    .from(vetHealthPlanActionsTable)
    .innerJoin(vetHealthPlansTable, eq(vetHealthPlanActionsTable.planId, vetHealthPlansTable.id))
    .where(and(
      eq(vetHealthPlanActionsTable.isActive, true),
      lt(vetHealthPlanActionsTable.nextDueDate, today),
    ));

  const farms = await db.select({ id: farmsTable.id, name: farmsTable.name }).from(farmsTable);
  const farmMap = Object.fromEntries(farms.map(f => [f.id, f]));

  for (const a of overdueActions) {
    const farm = farmMap[a.farmId];
    if (!farm) continue;
    const dueStr = a.nextDueDate ? new Date(a.nextDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "unknown date";
    await upsertNotification({
      tenantId: a.farmId,
      farmId: a.farmId,
      type: "warning",
      title: `Overdue Health Plan Action — ${a.description.slice(0, 60)}${a.description.length > 60 ? "…" : ""}`,
      message: `${farm.name}: an action from the ${a.planYear} vet health plan (${a.vetName}) was due ${dueStr} but has not been marked complete. Open Livestock → Vet Health Plans → Action Points to record completion or update the due date.`,
      relatedModule: "livestock-management",
      dedupeKey: `vhp-action-overdue-${a.actionId}-${a.nextDueDate?.toISOString().slice(0, 10) ?? "nodate"}`,
    });
  }
}

async function checkPoultryWithdrawalPeriods() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const active = await db
    .select({
      id: poultryTreatmentsTable.id,
      farmId: poultryTreatmentsTable.farmId,
      productName: poultryTreatmentsTable.productName,
      withdrawalClearDate: poultryTreatmentsTable.withdrawalClearDate,
      withdrawalPeriodDays: poultryTreatmentsTable.withdrawalPeriodDays,
    })
    .from(poultryTreatmentsTable)
    .where(gte(poultryTreatmentsTable.withdrawalClearDate, todayIso));

  for (const tx of active) {
    if (!tx.withdrawalClearDate) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, tx.farmId))
      .limit(1);

    if (!farm) continue;

    const clearDate = new Date(tx.withdrawalClearDate);
    const daysRemaining = Math.ceil((clearDate.getTime() - today.getTime()) / 86400000);
    const clearDateStr = clearDate.toLocaleDateString("en-GB");

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: tx.farmId,
      type: "poultry_withdrawal_active",
      severity: daysRemaining <= 3 ? "critical" : "warning",
      title: `Withdrawal Period Active — ${tx.productName}`,
      message: `${tx.productName} treatment has an active withdrawal period. Birds must NOT be sent for slaughter before ${clearDateStr} (${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining). Ensure FCI document reflects this before any birds leave the farm.`,
      relatedModule: "poultry-production",
      relatedId: tx.id,
      dedupeKey: `poultry-withdrawal-${tx.id}-${todayIso}`,
    });
  }
}

async function checkPoultrySchemeExpiry() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const in60 = new Date(today);
  in60.setDate(today.getDate() + 60);
  const in60Iso = in60.toISOString().slice(0, 10);

  const schemes = await db
    .select({
      id: poultrySchemeRecordsTable.id,
      farmId: poultrySchemeRecordsTable.farmId,
      scheme: poultrySchemeRecordsTable.scheme,
      nextAssessmentDue: poultrySchemeRecordsTable.nextAssessmentDue,
    })
    .from(poultrySchemeRecordsTable)
    .where(
      and(
        isNotNull(poultrySchemeRecordsTable.nextAssessmentDue),
        lte(poultrySchemeRecordsTable.nextAssessmentDue, in60Iso),
      )
    );

  for (const scheme of schemes) {
    if (!scheme.nextAssessmentDue) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, scheme.farmId))
      .limit(1);

    if (!farm) continue;

    const dueDate = new Date(scheme.nextAssessmentDue);
    const expired = dueDate < today;
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
    const dueDateStr = dueDate.toLocaleDateString("en-GB");
    const schemeName = scheme.scheme || "Assurance Scheme";

    if (expired) {
      await upsertNotification({
        tenantId: farm.tenantId,
        farmId: scheme.farmId,
        type: "poultry_scheme_overdue",
        severity: "critical",
        title: `${schemeName} Assessment Overdue`,
        message: `The ${schemeName} next assessment was due on ${dueDateStr}. Arrange an inspection immediately — operating outside scheme compliance risks your certification and premium contracts.`,
        relatedModule: "poultry-production",
        relatedId: scheme.id,
        dedupeKey: `poultry-scheme-overdue-${scheme.id}-week${Math.floor(Math.abs(daysUntil) / 7)}`,
      });
      await dispatchSmsForCriticalAlert(farm.tenantId, `${schemeName} Assessment Overdue`, `Assessment was due ${dueDateStr}. Arrange inspection immediately to maintain scheme certification.`);
    } else {
      await upsertNotification({
        tenantId: farm.tenantId,
        farmId: scheme.farmId,
        type: "poultry_scheme_due_soon",
        severity: daysUntil <= 14 ? "critical" : "warning",
        title: `${schemeName} Assessment Due in ${daysUntil} Days`,
        message: `Your ${schemeName} assessment is due on ${dueDateStr}. Ensure all poultry records (mortality, treatments, BWI, biosecurity checklists) are complete and up to date before the assessor visit.`,
        relatedModule: "poultry-production",
        relatedId: scheme.id,
        dedupeKey: `poultry-scheme-due-${scheme.id}-days${Math.floor(daysUntil / 7)}`,
      });
    }
  }
}

async function checkPoultryBwiAlerts() {
  const RECENT_DAYS = 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const failedAssessments = await db
    .select({
      id: poultryBroilerWelfareTable.id,
      farmId: poultryBroilerWelfareTable.farmId,
      assessmentDate: poultryBroilerWelfareTable.assessmentDate,
      overallOutcome: poultryBroilerWelfareTable.overallOutcome,
      actionsTaken: poultryBroilerWelfareTable.actionsTaken,
    })
    .from(poultryBroilerWelfareTable)
    .where(
      and(
        gte(poultryBroilerWelfareTable.assessmentDate, cutoffIso),
        sql`lower(${poultryBroilerWelfareTable.overallOutcome}) like '%fail%'`,
      )
    );

  for (const assessment of failedAssessments) {
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, assessment.farmId))
      .limit(1);

    if (!farm) continue;

    const dateStr = assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString("en-GB") : "recent date";

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: assessment.farmId,
      type: "poultry_bwi_fail",
      severity: "critical",
      title: "BWI Assessment Failed — Action Required",
      message: `A Broiler Welfare Indicator assessment on ${dateStr} recorded a Fail outcome. Review pododermatitis, hock burn and gait scores, take corrective action and re-assess. Document actions in the BWI record. This must be resolved before the next Red Tractor audit.`,
      relatedModule: "poultry-production",
      relatedId: assessment.id,
      dedupeKey: `poultry-bwi-fail-${assessment.id}`,
    });

    await dispatchSmsForCriticalAlert(farm.tenantId, "BWI Assessment Failed", `BWI assessment on ${dateStr} failed. Corrective action required before next Red Tractor audit.`);
  }
}

async function checkPigWithdrawalPeriods() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const active = await db
    .select({
      id: pigMedicineTreatmentsTable.id,
      farmId: pigMedicineTreatmentsTable.farmId,
      medicineProductName: pigMedicineTreatmentsTable.medicineProductName,
      withdrawalEndDate: pigMedicineTreatmentsTable.withdrawalEndDate,
    })
    .from(pigMedicineTreatmentsTable)
    .where(gte(pigMedicineTreatmentsTable.withdrawalEndDate, todayIso));

  for (const tx of active) {
    if (!tx.withdrawalEndDate) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, tx.farmId))
      .limit(1);
    if (!farm) continue;

    const clearDate = new Date(tx.withdrawalEndDate);
    const daysRemaining = Math.ceil((clearDate.getTime() - today.getTime()) / 86400000);
    const clearDateStr = clearDate.toLocaleDateString("en-GB");

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: tx.farmId,
      type: "pig_withdrawal_active",
      severity: daysRemaining <= 3 ? "critical" : "warning",
      title: `Pig Withdrawal Period Active — ${tx.medicineProductName}`,
      message: `${tx.medicineProductName} has an active meat withdrawal period. Pigs must NOT go to slaughter before ${clearDateStr} (${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining). Ensure FCI document reflects this before any pigs leave the farm.`,
      relatedModule: "pig-production",
      relatedId: tx.id,
      dedupeKey: `pig-withdrawal-${tx.id}-${todayIso}`,
    });
  }
}

async function checkPigRedTractorExpiry() {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const in60 = new Date(today);
  in60.setDate(today.getDate() + 60);
  const in60Iso = in60.toISOString().slice(0, 10);

  const checklists = await db
    .select({
      id: pigRedTractorChecklistTable.id,
      farmId: pigRedTractorChecklistTable.farmId,
      nextAssessmentDue: pigRedTractorChecklistTable.nextAssessmentDue,
    })
    .from(pigRedTractorChecklistTable)
    .where(
      and(
        isNotNull(pigRedTractorChecklistTable.nextAssessmentDue),
        lte(pigRedTractorChecklistTable.nextAssessmentDue, in60Iso),
      )
    );

  for (const checklist of checklists) {
    if (!checklist.nextAssessmentDue) continue;

    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, checklist.farmId))
      .limit(1);
    if (!farm) continue;

    const dueDate = new Date(checklist.nextAssessmentDue);
    const expired = dueDate < today;
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
    const dueDateStr = dueDate.toLocaleDateString("en-GB");

    if (expired) {
      await upsertNotification({
        tenantId: farm.tenantId,
        farmId: checklist.farmId,
        type: "pig_red_tractor_overdue",
        severity: "critical",
        title: "Pig Red Tractor Assessment Overdue",
        message: `The Red Tractor Pig assurance assessment was due on ${dueDateStr}. Arrange an inspection immediately — operating outside scheme compliance risks your certification and premium contracts.`,
        relatedModule: "pig-production",
        relatedId: checklist.id,
        dedupeKey: `pig-rt-overdue-${checklist.id}-week${Math.floor(Math.abs(daysUntil) / 7)}`,
      });
      await dispatchSmsForCriticalAlert(farm.tenantId, "Pig Red Tractor Assessment Overdue", `Assessment was due ${dueDateStr}. Arrange inspection immediately to maintain scheme certification.`);
    } else {
      await upsertNotification({
        tenantId: farm.tenantId,
        farmId: checklist.farmId,
        type: "pig_red_tractor_due_soon",
        severity: daysUntil <= 14 ? "critical" : "warning",
        title: `Pig Red Tractor Assessment Due in ${daysUntil} Days`,
        message: `Your Red Tractor Pig assessment is due on ${dueDateStr}. Ensure all pig records (stockmanship checks, medicine register, movements, tail biting risk assessments, FCI documents) are complete and up to date before the assessor visit.`,
        relatedModule: "pig-production",
        relatedId: checklist.id,
        dedupeKey: `pig-rt-due-${checklist.id}-days${Math.floor(daysUntil / 7)}`,
      });
    }
  }
}

async function checkPigTailBitingOutbreaks() {
  const RECENT_DAYS = 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const highRisk = await db
    .select({
      id: pigTailBitingRisksTable.id,
      farmId: pigTailBitingRisksTable.farmId,
      assessmentDate: pigTailBitingRisksTable.assessmentDate,
      riskLevel: pigTailBitingRisksTable.riskLevel,
    })
    .from(pigTailBitingRisksTable)
    .where(
      and(
        gte(pigTailBitingRisksTable.assessmentDate, cutoffIso),
        sql`${pigTailBitingRisksTable.riskLevel} in ('high', 'active')`,
      )
    );

  for (const assessment of highRisk) {
    const [farm] = await db
      .select({ tenantId: farmsTable.tenantId })
      .from(farmsTable)
      .where(eq(farmsTable.id, assessment.farmId))
      .limit(1);
    if (!farm) continue;

    const dateStr = assessment.assessmentDate ? new Date(assessment.assessmentDate).toLocaleDateString("en-GB") : "recent date";
    const isActive = assessment.riskLevel === "active";

    await upsertNotification({
      tenantId: farm.tenantId,
      farmId: assessment.farmId,
      type: "pig_tail_biting_outbreak",
      severity: isActive ? "critical" : "warning",
      title: isActive ? "Active Tail Biting Outbreak — Immediate Action Required" : "High Tail Biting Risk Recorded",
      message: isActive
        ? `A tail biting assessment on ${dateStr} recorded an active outbreak. Remove biters immediately, treat wounds, add enrichment material (straw, chains), and increase monitoring to twice daily. Document all interventions. Notify your vet if injuries are severe.`
        : `A tail biting risk assessment on ${dateStr} recorded a HIGH risk level. Review enrichment provision, stocking density, group stability and feeding adequacy. Increase monitoring frequency and update your risk assessment once corrective actions are in place.`,
      relatedModule: "pig-production",
      relatedId: assessment.id,
      dedupeKey: `pig-tail-biting-${assessment.riskLevel}-${assessment.id}`,
    });

    if (isActive) {
      await dispatchSmsForCriticalAlert(farm.tenantId, "Active Tail Biting Outbreak", `Tail biting outbreak recorded on ${dateStr}. Remove biters, treat wounds, add enrichment. Notify vet if injuries are severe.`);
    }
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
    await checkFeedStockLevels();
    await checkOverdueFeedOrders();
    await checkOverdueVetPlanActions();
    await checkPoultryWithdrawalPeriods();
    await checkPoultrySchemeExpiry();
    await checkPoultryBwiAlerts();
    await checkPigWithdrawalPeriods();
    await checkPigRedTractorExpiry();
    await checkPigTailBitingOutbreaks();
    console.log("[ALERTS] Alerting job completed");
  } catch (err) {
    console.error("[ALERTS] Alerting job error:", err);
  }
}

let lastDigestDay = -1;

function maybeRunWeeklyDigest() {
  const now = new Date();
  const isMonday = now.getUTCDay() === 1;
  const isDigestHour = now.getUTCHours() === 7;
  const today = now.getUTCDate();

  if (isMonday && isDigestHour && lastDigestDay !== today) {
    lastDigestDay = today;
    runWeeklyDigest().catch((err) => console.error("[ALERTS] Weekly digest error:", err));
  }
}

export function startAlertingJob() {
  const INTERVAL_MS = 60 * 60 * 1000;

  runAlertingJob();
  setInterval(() => {
    runAlertingJob();
    maybeRunWeeklyDigest();
  }, INTERVAL_MS);
  console.log("[ALERTS] Alerting job scheduled (runs every hour; digest every Monday 07:00 UTC)");
}
