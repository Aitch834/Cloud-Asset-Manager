/**
 * Tests for the unlinked-record CSV warning on viticulture CSV exports.
 *
 * Every viticulture tab that exports CSV (Phenology, Scouting, Spray Diary,
 * and the three Harvest export functions) now uses the shared production
 * helpers `buildViticultureUnlinkedWarning` and `buildViticultureCsvContent`
 * from `@/lib/csv`. This file tests those helpers directly, so any regression
 * in their logic will break these tests.
 *
 * Two properties are verified:
 *   1. Warning row present (with correct N, singular vs. plural) when unlinked
 *      records exist.
 *   2. Warning row absent when all records are linked.
 *
 * Coverage:
 *   - buildViticultureUnlinkedWarning  (shared helper, used by all tabs)
 *   - buildViticultureCsvContent       (used by exportCSV → Phenology,
 *                                       Scouting, Spray Diary)
 *   - HarvestTab's warningLine pattern (`_w ? _w + "\n" : ""`, used in
 *                                       exportHarvestCSV / exportBlockSummaryCSV
 *                                       / exportWineGBSurveyCSV)
 */

import { describe, it, expect } from "vitest";
import {
  buildViticultureUnlinkedWarning,
  buildViticultureCsvContent,
} from "./csv";

// ─── Test data ────────────────────────────────────────────────────────────────

const LINKED: Record<string, unknown> = {
  id: 1,
  blockId: 42,
  observationDate: "2024-06-15",
  bbchStage: "55",
  observer: "Alice",
};

const UNLINKED: Record<string, unknown> = {
  id: 2,
  blockId: null,
  observationDate: "2024-07-01",
  bbchStage: "71",
  observer: "Bob",
};

const UNLINKED2: Record<string, unknown> = {
  id: 3,
  blockId: undefined,
  observationDate: "2024-07-10",
  bbchStage: "77",
  observer: "Carol",
};

const COLS = [
  { key: "observationDate", label: "Date" },
  { key: "bbchStage", label: "BBCH Stage" },
  { key: "observer", label: "Observer" },
];

// ─── buildViticultureUnlinkedWarning ─────────────────────────────────────────

describe("buildViticultureUnlinkedWarning", () => {
  it("returns undefined when the row set is empty", () => {
    expect(buildViticultureUnlinkedWarning([])).toBeUndefined();
  });

  it("returns undefined when all rows have a truthy blockId", () => {
    expect(
      buildViticultureUnlinkedWarning([LINKED, { ...LINKED, id: 5, blockId: 99 }]),
    ).toBeUndefined();
  });

  it("returns a string when one row is unlinked (null blockId)", () => {
    const result = buildViticultureUnlinkedWarning([LINKED, UNLINKED]);
    expect(result).toBeDefined();
  });

  it("returns a string when one row is unlinked (undefined blockId)", () => {
    const result = buildViticultureUnlinkedWarning([LINKED, UNLINKED2]);
    expect(result).toBeDefined();
  });

  it("contains the correct singular count — '1 record'", () => {
    const result = buildViticultureUnlinkedWarning([LINKED, UNLINKED]);
    expect(result).toContain("1 record not linked");
    expect(result).not.toMatch(/1 records/);
  });

  it("contains the correct plural count — '2 records'", () => {
    const result = buildViticultureUnlinkedWarning([LINKED, UNLINKED, UNLINKED2]);
    expect(result).toContain("2 records not linked");
  });

  it("counts correctly with only unlinked rows", () => {
    const result = buildViticultureUnlinkedWarning([UNLINKED, UNLINKED2]);
    expect(result).toContain("2 records not linked");
  });

  it("treats blockId:0 as unlinked (falsy)", () => {
    const row0: Record<string, unknown> = { ...LINKED, blockId: 0 };
    const result = buildViticultureUnlinkedWarning([row0]);
    expect(result).toContain("1 record not linked");
  });

  it("treats blockId:'' as unlinked (falsy)", () => {
    const rowEmpty: Record<string, unknown> = { ...LINKED, blockId: "" };
    const result = buildViticultureUnlinkedWarning([rowEmpty]);
    expect(result).toContain("1 record not linked");
  });

  it("includes the standard message suffix", () => {
    const result = buildViticultureUnlinkedWarning([UNLINKED])!;
    expect(result).toContain("not linked to a block");
    expect(result).toContain("block-level totals may be incomplete");
  });

  it("wraps the message in CSV double-quotes", () => {
    const result = buildViticultureUnlinkedWarning([UNLINKED])!;
    expect(result).toMatch(/^".*"$/);
  });
});

// ─── buildViticultureCsvContent — Phenology / Scouting / Spray Diary path ────
//
// These tabs call:
//   exportCSV(rows, filename, cols, buildViticultureUnlinkedWarning(rows))
// which delegates the content-building to buildViticultureCsvContent.

