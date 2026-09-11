import { shareMastitisTrendCsv } from "../lib/mastitisTrendCsv";

const trendRows = Array.from({ length: 12 }, (_, index) => ({
  label: `Month ${index + 1}`,
  regular: index % 3,
  chronic: index % 2,
}));

describe("mastitis trend CSV native handoff", () => {
  it.each(["ios", "android"] as const)(
    "writes a 12-month attachment and opens native sharing on %s",
    async () => {
      const writeCsvFile = jest.fn().mockResolvedValue(undefined);
      const shareAsync = jest.fn().mockResolvedValue(undefined);

      await shareMastitisTrendCsv(
        trendRows,
        "mastitis-trend-meadow-farm.csv",
        {
          cacheDirectory: "file:///cache/",
          writeCsvFile,
          shareAsync,
        },
      );

      const [attachmentUri, attachmentContent] = writeCsvFile.mock.calls[0] as [
        string,
        string,
      ];
      const csvLines = attachmentContent.replace(/^\uFEFF/, "").split("\r\n");

      expect(attachmentUri).toBe("file:///cache/mastitis-trend-meadow-farm.csv");
      expect(csvLines).toHaveLength(13);
      expect(csvLines[0]).toBe('"Month","Total Cases","Chronic Cases"');
      expect(csvLines.slice(1)).toHaveLength(12);
      expect(csvLines[1]).toBe('"Month 1","0","0"');
      expect(csvLines[2]).toBe('"Month 2","2","1"');
      expect(csvLines[12]).toBe('"Month 12","3","1"');

      expect(shareAsync).toHaveBeenCalledWith(attachmentUri, {
        mimeType: "text/csv",
        dialogTitle: "Share Mastitis Trend CSV",
        UTI: "public.comma-separated-values-text",
      });
    },
  );
});