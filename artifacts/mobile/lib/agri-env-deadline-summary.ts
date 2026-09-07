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
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!dateOnlyMatch) return "none";
  const [, year, month, day] = dateOnlyMatch;
  const dueDay = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntilDue = Math.round((dueDay - today) / 86_400_000);
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