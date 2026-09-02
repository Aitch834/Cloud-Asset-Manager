import { organicInputRegisterHtml, type OrganicInputPrintRecord } from "../lib/organicInputPrint";

const record: OrganicInputPrintRecord = {
  productName: "<Pellet>",
  inputType: "Fertiliser",
  approvalStatus: "permitted",
  supplier: "Supplier & Sons",
  dateOfUse: "2026-04-12",
  quantityAmount: "25",
  quantityUnit: "kg",
  certifierApprovalRef: "CERT-1",
  derogationExpiryDate: "2026-12-31",
  fieldName: "North Field",
  cropYear: 2026,
  notes: "Applied <carefully>",
  poReference: "PO-10",
  grnReference: "GRN-20",
};

describe("organic input register print template", () => {
  it("renders the dashboard-compatible twelve-column register", () => {
    const html = organicInputRegisterHtml([record], "Meadow <Farm>", 2026);

    expect(html).toContain("Organic Input Purchase Register");
    expect(html).toContain("Crop Year 2026");
    expect(html).toContain(
      "<th>Date Used</th><th>Product</th><th>Input Type</th><th>Supplier</th><th>PO Reference</th><th>GRN / Delivery</th><th>Approval Status</th><th>Derogation Expiry</th><th>Certifier Ref</th><th>Field / Area</th><th>Quantity</th><th>Notes</th>",
    );
    expect(html).toContain("&lt;Pellet&gt;");
    expect(html).toContain("Supplier &amp; Sons");
    expect(html).toContain("Applied &lt;carefully&gt;");
    expect(html).toContain("25 kg");
  });

  it("marks offline additions as pending sync", () => {
    const html = organicInputRegisterHtml([{ ...record, pending: true, notes: null }], "Meadow Farm", null);

    expect(html).toContain("Pending sync");
    expect(html).toContain("All Years");
  });
});