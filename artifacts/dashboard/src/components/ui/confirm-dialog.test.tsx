// @vitest-environment jsdom
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { describe, expect, it } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

function FailingConfirmationHarness() {
  const [open, setOpen] = useState(true);
  const mutation = useMutation({
    mutationFn: async () => {
      throw new Error("Unable to remove the record.");
    },
  });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open confirmation</button>
      <ConfirmDialog
        open={open}
        title="Remove record"
        message="This cannot be undone."
        confirmLabel="Remove"
        confirmVariant="destructive"
        mutation={mutation}
        onConfirm={() => mutation.mutate()}
        onCancel={() => {
          setOpen(false);
          mutation.reset();
        }}
      />
    </>
  );
}

function renderFailingConfirmation() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <FailingConfirmationHarness />
    </QueryClientProvider>,
  );
}

describe("ConfirmDialog", () => {
  it("keeps a failed action visible, then clears it after cancelling and reopening", async () => {
    renderFailingConfirmation();

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    const error = await screen.findByTestId("dialog-error");
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(error.textContent).toContain("Failed — please try again.");
    expect(error.textContent).toContain("Unable to remove the record.");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Open confirmation" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.queryByTestId("dialog-error")).toBeNull();
  });
});