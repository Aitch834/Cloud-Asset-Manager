import { b as useAppStore, j as jsxRuntimeExports, R as Redirect, a4 as useSearch, r as reactExports, m as useQuery, l as cn, T as Plus, e as LoaderCircle, n as Card, c as useQueryClient, S as useMutation, aM as toast, p as Link, A as ArrowRight, B as Building2 } from "./index-dOwizOzO.js";
import { A as AppLayout, c as ClipboardList, e as ChartColumn, d as Wrench, U as Users } from "./AppLayout-DxVOt1e5.js";
import { u as usePersistedTab } from "./use-persisted-tab-Bj-lqAhP.js";
import { a as usePersistedFilter } from "./use-persisted-filter-BVVAsJLr.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BJ5F-MNX.js";
import { C as CircleX } from "./circle-x-V1QOnZXx.js";
import { C as CircleCheck } from "./circle-check-DQpFq1ze.js";
import { a as Clock } from "./database-BRM0OUE2.js";
import { S as Search } from "./search-BaxYgIhK.js";
import { P as Printer } from "./printer-nkM_Y8P7.js";
import { U as UserCheck } from "./user-check-7BlC3P9H.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-Cia-aNs-.js";
import { T as TriangleAlert } from "./triangle-alert-D1dPGvoB.js";
import { H as HardHat } from "./hard-hat-BvE7-6vz.js";
import { S as Send } from "./send-CwKm0HDy.js";
import { H as History } from "./history-wreULEa6.js";
import { M as MessageSquare } from "./message-square-_JvoX5Ai.js";
import { C as ChevronUp } from "./chevron-up-DmXKv5PB.js";
import { C as ChevronRight } from "./tractor-Cxn8N8za.js";
import "./use-safe-clerk-YwdTw6WL.js";
import "./shield-alert-C8T4oV9r.js";
import "./shield-check-D0h4MUGc.js";
import "./textarea-CtBJ8gnr.js";
import "./select-DQkn2syB.js";
import "./index-CDU9tKoH.js";
import "./index-D6wgdV58.js";
const STATUS_CONFIG = {
  pending: { label: "Pending", colour: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  in_progress: { label: "In Progress", colour: "bg-blue-50 text-blue-700 border-blue-200", icon: ClipboardList },
  completed: { label: "Completed", colour: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CircleCheck },
  cancelled: { label: "Cancelled", colour: "bg-slate-50 text-slate-500 border-slate-200", icon: CircleX }
};
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function AssignmentCard({ a, farmId, autoExpand, forceOpen }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = reactExports.useState(autoExpand ?? false);
  const isExpanded = expanded || !!forceOpen;
  const [newStatus, setNewStatus] = reactExports.useState(a.status);
  const [highlighted, setHighlighted] = reactExports.useState(autoExpand ?? false);
  const cardRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (autoExpand && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      const t = setTimeout(() => setHighlighted(false), 4e3);
      return () => clearTimeout(t);
    }
    return void 0;
  }, [autoExpand]);
  const { data: historyData, isFetching: historyLoading } = useQuery({
    queryKey: ["assignment-history", a.id],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments/${a.id}/history`).then((r) => r.json()),
    enabled: expanded
  });
  const history = historyData?.history ?? [];
  const cfg = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const dueDate = a.dueDate ? new Date(a.dueDate) : null;
  const isOverdue = dueDate && a.status !== "completed" && a.status !== "cancelled" ? dueDate < /* @__PURE__ */ new Date() : false;
  const patchMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-assignments/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-assignments", farmId] });
      toast({ title: "Assignment updated" });
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/task-assignments/${a.id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-assignments", farmId] });
      toast({ title: "Assignment removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: cardRef,
      className: cn(
        "rounded-xl border bg-white transition-all",
        highlighted && "ring-2 ring-primary ring-offset-1",
        isOverdue && a.status === "pending" ? "border-red-200" : "border-border"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start gap-3 p-4 cursor-pointer print:cursor-default",
            onClick: () => setExpanded((p) => !p),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: cn("w-4 h-4 mt-0.5 flex-shrink-0", {
                "text-amber-500": a.status === "pending",
                "text-blue-500": a.status === "in_progress",
                "text-emerald-500": a.status === "completed",
                "text-slate-400": a.status === "cancelled"
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("font-semibold text-sm leading-snug", a.status === "completed" ? "text-foreground/50 line-through" : "text-foreground"), children: a.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
                    a.module && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground/60 border border-border", children: a.module }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", cfg.colour), children: cfg.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("w-3.5 h-3.5 text-foreground/30 transition-transform print:hidden", isExpanded && "rotate-180") })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/60 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3 h-3" }),
                    a.staffName
                  ] }),
                  a.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("text-xs flex items-center gap-1", isOverdue ? "text-red-600 font-semibold" : "text-foreground/50"), children: [
                    isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                    "Due ",
                    fmtDate(a.dueDate)
                  ] }),
                  a.taskType === "field-inspection" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      href: a.taskSourceId ? `/field-inspections?inspectionId=${encodeURIComponent(a.taskSourceId)}` : "/field-inspections",
                      onClick: (e) => e.stopPropagation(),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 flex items-center gap-1 w-fit", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-2.5 h-2.5" }),
                        "From Field Inspection"
                      ] })
                    }
                  ),
                  a.taskSourceId?.startsWith("equipment-") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      href: `/equipment?equipmentId=${encodeURIComponent(a.taskSourceId.slice("equipment-".length))}`,
                      onClick: (e) => e.stopPropagation(),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 cursor-pointer hover:bg-orange-100 flex items-center gap-1 w-fit", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-2.5 h-2.5" }),
                        "From Equipment"
                      ] })
                    }
                  ),
                  a.taskSourceId?.startsWith("contractor-rams-") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      href: `/contractors?ramsId=${encodeURIComponent(a.taskSourceId.slice("contractor-rams-".length))}`,
                      onClick: (e) => e.stopPropagation(),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 cursor-pointer hover:bg-teal-100 flex items-center gap-1 w-fit", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { className: "w-2.5 h-2.5" }),
                        "From Contractor RAMS"
                      ] })
                    }
                  ),
                  a.smsSent && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-emerald-600 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-3 h-3" }),
                    "SMS sent"
                  ] }),
                  history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-indigo-600 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3 h-3" }),
                    history.length,
                    " reassignment",
                    history.length !== 1 ? "s" : ""
                  ] })
                ] })
              ] })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 pt-0 border-t border-border space-y-3 mt-0", children: [
          a.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/60 leading-relaxed pt-3", children: a.description }),
          a.assignmentNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-indigo-50 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-indigo-700 mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-3 h-3" }),
              "Manager's note"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-indigo-700", children: a.assignmentNote })
          ] }),
          a.completionNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
              "Completion note"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-emerald-700", children: a.completionNote })
          ] }),
          a.completedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            "Completed ",
            fmtDate(a.completedAt)
          ] }),
          !forceOpen && historyLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-2 text-foreground/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Loading history…" })
          ] }),
          !historyLoading && history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-lg overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3.5 h-3.5 text-foreground/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground/70", children: "Reassignment history" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: history.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold text-indigo-600", children: i + 1 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60", children: h.previousAssigneeName ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3 text-foreground/30 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground", children: h.newAssigneeName ?? "—" })
                ] }),
                h.reassignmentNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-0.5 italic", children: [
                  '"',
                  h.reassignmentNote,
                  '"'
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/35 mt-0.5", children: fmtDateTime(h.reassignedAt) })
              ] })
            ] }) }, h.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1 print:hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: newStatus,
                onChange: (e) => setNewStatus(e.target.value),
                className: "flex-1 text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "Pending" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_progress", children: "In Progress" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "Cancelled" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                disabled: newStatus === a.status || patchMut.isPending,
                onClick: () => patchMut.mutate({ status: newStatus }),
                className: "text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors",
                children: patchMut.isPending ? "…" : "Update"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => deleteMut.mutate(),
                disabled: deleteMut.isPending,
                className: "w-7 h-7 flex items-center justify-center rounded-lg border border-border text-foreground/30 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors",
                title: "Delete assignment",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const PERIOD_OPTIONS = [
  { value: "this-week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "last-3-months", label: "Last 3 Months" }
];
function fmtPeriodLabel(period, start, end) {
  const s = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${s} – ${e}`;
}
function StatusPill({ status, count }) {
  if (count === 0) return null;
  const cfg = {
    completed: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-slate-100 text-slate-500"
  };
  const labels = {
    completed: "Done",
    in_progress: "In Progress",
    pending: "Pending",
    cancelled: "Cancelled"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[11px] font-semibold px-1.5 py-0.5 rounded ${cfg[status] ?? "bg-slate-100 text-slate-600"}`, children: [
    count,
    " ",
    labels[status] ?? status
  ] });
}
function TaskRow({ task }) {
  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2 px-3 text-sm border-b border-border/20 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-3.5 h-3.5 shrink-0 ${task.status === "completed" ? "text-emerald-500" : task.status === "in_progress" ? "text-blue-500" : task.status === "cancelled" ? "text-slate-400" : "text-amber-500"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-medium truncate", children: task.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50 shrink-0", children: task.staffName }),
    task.completedAt ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 shrink-0", children: fmtDate(task.completedAt) }) : task.dueDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/40 shrink-0", children: [
      "Due ",
      fmtDate(task.dueDate)
    ] }) : null
  ] });
}
function StaffGroup({ staffName, tasks, forceOpen }) {
  const [open, setOpen] = reactExports.useState(false);
  const isOpen = open || !!forceOpen;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/40 rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-black/[0.02] transition-colors text-left print:cursor-default",
        onClick: () => setOpen((v) => !v),
        children: [
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5 text-foreground/40 shrink-0 print:hidden" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5 text-foreground/40 shrink-0 print:hidden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5 text-foreground/50 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium flex-1", children: staffName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 flex-wrap justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "completed", count: completed }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "in_progress", count: inProgress }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "pending", count: pending }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "cancelled", count: cancelled })
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-slate-50 border-t border-border/30", children: tasks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskRow, { task: t }, t.id)) })
  ] });
}
function DeptGroup({ deptName, deptColour, tasks, forceOpen }) {
  const [open, setOpen] = reactExports.useState(true);
  const isOpen = open || !!forceOpen;
  const byStaff = tasks.reduce((acc, t) => {
    const key = t.staffName || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/50 rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left print:cursor-default",
        onClick: () => setOpen((v) => !v),
        children: [
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-foreground/40 shrink-0 print:hidden" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-foreground/40 shrink-0 print:hidden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full shrink-0", style: { background: deptColour ?? "#374151" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-foreground/50 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm flex-1", children: deptName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/50", children: [
            total,
            " task",
            total !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 flex-wrap justify-end ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "completed", count: completed }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "in_progress", count: inProgress }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "pending", count: pending }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "cancelled", count: cancelled })
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/20 px-3 py-2 space-y-2", children: Object.entries(byStaff).sort(([a], [b]) => a.localeCompare(b)).map(([name, staffTasks]) => /* @__PURE__ */ jsxRuntimeExports.jsx(StaffGroup, { staffName: name, tasks: staffTasks, forceOpen }, name)) })
  ] });
}
function ModuleGroup({ moduleName, tasks, forceOpen }) {
  const [open, setOpen] = reactExports.useState(true);
  const isOpen = open || !!forceOpen;
  const byDept = tasks.reduce((acc, t) => {
    const key = t.departmentName ?? "__none__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-border rounded-2xl overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-black/[0.01] transition-colors text-left print:cursor-default",
        onClick: () => setOpen((v) => !v),
        children: [
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-foreground/40 shrink-0 print:hidden" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-foreground/40 shrink-0 print:hidden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm flex-1", children: moduleName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/50", children: [
            total,
            " task",
            total !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 flex-wrap justify-end ml-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "completed", count: completed }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "in_progress", count: inProgress }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "pending", count: pending }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: "cancelled", count: cancelled })
          ] })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 space-y-3 bg-slate-50/50 border-t border-border", children: Object.entries(byDept).sort(([a], [b]) => a === "__none__" ? 1 : b === "__none__" ? -1 : a.localeCompare(b)).map(([deptKey, deptTasks]) => {
      const firstTask = deptTasks[0];
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        DeptGroup,
        {
          deptName: deptKey === "__none__" ? "No Department" : deptKey,
          deptColour: deptKey === "__none__" ? "#94a3b8" : firstTask.departmentColour,
          tasks: deptTasks,
          forceOpen
        },
        deptKey
      );
    }) })
  ] });
}
function ReportsView({ farmId }) {
  const [period, setPeriod] = reactExports.useState("this-month");
  const [printing, setPrinting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const before = () => setPrinting(true);
    const after = () => setPrinting(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
  const { data, isLoading } = useQuery({
    queryKey: ["task-report", farmId, period],
    queryFn: () => fetch(`/api/farms/${farmId}/task-report?period=${period}`).then((r) => r.json())
  });
  const tasks = data?.tasks ?? [];
  const byModule = tasks.reduce((acc, t) => {
    const key = t.module || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const totalCompleted = tasks.filter((t) => t.status === "completed").length;
  const totalInProgress = tasks.filter((t) => t.status === "in_progress").length;
  const totalPending = tasks.filter((t) => t.status === "pending").length;
  const totalCancelled = tasks.filter((t) => t.status === "cancelled").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 print:space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap print:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: period,
          onChange: (e) => setPeriod(e.target.value),
          className: "text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
          children: PERIOD_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value))
        }
      ),
      data && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: fmtPeriodLabel(period, data.startDate, data.endDate) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setPrinting(true);
            setTimeout(() => {
              window.print();
            }, 50);
          },
          className: "ml-auto flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 bg-white hover:bg-black/[0.03] transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
            "Print / Export"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden print:block mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Task Board Report" }),
      data && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600 mt-1", children: [
        "Period: ",
        PERIOD_OPTIONS.find((o) => o.value === period)?.label,
        " —",
        " ",
        fmtPeriodLabel(period, data.startDate, data.endDate)
      ] })
    ] }),
    tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-emerald-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: totalCompleted }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50", children: "Completed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4 text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: totalInProgress }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50", children: "In Progress" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-amber-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: totalPending }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50", children: "Pending" })
      ] }),
      totalCancelled > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: totalCancelled }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/50", children: "Cancelled" })
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-foreground/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mr-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Loading report…" })
    ] }),
    !isLoading && tasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center border-dashed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-10 h-10 text-foreground/20 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-1", children: "No tasks in this period" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Try a different time period or assign some tasks on the board." })
    ] }),
    !isLoading && Object.entries(byModule).sort(([a], [b]) => a.localeCompare(b)).map(([mod, modTasks]) => /* @__PURE__ */ jsxRuntimeExports.jsx(ModuleGroup, { moduleName: mod, tasks: modTasks, forceOpen: printing }, mod))
  ] });
}
function TaskBoardPage() {
  const { farmId } = useAppStore();
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const search = useSearch();
  const targetId = (() => {
    const params = new URLSearchParams(search);
    const v = params.get("id");
    return v ? parseInt(v, 10) : null;
  })();
  const [view, setView] = usePersistedTab({ page: "task-board", farmId, validIds: ["board", "reports"], defaultTab: "board" });
  const [showNewTask, setShowNewTask] = reactExports.useState(false);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "task-board", filter: "status", farmId, defaultValue: "all" });
  const [deptFilter, setDeptFilter] = usePersistedFilter({ page: "task-board", filter: "dept", farmId, defaultValue: "all" });
  const [memberFilter, setMemberFilter] = usePersistedFilter({ page: "task-board", filter: "member", farmId, defaultValue: "all" });
  const [moduleFilter, setModuleFilter] = usePersistedFilter({ page: "task-board", filter: "module", farmId, defaultValue: "all" });
  const [completedWindow, setCompletedWindow] = reactExports.useState("90d");
  const [sortOrder, setSortOrder] = reactExports.useState("due-asc");
  const [boardPrinting, setBoardPrinting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const before = () => setBoardPrinting(true);
    const after = () => setBoardPrinting(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
  const WINDOW_OPTIONS = [
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "12m", label: "Last 12 months" },
    { value: "all", label: "All time" }
  ];
  const SORT_OPTIONS = [
    { value: "due-asc", label: "Due date ↑ (soonest)" },
    { value: "due-desc", label: "Due date ↓ (latest)" },
    { value: "raised-desc", label: "Date raised ↓ (newest)" },
    { value: "raised-asc", label: "Date raised ↑ (oldest)" },
    { value: "staff-az", label: "Staff name A→Z" },
    { value: "title-az", label: "Title A→Z" }
  ];
  function applySortOrder(items) {
    return [...items].sort((a, b) => {
      switch (sortOrder) {
        case "due-asc": {
          const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return da - db;
        }
        case "due-desc": {
          const da = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity;
          const db = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
          return db - da;
        }
        case "raised-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "raised-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "staff-az":
          return (a.staffName ?? "").localeCompare(b.staffName ?? "");
        case "title-az":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }
  function applyCompletedWindow(items) {
    if (completedWindow === "all") return items;
    if (targetId != null) {
      return applyWindow(items.filter((r) => r.id !== targetId)).concat(items.filter((r) => r.id === targetId));
    }
    return applyWindow(items);
  }
  function applyWindow(items) {
    if (completedWindow.startsWith("year:")) {
      const yr = parseInt(completedWindow.slice(5), 10);
      return items.filter((r) => {
        const d = r.completedAt ?? r.createdAt;
        return d ? new Date(d).getFullYear() === yr : false;
      });
    }
    const now = /* @__PURE__ */ new Date();
    const cutoff = new Date(now);
    if (completedWindow === "30d") cutoff.setDate(now.getDate() - 30);
    else if (completedWindow === "90d") cutoff.setDate(now.getDate() - 90);
    else if (completedWindow === "12m") cutoff.setFullYear(now.getFullYear() - 1);
    return items.filter((r) => {
      const d = r.completedAt ?? r.createdAt;
      return d ? new Date(d) >= cutoff : true;
    });
  }
  const { data, isLoading } = useQuery({
    queryKey: ["task-assignments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments`).then((r) => r.json())
  });
  const { data: staffData } = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const staff = staffData?.members ?? [];
  const completedYears = reactExports.useMemo(() => {
    const years = /* @__PURE__ */ new Set();
    records.forEach((r) => {
      if (r.status === "completed" || r.status === "cancelled") {
        const d = r.completedAt ?? r.createdAt;
        if (d) years.add(new Date(d).getFullYear().toString());
      }
    });
    return Array.from(years).sort().reverse();
  }, [records]);
  const departments = (() => {
    const seen = /* @__PURE__ */ new Map();
    staff.forEach((s) => {
      if (s.departmentName) seen.set(s.departmentName, s.departmentColour ?? null);
    });
    return Array.from(seen.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([name, colour]) => ({ name, colour }));
  })();
  const deptMemberNames = deptFilter === "all" ? null : new Set(staff.filter((s) => s.departmentName === deptFilter).map((s) => `${s.firstName} ${s.lastName}`.trim()));
  const memberFiltered = (() => {
    let result = records;
    if (deptMemberNames) result = result.filter((r) => deptMemberNames.has(r.staffName));
    if (memberFilter !== "all") result = result.filter((r) => r.staffName === memberFilter);
    return result;
  })();
  const moduleNames = Array.from(new Set(records.map((r) => r.module ?? "General"))).sort();
  const filtered = memberFiltered.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (moduleFilter !== "all" && (r.module ?? "General") !== moduleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !(r.staffName ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const pending = applySortOrder(filtered.filter((r) => r.status === "pending" || r.status === "in_progress"));
  const completedAll = filtered.filter((r) => r.status === "completed" || r.status === "cancelled");
  const windowFilterActive = statusFilter === "all";
  const completed = applySortOrder(windowFilterActive ? applyCompletedWindow(completedAll) : completedAll);
  const staffNames = deptMemberNames ? Array.from(new Set(records.filter((r) => deptMemberNames.has(r.staffName)).map((r) => r.staffName))).sort() : Array.from(new Set(records.map((r) => r.staffName))).sort();
  const totalPending = records.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Task Board", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 print:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 p-1 bg-muted rounded-lg w-fit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setView("board"),
              className: cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all",
                view === "board" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }),
                "Board"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setView("reports"),
              className: cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all",
                view === "reports" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5" }),
                "Reports"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowNewTask(true),
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
              "New Task"
            ]
          }
        )
      ] }),
      view === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsView, { farmId }),
      view === "board" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden", children: ["pending", "in_progress", "completed", "cancelled"].map((s) => {
          const count = memberFiltered.filter((r) => r.status === s).length;
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setStatusFilter(statusFilter === s ? "all" : s),
              className: cn(
                "p-3 rounded-xl border text-left transition-all hover:shadow-sm",
                statusFilter === s ? "ring-2 ring-primary ring-offset-1" : "bg-white border-border"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-4 h-4 mb-1.5", {
                  "text-amber-500": s === "pending",
                  "text-blue-500": s === "in_progress",
                  "text-emerald-500": s === "completed",
                  "text-slate-400": s === "cancelled"
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-foreground", children: count }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: cfg.label })
              ]
            },
            s
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative print:hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/35 pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search tasks or staff…",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-foreground/30"
            }
          ),
          searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSearchQuery(""),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 text-xs",
              children: "✕"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          departments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: deptFilter,
              onChange: (e) => {
                setDeptFilter(e.target.value);
                setMemberFilter("all");
              },
              className: "text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All departments" }),
                departments.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d.name, children: d.name }, d.name))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: memberFilter,
              onChange: (e) => setMemberFilter(e.target.value),
              className: "text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All staff" }),
                staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n, children: n }, n))
              ]
            }
          ),
          moduleNames.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: moduleFilter,
              onChange: (e) => setModuleFilter(e.target.value),
              className: "text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All modules" }),
                moduleNames.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: sortOrder,
              onChange: (e) => setSortOrder(e.target.value),
              className: "text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30",
              children: SORT_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value))
            }
          ),
          (searchQuery || statusFilter !== "all" || deptFilter !== "all" || memberFilter !== "all" || moduleFilter !== "all" || sortOrder !== "due-asc") && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setSearchQuery("");
                setStatusFilter("all");
                setDeptFilter("all");
                setMemberFilter("all");
                setModuleFilter("all");
                setSortOrder("due-asc");
              },
              className: "text-xs text-foreground/50 hover:text-foreground underline underline-offset-2",
              children: "Clear all"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/40 ml-auto", children: [
            filtered.length,
            " assignment",
            filtered.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setBoardPrinting(true);
                setTimeout(() => {
                  window.print();
                }, 50);
              },
              className: "flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 bg-white hover:bg-black/[0.03] transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
                "Print / Export"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden print:block mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Task Board" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-600 mt-1", children: [
            deptFilter !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Department: ",
              deptFilter,
              " · "
            ] }),
            memberFilter !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Staff: ",
              memberFilter,
              " · "
            ] }),
            moduleFilter !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Module: ",
              moduleFilter,
              " · "
            ] }),
            "Sorted by: ",
            SORT_OPTIONS.find((o) => o.value === sortOrder)?.label,
            " ·",
            " ",
            filtered.length,
            " assignment",
            filtered.length !== 1 ? "s" : ""
          ] })
        ] }),
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-foreground/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mr-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Loading task board…" })
        ] }),
        !isLoading && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center border-dashed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-10 h-10 text-foreground/20 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-1", children: "No tasks assigned yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/50", children: [
            "Go to the Week Ahead planner and click the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5 inline" }),
            " icon on any task to assign it to a staff member."
          ] })
        ] }),
        pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold text-sm text-foreground/70 mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-amber-500" }),
            "Open (",
            pending.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: pending.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentCard, { a, farmId, autoExpand: targetId === a.id, forceOpen: boardPrinting }, a.id)) })
        ] }),
        completedAll.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold text-sm text-foreground/70 flex items-center gap-2", children: [
              statusFilter === "cancelled" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-slate-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-emerald-500" }),
              statusFilter === "cancelled" ? "Cancelled" : statusFilter === "completed" ? "Completed" : "Completed & Cancelled",
              " ",
              "(",
              completed.length,
              completedAll.length !== completed.length ? ` of ${completedAll.length}` : "",
              ")"
            ] }),
            windowFilterActive && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: completedWindow,
                onChange: (e) => setCompletedWindow(e.target.value),
                className: "text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground/70 print:hidden",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Rolling window", children: WINDOW_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value)) }),
                  completedYears.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "By year", children: completedYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: `year:${y}`, children: y }, y)) })
                ]
              }
            )
          ] }),
          completed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 text-center py-6", children: 'No completed tasks in this period. Choose "All time" to see everything.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: completed.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(AssignmentCard, { a, farmId, autoExpand: targetId === a.id, forceOpen: boardPrinting }, a.id)) })
        ] }),
        !isLoading && totalPending === 0 && records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/35 text-center pb-2", children: "All assigned tasks are complete. Great work." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: showNewTask,
        onClose: () => setShowNewTask(false),
        allowEditTitle: true,
        onAssigned: () => setStatusFilter("all")
      }
    )
  ] });
}
export {
  TaskBoardPage as default
};
