import { buildVineRegisterPdfHtml } from "../lib/vineRegisterPdf";

describe("vine register PDF template", () => {
  it("includes the farm header, FSA references, and register table", () => {
    const html = buildVineRegisterPdfHtml([
      {
        registeredVariety: "Bacchus",
        vivcNumber: "12345",
        registeredAreaHa: "1.25",
        giClassification: "Sussex PDO",
        wineColour: "White",
        dateRegistered: "2025-04-02",
        dateAmended: null,
        isRemovedFromRegister: false,
      },
    ], {
      farmName: "Meadow Farm",
      address: "Vineyard Lane",
      postcode: "AB1 2CD",
      farmMeta: {
        fsaVineRegisterRef: "FSA-123",
        fsaWineProductionRef: "WINE-456",
        appaRef: "APPA-789",
        winegbMembershipNumber: "WGB-101",
      },
    });

    expect(html).toContain("BDE Farm Trac");
    expect(html).toContain("Meadow Farm");
    expect(html).toContain("Vineyard Lane, AB1 2CD");
    expect(html).toContain("FSA Vine Reg: FSA-123");
    expect(html).toContain("FSA Wine Prod: WINE-456");
    expect(html).toContain("Registered Variety");
    expect(html).toContain("Bacchus");
    expect(html).toContain("1.2500 ha");
  });

  it("escapes register values before placing them in HTML", () => {
    const html = buildVineRegisterPdfHtml([
      {
        registeredVariety: "<img src=x onerror=alert(1)>",
        registeredAreaHa: "not-a-number",
        giClassification: "A & B",
        wineColour: null,
        dateRegistered: null,
        isRemovedFromRegister: true,
      },
    ], { farmName: "Farm <One>" });

    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("A &amp; B");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).not.toContain("not-a-number ha");
  });
});