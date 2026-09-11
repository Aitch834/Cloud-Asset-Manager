import fs from "node:fs";
import path from "node:path";

import {
  canonicalisePhenologyDate,
  filterPhenologyRecordsByDateRange,
  getPersistablePhenologyDateRange,
  isPhenologyDateInvalid,
  parsePersistedPhenologyDateRange,
  type PhenologyDateRecord,
} from "../lib/vinePhenologyDateFilter";

const screenSource = fs.readFileSync(
  path.resolve(__dirname, "../app/vine-phenology-history.tsx"),
  "utf8",
);

const records: PhenologyDateRecord[] = [
  { observationDate: "2024-04-12" },
  { observationDate: "2024-06-20" },
  { observationDate: "2024-09-03" },
];

describe("vine phenology date filter", () => {
  it("does not treat partial dates as errors", () => {
    expect(canonicalisePhenologyDate("12/")).toBeNull();
    expect(canonicalisePhenologyDate("2024-")).toBeNull();
    expect(isPhenologyDateInvalid("12/")).toBe(false);
    expect(isPhenologyDateInvalid("2024-")).toBe(false);
    expect(isPhenologyDateInvalid("2024-02-")).toBe(true);
  });

  it("does not narrow records until a complete valid date is entered", () => {
    expect(filterPhenologyRecordsByDateRange(records, "12/", "")).toEqual(records);
    expect(filterPhenologyRecordsByDateRange(records, "2024-", "")).toEqual(records);
    expect(filterPhenologyRecordsByDateRange(records, "12/06/2024", "")).toEqual([
      { observationDate: "2024-06-20" },
      { observationDate: "2024-09-03" },
    ]);
  });

  it("only shows the invalid state after eight characters", () => {
    expect(isPhenologyDateInvalid("1234567")).toBe(false);
    expect(isPhenologyDateInvalid("12345678")).toBe(true);
  });

  it("returns every record when both date fields are cleared", () => {
    expect(filterPhenologyRecordsByDateRange(records, "", "")).toEqual(records);
  });

  it("persists only a complete valid ordered range", () => {
    expect(getPersistablePhenologyDateRange("12/04/2024", "2024-09-03")).toEqual({
      from: "2024-04-12",
      to: "2024-09-03",
    });
    expect(getPersistablePhenologyDateRange("12/", "03/09/2024")).toBeNull();
    expect(getPersistablePhenologyDateRange("31/02/2024", "03/09/2024")).toBeNull();
    expect(getPersistablePhenologyDateRange("03/09/2024", "12/04/2024")).toBeNull();
  });

  it("rejects malformed or partial saved ranges", () => {
    expect(parsePersistedPhenologyDateRange({ from: "2024-04-12", to: "2024-09-03" })).toEqual({
      from: "2024-04-12",
      to: "2024-09-03",
    });
    expect(parsePersistedPhenologyDateRange({ from: "2024-04-", to: "2024-09-03" })).toBeNull();
    expect(parsePersistedPhenologyDateRange({ from: "2024-04-12" })).toBeNull();
    expect(parsePersistedPhenologyDateRange("not a range")).toBeNull();
  });

  it("clears both date bounds from the dedicated X control", () => {
    const clearControlIndex = screenSource.indexOf("style={styles.dateRangeClear}");
    const clearControlSource = screenSource.slice(clearControlIndex - 260, clearControlIndex);

    expect(clearControlIndex).toBeGreaterThanOrEqual(0);
    expect(clearControlSource).toContain("onPress={clearDateRange}");
    expect(screenSource).toContain("AsyncStorage.removeItem(`bde_vine_phenology_date_range_${farmId}`)");
  });
});