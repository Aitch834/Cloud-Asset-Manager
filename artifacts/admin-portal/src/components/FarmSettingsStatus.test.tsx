import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Farm, Subscription } from "@/lib/api";
import {
  FarmSettingsStatus,
  getFarmReportTypes,
  getFarmSettingsMissingFields,
} from "./FarmSettingsStatus";

const completeFarm: Farm = {
  id: 1,
  tenantId: 1,
  name: "Hill Farm",
  address: "1 Farm Lane",
  cphNumber: "12/345/6789",
  sbiNumber: "123456789",
  herdMark: "UK123456",
  sectorDairy: true,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
};

function subscription(moduleKey: string, overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 1,
    farmId: 1,
    moduleId: 1,
    moduleKey,
    moduleName: moduleKey,
    status: "active",
    ...overrides,
  };
}

describe("FarmSettingsStatus", () => {
  it("shows a complete dairy status only when report header and livestock fields are present", () => {
    render(<FarmSettingsStatus farm={completeFarm} reportTypes={["dairy"]} />);

    expect(screen.getByRole("status").textContent).toContain("Farm settings complete");
    expect(screen.getByRole("status").textContent).toContain("(dairy reports)");
  });

  it("lists missing livestock identifiers instead of showing a misleading complete state", () => {
    render(
      <FarmSettingsStatus
        farm={{ ...completeFarm, cphNumber: "", herdMark: "" }}
        reportTypes={["livestock"]}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain("Farm settings incomplete");
    expect(screen.getByRole("status").textContent).toContain("CPH number");
    expect(screen.getByRole("status").textContent).toContain("herd mark");
  });

  it("requires the mark that matches the farm's livestock sectors", () => {
    expect(getFarmSettingsMissingFields({
      ...completeFarm,
      sectorDairy: false,
      sectorSheep: true,
      herdMark: "UK123456",
      flockMark: "",
    })).toContain("flock mark");
  });

  it("labels mixed livestock and dairy subscriptions together", () => {
    render(
      <FarmSettingsStatus
        farm={completeFarm}
        reportTypes={getFarmReportTypes([
          subscription("livestock-management"),
          subscription("dairy-management", { id: 2, moduleId: 2 }),
        ])}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain("(livestock & dairy reports)");
  });

  it("ignores arable subscriptions and expired trials", () => {
    const now = Date.parse("2026-09-02T12:00:00Z");

    expect(getFarmReportTypes([subscription("field-crop-management")], now)).toEqual([]);
    expect(getFarmReportTypes([
      subscription("dairy-management", {
        status: "trial",
        currentPeriodEnd: "2026-09-01T12:00:00Z",
      }),
    ], now)).toEqual([]);
  });
});