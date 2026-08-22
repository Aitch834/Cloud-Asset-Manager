/**
 * Determines whether a successful LIS movement is the first production
 * submission. SMTP delivery is deliberately not an input: the user-facing LIS
 * state must remain correct when the separate incident-closure email fails.
 */
export function shouldSurfaceFirstProductionSubmission(params: {
  sandbox: boolean;
  createdFirstSubmissionMarker: boolean;
}): boolean {
  return !params.sandbox && params.createdFirstSubmissionMarker;
}