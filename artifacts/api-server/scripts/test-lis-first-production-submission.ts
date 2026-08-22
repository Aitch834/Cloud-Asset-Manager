import assert from "node:assert/strict";
import { shouldSurfaceFirstProductionSubmission } from "../src/lib/lisFirstProductionSubmission";

function test(name: string, run: () => void): void {
  try {
    run();
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}

// The marker is committed before the best-effort SMTP call. A closure-email
// failure therefore cannot hide the first successful production submission.
test("surfaces the first live submission even when the closure email fails", () => {
  assert.equal(
    shouldSurfaceFirstProductionSubmission({
      sandbox: false,
      createdFirstSubmissionMarker: true,
    }),
    true,
  );
});

// A later live submission may reclaim a failed email delivery, but it did not
// create the durable first-submission marker and must not show the callout.
test("does not surface a later live submission that retries the closure email", () => {
  assert.equal(
    shouldSurfaceFirstProductionSubmission({
      sandbox: false,
      createdFirstSubmissionMarker: false,
    }),
    false,
  );
});

test("does not surface sandbox submissions", () => {
  assert.equal(
    shouldSurfaceFirstProductionSubmission({
      sandbox: true,
      createdFirstSubmissionMarker: true,
    }),
    false,
  );
});