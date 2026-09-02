import { certificationNotice } from "@/lib/organicFieldCertification";

describe("certificationNotice", () => {
  const today = new Date("2026-09-02T12:00:00Z");

  it("flags a conversion that reaches two years in exactly 30 days", () => {
    expect(certificationNotice("2024-10-02T12:00:00Z", "in-conversion", today)).toMatchObject({
      kind: "due-soon",
    });
  });

  it("does not flag a conversion more than 30 days away", () => {
    expect(certificationNotice("2024-10-03T12:00:00Z", "in-conversion", today)).toBeNull();
  });

  it("marks a conversion eligible on its two-year date and after", () => {
    expect(certificationNotice("2024-09-02T12:00:00Z", "in-conversion", today)).toMatchObject({
      kind: "eligible",
    });
    expect(certificationNotice("2024-08-01T12:00:00Z", "in-conversion", today)).toMatchObject({
      kind: "eligible",
    });
  });

  it("does not show notices for certified or conventional fields", () => {
    expect(certificationNotice("2024-08-01T12:00:00Z", "certified", today)).toBeNull();
    expect(certificationNotice("2024-08-01T12:00:00Z", "conventional", today)).toBeNull();
  });

  it("does not show notices without a valid conversion start date", () => {
    expect(certificationNotice(null, "in-conversion", today)).toBeNull();
    expect(certificationNotice("not-a-date", "in-conversion", today)).toBeNull();
  });
});