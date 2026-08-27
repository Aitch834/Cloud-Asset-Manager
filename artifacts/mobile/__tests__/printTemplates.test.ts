import { grainIntakeDocketHtml, grainOutloadingDocketHtml } from "../lib/printTemplates";

const farm = {
  id: "farm-1",
  name: "Meadow <Farm>",
  tenantSlug: "meadow",
  cphNumber: "12/345/6789",
  sectorArable: true,
  sectorBeef: false,
  sectorDairy: false,
  sectorPigs: false,
  sectorPoultry: false,
  sectorViticulture: false,
};

const intake = {
  id: "intake-1",
  farmId: "farm-1",
  intakeDate: "2025-01-01",
  customerName: "<img src=x onerror=alert(1)>",
  lotReference: "LOT-<1>",
  commodity: "Wheat",
  variety: "",
  quantityTonnes: "10",
  moisturePercent: "",
  screeningsPercent: "",
  specificWeightKgHl: "",
  grade: "",
  deliveryNoteRef: "",
  vehicleReg: "",
  haulier: "",
  bayOrBin: "",
  transportArrangedBy: "customer" as const,
  notes: "",
  recordedBy: "A & B",
  createdAt: "2025-01-01",
  synced: false,
};

describe("print templates", () => {
  it("escapes docket text and includes the complete holding identity", () => {
    const html = grainIntakeDocketHtml(intake, farm);

    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("Meadow &lt;Farm&gt;");
    expect(html).toContain("CPH: <strong>12/345/6789</strong>");
  });

  it("omits unsafe signature URLs while allowing safe image data", () => {
    const unsafe = grainIntakeDocketHtml({ ...intake, customerSignature: "javascript:alert(1)" }, farm);
    const safe = grainIntakeDocketHtml({ ...intake, customerSignature: "data:image/png;base64,AA==" }, farm);

    expect(unsafe).not.toContain("<img ");
    expect(unsafe).not.toContain("javascript:alert");
    expect(safe).toContain('<img src="data:image/png;base64,AA=="');
  });

  it("escapes unrecognised outloading movement text", () => {
    const html = grainOutloadingDocketHtml({
      ...intake,
      movementDate: "2025-01-02",
      movementType: "<script>alert(1)</script>",
      intakeLotRef: "LOT-1",
      intakeCustomerName: "Customer",
      intakeId: null,
      destination: "",
    }, farm);

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});