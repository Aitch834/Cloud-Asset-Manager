export interface AgriEnvMilestoneRecord {
  id: number;
  projectId: number;
  milestoneName: string;
  dueDate: string | null;
  status: string;
  schemeName: string;
}

export interface AgriEnvHomeMilestone {
  id: number;
  projectId: number;
  milestoneName: string;
  dueDate: string;
  status: string;
  schemeName: string;
  isOverdue: boolean;
}

export interface AgriEnvMilestoneSections {
  upcoming: AgriEnvHomeMilestone[];
  past: AgriEnvHomeMilestone[];
}

function dueDateAtNoon(dueDate: string): Date {
  return new Date(`${dueDate.slice(0, 10)}T12:00:00`);
}

function toHomeMilestone(
  milestone: AgriEnvMilestoneRecord,
  today: Date,
): AgriEnvHomeMilestone {
  const dueDate = milestone.dueDate!;
  return {
    id: milestone.id,
    projectId: milestone.projectId,
    milestoneName: milestone.milestoneName,
    dueDate,
    status: milestone.status,
    schemeName: milestone.schemeName,
    isOverdue: dueDateAtNoon(dueDate) < today,
  };
}

export function getAgriEnvMilestoneSections(
  milestones: AgriEnvMilestoneRecord[],
  now = new Date(),
  horizonDays = 90,
): AgriEnvMilestoneSections {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + horizonDays);

  const upcoming = milestones
    .filter((milestone) => {
      if (!milestone.dueDate) return false;
      if (["paid", "completed", "cancelled"].includes(milestone.status)) return false;
      return dueDateAtNoon(milestone.dueDate) <= horizon;
    })
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 5)
    .map((milestone) => toHomeMilestone(milestone, today));

  const past = milestones
    .filter((milestone) => {
      if (!milestone.dueDate || dueDateAtNoon(milestone.dueDate) >= today) return false;
      // Pending/overdue rows remain in the actionable deadline section, so
      // they are not duplicated in the historical section below it.
      return milestone.status !== "pending" && milestone.status !== "overdue";
    })
    .sort((a, b) => b.dueDate!.localeCompare(a.dueDate!))
    .map((milestone) => toHomeMilestone(milestone, today));

  return { upcoming, past };
}

export function formatAgriEnvMilestoneStatus(status: string): string {
  const readable = status.replace(/[-_]/g, " ").trim();
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : "Unknown";
}