import {
  buildOrganicFpCsv,
  buildOrganicFpCsvFilename,
} from "@/lib/organicFpCsv";

describe("buildOrganicFpCsv", () => {
  it("matches the dashboard FP input log columns and calculates expiry days", () => {
    const today = new Date("2026-09-02T12:00:00Z").setHours(0, 0, 0, 0);
    const csv = buildOrganicFpCsv(
      [
        {
          applicationDate: "2026-08-01",
          cropYear: 2026,
          inputName: "Copper, product",
          inputType: "Crop Protection",
          approvalStatus: "derogation",
          derogationExpiryDate: "2026-09-12",
          supplier: "Supplier Ltd",
          quantityApplied: "2.5",
          quantityUnit: "kg",
          purposeOfUse: "Disease control",
          appliedBy: "Alex",
          certifierApprovalRef: "CERT-42",
          poReference: "PO-7",
          grnReference: "GRN-8",
          notes: "Keep records",
        },
      ],
      today,
    );

    expect(csv).toContain(
      '"Date Applied","Crop Year","Input / Product","Type","Approval Status","Expiry Date","Days Remaining","Supplier","Qty Applied","Unit","Purpose","Applied By","Certifier Ref","PO Ref","GRN Ref","Notes"',
    );
    expect(csv).toContain(
      '"01/08/2026","2026","Copper, product","Crop Protection","derogation","12/09/2026","10","Supplier Ltd","2.5","kg","Disease control","Alex","CERT-42","PO-7","GRN-8","Keep records"',
    );
  });

  it("leaves expiry columns empty for permitted inputs", () => {
    const csv = buildOrganicFpCsv([
      {
        applicationDate: "2026-09-01",
        cropYear: 2026,
        inputName: "Compost",
        approvalStatus: "permitted",
        derogationExpiryDate: "2026-09-30",
      },
    ]);

    expect(csv).toContain(
      '"01/09/2026","2026","Compost","","permitted","","","","","","","","","","",""',
    );
  });

  it("neutralises formula-like user data and uses the dashboard filename", () => {
    const csv = buildOrganicFpCsv([
      {
        applicationDate: "2026-09-01",
        inputName: '=HYPERLINK("https://example.com")',
      },
    ]);

    expect(csv).toContain('"\t=HYPERLINK(""https://example.com"")"');
    expect(buildOrganicFpCsvFilename("Green Valley Farm", "2026")).toBe(
      "fp-input-log-2026-Green-Valley-Farm.csv",
    );
  });
});
