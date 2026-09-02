import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Farm, Subscription } from "@/lib/api";

export type FarmReportType = "livestock" | "dairy";

const REPORT_MODULE_GROUPS: ReadonlyArray<{
  type: FarmReportType;
  moduleKeys: ReadonlyArray<string>;
}> = [
  {
    type: "livestock",
    moduleKeys: [
      "livestock-management", "livestock", "beef-production", "sheep-production",
      "goat-production", "venison-production", "organic-livestock", "pig-production",
      "poultry-production", "organic-venison", "organic-poultry",
    ],
  },
  {
    type: "dairy",
    moduleKeys: [
      "dairy-management", "sheep-dairy", "goat-dairy", "organic-dairy",
      "organic-sheep-dairy", "organic-goat-dairy",
    ],
  },
];

function isCurrentSubscription(subscription: Subscription, now: number): boolean {
  return subscription.status === "active" ||
    (subscription.status === "trial" &&
      (!subscription.currentPeriodEnd || new Date(subscription.currentPeriodEnd).getTime() > now));
}

export function getFarmReportTypes(
  subscriptions: Subscription[],
  now = Date.now(),
): FarmReportType[] {
  const activeModuleKeys = new Set(
    subscriptions
      .filter((subscription) => isCurrentSubscription(subscription, now))
      .map((subscription) => subscription.moduleKey),
  );

  return REPORT_MODULE_GROUPS
    .filter((group) => group.moduleKeys.some((moduleKey) => activeModuleKeys.has(moduleKey)))
    .map((group) => group.type);
}

function isFilled(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getFarmSettingsMissingFields(farm: Farm): string[] {
  const missingFields: string[] = [];

  if (!isFilled(farm.address)) missingFields.push("farm address");
  if (!isFilled(farm.cphNumber)) missingFields.push("CPH number");
  if (!isFilled(farm.sbiNumber)) missingFields.push("SBI number");

  const relevantMarks: Array<{ label: string; filled: boolean }> = [];
  if (farm.sectorBeef || farm.sectorDairy) {
    relevantMarks.push({ label: "herd mark", filled: isFilled(farm.herdMark) });
  }
  if (farm.sectorSheep || farm.sectorGoats) {
    relevantMarks.push({ label: "flock mark", filled: isFilled(farm.flockMark) });
  }
  if (farm.sectorPigs) {
    relevantMarks.push({ label: "pig herd mark", filled: isFilled(farm.pigHerdMark) });
  }

  if (relevantMarks.length > 0) {
    missingFields.push(...relevantMarks.filter((mark) => !mark.filled).map((mark) => mark.label));
  } else if (![farm.herdMark, farm.flockMark, farm.pigHerdMark].some(isFilled)) {
    missingFields.push("herd / flock mark");
  }

  return missingFields;
}

function formatReportTypes(reportTypes: FarmReportType[]): string {
  return reportTypes.join(" & ");
}

export function FarmSettingsStatus({
  farm,
  reportTypes,
}: {
  farm: Farm;
  reportTypes: FarmReportType[];
}) {
  if (reportTypes.length === 0) return null;

  const reportLabel = formatReportTypes(reportTypes);
  const missingFields = getFarmSettingsMissingFields(farm);
  const complete = missingFields.length === 0;

  return (
    <div
      role="status"
      title={complete
        ? `Farm address, CPH, SBI and livestock marks are filled in for ${reportLabel} reports`
        : `Missing ${missingFields.join(", ")} for ${reportLabel} report headers`}
      className={`mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
        complete
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {complete
        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
        : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />}
      <span className="font-medium">
        {complete ? "Farm settings complete" : `Farm settings incomplete · missing ${missingFields.join(", ")}`}
      </span>
      <span className="truncate text-[11px] opacity-80">({reportLabel} reports)</span>
    </div>
  );
}