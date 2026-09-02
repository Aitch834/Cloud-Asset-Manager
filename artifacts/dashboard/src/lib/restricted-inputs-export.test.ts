import { describe, expect, it } from "vitest";
import {
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