import { describe, expect, it } from "vitest";

import { buildChemistryPicksRowHtml } from "./harvest-chemistry-print";

describe("chemistry print Picks footer", () => {
  it("renders one shared row with vintage counts, grand total, and a single-pick warning", () => {
    const html = buildChemistryPicksRowHtml([2, 1, 3], 6, 10.5, "5px 5px");

    expect(html.match(/>Picks<\/td>/g)).toHaveLength(1);
    expect(html).toContain(">2</td>");
    expect(html).toContain(">&#9888; 1</td>");
    expect(html).toContain(">3</td>");
    expect(html).toContain(">6</td>");
    expect(html.match(/<tbody><tr>/g)).toHaveLength(1);
    expect(html).toContain("background:#fef3c7");
    expect(html).toContain("border:1px solid #fbbf24");
    expect(html).toContain("color:#92400e");
  });
});