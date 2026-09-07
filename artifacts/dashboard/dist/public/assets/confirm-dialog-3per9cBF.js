import { r as reactExports, j as jsxRuntimeExports, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, N as DialogMutationError, J as DialogFooter, d as Button } from "./index-D5ac2D7t.js";
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  mutation
}) {
  const confirmInFlightRef = reactExports.useRef(false);
  const [confirmSubmitted, setConfirmSubmitted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!open || mutation?.isError) {
      confirmInFlightRef.current = false;
      setConfirmSubmitted(false);
    }
  }, [open, mutation?.isError]);
  const handleConfirm = () => {
    if (confirmInFlightRef.current || mutation?.isPending) return;
    confirmInFlightRef.current = true;
    setConfirmSubmitted(true);
    onConfirm();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    mutation && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation, message: "Failed — please try again." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: handleConfirm, disabled: mutation?.isPending || confirmSubmitted, children: confirmLabel })
    ] })
  ] }) });
}
export {
  ConfirmDialog as C
};
