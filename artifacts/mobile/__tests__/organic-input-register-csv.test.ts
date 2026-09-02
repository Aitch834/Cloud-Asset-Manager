import {
  buildInputRegisterCsv,
  type InputRegisterCsvRecord,
} from "@/lib/organicInputRegisterCsv";

const BASE_RECORD: InputRegisterCsvRecord = {
  dateOfUse: "2026-09-02T12:00:00.000Z",
  productName: "Compost, premium",
  inputType: "Fertiliser / Soil Amendment",
  supplier: "Organic Supplies Ltd",
  poReference: "PO-42",
  grnReference: "GRN-17",
  approvalStatus: "permitted",
  derogationExpiryDate: null,
  certifierApprovalRef: "CERT-9",
  fieldName: "North Field",
  quantityAmount: "2.5",
  quantityUnit: "t",
  notes: "Applied before drilling",
};

describe("Input Register CSV export", () => {
  it("includes the UTF-8 BOM and preserves the audit column order", () => {
    const csv = buildInputRegisterCsv([]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv.slice(1)).toBe(
      '"Date Used","Product","Input Type","Supplier","PO Reference","GRN / Delivery Ref","Approval Status","Derogation Expiry","Certifier Ref","Field / Area","Quantity","Notes"',
    );
  });

  it("formats dates, approval labels, and combined quantities", () => {
    const csv = buildInputRegisterCsv([
      BASE_RECORD,
      {
        ...BASE_RECORD,
        dateOfUse: "2026-10-03T12:00:00.000Z",
        approvalStatus: "restricted",
        quantityAmount: "10",
        quantityUnit: null,
        derogationExpiryDate: "2026-12-31T12:00:00.000Z",
      },
      {
        ...BASE_RECORD,
        approvalStatus: "derogation",
        quantityAmount: null,
        quantityUnit: "kg",
      },
    ]);

    expect(csv).toContain(
      '"02/09/2026","Compost, premium","Fertiliser / Soil Amendment","Organic Supplies Ltd","PO-42","GRN-17","Permitted","","CERT-9","North Field","2.5 t","Applied before drilling"',
    );
    expect(csv).toContain(
      '"03/10/2026","Compost, premium","Fertiliser / Soil Amendment","Organic Supplies Ltd","PO-42","GRN-17","Restricted","31/12/2026","CERT-9","North Field","10","Applied before drilling"',
    );
    expect(csv).toContain(
      '"02/09/2026","Compost, premium","Fertiliser / Soil Amendment","Organic Supplies Ltd","PO-42","GRN-17","Derogation","","CERT-9","North Field","","Applied before drilling"',
    );
  });

  it("sanitises formula-like values before quoting them", () => {
    const csv = buildInputRegisterCsv([
      {
        ...BASE_RECORD,
        productName: '=HYPERLINK("https://example.com")',
        inputType: "+category",
        supplier: "-supplier",
        poReference: "@po",
        grnReference: "|grn",
        approvalStatus: "%status",
        certifierApprovalRef: "\tcertifier",
        fieldName: "\rfield",
        notes: "safe",
      },
    ]);

    expect(csv).toContain(
      '"\t=HYPERLINK(""https://example.com"")","\t+category","\t-supplier","\t@po","\t|grn","\t%status"',
    );
    expect(csv).toContain('"\t\tcertifier","\t\rfield"');
  });

  it("uses empty cells for null fields and accepts pending records without PO or GRN references", () => {
    const csv = buildInputRegisterCsv([
      {
        ...BASE_RECORD,
        productName: "",
        dateOfUse: null,
        inputType: null,
        supplier: null,
        poReference: null,
        grnReference: null,
        approvalStatus: "pending",
        derogationExpiryDate: null,
        certifierApprovalRef: null,
        fieldName: null,
        quantityAmount: null,
        quantityUnit: null,
        notes: null,
        pending: true,
      },
    ]);

    expect(csv).toContain(
      '"","","","","","","pending","","","","","Pending sync"',
    );
  });
});