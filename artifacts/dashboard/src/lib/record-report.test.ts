import { beforeEach, describe, expect, it, vi } from "vitest";

const { printProReport } = vi.hoisted(() => ({ printProReport: vi.fn() }));

vi.mock("@/lib/print-report", async () => {
  const actual = await vi.importActual<typeof import("@/lib/print-report")>("@/lib/print-report");
  return { ...actual, printProReport };
});

import { printRecordReport, printRecordsReport } from "./record-report";

describe("record report table HTML", () => {
  beforeEach(() => {
    printProReport.mockReset();
  });

  it("escapes malicious record labels and values", () => {
    const malicious = `<script>alert("xss")</script>`;

    printRecordReport({
      title: "Record",
      farmName: "Hill Farm",
      record: { [malicious]: malicious },
    });

    const [{ tableHtml }] = printProReport.mock.calls[0];
    expect(tableHtml).not.toContain(malicious);
    expect(tableHtml).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
  });

  it("escapes malicious multi-record column labels and cells", () => {
    const malicious = `<img src=x onerror=alert(1)>`;

    printRecordsReport({
      title: "Records",
      farmName: "Hill Farm",
      columns: [{ label: malicious, value: record => record.value }],
      records: [{ value: malicious }],
    });

    const [{ tableHtml }] = printProReport.mock.calls[0];
    expect(tableHtml).not.toContain(malicious);
    expect(tableHtml).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });
});