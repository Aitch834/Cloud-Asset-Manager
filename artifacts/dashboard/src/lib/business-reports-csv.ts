export const AGRI_ENV_GRANT_CSV_HEADERS = [
  "Claimed this year",
  "Total grant value",
  "All-time claimed",
  "Remaining grant value",
] as const;

export const PL_CSV_HEADERS = [
  "Line Item",
  ...AGRI_ENV_GRANT_CSV_HEADERS,
  "Note",
] as const;

interface AgriEnvProjectForCsv {
  schemeName?: string | null;
  yearClaimedPence?: number | null;
  totalGrantValuePence?: number | null;
  allTimeClaimedPence?: number | null;
}

function formatPence(pence: number | null | undefined): string {
  if (pence == null) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildAgriEnvProjectCsvRows(
  projects: AgriEnvProjectForCsv[],
): (string | number)[][] {
  return projects.map((project) => {
    const remaining = project.totalGrantValuePence != null
      ? project.totalGrantValuePence - (project.allTimeClaimedPence ?? 0)
      : null;

    return [
      `  ↳ ${project.schemeName}`,
      formatPence(project.yearClaimedPence),
      project.totalGrantValuePence != null ? formatPence(project.totalGrantValuePence) : "—",
      project.allTimeClaimedPence != null ? formatPence(project.allTimeClaimedPence) : "—",
      remaining != null ? formatPence(remaining) : "—",
    ];
  });
}

export function buildPlAgriEnvProjectCsvRows(
  projects: AgriEnvProjectForCsv[],
): (string | number)[][] {
  return buildAgriEnvProjectCsvRows(projects).map((row) => [...row, ""]);
}
