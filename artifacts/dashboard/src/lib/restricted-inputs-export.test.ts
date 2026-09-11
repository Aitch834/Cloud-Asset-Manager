import { describe, expect, it } from "vitest";
import {
  buildInputRegisterPrintHtml,
  getRestrictedInputCsvHeaders,
  getRestrictedInputPrintHeaderHtml,
} from "./restricted-inputs-export";

describe("restricted inputs export columns", () => {
  it("keeps CSV headers exactly aligned with the print table headers", () => {
    const printHeaderLabels = [...getRestrictedInputPrintHeaderHtml().matchAll(/<th>(.*?)<\/th>/g)]
      .map(match => match[1]);
    expect(getRestrictedInputCsvHeaders()).toEqual(printHeaderLabels);
  });
});

describe("input register print approval filter label", () => {
  it.each([
    ["all", "Organic Input Purchase Register · Crop Year 2026 · Complementary Record"],
    ["permitted", "Organic Input Purchase Register · Crop Year 2026 · Permitted only · Complementary Record"],
    ["restricted", "Organic Input Purchase Register · Crop Year 2026 · Restricted (notify certifier) only · Complementary Record"],
    ["derogation", "Organic Input Purchase Register · Crop Year 2026 · Derogation Required only · Complementary Record"],
  ])("formats the %s filter heading", (filter, expected) => {
    const html = buildInputRegisterPrintHtml([], "Test Farm", 2026, filter, "", "10 September 2026");
    expect(html.match(/<p class="sub">(.*?)<\/p>/)?.[1]).toBe(expected);
  });
});
