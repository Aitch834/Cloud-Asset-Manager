import { savePdf } from "../lib/hooks/usePrint";
import {
  vineScoutingHistoryHtml,
  type VineScoutingHistoryRow,
} from "../lib/printTemplates";

jest.mock("react-native", () => require("react-native-web"));

const baseRow: VineScoutingHistoryRow = {
  id: 1,
  scoutDate: "2026-09-01",
  nextScoutDate: null,
  blockName: "Long South-Facing Bacchus Block",
  scoutedBy: "Release Device Tester",
  downyMildewPressure: 1,
  powderyMildewPressure: 2,
  botrytisPressure: 3,
  phomopsisPressure: 0,
  leafhopperPressure: 1,
  spiderMitePressure: 0,
  vineWeevilSighted: true,
  eutypaDiebackSighted: false,
  xylellaFastidiosa: false,
  phytophthoraViticola: false,
  actionTaken: "Marked affected rows and scheduled a follow-up inspection.",
  notes: "Long notes verify that content wraps without overlapping adjacent columns.",
};

describe("vine scouting report native PDF handoff", () => {
  it.each(["ios", "android"] as const)(
    "creates the eight-column landscape report and opens native sharing on %s",
    async platform => {
      const html = vineScoutingHistoryHtml(
        [
          { ...baseRow, id: 1, nextScoutDate: "2000-01-01" },
          { ...baseRow, id: 2, nextScoutDate: "2999-12-31" },
          { ...baseRow, id: 3, nextScoutDate: null },
        ],
        "Release Test Vineyard",
        "Test Lane",
        "AB1 2CD",
      );
      const printToFileAsync = jest.fn().mockResolvedValue({
        uri: "file:///generated/Print.pdf",
      });
      const shareAsync = jest.fn().mockResolvedValue(undefined);
      const copyAsync = jest.fn().mockResolvedValue(undefined);
      const deleteAsync = jest.fn().mockResolvedValue(undefined);

      await savePdf(
        html,
        "Vine Scouting History",
        "vine-scouting-history.pdf",
        platform,
        {
          printToFileAsync,
          shareAsync,
          cacheDirectory: "file:///cache/",
          copyAsync,
          deleteAsync,
        },
      );

      const printableHtml = printToFileAsync.mock.calls[0]?.[0]?.html as string;
      expect(printableHtml).toContain("@page { size: A4 landscape;");
      expect(printableHtml.match(/<th>/g)).toHaveLength(8);
      expect(printableHtml).toContain("Overdue &middot; 01 January 2000");
      expect(printableHtml).toContain("Next: 31 December 2999");
      expect(printableHtml).toContain("Next: Not scheduled");
      expect(printableHtml).toContain("overflow-wrap: anywhere");

      expect(copyAsync).toHaveBeenCalledWith({
        from: "file:///generated/Print.pdf",
        to: "file:///cache/vine-scouting-history.pdf",
      });
      expect(shareAsync).toHaveBeenCalledWith(
        "file:///cache/vine-scouting-history.pdf",
        {
          mimeType: "application/pdf",
          dialogTitle: "Share Vine Scouting History",
          UTI: "com.adobe.pdf",
        },
      );
    },
  );
});