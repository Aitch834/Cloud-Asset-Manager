/**
 * Inline error banner for dialogs whose save/delete mutation failed.
 *
 * Standard pattern: the dialog stays open, the user's entered data is
 * preserved, and this banner explains what happened and that they can retry.
 * Render it just above the DialogFooter and pass the TanStack mutation:
 *
 *   <DialogMutationError mutation={saveMut} />
 *
 * The banner hides itself while the mutation is retrying (isPending) and
 * after a subsequent success. Call `mutation.reset()` when the dialog closes
 * so a stale error doesn't reappear on reopen.
 */
export function DialogMutationError({
  mutation,
  message,
}: {
  mutation: { isError: boolean; isPending: boolean; error: unknown };
  message?: string;
}) {
  if (!mutation.isError || mutation.isPending) return null;
  const raw = mutation.error instanceof Error ? mutation.error.message : "";
  // Server bodies can be long HTML/JSON blobs — keep it readable.
  const detail = raw && raw.length <= 200 && !raw.trimStart().startsWith("<") ? raw : "";
  return (
    <div
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
      data-testid="dialog-error"
    >
      <p className="font-medium">
        {message ?? "Something went wrong — your changes have not been saved."}
      </p>
      <p className="mt-0.5 break-words">
        {detail || "Please check your connection and try again, or cancel to close this dialog."}
      </p>
    </div>
  );
}
