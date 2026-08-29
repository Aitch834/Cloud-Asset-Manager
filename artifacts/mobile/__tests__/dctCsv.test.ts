import {
  buildDctCsv,
  buildDctCsvFilename,
  DCT_CSV_HEADERS,
} from "@/lib/utils/dctCsv";

describe("DCT CSV export", () => {
  it("uses the selected month in the expected filename", () => {
    expect(buildDctCsvFilename("August 2026")).toBe(
      "dct-records-august-2026.csv",
    );
  });

  it("exports the dashboard column contract in order", () => {
    const csv = buildDctCsv([]);
    expect(csv).toBe(
      `\uFEFF${DCT_CSV_HEADERS.map((header) => `"${header}"`).join(",")}`,
    );
  });

  it("exports a DCT row and neutralises spreadsheet formulas", () => {
    const csv = buildDctCsv([
      {
        dryOffDate: "2026-08-12T12:00:00.000Z",
        cowEarTag: "=UK123",
        protocol: "teat-sealant-only",
        antibioticTubeProduct: "Product A",
        antibioticTubeBatch: "B-42",
        standardMilkWithdrawalDays: 7,
        doubledMilkWithdrawalDays: 14,
        teatSealantProduct: "Sealant A",
        sccAtDryOff: 220,
        vetAuthorisation: true,
        vetName: "Dr Brown",
        certifierNotified: true,
        expectedCalvingDate: "2026-10-21T12:00:00.000Z",
        therapeuticJustification: "High SCC",
      },
    ]);

    const [, row] = csv.split("\r\n");
    expect(row).toContain('"\t=UK123"');
    expect(row).toContain('"teat sealant only"');
    expect(row).toContain('"7","14"');
    expect(row).toContain('"Yes","Dr Brown","Yes"');
    expect(row?.split(",")).toHaveLength(DCT_CSV_HEADERS.length);
  });
});