import { buildMastitisCsv } from "@/lib/mastitisCsv";

describe("buildMastitisCsv", () => {
  it("exports the API record fields, including vet and treatment details", () => {
    const csv = buildMastitisCsv([
      {
        onsetDate: "2026-08-05T00:00:00.000Z",
        earTagNumber: "UK123",
        quartersAffected: "Left fore",
        clinicalGrade: "Severe",
        bacterialCultureResult: "E. coli",
        sccAtOnset: 850,
        treatmentProduct: "Ubrolexin",
        treatmentStartDate: "2026-08-05T00:00:00.000Z",
        treatmentDurationDays: 3,
        withdrawalEndDate: "2026-08-10T00:00:00.000Z",
        vetConsulted: true,
        vetName: "Jane Brown MRCVS",
        outcome: "Recovered",
        outcomeDate: "2026-08-12T00:00:00.000Z",
        notes: "Follow-up, retest planned",
      },
    ]);

    expect(csv).toContain(
      '"Onset Date","Ear Tag","Quarter(s) Affected","Clinical Grade","Bacterial Culture","SCC at Onset (k/mL)","Treatment Product","Treatment Start Date","Treatment Duration (days)","Withdrawal End Date","Vet Consulted","Vet Name","Outcome","Outcome Date","Notes"',
    );
    expect(csv).toContain(
      '"05/08/2026","UK123","Left fore","Severe","E. coli","850","Ubrolexin","05/08/2026","3","10/08/2026","Yes","Jane Brown MRCVS","Recovered","12/08/2026","Follow-up, retest planned"',
    );
    expect(csv).not.toContain("Std W/D");
    expect(csv).not.toContain("attendingVet");
  });

  it("exports offline records with the same truthful columns", () => {
    const csv = buildMastitisCsv([
      {
        onsetDate: "2026-07-01",
        earTagNumber: "UK456",
        quartersAffected: "Right hind",
        clinicalGrade: "Mild",
        sccAtOnset: 420,
        treatmentProduct: "None",
        treatmentStartDate: "2026-07-01",
        treatmentDurationDays: "1",
        vetConsulted: false,
        vetName: "",
        notes: "Saved offline",
      },
    ]);

    expect(csv).toContain(
      '"01/07/2026","UK456","Right hind","Mild","","420","None","01/07/2026","1","","No","","","","Saved offline"',
    );
  });

  it("neutralises formula-like user data", () => {
    const csv = buildMastitisCsv([
      {
        onsetDate: "2026-08-01",
        earTagNumber: "=HYPERLINK(\"https://example.com\")",
      },
    ]);

    expect(csv).toContain(
      '"\t=HYPERLINK(""https://example.com"")"',
    );
  });
});