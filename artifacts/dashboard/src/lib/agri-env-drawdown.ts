export interface AgriEnvDrawdownProject {
  id: number;
  status: string;
  totalGrantValuePence: number | null;
}

export interface AgriEnvDrawdownMilestone {
  projectId: number;
  status: string;
  claimAmountPence: number | null;
}

export interface AgriEnvDrawdownSummary {
  eligibleProjects: AgriEnvDrawdownProject[];
  totalPence: number;
  paidPence: number;
  submittedPence: number;
  paidPercentage: number;
  submittedPercentage: number;
}

const ACTIVE_AGRI_ENV_PROJECT_STATUSES = new Set([
  "active",
  "applied",
  "pending",
]);

/**
 * Calculates the values shown in the farm-wide agri-environment drawdown card.
 *
 * Projects without a grant value cannot contribute to drawdown, and only
 * active, applied, and pending projects are still eligible to be drawn down.
 * Milestones are scoped to that same eligible project set.
 */
export function calculateAgriEnvDrawdown(
  projects: AgriEnvDrawdownProject[],
  milestones: AgriEnvDrawdownMilestone[],
): AgriEnvDrawdownSummary {
  const eligibleProjects = projects.filter(
    (project) =>
      ACTIVE_AGRI_ENV_PROJECT_STATUSES.has(project.status) &&
      (project.totalGrantValuePence ?? 0) > 0,
  );
  const eligibleProjectIds = new Set(eligibleProjects.map((project) => project.id));
  const totalPence = eligibleProjects.reduce(
    (sum, project) => sum + (project.totalGrantValuePence ?? 0),
    0,
  );
  const paidPence = milestones
    .filter(
      (milestone) =>
        eligibleProjectIds.has(milestone.projectId) &&
        milestone.status === "paid",
    )
    .reduce((sum, milestone) => sum + (milestone.claimAmountPence ?? 0), 0);
  const submittedPence = milestones
    .filter(
      (milestone) =>
        eligibleProjectIds.has(milestone.projectId) &&
        milestone.status === "submitted",
    )
    .reduce((sum, milestone) => sum + (milestone.claimAmountPence ?? 0), 0);
  const paidPercentage = totalPence > 0
    ? Math.min(100, Math.round((paidPence / totalPence) * 100))
    : 0;
  const submittedPercentage = totalPence > 0
    ? Math.min(
        100 - paidPercentage,
        Math.round((submittedPence / totalPence) * 100),
      )
    : 0;

  return {
    eligibleProjects,
    totalPence,
    paidPence,
    submittedPence,
    paidPercentage,
    submittedPercentage,
  };
}