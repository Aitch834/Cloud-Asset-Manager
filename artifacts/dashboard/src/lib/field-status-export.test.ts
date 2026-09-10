import { describe, expect, it } from "vitest";
import {
  FIELD_STATUS_COLUMNS,
  getFieldStatusHeaders,
  getFieldStatusPrintHeaderHtml,
} from "./field-status-export";

describe("Field Status export columns", () => {
  it("uses the same ordered labels for CSV and print", () => {
    const printHeaders = Array.from(
      getFieldStatusPrintHeaderHtml().matchAll(/<th>(.*?)<\/th>/g),
      match => match[1],
    );

    expect(getFieldStatusHeaders()).toEqual(printHeaders);
    expect(getFieldStatusHeaders()).toEqual(FIELD_STATUS_COLUMNS.map(column => column.header));
  });
});