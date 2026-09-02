import { describe, expect, it } from "vitest";
import {
  buildFpInputLogCsvRows,
  buildFpInputLogPrintRows,
} from "./fp-input-log-export";

const TODAY = new Date(2026, 11, 31, 12, 0, 0);

describe("FP input log derogation countdown", () => {
  it.each([
    ["expiry today", "2026-12-31", 0],
    ["expiry yesterday", "2026-12-30", -1],
    ["expiry tomorrow", "2027-01-01", 1],
  ])("%s is correct in the CSV and print calculation", (_caseName, expiry, expected) => {
    const row = { approvalStatus: "derogation", derogationExpiryDate: expiry };
    const [csvRow] = buildFpInputLogCsvRows([row], TODAY);
    const [printRow] = buildFpInputLogPrintRows([row], TODAY);

    expect(csvRow[6]).toBe(expected);
    expect(printRow).toContain(
      expected < 0
        ? `<span class="expiry-expired">${expected}</span>`
        : `<td>${expected}</td>`,
    );
  });

  it.each([
    ["spring DST boundary", "2027-03-29", new Date(2027, 2, 27, 12, 0, 0), 2],
    ["autumn DST boundary", "2026-10-26", new Date(2026, 9, 24, 12, 0, 0), 2],
  ])("keeps %s as calendar days rather than elapsed hours", (_caseName, expiry, today, expected) => {
    const row = { approvalStatus: "derogation", derogationExpiryDate: expiry };
    expect(buildFpInputLogCsvRows([row], today)[0][6]).toBe(expected);
    expect(buildFpInputLogPrintRows([row], today)[0]).toContain(`<td>${expected}</td>`);
  });

  it("preserves negative values for expired derogations", () => {
    const row = { approvalStatus: "derogation", derogationExpiryDate: "2025-12-31" };
    expect(buildFpInputLogCsvRows([row], TODAY)[0][6]).toBe(-365);
    expect(buildFpInputLogPrintRows([row], TODAY)[0]).toContain(
      `<span class="expiry-expired">-365</span>`,
    );
  });
});