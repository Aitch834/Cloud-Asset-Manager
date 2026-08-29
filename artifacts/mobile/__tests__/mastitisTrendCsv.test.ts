import { buildMastitisTrendCsv } from "../lib/mastitisTrendCsv";

describe("mastitis trend CSV", () => {
  it("exports the rolling trend with totals and chronic cases", () => {
    const csv = buildMastitisTrendCsv([
      { label: "Aug 25", regular: 2, chronic: 1 },
      { label: "Sep 25", regular: 0, chronic: 0 },
    ]);

    expect(csv).toBe(
      "\uFEFF" +
        '"Month","Total Cases","Chronic Cases"\r\n' +
        '"Aug 25","3","1"\r\n' +
        '"Sep 25","0","0"',
    );
  });

  it("quotes and sanitises exported labels", () => {
    const csv = buildMastitisTrendCsv([
      { label: '=HYPERLINK("https://example.com")', regular: 1, chronic: 0 },
    ]);

    expect(csv).toContain('"\t=HYPERLINK(""https://example.com"")"');
  });
});