import { j as jsxRuntimeExports } from "./index-BWN71dIU.js";
function DialogMutationError({
  mutation,
  message
}) {
  if (!mutation.isError || mutation.isPending) return null;
  const raw = mutation.error instanceof Error ? mutation.error.message : "";
  const detail = raw && raw.length <= 200 && !raw.trimStart().startsWith("<") ? raw : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      role: "alert",
      className: "rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700",
      "data-testid": "dialog-error",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: message ?? "Something went wrong — your changes have not been saved." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 break-words", children: detail || "Please check your connection and try again, or cancel to close this dialog." })
      ]
    }
  );
}
export {
  DialogMutationError as D
};
