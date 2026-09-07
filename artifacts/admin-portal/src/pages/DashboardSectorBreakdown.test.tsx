import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Stats } from "@/lib/api";
import Dashboard from "./Dashboard";

const { getStats } = vi.hoisted(() => ({
  getStats: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSecret: () => "test-secret",
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    api: {
      ...actual.api,
      getStats,
    },
  };
});

const baseStats: Stats = {
  totalTenants: 4,
  totalFarms: 6,
  activeSubscriptions: 8,
  totalUsers: 12,
  mrrPence: 12500,
  churnedTenants: 0,
  churnRatePct: 0,
  leadSourceBreakdown: [{ source: "Website", count: 3 }],
  sectorBreakdown: [],
  moduleAdoption: [
    {
      moduleKey: "field-crop-management",
      moduleName: "Field & Crop Management",
      activeCount: 4,
    },
  ],
  websiteVisits: {
    total: 20,
    today: 2,
    thisWeek: 8,
    thisMonth: 20,
    dailyLast14: [],
  },
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function panelFor(title: string): HTMLElement {
  const heading = screen.getByRole("heading", { name: title });
  const panel = heading.parentElement?.parentElement;
  if (!panel) throw new Error(`Could not find panel for ${title}`);
  return panel;
}

describe("Dashboard sector breakdown", () => {
  it("renders populated sector stats beside the existing summary panels", async () => {
    getStats.mockResolvedValue({
      stats: {
        ...baseStats,
        sectorBreakdown: [
          { sector: "Arable", count: 3 },
          { sector: "Viticulture", count: 1 },
        ],
      },
    });

    render(<Dashboard />);

    await screen.findByText("Sector Breakdown");
    const sectorPanel = panelFor("Sector Breakdown");
    expect(within(sectorPanel).getByText("4 leads with sector set")).toBeTruthy();
    expect(within(sectorPanel).getByText("Arable")).toBeTruthy();
    expect(within(sectorPanel).getByText("3 (75%)")).toBeTruthy();
    expect(within(sectorPanel).getByText("Viticulture")).toBeTruthy();
    expect(within(sectorPanel).getByText("1 (25%)")).toBeTruthy();

    expect(screen.getByRole("heading", { name: "Lead Source Breakdown" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Module Adoption" })).toBeTruthy();
  });

  it("renders the no-sector empty state without hiding the existing summary panels", async () => {
    getStats.mockResolvedValue({ stats: baseStats });

    render(<Dashboard />);

    await screen.findByText("Sector Breakdown");
    const sectorPanel = panelFor("Sector Breakdown");
    expect(within(sectorPanel).getByText("0 leads with sector set")).toBeTruthy();
    expect(
      within(sectorPanel).getByText(
        "No sector data yet. Sectors are set when leads register on the website.",
      ),
    ).toBeTruthy();

    expect(screen.getByRole("heading", { name: "Lead Source Breakdown" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Module Adoption" })).toBeTruthy();
  });
});