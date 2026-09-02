jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  EncodingType: { UTF8: "utf8" },
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  buildOrganicFieldStatusCsv,
  buildOrganicFieldStatusCsvFilename,
  shareOrganicFieldStatusCsv,
} from "@/lib/organicFieldStatusCsv";

const writeAsStringAsync = FileSystem.writeAsStringAsync as jest.Mock;
const shareAsync = Sharing.shareAsync as jest.Mock;

const record = {
  fieldName: "North Field",
  status: "in-conversion",
  conversionStartDate: "2025-04-01",
  certificationDate: null,
  certifierRef: "CERT-42",
  parallelProduction: true,
  notes: "Keep buffer strip",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Organic Field Status CSV", () => {
  it.each(["ios", "android"])(
    "uses the native share contract on %s",
    async () => {
      await shareOrganicFieldStatusCsv([record], "Green Valley Farm");

      expect(writeAsStringAsync).toHaveBeenCalledWith(
        "file:///cache/field-status-register-green-valley-farm.csv",
        expect.stringContaining(
          '"North Field","In Conversion","01/04/2025","","CERT-42","Yes","Keep buffer strip"',
        ),
        { encoding: "utf8" },
      );
      expect(shareAsync).toHaveBeenCalledWith(
        "file:///cache/field-status-register-green-valley-farm.csv",
        {
          mimeType: "text/csv",
          dialogTitle: "Share Field Status Register CSV",
          UTI: "public.comma-separated-values-text",
        },
      );
    },
  );

  it("builds a spreadsheet-safe CSV and never leaves a blank filename", () => {
    const csv = buildOrganicFieldStatusCsv([
      { ...record, fieldName: "=HYPERLINK(\"https://example.com\")" },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"\t=HYPERLINK(""https://example.com"")"');
    expect(buildOrganicFieldStatusCsvFilename("")).toBe(
      "field-status-register-farm.csv",
    );
  });
});