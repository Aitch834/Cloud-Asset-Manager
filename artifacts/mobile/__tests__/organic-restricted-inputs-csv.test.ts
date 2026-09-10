import {
  buildRestrictedInputsCsv,
  buildRestrictedInputsCsvFilename,
  buildFilteredRestrictedInputsCsv,
  filterRestrictedInputs,
} from "../lib/organicRestrictedInputsCsv";

const BASE_RECORD = {
  dateOfUse: "2026-09-02",
  productName: "Rock Phosphate",
  inputType: "Fertiliser / Soil Amendment",
  fieldName: "North Field",
  appliedBy: "A. Grower",
  approvalStatus: "restricted",
  certifierApprovalRef: "CERT-42",
  certifierNotified: true,
  derogationExpiryDate: "2026-12-31",
  supplier: "Organic Supplies Ltd",
  poReference: "PO-9",
  grnReference: "GRN-11",
  justification: "No permitted alternative",
  cropYear: 2026,
};

describe("restricted inputs CSV", () => {
  it("matches the dashboard export columns and audit values", () => {
    const csv = buildRestrictedInputsCsv([BASE_RECORD]);

    const [header, record] = csv.replace(/^\uFEFF/, "").split("\r\n");
    expect(header).toBe(
      '"Date Applied","Product","Type / Category","Field / Area","Applied By","Approval Status","Certifier Approval Ref","Certifier Notified","Derogation Expiry Date","Supplier","PO Reference","GRN / Delivery Ref","Justification"',
    );
    expect(record).toContain('"Restricted (notify certifier)"');
    expect(record).toContain('"Yes"');
    expect(record).toContain('"No permitted alternative"');
  });

  it("marks matching offline additions without changing synced-only columns", () => {
    const pendingRecord = {
      ...BASE_RECORD,
      productName: "Pending offline input",
      certifierApprovalRef: null,
      pending: true,
    };
    const now = new Date(2026, 8, 2, 12, 0, 0);
    const csv = buildFilteredRestrictedInputsCsv(
      [BASE_RECORD, pendingRecord],
      "pending",
      now,
    );
    const [header, record] = csv.replace(/^\uFEFF/, "").split("\r\n");

    expect(header).toContain('"Sync Status"');
    expect(record).toContain('"Pending offline input"');
    expect(record).toContain('"Pending sync"');
    expect(csv).not.toContain('"Rock Phosphate"');

    const syncedOnlyHeader = buildRestrictedInputsCsv([BASE_RECORD])
      .replace(/^\uFEFF/, "")
      .split("\r\n")[0];
    expect(syncedOnlyHeader).not.toContain('"Sync Status"');
  });

  it("includes the selected status in the filename", () => {
    expect(buildRestrictedInputsCsvFilename("Hill Top Farm", "pending"))
      .toBe("restricted-inputs-pending-hill-top-farm.csv");
  });

  it("uses calendar dates at the active, pending, and expired boundary", () => {
    const now = new Date(2026, 8, 2, 12, 0, 0);
    const records = [
      { ...BASE_RECORD, productName: "Active today", derogationExpiryDate: "2026-09-02" },
      {
        ...BASE_RECORD,
        productName: "Pending today",
        certifierApprovalRef: null,
        derogationExpiryDate: "2026-09-02",
      },
      { ...BASE_RECORD, productName: "Expired yesterday", derogationExpiryDate: "2026-09-01" },
      { ...BASE_RECORD, productName: "Permitted", approvalStatus: "permitted" },
    ];

    expect(filterRestrictedInputs(records, "active", now).map((record) => record.productName))
      .toEqual(["Active today"]);
    expect(filterRestrictedInputs(records, "pending", now).map((record) => record.productName))
      .toEqual(["Pending today"]);
    expect(filterRestrictedInputs(records, "expired", now).map((record) => record.productName))
      .toEqual(["Expired yesterday"]);
    expect(filterRestrictedInputs(records, "all", now).map((record) => record.productName))
      .toEqual(["Active today", "Pending today", "Expired yesterday"]);

    const activeCsv = buildFilteredRestrictedInputsCsv(records, "active", now);
    expect(activeCsv).toContain('"Active today"');
    expect(activeCsv).not.toContain('"Pending today"');
    expect(activeCsv).not.toContain('"Expired yesterday"');
    expect(activeCsv).not.toContain('"Permitted"');
  });
});