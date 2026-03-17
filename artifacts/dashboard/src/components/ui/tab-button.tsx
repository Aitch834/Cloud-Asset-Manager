import { cn } from "@/lib/utils";

export function TabBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 bg-black/[0.07] rounded-xl p-1.5 w-fit", className)}>
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
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap",
        size === "md" ? "px-5 py-2.5" : "px-4 py-1.5",
        active
          ? "bg-white shadow-sm border border-black/[0.06] text-foreground"
          : "text-foreground/60 hover:text-foreground hover:bg-black/[0.05]",
      )}
    >
      {children}
    </button>
  );
}
