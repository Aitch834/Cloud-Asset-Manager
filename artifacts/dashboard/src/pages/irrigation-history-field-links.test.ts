import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pagesDir = dirname(fileURLToPath(import.meta.url));

function readPage(path: string) {
  return readFileSync(resolve(pagesDir, path), "utf8");
}

function extractBetween(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("irrigation history field links", () => {
  const irrigationSource = readPage("WaterIrrigationPage.tsx");
  const fieldsSource = readPage("fields/FieldsPage.tsx");

  it("links a joined field to its matching field editor", () => {
    const hrefHelper = extractBetween(
      irrigationSource,
      "function fieldEditHref(",
      "\n  function licenceLabel(",
    );
    const fieldCell = extractBetween(
      irrigationSource,
      '<td className="py-2 pr-3">\n                      {fieldEditHref(r)',
      "\n                    </td>",
    );

    expect(hrefHelper).toContain(
      "`/fields?editFieldId=${fieldId}`",
    );
    expect(fieldCell).toContain("href={fieldEditHref(r) ?? undefined}");
    expect(fieldCell).toContain("{fieldLabel(r)}");
  });

  it("opens the matching field edit dialog after following the link", () => {
    expect(fieldsSource).toContain(
      'const raw = params.get("editFieldId");',
    );
    expect(fieldsSource).toContain(
      'urlOverride: autoOpenFieldId !== null ? "fields" : undefined',
    );
    expect(fieldsSource).toContain(
      "defaultEditOpen={autoOpenFieldId === field.id}",
    );
  });

  it("leaves a description-only row as plain text", () => {
    const hrefHelper = extractBetween(
      irrigationSource,
      "function fieldEditHref(",
      "\n  function licenceLabel(",
    );
    const fieldCell = extractBetween(
      irrigationSource,
      '<td className="py-2 pr-3">\n                      {fieldEditHref(r)',
      "\n                    </td>",
    );

    expect(hrefHelper).toContain("const fieldId = Number(r.fieldId)");
    expect(hrefHelper).toContain(
      "Number.isInteger(fieldId) && fieldId > 0",
    );
    expect(hrefHelper).not.toContain("fieldOrBlockDescription");
    expect(fieldCell).toContain(") : fieldLabel(r)}");
  });
});