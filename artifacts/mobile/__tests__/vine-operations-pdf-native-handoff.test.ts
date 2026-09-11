import { savePdf } from "../lib/hooks/usePrint";
import {
  vineOperationsHtml,
} from "../lib/printTemplates";
import {
  buildVineOperationsPdfRows,
  type VineOperationsPdfSourceRow,
} from "../lib/vineOperationsPdf";

jest.mock("react-native", () => require("react-native-web"));

const pruningAndCanopyRow: VineOperationsPdfSourceRow = {
  id: 2510,
  operationDate: "2026-02-18",
  blockName: "South Slope Pinot Noir",
  operationType: "Pruning",
  operatorName: "Release Device Tester",
  hoursWorked: 3.5,
  notes: "Distinctive values verify the native report handoff.",
  pruningSystem: "Double Guyot — east cordon",
  budsPerVineTarget: 17,
  budsPerVineActual: 14,
  pruningWeightKgPerVine: 0.63,
  shootsRemovedPct: 38,
  leavesRemovedZone: "Fruit zone — morning side",
};

describe("vine operations report native PDF handoff", () => {
  it.each(["ios", "android"] as const)(
    "preserves pruning and canopy details in the Expo Print HTML on %s",
    async platform => {
      const html = vineOperationsHtml(
        buildVineOperationsPdfRows([pruningAndCanopyRow]),
        "Release Test Vineyard",
        "2026-02-01",
        "2026-02-28",
      );
      const printToFileAsync = jest.fn().mockResolvedValue({
        uri: "file:///generated/Print.pdf",
      });
      const shareAsync = jest.fn().mockResolvedValue(undefined);
      const copyAsync = jest.fn().mockResolvedValue(undefined);
      const deleteAsync = jest.fn().mockResolvedValue(undefined);

      await savePdf(
        html,
        "Vine Operations History",
        "vine-operations-history.pdf",
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
      expect(printableHtml).toContain("Pruning system: <strong>Double Guyot — east cordon</strong>");
      expect(printableHtml).toContain("Target buds/vine: <strong>17</strong>");
      expect(printableHtml).toContain("Actual buds/vine: <strong>14</strong>");
      expect(printableHtml).toContain("Pruning weight: <strong>0.63 kg/vine</strong>");
      expect(printableHtml).toContain("Shoots removed: <strong>38%</strong>");
      expect(printableHtml).toContain("Leaves removed zone: <strong>Fruit zone — morning side</strong>");

      expect(copyAsync).toHaveBeenCalledWith({
        from: "file:///generated/Print.pdf",
        to: "file:///cache/vine-operations-history.pdf",
      });
      expect(shareAsync).toHaveBeenCalledWith(
        "file:///cache/vine-operations-history.pdf",
        {
          mimeType: "application/pdf",
          dialogTitle: "Share Vine Operations History",
          UTI: "com.adobe.pdf",
        },
      );
    },
  );
});