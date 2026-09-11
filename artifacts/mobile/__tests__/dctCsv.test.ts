import {
  buildDctCsv,
  buildDctCsvFilename,
  DCT_CSV_HEADERS,
  shareDctCsvNative,
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

  it("writes the selected month's records and shares the same native attachment", async () => {
    const selectedMonthRecords = [
      {
        dryOffDate: "2026-08-12T12:00:00.000Z",
        cowEarTag: "UK-AUG-001",
        protocol: "selective-dry-cow-therapy",
        antibioticTubeProduct: "Product A",
        antibioticTubeBatch: "AUG-42",
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
    ];
    const writeCsvFile = jest.fn().mockResolvedValue(undefined);
    const shareAsync = jest.fn().mockResolvedValue(undefined);

    await shareDctCsvNative(selectedMonthRecords, "August 2026", {
      cacheDirectory: "file:///cache/",
      writeCsvFile,
      shareAsync,
    });

    const [savedUri, writtenPayload] = writeCsvFile.mock.calls[0] as [
      string,
      string,
    ];
    const csvLines = writtenPayload.replace(/^\uFEFF/, "").split("\r\n");

    expect(savedUri).toBe("file:///cache/dct-records-august-2026.csv");
    expect(csvLines).toHaveLength(2);
    expect(csvLines[0]?.split(",")).toHaveLength(DCT_CSV_HEADERS.length);
    expect(csvLines[1]?.split(",")).toHaveLength(DCT_CSV_HEADERS.length);
    expect(writtenPayload).toContain("UK-AUG-001");
    expect(writtenPayload).not.toContain("UK-JUL-001");
    expect(shareAsync).toHaveBeenCalledWith(savedUri, {
      mimeType: "text/csv",
      dialogTitle: "Share DCT CSV",
      UTI: "public.comma-separated-values-text",
    });
  });
});