import { j as jsxRuntimeExports, k as cn } from "./index-DF30SY2m.js";
function TabBar({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("flex items-center w-fit flex-wrap", className),
      style: { gap: 6, padding: 6, background: "rgba(0,0,0,0.07)", borderRadius: 12 },
      children
    }
  );
}
function TabButton({
  active,
  onClick,
  children,
  size = "md"
}) {
  const pad = size === "md" ? "10px 20px" : "6px 16px";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      style: {
        padding: pad,
        fontSize: "0.875rem",
        fontWeight: 600,
        borderRadius: 8,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background 0.15s, color 0.15s",
        background: active ? "#fff" : "transparent",
        boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" : "none",
        border: "none",
        color: active ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.6)"
      },
      className: cn(
        "hover:text-foreground",
        !active && "hover:bg-black/[0.05]"
      ),
      children
    }
  );
}
export {
  TabBar as T,
  TabButton as a
};
