export interface AgriEnvDeadlineProject {
  id: number;
  schemeName: string;
}

export interface AgriEnvDeadlineMilestone {
  projectId: number;
  dueDate: string | null;
  status: string;
}

function deadlineStatus(
  dateStr: string | null,
  now: Date,
): "overdue" | "warning" | "ok" | "none" {
  if (!dateStr) return "none";
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / 86_400_000);
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 30) return "warning";
  return "ok";
}

export function getMilestoneDeadlineCounts(
  projects: AgriEnvDeadlineProject[],
  milestones: AgriEnvDeadlineMilestone[],
  schemeFilter: string,
  now = new Date(),
): { overdue: number; upcoming: number } {
  const normalizedFilter = schemeFilter.trim().toLowerCase();
  const schemeProjects = normalizedFilter
    ? projects.filter(p => p.schemeName.toLowerCase().includes(normalizedFilter))
    : projects;
  const schemeProjectIds = new Set(schemeProjects.map(p => p.id));
  const pendingMilestones = milestones.filter(
    m => m.status !== "paid" && schemeProjectIds.has(m.projectId),
  );

  return {
    overdue: pendingMilestones.filter(m => deadlineStatus(m.dueDate, now) === "overdue").length,
    upcoming: pendingMilestones.filter(m => deadlineStatus(m.dueDate, now) === "warning").length,
  };
}