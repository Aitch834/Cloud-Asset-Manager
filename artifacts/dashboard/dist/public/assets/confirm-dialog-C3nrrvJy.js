import { j as jsxRuntimeExports, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, N as DialogMutationError, J as DialogFooter, d as Button } from "./index-LXPEs_eP.js";
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    mutation && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation, message: "Failed — please try again." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: onConfirm, disabled: mutation?.isPending, children: confirmLabel })
    ] })
  ] }) });
}
export {
  ConfirmDialog as C
};
