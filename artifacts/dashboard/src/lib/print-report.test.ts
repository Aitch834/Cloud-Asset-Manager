import { describe, expect, it } from "vitest";
import { buildProReport, escapeHtml } from "./print-report";

describe("buildProReport", () => {
  it("escapes malicious report cell values without altering controlled markup", () => {
    const cell = escapeHtml(`<svg onload="alert('xss')">&`);

    expect(cell).toBe("&lt;svg onload=&quot;alert(&#39;xss&#39;)&quot;&gt;&amp;");
    expect(`<td>${cell}</td>`).toBe("<td>&lt;svg onload=&quot;alert(&#39;xss&#39;)&quot;&gt;&amp;</td>");
  });

  it("does not apply Red Tractor branding to a general report", () => {
    const html = buildProReport({
      title: "Farm Summary",
      farmName: "Hill Farm",
      tableHtml: "<table></table>",
    });

    expect(html).not.toContain("RED TRACTOR");
    expect(html).toContain("Farm record produced by BDE Farm Trac.");
  });

  it("shows declared authority metadata without substituting another scheme", () => {
    const html = buildProReport({
      title: "Seasonal Survey",
      farmName: "Vine Farm",
      authority: "WineGB",
      authorityReferenceLabel: "WineGB Membership",
      authorityReference: "WG-123",
      authorityReferenceRequired: true,
      tableHtml: "<table></table>",
    });

    expect(html).toContain(">WineGB<");
    expect(html).toContain("WineGB Membership: WG-123");
    expect(html).not.toContain("RED TRACTOR");
  });

  it("surfaces missing required holding metadata in the report", () => {
    const html = buildProReport({
      title: "SFI Evidence",
      farmName: undefined,
      authority: "Rural Payments Agency",
      authorityReferenceLabel: "SBI",
      authorityReferenceRequired: true,
      tableHtml: "<table></table>",
    });

    expect(html).toContain("Holding name not configured");
    expect(html).toContain("Required report information missing: Holding name, SBI");
  });

  it("escapes user-provided header metadata", () => {
    const html = buildProReport({
      title: "<script>alert(1)</script>",
      farmName: "A & B Farm",
      tableHtml: "<table></table>",
    });

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("A &amp; B Farm");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("escapes all textual options while preserving trusted table structure", () => {
    const malicious = `<img src=x onerror="alert('xss')">`;
    const html = buildProReport({
      title: malicious,
      subtitle: malicious,
      farmName: malicious,
      farmAddress: malicious,
      contactPhone: malicious,
      cphNumber: malicious,
      sbiNumber: malicious,
      redTractorId: malicious,
      authority: malicious,
      authorityReferenceLabel: malicious,
      authorityReference: malicious,
      additionalReferences: [{ label: malicious, value: malicious }],
      recordCount: 1,
      recordLabel: malicious,
      extraMeta: malicious,
      footerNote: malicious,
      tableHtml: "<table><tbody><tr><td>trusted structure</td></tr></tbody></table>",
    });

    expect(html).not.toContain(malicious);
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;");
    expect(html).toContain("<table><tbody><tr><td>trusted structure</td></tr></tbody></table>");
  });
});