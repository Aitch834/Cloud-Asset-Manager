import { savePdf } from "../lib/hooks/usePrint";
import { buildVineRegisterPdfHtml } from "../lib/vineRegisterPdf";

jest.mock("react-native", () => require("react-native-web"));

describe("vine register native PDF handoff", () => {
  it.each(["ios", "android"] as const)(
    "creates a readable named PDF and opens the native share flow on %s",
    async platform => {
      const html = buildVineRegisterPdfHtml(
        [
          {
            registeredVariety: "Bacchus",
            vivcNumber: "12345",
            registeredAreaHa: "1.25",
            giClassification: "Sussex PDO",
            wineColour: "White",
            dateRegistered: "2025-04-02",
            dateAmended: "2025-05-03",
            isRemovedFromRegister: false,
          },
        ],
        {
          farmName: "Meadow Farm",
          address: "Vineyard Lane",
          postcode: "AB1 2CD",
          farmMeta: {
            fsaVineRegisterRef: "FSA-123",
            fsaWineProductionRef: "WINE-456",
            appaRef: "APPA-789",
            winegbMembershipNumber: "WGB-101",
          },
        },
      );
      const printToFileAsync = jest.fn().mockResolvedValue({
        uri: "file:///generated/Print.pdf",
      });
      const shareAsync = jest.fn().mockResolvedValue(undefined);
      const copyAsync = jest.fn().mockResolvedValue(undefined);
      const deleteAsync = jest.fn().mockResolvedValue(undefined);

      await savePdf(html, "Vine Register", "vine-register.pdf", platform, {
        printToFileAsync,
        shareAsync,
        cacheDirectory: "file:///cache/",
        copyAsync,
        deleteAsync,
      });

      const printableHtml = printToFileAsync.mock.calls[0]?.[0]?.html as string;
      expect(printableHtml).toContain("<title>FSA Vine Register — Meadow Farm</title>");
      expect(printableHtml).toContain("FSA Vine Reg: FSA-123");
      expect(printableHtml).toContain("FSA Wine Prod: WINE-456");
      expect(printableHtml).toContain("<table>");
      expect(printableHtml).toContain("Bacchus");

      expect(deleteAsync).toHaveBeenCalledWith(
        "file:///cache/vine-register.pdf",
        { idempotent: true },
      );
      expect(copyAsync).toHaveBeenCalledWith({
        from: "file:///generated/Print.pdf",
        to: "file:///cache/vine-register.pdf",
      });
      expect(shareAsync).toHaveBeenCalledWith(
        "file:///cache/vine-register.pdf",
        {
          mimeType: "application/pdf",
          dialogTitle: "Share Vine Register",
          UTI: "com.adobe.pdf",
        },
      );
    },
  );
});