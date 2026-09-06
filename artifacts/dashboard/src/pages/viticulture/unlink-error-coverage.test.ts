import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const viticultureDir = dirname(fileURLToPath(import.meta.url));

function readSource(path: string) {
  return readFileSync(resolve(viticultureDir, path), "utf8");
}

function extractUnlinkMutation(source: string) {
  const start = source.indexOf("const unlinkMutation = useMutation({");
  const end = source.indexOf("\n  });", start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end + "\n  });".length);
}

function extractUnlinkDialog(source: string) {
  const start = source.indexOf("{/* Unlink confirm */}");
  const end = source.indexOf("\n      />", start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end + "\n      />".length);
}

const unlinkSurfaces = [
  ["Disease Scouting", "ScoutingTab.tsx"],
  ["Spray Diary", "SprayDiaryTab.tsx"],
] as const;

describe.each(unlinkSurfaces)("%s unlink failure handling", (_surface, fileName) => {
  const source = readSource(fileName);
  const mutation = extractUnlinkMutation(source);
  const dialog = extractUnlinkDialog(source);

  it("keeps a failed unlink visible and retryable in the open dialog", () => {
    expect(mutation).toContain('if (!r.ok) throw new Error("Failed to unlink record")');
    expect(mutation).not.toContain("onError:");
    expect(dialog).toContain("open={unlinkRecordId !== null}");
    expect(dialog).toContain("mutation={unlinkMutation}");
    expect(dialog).toContain("onConfirm={() => unlinkMutation.mutate(unlinkRecordId!)}");
  });

  it("clears the mutation error when the dialog is closed", () => {
    expect(dialog).toContain(
      "onCancel={() => { setUnlinkRecordId(null); unlinkMutation.reset(); }}",
    );
  });
});

describe("shared unlink confirmation behavior", () => {
  const source = readSource("../../components/ui/confirm-dialog.tsx");

  it("renders mutation failures inline without closing the controlled dialog", () => {
    expect(source).toContain("<Dialog open={open}");
    expect(source).toContain(
      "{mutation && <DialogMutationError mutation={mutation} message=\"Failed — please try again.\" />}",
    );
    expect(source).toContain("if (!o) onCancel()");
  });
});