import { cn } from "@/lib/utils";

export function TabBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("flex items-center w-fit flex-wrap", className)}
      style={{ gap: 6, padding: 6, background: "rgba(0,0,0,0.07)", borderRadius: 12 }}
    >
      {children}
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const pad = size === "md" ? "10px 20px" : "6px 16px";
  return (
    <button
      onClick={onClick}
      style={{
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
        color: active ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.6)",
      }}
      className={cn(
        "hover:text-foreground",
        !active && "hover:bg-black/[0.05]",
      )}
    >
      {children}
    </button>
  );
}
