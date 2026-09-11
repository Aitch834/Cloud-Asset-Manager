import { describe, expect, it } from "vitest";
import { resolvePersistedFilterValue } from "./use-persisted-filter";

const baseYieldSortColumns = ["", "name", "total:kg", "total:tha"];

function yieldSortColumns(...vintages: string[]) {
  return [
    ...baseYieldSortColumns,
    ...vintages.flatMap(vintage => [`vy:kg:${vintage}`, `vy:tha:${vintage}`]),
  ];
}

function chemistrySortColumns(...vintages: string[]) {
  return ["", "name", "avg", ...vintages];
}

describe("resolvePersistedFilterValue", () => {
  it("falls back when a saved vintage sort column has been removed", () => {
    const currentColumns = yieldSortColumns("2024", "2025");

    expect(resolvePersistedFilterValue("vy:kg:2023", "", currentColumns)).toBe("");
    expect(resolvePersistedFilterValue("total:kg", "", currentColumns)).toBe("total:kg");
  });

  it("keeps each farm's valid saved vintage sort when the farm changes", () => {
    const farmAColumns = yieldSortColumns("2022", "2023");
    const farmBColumns = yieldSortColumns("2024", "2025");

    expect(resolvePersistedFilterValue("vy:tha:2022", "", farmAColumns)).toBe("vy:tha:2022");
    expect(resolvePersistedFilterValue("vy:kg:2025", "", farmBColumns)).toBe("vy:kg:2025");
    expect(resolvePersistedFilterValue("vy:tha:2022", "", farmBColumns)).toBe("");
  });

  it("falls back to alphabetical block order when a saved chemistry vintage is removed", () => {
    const currentColumns = chemistrySortColumns("2024", "2025");

    expect(resolvePersistedFilterValue("2023", "", currentColumns)).toBe("");
    expect(resolvePersistedFilterValue("name", "", currentColumns)).toBe("name");
    expect(resolvePersistedFilterValue("avg", "", currentColumns)).toBe("avg");
  });

  it("keeps valid saved chemistry sorts isolated by each farm's visible vintages", () => {
    const farmAColumns = chemistrySortColumns("2022", "2023");
    const farmBColumns = chemistrySortColumns("2024", "2025");

    expect(resolvePersistedFilterValue("2022", "", farmAColumns)).toBe("2022");
    expect(resolvePersistedFilterValue("2025", "", farmBColumns)).toBe("2025");
    expect(resolvePersistedFilterValue("2022", "", farmBColumns)).toBe("");
  });
});
