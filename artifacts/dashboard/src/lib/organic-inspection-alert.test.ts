import { describe, expect, it } from "vitest";
import {
  getOrganicInspectionAlerts,
  hasOrganicComplianceModule,
  ORGANIC_COMPLIANCE_MODULE_KEY,
  type OrganicInspectionAlertRecord,
} from "./organic-inspection-alert";

const TODAY = new Date(2026, 8, 2, 12);

function dateOffset(days: number): string {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function inspection(nextDueDate: string): OrganicInspectionAlertRecord {
  return {
    id: 1,
    certifier: "Soil Association",
    inspectionDate: "2026-08-20",
    nextDueDate,
  };
}

describe("organic inspection dashboard alert", () => {
  it("only allows farms with the organic-compliance module to render the panel", () => {
    expect(hasOrganicComplianceModule(["soil-management", "water-irrigation"])).toBe(false);
    expect(hasOrganicComplianceModule([ORGANIC_COMPLIANCE_MODULE_KEY])).toBe(true);
  });

  it("returns an alert when the latest inspection is due within 60 days", () => {
    expect(getOrganicInspectionAlerts([inspection(dateOffset(30))], TODAY)).toHaveLength(1);
  });

  it("returns no alert when every latest inspection is due beyond 60 days", () => {
    expect(getOrganicInspectionAlerts([inspection(dateOffset(61))], TODAY)).toEqual([]);
  });
});