describe("buildViticultureCsvContent — exportCSV path (Phenology, Scouting, Spray Diary)", () => {
  describe("all records linked → no warning", () => {
    it("does NOT include a WARNING line", () => {
      const warning = buildViticultureUnlinkedWarning([LINKED]);
      const csv = buildViticultureCsvContent([LINKED], COLS, warning);
      expect(csv).not.toContain("WARNING");
    });

    it("starts with the BOM then the column header on the first line", () => {
      const warning = buildViticultureUnlinkedWarning([LINKED]);
      const csv = buildViticultureCsvContent([LINKED], COLS, warning);
      const firstLine = csv.slice(1).split("\n")[0]; // drop BOM
      expect(firstLine).toContain('"Date"');
      expect(firstLine).toContain('"BBCH Stage"');
    });

    it("includes every data row", () => {
      const warning = buildViticultureUnlinkedWarning([LINKED]);
      const csv = buildViticultureCsvContent([LINKED], COLS, warning);
      expect(csv).toContain("2024-06-15");
      expect(csv).toContain("Alice");
    });
  });

  describe("one record unlinked → singular warning", () => {
    it("prepends the warning as the very first line (after BOM)", () => {
      const rows = [LINKED, UNLINKED];
      const warning = buildViticultureUnlinkedWarning(rows);
      const csv = buildViticultureCsvContent(rows, COLS, warning);
      const lines = csv.slice(1).split("\n"); // drop BOM
      expect(lines[0]).toContain("WARNING");
    });

    it("places the column header on the second line", () => {
      const rows = [LINKED, UNLINKED];
      const warning = buildViticultureUnlinkedWarning(rows);
      const csv = buildViticultureCsvContent(rows, COLS, warning);
      const lines = csv.slice(1).split("\n");
      expect(lines[1]).toContain('"Date"');
    });

    it("warning contains singular '1 record'", () => {
      const rows = [LINKED, UNLINKED];
      const warning = buildViticultureUnlinkedWarning(rows);
      const csv = buildViticultureCsvContent(rows, COLS, warning);
      expect(csv).toContain("1 record not linked");
      expect(csv).not.toMatch(/1 records/);
    });
  });

  describe("multiple records unlinked → plural warning", () => {
    it("warning contains the correct plural count", () => {
      const rows = [LINKED, UNLINKED, UNLINKED2];
      const warning = buildViticultureUnlinkedWarning(rows);
      const csv = buildViticultureCsvContent(rows, COLS, warning);
      expect(csv).toContain("2 records not linked");
    });

    it("counts correctly when all rows are unlinked", () => {
      const rows = [UNLINKED, UNLINKED2];
      const warning = buildViticultureUnlinkedWarning(rows);
      const csv = buildViticultureCsvContent(rows, COLS, warning);
      expect(csv).toContain("2 records not linked");
    });
  });

  it("includes the UTF-8 BOM as the very first character", () => {
    const csv = buildViticultureCsvContent([LINKED], COLS);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
});

// ─── HarvestTab warningLine pattern ──────────────────────────────────────────
//
// HarvestTab's three export functions (exportHarvestCSV, exportBlockSummaryCSV,
// exportWineGBSurveyCSV) use:
//
//   const _w = buildViticultureUnlinkedWarning(rows);
//   const warningLine = _w ? _w + "\n" : "";
//
// We verify that pattern here using the real production helper.

function harvestWarningLine(rows: Record<string, unknown>[]): string {
  const _w = buildViticultureUnlinkedWarning(rows);
  return _w ? _w + "\n" : "";
}

describe("HarvestTab warningLine pattern (exportHarvestCSV / exportBlockSummaryCSV / exportWineGBSurveyCSV)", () => {
  describe("all records linked → no warning", () => {
    it("returns empty string when row set is empty", () => {
      expect(harvestWarningLine([])).toBe("");
    });

    it("returns empty string when all rows are linked", () => {
      expect(harvestWarningLine([LINKED])).toBe("");
    });
  });

  describe("one record unlinked → singular warning", () => {
    it("returns a non-empty string", () => {
      expect(harvestWarningLine([LINKED, UNLINKED])).not.toBe("");
    });

    it("contains '1 record' (singular)", () => {
      const result = harvestWarningLine([LINKED, UNLINKED]);
      expect(result).toContain("1 record not linked");
      expect(result).not.toMatch(/1 records/);
    });

    it("ends with a newline so it sits on its own line before CSV content", () => {
      const result = harvestWarningLine([UNLINKED]);
      expect(result).toMatch(/\n$/);
    });

    it("is a double-quoted CSV cell before the newline", () => {
      const line = harvestWarningLine([UNLINKED]).trimEnd();
      expect(line).toMatch(/^".*"$/);
    });
  });

  describe("multiple records unlinked → plural warning", () => {
    it("contains '2 records' for two unlinked rows", () => {
      const result = harvestWarningLine([UNLINKED, UNLINKED2]);
      expect(result).toContain("2 records not linked");
    });

    it("counts correctly with mixed linked and unlinked", () => {
      const result = harvestWarningLine([LINKED, UNLINKED, UNLINKED2]);
      expect(result).toContain("2 records not linked");
    });

    it("counts three unlinked rows correctly", () => {
      const third: Record<string, unknown> = { ...UNLINKED, id: 4 };
      const result = harvestWarningLine([UNLINKED, UNLINKED2, third]);
      expect(result).toContain("3 records not linked");
    });
  });

  it("includes the standard message suffix", () => {
    const result = harvestWarningLine([UNLINKED]);
    expect(result).toContain("not linked to a block");
    expect(result).toContain("block-level totals may be incomplete");
  });
});

// ─── Cross-check: Phenology and Harvest paths agree ──────────────────────────

describe("Phenology and Harvest paths produce consistent warning text", () => {
  it("both warn about the same N when given identical row sets", () => {
    const rows = [LINKED, UNLINKED, UNLINKED2];

    const phenCsv = buildViticultureCsvContent(
      rows,
      COLS,
      buildViticultureUnlinkedWarning(rows),
    );
    const harvestWarning = harvestWarningLine(rows);

    expect(phenCsv).toContain("2 records");
    expect(harvestWarning).toContain("2 records");
  });

  it("both produce no warning when every record is linked", () => {
    const rows = [LINKED, { ...LINKED, id: 5, blockId: 99 }];

    expect(buildViticultureUnlinkedWarning(rows)).toBeUndefined();
    expect(harvestWarningLine(rows)).toBe("");
  });
});
