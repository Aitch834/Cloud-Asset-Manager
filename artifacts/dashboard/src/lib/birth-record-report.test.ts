import { describe, expect, it } from "vitest";
import { buildBirthRecordTable, type BirthRecordReportData } from "./birth-record-report";

const base: BirthRecordReportData = {
  species: "sheep",
  recordId: "birth-1",
  birthDate: "2026-02-12",
  damLabel: "UK012345 001",
  offspring: [{ label: "Lamb 1", outcome: "live", sex: "female", tag: "UK012345 101" }],
};

describe("Farm Birth Record report", () => {
  it("renders a single offspring and the non-statutory disclaimer", () => {
    const html = buildBirthRecordTable(base);
    expect(html).toContain("Lamb 1");
    expect(html).toContain("UK012345 101");
    expect(html).toContain("not an official statutory birth certificate");
  });

  it("keeps multiple offspring from one event in one report", () => {
    const html = buildBirthRecordTable({
      ...base,
      offspring: [
        base.offspring[0],
        { label: "Lamb 2", outcome: "stillborn", sex: "male", weightKg: "4.2" },
      ],
      perinatalDisposal: "Collected 13 February · NFAS-22",
    });
    expect(html).toContain("Lamb 1");
    expect(html).toContain("Lamb 2");
    expect(html).toContain("stillborn");
    expect(html).toContain("NFAS-22");
  });

  it("uses em dashes for missing optional values and escapes record text", () => {
    const html = buildBirthRecordTable({ ...base, damLabel: "<script>alert(1)</script>", notes: undefined });
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("—");
  });

  it("includes the organic kidding declarations", () => {
    const html = buildBirthRecordTable({
      ...base,
      species: "goat",
      offspring: [{ label: "Kid 1", outcome: "live" }],
      organic: { statusConfirmed: true, colostrumFromOrganicDoe: false },
    });
    expect(html).toContain("Organic status confirmed");
    expect(html).toContain("Colostrum from organic doe");
    expect(html).toContain(">No<");
  });
});