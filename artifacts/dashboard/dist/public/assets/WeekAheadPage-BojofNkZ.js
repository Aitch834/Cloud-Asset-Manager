import { s as createLucideIcon, b as useAppStore, j as jsxRuntimeExports, R as Redirect, c as useQueryClient, r as reactExports, m as useQuery, O as useMutation, l as cn, p as Link, S as Plus, e as LoaderCircle, n as Card, a_ as toast, a0 as X, A as ArrowRight } from "./index-CdTz9koZ.js";
import { A as AppLayout, C as CalendarDays, P as Boxes, d as Wrench, j as Truck } from "./AppLayout-FSCQu3Bg.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-BhqvWLqR.js";
import { L as LayoutList } from "./layout-list-DwfqxUbA.js";
import { C as CircleCheckBig } from "./circle-check-big-Guf8QSyn.js";
import { U as UserPlus } from "./user-plus-BM1E0_wc.js";
import { C as CircleCheck } from "./circle-check-ChfSawf-.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-DLCxYIA6.js";
import { T as TriangleAlert } from "./triangle-alert-Jvi8sGth.js";
import { C as CircleAlert, a as Clock } from "./database-DX20-aNG.js";
import { C as Calendar } from "./calendar-QH6VRUy9.js";
import { T as Tractor } from "./tractor-sbify2To.js";
import { D as Droplets } from "./shield-alert-EIGouMgo.js";
import { U as User } from "./user-BVMFkjb2.js";
import { P as Package } from "./use-safe-clerk-BndrBebd.js";
import { B as Baby } from "./baby-C27xSZDA.js";
import "./shield-check-B3QDv7Ce.js";
import "./index-eUFMt5e3.js";
const __iconNode = [
  ["path", { d: "M6 5h12", key: "fvfigv" }],
  ["path", { d: "M4 12h10", key: "oujl3d" }],
  ["path", { d: "M12 19h8", key: "baeox8" }]
];
const ChartNoAxesGantt = createLucideIcon("chart-no-axes-gantt", __iconNode);
function dayLabel(dateStr, today) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / 864e5);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}
function daysUntil(dateStr, today) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 864e5);
}
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const COLOUR_MAP = {
  red: { badge: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-400", chip: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200", bar: "bg-red-400" },
  indigo: { badge: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-400", chip: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200", bar: "bg-indigo-500" },
  violet: { badge: "bg-violet-50 text-violet-700 border-violet-100", dot: "bg-violet-400", chip: "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200", bar: "bg-violet-500" },
  amber: { badge: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400", chip: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200", bar: "bg-amber-400" },
  orange: { badge: "bg-orange-50 text-orange-700 border-orange-100", dot: "bg-orange-400", chip: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200", bar: "bg-orange-400" },
  blue: { badge: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-400", chip: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200", bar: "bg-blue-500" },
  green: { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400", chip: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200", bar: "bg-emerald-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400", chip: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200", bar: "bg-emerald-500" },
  purple: { badge: "bg-purple-50 text-purple-700 border-purple-100", dot: "bg-purple-400", chip: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200", bar: "bg-purple-500" },
  slate: { badge: "bg-slate-50 text-slate-600 border-slate-100", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200", bar: "bg-slate-500" }
};
const COLOUR_OPTIONS = [
  { value: "slate", label: "Default", swatch: "bg-slate-400" },
  { value: "blue", label: "Blue", swatch: "bg-blue-400" },
  { value: "green", label: "Green", swatch: "bg-emerald-400" },
  { value: "amber", label: "Amber", swatch: "bg-amber-400" },
  { value: "orange", label: "Orange", swatch: "bg-orange-400" },
  { value: "red", label: "Red", swatch: "bg-red-400" },
  { value: "violet", label: "Violet", swatch: "bg-violet-400" },
  { value: "indigo", label: "Indigo", swatch: "bg-indigo-400" }
];
function AssignDialog({
  task,
  farmId,
  staff,
  onClose,
  onAssigned,
  isReassignment,
  assignmentDbId
}) {
  const [memberId, setMemberId] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [reassignReason, setReassignReason] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const assignMut = useMutation({
    mutationFn: (body) => {
      if (isReassignment && assignmentDbId) {
        return fetch(`/api/farms/${farmId}/task-assignments/${assignmentDbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        }).then((r) => r.json());
      }
      return fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: (data) => {
      const member = staff.find((s) => s.id === Number(memberId));
      const name = member ? `${member.firstName} ${member.lastName}` : "staff member";
      if (isReassignment) {
        toast({ title: "Task reassigned", description: data.smsSent ? `${name} has been notified by SMS. Previous assignee also notified.` : `Task reassigned to ${name}.` });
      } else if (data.smsSent) {
        toast({ title: "Task assigned", description: `${name} has been notified by SMS.` });
      } else {
        toast({ title: "Task assigned", description: `${name} has been assigned the task. (No phone number on file — SMS not sent.)` });
      }
      onAssigned();
      onClose();
    },
    onError: () => {
      setError("Failed to assign task. Please try again.");
    }
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!memberId) {
      setError("Please select a staff member.");
      return;
    }
    setError("");
    if (isReassignment && assignmentDbId) {
      assignMut.mutate({
        assignedToMemberId: Number(memberId),
        assignmentNote: note.trim() || void 0,
        reassignmentNote: reassignReason.trim() || void 0
      });
    } else {
      const dueIso = task.dueDate ? task.dueDate.split("T")[0] : void 0;
      assignMut.mutate({
        assignedToMemberId: Number(memberId),
        title: task.title,
        description: task.description,
        dueDate: dueIso,
        module: task.module,
        href: task.href,
        taskType: task.type,
        taskSourceId: task.id,
        assignmentNote: note.trim() || void 0
      });
    }
  };
  const activeStaff = staff.filter((s) => s.isActive);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-4 rounded-lg bg-indigo-50 border border-indigo-100 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-indigo-700 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5" }),
        isReassignment ? "Re-assign to a different staff member" : "Assign to staff member"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "w-5 h-5 flex items-center justify-center rounded-full text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: memberId,
          onChange: (e) => setMemberId(e.target.value),
          className: "w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select staff member…" }),
            activeStaff.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.id, children: [
              s.firstName,
              " ",
              s.lastName,
              s.jobTitle ? ` — ${s.jobTitle}` : "",
              s.phone ? "" : " (no phone)"
            ] }, s.id))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: note,
          onChange: (e) => setNote(e.target.value),
          placeholder: isReassignment ? "Updated note for the new staff member (optional)…" : "Optional note for the staff member…",
          rows: 2,
          className: "w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        }
      ),
      isReassignment && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: reassignReason,
          onChange: (e) => setReassignReason(e.target.value),
          placeholder: "Reason for re-assigning (optional — logged in assignment history)…",
          rows: 2,
          className: "w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        }
      ),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: assignMut.isPending || !memberId,
            className: "flex-1 bg-indigo-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors",
            children: assignMut.isPending ? isReassignment ? "Re-assigning…" : "Assigning…" : isReassignment ? "Re-assign & notify" : "Assign & notify"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "text-xs font-semibold py-2 px-3 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors", children: "Cancel" })
      ] })
    ] })
  ] });
}
function TaskCard({
  task,
  today,
  onDelete,
  staff,
  farmId,
  onAssigned
}) {
  const days = daysUntil(task.dueDate, today);
  const overdue = days < 0;
  const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
  const isCustom = task.type === "planner_event";
  const isAssignment = task.type === "task_assignment";
  const isBirthWatch = ["expected_calving", "expected_lambing", "expected_farrowing"].includes(task.type);
  const [showAssign, setShowAssign] = reactExports.useState(false);
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
    "flex items-start gap-4 px-5 py-4 rounded-xl border bg-white hover:shadow-sm transition-all group",
    overdue ? "border-red-200 bg-red-50/30" : "border-border",
    isCustom ? "cursor-default" : "cursor-pointer"
  ), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", colours.dot) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("font-semibold text-sm leading-snug", overdue ? "text-red-800" : "text-foreground"), children: task.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border", colours.badge), children: task.module }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAssign((p) => !p);
              },
              className: cn(
                "w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                showAssign ? "bg-indigo-100 text-indigo-600" : "text-foreground/30 hover:text-indigo-600 hover:bg-indigo-50"
              ),
              title: "Assign to staff member",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5" })
            }
          ),
          isCustom && onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(task.id);
              },
              className: "w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-red-500 hover:bg-red-50 transition-colors",
              title: "Remove reminder",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/60 mt-1 leading-relaxed", children: task.description }),
      overdue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
        Math.abs(days),
        " day",
        Math.abs(days) !== 1 ? "s" : "",
        " overdue"
      ] }),
      days === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-amber-600 mt-1.5 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
        "Due today"
      ] }),
      isBirthWatch && !showAssign && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAssign(true);
          },
          className: "mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Baby, { className: "w-3.5 h-3.5" }),
            "Raise birth-watch task"
          ]
        }
      ),
      showAssign && /* @__PURE__ */ jsxRuntimeExports.jsx(AssignDialog, { task, farmId, staff, onClose: () => setShowAssign(false), onAssigned })
    ] }),
    !isCustom && !showAssign && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 text-foreground/20 group-hover:text-foreground/50 flex-shrink-0 mt-1 transition-colors" })
  ] });
  if (isCustom || showAssign) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: inner });
  if (isAssignment) return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: `/task-board?id=${task.id.replace("assign-", "")}`, children: inner });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: task.href, children: inner });
}
function ResourceAssignSection({
  task,
  farmId,
  resources,
  onRefresh
}) {
  const [showPicker, setShowPicker] = reactExports.useState(false);
  const createAllocMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-resource-allocations`, {
      method: "POST",
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
      onRefresh();
      setShowPicker(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const removeAllocMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/task-resource-allocations/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => onRefresh(),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const allocations = task.allocations ?? [];
  const assignedIds = new Set(allocations.map((a) => a.resourceId));
  const available = resources.filter((r) => !assignedIds.has(r.id));
  if (resources.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-border/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/60", children: "Resources" }),
      available.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowPicker((p) => !p),
          className: "text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors",
          children: showPicker ? "Cancel" : "+ Assign"
        }
      )
    ] }),
    allocations.length === 0 && !showPicker && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/35 italic", children: "No resources assigned" }),
    allocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-2", children: allocations.map((alloc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-1.5 h-1.5 rounded-full", RESOURCE_DOT_COLOURS[alloc.resourceColour] ?? "bg-slate-400") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResourceTypeIcon, { type: alloc.resourceType, className: "text-foreground/50" }),
      alloc.resourceName,
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => removeAllocMut.mutate(alloc.id),
          disabled: removeAllocMut.isPending,
          className: "ml-0.5 text-foreground/30 hover:text-red-500 transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-2.5 h-2.5" })
        }
      )
    ] }, alloc.id)) }),
    showPicker && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border bg-muted/20 p-1.5 space-y-0.5", children: available.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => createAllocMut.mutate({ resourceId: r.id, taskRef: task.id, taskTitle: task.title, allocatedDate: task.dueDate.slice(0, 10) }),
        disabled: createAllocMut.isPending,
        className: "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-border/50 transition-all text-left",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2 h-2 rounded-full flex-shrink-0", RESOURCE_DOT_COLOURS[r.colour] ?? "bg-slate-400") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResourceTypeIcon, { type: r.type, className: "text-foreground/40 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground leading-tight", children: r.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40", children: RESOURCE_TYPE_LABELS[r.type] ?? r.type })
          ] })
        ]
      },
      r.id
    )) })
  ] });
}
function TaskCardExpanded({
  task,
  today,
  onDelete,
  staff,
  farmId,
  onAssigned,
  onClose,
  resources
}) {
  const days = daysUntil(task.dueDate, today);
  const overdue = days < 0;
  const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
  const isCustom = task.type === "planner_event";
  const isAssignment = task.type === "task_assignment";
  const isBirthWatch = ["expected_calving", "expected_lambing", "expected_farrowing"].includes(task.type);
  const [showAssign, setShowAssign] = reactExports.useState(false);
  const dueLabel = new Date(task.dueDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
    "rounded-xl border bg-white shadow-md p-4",
    overdue ? "border-red-200" : "border-indigo-200"
  ), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5", colours.dot) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("font-semibold text-sm leading-snug", overdue ? "text-red-800" : "text-foreground"), children: task.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onClose,
          className: "w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors flex-shrink-0",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border", colours.badge), children: task.module }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-foreground/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3" }),
        dueLabel
      ] }),
      overdue && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold text-red-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
        Math.abs(days),
        "d overdue"
      ] }),
      days === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
        "Due today"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/60 leading-relaxed mb-3", children: task.description }),
    (task.reqTractors ?? 0) + (task.reqImplements ?? 0) + (task.reqVehicles ?? 0) + (task.reqSprayers ?? 0) + (task.reqTrailers ?? 0) + (task.reqStaff ?? 0) + (task.reqOther ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mb-3", children: [{ label: "Tractor", count: task.reqTractors, icon: Tractor }, { label: "Implement", count: task.reqImplements, icon: Wrench }, { label: "Vehicle", count: task.reqVehicles, icon: Truck }, { label: "Sprayer", count: task.reqSprayers, icon: Droplets }, { label: "Trailer", count: task.reqTrailers, icon: Boxes }, { label: "Staff", count: task.reqStaff, icon: User }, { label: "Other", count: task.reqOther, icon: Package }].filter((r) => (r.count ?? 0) > 0).map(({ label, count, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-2.5 h-2.5" }),
      count,
      "× ",
      label
    ] }, label)) }),
    (() => {
      const assignmentDbId = isAssignment ? parseInt(task.id.replace("assign-", ""), 10) : void 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          isAssignment && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              href: `/task-board?id=${assignmentDbId}`,
              className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              children: [
                "View assignment ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3" })
              ]
            }
          ),
          !isCustom && !isAssignment && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              href: task.href,
              className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              children: [
                "Open record ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3" })
              ]
            }
          ),
          isBirthWatch && !showAssign && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAssign(true),
              className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Baby, { className: "w-3.5 h-3.5" }),
                "Raise birth-watch task"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAssign((p) => !p),
              className: cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
                showAssign ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "border-border hover:bg-muted"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5" }),
                isAssignment ? "Re-assign" : "Assign"
              ]
            }
          ),
          isCustom && onDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onDelete(task.id),
              className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-red-600 hover:bg-red-50 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
                "Delete"
              ]
            }
          )
        ] }),
        showAssign && /* @__PURE__ */ jsxRuntimeExports.jsx(
          AssignDialog,
          {
            task,
            farmId,
            staff,
            onClose: () => setShowAssign(false),
            onAssigned,
            isReassignment: isAssignment,
            assignmentDbId
          }
        )
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ResourceAssignSection, { task, farmId, resources: resources ?? [], onRefresh: onAssigned })
  ] });
}
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function getCalendarWeeks(today, days) {
  const start = new Date(today);
  const dow = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dow);
  const end = new Date(today);
  end.setDate(end.getDate() + days);
  const endDow = (end.getDay() + 6) % 7;
  if (endDow < 6) end.setDate(end.getDate() + (6 - endDow));
  const weeks = [];
  const cur = new Date(start);
  while (cur <= end) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}
function CalendarView({
  tasks,
  today,
  days,
  onDelete,
  staff,
  farmId,
  onAssigned
}) {
  const [selectedTask, setSelectedTask] = reactExports.useState(null);
  const overdue = tasks.filter((t) => daysUntil(t.dueDate, today) < 0);
  const upcoming = tasks.filter((t) => daysUntil(t.dueDate, today) >= 0);
  const byDate = /* @__PURE__ */ new Map();
  for (const t of upcoming) {
    const key = isoDate(new Date(t.dueDate));
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(t);
  }
  const weeks = getCalendarWeeks(today, days);
  const todayStr = isoDate(today);
  const rangeStart = isoDate(today);
  const rangeEndDate = new Date(today);
  rangeEndDate.setDate(rangeEndDate.getDate() + days);
  const rangeEnd = isoDate(rangeEndDate);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    overdue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50/60 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-red-700", children: "Overdue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full", children: overdue.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: overdue.map((t) => {
        const colours = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
        const isSelected = selectedTask?.id === t.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setSelectedTask(isSelected ? null : t),
            className: cn(
              "text-left px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all",
              isSelected ? "ring-2 ring-red-400 bg-white border-red-300" : "bg-white border-red-200 hover:border-red-400 hover:shadow-sm"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2 h-2 rounded-full flex-shrink-0", colours.dot) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-red-800", children: t.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("ml-auto text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0", colours.badge), children: t.module })
            ]
          },
          t.id
        );
      }) }),
      selectedTask && overdue.some((t) => t.id === selectedTask.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TaskCardExpanded,
        {
          task: selectedTask,
          today,
          onDelete,
          staff,
          farmId,
          onAssigned,
          onClose: () => setSelectedTask(null)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 border-b border-border", children: DOW_LABELS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2 text-center text-[11px] font-bold text-foreground/50 uppercase tracking-wide", children: d }, d)) }),
      weeks.map((week, wi) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid grid-cols-7", wi < weeks.length - 1 && "border-b border-border"), children: week.map((day, di) => {
        const dayStr = isoDate(day);
        const isToday = dayStr === todayStr;
        const inRange = dayStr >= rangeStart && dayStr <= rangeEnd;
        const dayTasks = byDate.get(dayStr) ?? [];
        const maxVisible = days <= 7 ? 6 : 3;
        const overflow = dayTasks.length > maxVisible ? dayTasks.length - maxVisible : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "min-h-[90px] p-1.5 relative",
              di < 6 && "border-r border-border",
              !inRange && "bg-muted/30",
              isToday && "bg-primary/5"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                  "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-primary text-primary-foreground" : inRange ? "text-foreground" : "text-foreground/30"
                ), children: day.getDate() }),
                day.getDate() === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-foreground/40 uppercase", children: day.toLocaleDateString("en-GB", { month: "short" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                dayTasks.slice(0, maxVisible).map((t) => {
                  const colours = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
                  const isSelected = selectedTask?.id === t.id;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setSelectedTask(isSelected ? null : t),
                      className: cn(
                        "w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate transition-all leading-tight",
                        colours.chip,
                        isSelected && "ring-2 ring-offset-0 ring-indigo-400"
                      ),
                      title: t.title,
                      children: t.title
                    },
                    t.id
                  );
                }),
                overflow > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-[10px] text-primary font-semibold pl-1 hover:underline w-full text-left", children: [
                    "+",
                    overflow,
                    " more"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { side: "bottom", align: "start", className: "w-64 p-2 space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-bold text-foreground/50 uppercase tracking-wide px-1 pb-1", children: [
                      day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }),
                      " — all tasks"
                    ] }),
                    dayTasks.map((t) => {
                      const colours = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
                      const isSelected = selectedTask?.id === t.id;
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => setSelectedTask(isSelected ? null : t),
                          className: cn(
                            "w-full text-left text-[10px] font-semibold px-1.5 py-1 rounded border truncate transition-all leading-tight",
                            colours.chip,
                            isSelected && "ring-2 ring-offset-0 ring-indigo-400"
                          ),
                          title: t.title,
                          children: t.title
                        },
                        t.id
                      );
                    })
                  ] })
                ] })
              ] })
            ]
          },
          di
        );
      }) }, wi))
    ] }),
    selectedTask && !overdue.some((t) => t.id === selectedTask.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskCardExpanded,
      {
        task: selectedTask,
        today,
        onDelete,
        staff,
        farmId,
        onAssigned,
        onClose: () => setSelectedTask(null)
      }
    ),
    tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/35 text-center", children: "Click any task chip to see full details, assign to staff, or open the record." })
  ] });
}
const RESOURCE_DOT_COLOURS = {
  slate: "bg-slate-400",
  indigo: "bg-indigo-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  orange: "bg-orange-500",
  red: "bg-red-500",
  purple: "bg-purple-500"
};
const RESOURCE_TYPE_LABELS = {
  tractor: "Tractor",
  implement: "Implement",
  vehicle: "Vehicle",
  sprayer: "Sprayer",
  trailer: "Trailer",
  staff: "Staff / Contractor",
  other: "Other"
};
function ResourceTypeIcon({ type, className }) {
  const icons = {
    tractor: Tractor,
    implement: Wrench,
    vehicle: Truck,
    sprayer: Droplets,
    trailer: Package,
    staff: User,
    other: Boxes
  };
  const Icon = icons[type] ?? Boxes;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("w-3 h-3", className) });
}
function GanttView({
  tasks,
  today,
  days,
  onDelete,
  staff,
  farmId,
  onAssigned,
  resources
}) {
  const [selectedTask, setSelectedTask] = reactExports.useState(null);
  const [showResourceSidebar, setShowResourceSidebar] = reactExports.useState(false);
  const [draggingResourceId, setDraggingResourceId] = reactExports.useState(null);
  const [dropTargetId, setDropTargetId] = reactExports.useState(null);
  const createAllocMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-resource-allocations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => onAssigned(),
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const conflictedTaskIds = reactExports.useMemo(() => {
    const byKey = /* @__PURE__ */ new Map();
    for (const task of tasks) {
      for (const alloc of task.allocations ?? []) {
        const key = `${alloc.allocatedDate}-${alloc.resourceId}`;
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(task.id);
      }
    }
    const conflicted = /* @__PURE__ */ new Set();
    for (const [, ids] of byKey) {
      if (ids.length > 1) ids.forEach((id) => conflicted.add(id));
    }
    return conflicted;
  }, [tasks]);
  const overdue = tasks.filter((t) => daysUntil(t.dueDate, today) < 0);
  const upcoming = tasks.filter((t) => daysUntil(t.dueDate, today) >= 0);
  const sorted = [...upcoming].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const dayHeaders = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const todayStr = isoDate(today);
  const ganttStart = new Date(today);
  ganttStart.setHours(0, 0, 0, 0);
  const ganttStartMs = ganttStart.getTime();
  const totalMs = days * 864e5;
  const getBarProps = (task) => {
    const startD = new Date(task.dueDate);
    startD.setHours(0, 0, 0, 0);
    const endD = task.endDate ? (() => {
      const d = new Date(task.endDate);
      d.setHours(0, 0, 0, 0);
      return d;
    })() : startD;
    const clampedStart = Math.max(ganttStartMs, startD.getTime());
    const clampedEnd = Math.min(ganttStartMs + totalMs, endD.getTime() + 864e5);
    const leftPct = (clampedStart - ganttStartMs) / totalMs * 100;
    const widthPct = Math.max(1 / days * 100, (clampedEnd - clampedStart) / totalMs * 100);
    return {
      leftPct,
      widthPct,
      hasDuration: endD.getTime() > startD.getTime(),
      startsBeforeWindow: startD.getTime() < ganttStartMs,
      endsAfterWindow: endD.getTime() + 864e5 > ganttStartMs + totalMs
    };
  };
  const colGrid = { gridTemplateColumns: `repeat(${days}, 1fr)` };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    overdue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50/60 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-red-700", children: "Overdue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full", children: overdue.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: overdue.map((t) => {
        const colours = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
        const isSel = selectedTask?.id === t.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setSelectedTask(isSel ? null : t),
            className: cn(
              "text-left px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all",
              isSel ? "ring-2 ring-red-400 bg-white border-red-300" : "bg-white border-red-200 hover:border-red-400 hover:shadow-sm"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2 h-2 rounded-full flex-shrink-0", colours.dot) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-red-800", children: t.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("ml-auto text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0", colours.badge), children: t.module })
            ]
          },
          t.id
        );
      }) }),
      selectedTask && overdue.some((t) => t.id === selectedTask.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCardExpanded, { task: selectedTask, today, onDelete, staff, farmId, onAssigned, onClose: () => setSelectedTask(null), resources }) })
    ] }),
    resources.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setShowResourceSidebar((p) => !p),
        className: cn(
          "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
          showResourceSidebar ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-border text-foreground/60 hover:bg-muted"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "w-3.5 h-3.5" }),
          showResourceSidebar ? "Hide resources" : "Show resources"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-border bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-56 flex-shrink-0 border-r border-border px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-foreground/40 uppercase tracking-wide", children: "Task" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 grid", style: colGrid, children: dayHeaders.map((d, i) => {
            const ds = isoDate(d);
            const isToday = ds === todayStr;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("py-2 text-center border-r last:border-r-0 border-border/40", isToday && "bg-primary/10"), children: days <= 7 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-[10px] font-bold leading-none", isToday ? "text-primary" : "text-foreground/50"), children: d.toLocaleDateString("en-GB", { weekday: "short" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-[12px] font-bold mt-0.5", isToday ? "text-primary" : "text-foreground/70"), children: d.getDate() })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-[10px] font-bold", isToday ? "text-primary" : "text-foreground/40"), children: d.getDate() === 1 ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : d.getDate() % (days <= 14 ? 2 : 5) === 0 ? String(d.getDate()) : "" }) }, i);
          }) })
        ] }),
        sorted.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-8 text-center text-sm text-foreground/40", children: "No upcoming tasks in this window." }),
        sorted.map((task) => {
          const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
          const isSel = selectedTask?.id === task.id;
          const { leftPct, widthPct, hasDuration, startsBeforeWindow, endsAfterWindow } = getBarProps(task);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex border-b last:border-b-0 transition-colors", isSel ? "bg-indigo-50/40" : "hover:bg-muted/20"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-56 flex-shrink-0 border-r border-border px-3 py-2 flex items-start gap-2 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", colours.dot) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate leading-tight", children: task.title }),
                  conflictedTaskIds.has(task.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3 flex-shrink-0 text-amber-500", "aria-label": "Resource conflict" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex text-[10px] font-semibold px-1.5 rounded-full border mt-0.5", colours.badge), children: task.module }),
                (task.allocations ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5 mt-1 flex-wrap", children: task.allocations.map((alloc) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm", RESOURCE_DOT_COLOURS[alloc.resourceColour] ?? "bg-slate-400"), title: alloc.resourceName }, alloc.id)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", style: { minHeight: 50 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid pointer-events-none", style: colGrid, children: dayHeaders.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("border-r last:border-r-0 border-border/25 h-full", isoDate(d) === todayStr && "bg-primary/5") }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setSelectedTask(isSel ? null : task),
                  onDragOver: (e) => {
                    e.preventDefault();
                    setDropTargetId(task.id);
                  },
                  onDragLeave: () => setDropTargetId(null),
                  onDrop: (e) => {
                    e.preventDefault();
                    setDropTargetId(null);
                    if (draggingResourceId !== null) {
                      createAllocMut.mutate({ resourceId: draggingResourceId, taskRef: task.id, taskTitle: task.title, allocatedDate: task.dueDate.slice(0, 10) });
                      setDraggingResourceId(null);
                    }
                  },
                  title: task.title,
                  className: cn(
                    "absolute top-1/2 -translate-y-1/2 h-7 flex items-center px-2 text-white text-[10px] font-semibold transition-all hover:brightness-90 focus:outline-none",
                    colours.bar,
                    hasDuration ? "rounded-md" : "rounded-full",
                    startsBeforeWindow && "rounded-l-none",
                    endsAfterWindow && "rounded-r-none",
                    isSel && "ring-2 ring-offset-1 ring-indigo-400 brightness-90",
                    dropTargetId === task.id && "ring-2 ring-offset-1 ring-white scale-y-110 brightness-110"
                  ),
                  style: { left: `${Math.max(0, leftPct)}%`, width: `${widthPct}%` },
                  children: hasDuration && widthPct > 12 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: task.title })
                }
              )
            ] })
          ] }, task.id);
        })
      ] }) }),
      showResourceSidebar && resources.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-52 flex-shrink-0 rounded-xl border border-border bg-white overflow-hidden self-stretch", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2.5 border-b border-border bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold text-foreground/60 uppercase tracking-wide", children: "Resources" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/35 mt-0.5", children: "Drag onto a task bar to assign" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1 max-h-[480px] overflow-y-auto", children: resources.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            draggable: true,
            onDragStart: () => setDraggingResourceId(r.id),
            onDragEnd: () => setDraggingResourceId(null),
            className: cn(
              "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing border select-none transition-all",
              draggingResourceId === r.id ? "opacity-40 border-border/50 bg-muted/30" : "border-transparent hover:border-border/60 hover:bg-muted/30"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("w-2.5 h-2.5 rounded-full flex-shrink-0", RESOURCE_DOT_COLOURS[r.colour] ?? "bg-slate-400") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ResourceTypeIcon, { type: r.type, className: "text-foreground/40 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate leading-tight", children: r.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-foreground/40", children: RESOURCE_TYPE_LABELS[r.type] ?? r.type })
              ] })
            ]
          },
          r.id
        )) })
      ] })
    ] }),
    selectedTask && !overdue.some((t) => t.id === selectedTask.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCardExpanded, { task: selectedTask, today, onDelete, staff, farmId, onAssigned, onClose: () => setSelectedTask(null), resources }),
    (sorted.length > 0 || overdue.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/35 text-center", children: [
      "Click any bar to view details. ",
      resources.length > 0 ? "Show the resource panel and drag a resource onto a bar to assign it." : "Visit Resource Planner to add your tractors, implements and staff."
    ] })
  ] });
}
function DaySection({ label, tasks, today, isOverdue, onDelete, staff, farmId, onAssigned }) {
  if (tasks.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
      isOverdue ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: cn("font-bold text-sm", isOverdue ? "text-red-600" : "text-foreground/70"), children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
        "text-xs font-semibold px-2 py-0.5 rounded-full",
        isOverdue ? "bg-red-100 text-red-700" : "bg-muted text-foreground/60"
      ), children: tasks.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: tasks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { task: t, today, onDelete, staff, farmId, onAssigned }, t.id)) })
  ] });
}
function AddReminderPanel({ farmId, days, onClose }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = reactExports.useState("");
  const [date, setDate] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [colour, setColour] = reactExports.useState("slate");
  const [endDate, setEndDate] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [showReqs, setShowReqs] = reactExports.useState(false);
  const [reqTractors, setReqTractors] = reactExports.useState(0);
  const [reqImplements, setReqImplements] = reactExports.useState(0);
  const [reqVehicles, setReqVehicles] = reactExports.useState(0);
  const [reqSprayers, setReqSprayers] = reactExports.useState(0);
  const [reqTrailers, setReqTrailers] = reactExports.useState(0);
  const [reqStaff, setReqStaff] = reactExports.useState(0);
  const [reqOther, setReqOther] = reactExports.useState(0);
  const [estimatedHours, setEstimatedHours] = reactExports.useState("");
  const [startTime, setStartTime] = reactExports.useState("");
  const [endTime, setEndTime] = reactExports.useState("");
  const minDate = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().split("T")[0];
  })();
  const maxDate = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  })();
  const maxEndDate = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + 365);
    return d.toISOString().split("T")[0];
  })();
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/planner-events`, {
      method: "POST",
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
      queryClient.invalidateQueries({ queryKey: ["week-ahead", farmId, days] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!date) {
      setError("Please choose a date.");
      return;
    }
    setError("");
    createMut.mutate({ title: title.trim(), description: description.trim() || void 0, eventDate: date + "T12:00:00Z", endDate: endDate ? endDate + "T12:00:00Z" : void 0, colour, estimatedDurationHours: estimatedHours ? Number(estimatedHours) : void 0, startTime: startTime || void 0, endTime: endTime || void 0, reqTractors, reqImplements, reqVehicles, reqSprayers, reqTrailers, reqStaff, reqOther });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 border-primary/20 bg-primary/5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-foreground", children: "Add a reminder" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "w-6 h-6 flex items-center justify-center rounded-full text-foreground/40 hover:text-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 block mb-1", children: "Title *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "e.g. Merchant rep visit, Drainage contractor",
            className: "w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 block mb-1", children: "Start Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: date,
            min: minDate,
            max: maxDate,
            onChange: (e) => {
              setDate(e.target.value);
              if (endDate && e.target.value > endDate) setEndDate("");
            },
            className: "w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-foreground/60 block mb-1", children: [
          "End Date ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-foreground/40", children: "(optional — for multi-day tasks)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: endDate,
            min: date || minDate,
            max: maxEndDate,
            onChange: (e) => setEndDate(e.target.value),
            className: "w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 block mb-1", children: "Note (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: "Any extra details…",
            rows: 2,
            className: "w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground/60 block mb-2", children: "Colour" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: COLOUR_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setColour(opt.value),
            title: opt.label,
            className: cn(
              "w-6 h-6 rounded-full transition-all",
              opt.swatch,
              colour === opt.value ? "ring-2 ring-offset-2 ring-foreground/40 scale-110" : "opacity-60 hover:opacity-100"
            )
          },
          opt.value
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowReqs((p) => !p),
            className: "flex items-center gap-1.5 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("w-3 h-3 transition-transform", showReqs && "rotate-180") }),
              "Resource requirements ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-foreground/30", children: "(optional)" })
            ]
          }
        ),
        showReqs && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-3 border border-border/60 rounded-lg p-3 bg-white/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold text-foreground/50 block mb-1", children: "Start time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: startTime, onChange: (e) => setStartTime(e.target.value), className: "w-full text-xs border border-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold text-foreground/50 block mb-1", children: "End time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: endTime, onChange: (e) => setEndTime(e.target.value), className: "w-full text-xs border border-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-semibold text-foreground/50 block mb-1", children: "Estimated hours" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", step: "0.5", value: estimatedHours, onChange: (e) => setEstimatedHours(e.target.value), placeholder: "e.g. 4", className: "w-full text-xs border border-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [
            { label: "Tractors", val: reqTractors, set: setReqTractors },
            { label: "Implements", val: reqImplements, set: setReqImplements },
            { label: "Vehicles", val: reqVehicles, set: setReqVehicles },
            { label: "Sprayers", val: reqSprayers, set: setReqSprayers },
            { label: "Trailers", val: reqTrailers, set: setReqTrailers },
            { label: "Staff", val: reqStaff, set: setReqStaff },
            { label: "Other", val: reqOther, set: setReqOther }
          ].map(({ label, val, set }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 bg-muted/40 rounded-md px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-foreground/60", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => set(Math.max(0, val - 1)), className: "w-5 h-5 rounded text-foreground/50 hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center text-sm font-bold", children: "−" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold w-4 text-center", children: val }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => set(val + 1), className: "w-5 h-5 rounded text-foreground/50 hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center text-sm font-bold", children: "+" })
            ] })
          ] }, label)) })
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: createMut.isPending,
            className: "flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors",
            children: createMut.isPending ? "Saving…" : "Add reminder"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "text-sm font-semibold py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors", children: "Cancel" })
      ] })
    ] })
  ] });
}
function WeekAheadPage() {
  const { farmId } = useAppStore();
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { href: "/select" });
  const queryClient = useQueryClient();
  const [days, setDays] = reactExports.useState(7);
  const [showAddPanel, setShowAddPanel] = reactExports.useState(false);
  const [viewMode, setViewMode] = reactExports.useState(() => {
    try {
      return localStorage.getItem("weekAheadViewMode") || "list";
    } catch {
      return "list";
    }
  });
  const setView = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("weekAheadViewMode", mode);
    } catch {
    }
  };
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + days);
  const { data, isLoading } = useQuery({
    queryKey: ["week-ahead", farmId, days],
    queryFn: () => fetch(`/api/farms/${farmId}/week-ahead?days=${days}`).then((r) => r.json())
  });
  const { data: staffData } = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json())
  });
  const { data: resourcesData } = useQuery({
    queryKey: ["resources", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/resources`).then((r) => r.json())
  });
  const { data: organicCertData } = useQuery({
    queryKey: ["oa-cert", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/organic-arable/certification`, { credentials: "include" });
      if (!r.ok) return [];
      const d = await r.json();
      return (d.records ?? []).filter((c) => !["suspended", "withdrawn"].includes(c.status));
    }
  });
  const deleteMut = useMutation({
    mutationFn: (id) => {
      const numId = id.replace("planner-", "");
      return fetch(`/api/farms/${farmId}/planner-events/${numId}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["week-ahead", farmId, days] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const certTasks = [];
  for (const cert of organicCertData ?? []) {
    const certifier = cert.certifier ?? "Organic cert";
    const makeTask = (dateStr, id, title, colour) => {
      if (!dateStr) return null;
      const d = daysUntil(dateStr, today);
      if (d > days && d >= 0) return null;
      return { id, type: "organic-cert", title, description: `${certifier}${cert.certificateNumber ? ` — ${cert.certificateNumber}` : ""}`, dueDate: dateStr, module: "Organic Arable", href: "/organic-arable", colour };
    };
    const r = makeTask(cert.renewalDate, `oa-cert-renewal-${cert.id}`, `Cert renewal — ${certifier}`, "green");
    const i = makeTask(cert.nextInspectionDue, `oa-cert-inspect-${cert.id}`, `Organic inspection — ${certifier}`, "amber");
    const a = makeTask(cert.annualInspectionDate, `oa-cert-annual-${cert.id}`, `Annual inspection — ${certifier}`, "amber");
    if (r) certTasks.push(r);
    if (i) certTasks.push(i);
    if (a) certTasks.push(a);
  }
  const apiTasks = data?.tasks ?? [];
  const tasks = [...apiTasks, ...certTasks];
  const staff = staffData?.members ?? [];
  const resources = resourcesData?.resources ?? [];
  const overdue = tasks.filter((t) => daysUntil(t.dueDate, today) < 0);
  const upcoming = tasks.filter((t) => daysUntil(t.dueDate, today) >= 0);
  const grouped = /* @__PURE__ */ new Map();
  for (const t of upcoming) {
    const lbl = dayLabel(t.dueDate, today);
    if (!grouped.has(lbl)) grouped.set(lbl, []);
    grouped.get(lbl).push(t);
  }
  const dateRange = `${today.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${rangeEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  const label = days === 7 ? "Week Ahead" : "Month Ahead";
  const handleDelete = (id) => deleteMut.mutate(id);
  const handleAssigned = () => {
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: label, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50 mt-0.5", children: dateRange }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setDays(7),
              className: cn("px-3 py-1.5 rounded-md transition-all", days === 7 ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"),
              children: "7 days"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setDays(30),
              className: cn("px-3 py-1.5 rounded-md transition-all", days === 30 ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"),
              children: "30 days"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setView("list"),
              title: "List view",
              className: cn(
                "px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                viewMode === "list" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutList, { className: "w-3.5 h-3.5" }),
                "List"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setView("calendar"),
              title: "Calendar view",
              className: cn(
                "px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                viewMode === "calendar" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5" }),
                "Calendar"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setView("gantt"),
              title: "Gantt view",
              className: cn(
                "px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                viewMode === "gantt" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesGantt, { className: "w-3.5 h-3.5" }),
                "Gantt"
              ]
            }
          )
        ] }),
        !isLoading && tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full", children: [
          tasks.length,
          " task",
          tasks.length !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { href: "/task-board", className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted transition-all", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3.5 h-3.5 text-emerald-500" }),
          "Task Board"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowAddPanel((p) => !p),
            className: cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
              showAddPanel ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border hover:bg-muted"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
              "Add reminder"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-6", viewMode === "list" ? "max-w-2xl" : "max-w-5xl"), children: [
      showAddPanel && /* @__PURE__ */ jsxRuntimeExports.jsx(AddReminderPanel, { farmId, days, onClose: () => setShowAddPanel(false) }),
      viewMode === "list" && staff.length > 0 && !isLoading && tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3.5 h-3.5" }),
        "Click the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3 h-3 inline" }),
        " icon on any task to assign it to a staff member."
      ] }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mr-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
          "Loading your ",
          label.toLowerCase(),
          "…"
        ] })
      ] }),
      !isLoading && tasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center border-dashed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-10 h-10 text-emerald-500 mx-auto mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-1", children: "All clear" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/50", children: [
          "No scheduled tasks, due dates, or overdue items found across your active modules",
          days === 7 ? " for the next 7 days" : " for the next 30 days",
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/35 mt-2", children: 'Use "Add reminder" above to note any events not captured automatically.' })
      ] }),
      !isLoading && tasks.length > 0 && viewMode === "calendar" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        CalendarView,
        {
          tasks,
          today,
          days,
          onDelete: handleDelete,
          staff,
          farmId,
          onAssigned: handleAssigned
        }
      ),
      !isLoading && tasks.length > 0 && viewMode === "gantt" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        GanttView,
        {
          tasks,
          today,
          days,
          onDelete: handleDelete,
          staff,
          farmId,
          onAssigned: handleAssigned,
          resources
        }
      ),
      !isLoading && viewMode === "list" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        overdue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(DaySection, { label: "Overdue", tasks: overdue, today, isOverdue: true, onDelete: handleDelete, staff, farmId, onAssigned: handleAssigned }),
        [...grouped.entries()].map(([lbl, items]) => /* @__PURE__ */ jsxRuntimeExports.jsx(DaySection, { label: lbl, tasks: items, today, onDelete: handleDelete, staff, farmId, onAssigned: handleAssigned }, lbl)),
        tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/35 text-center pb-2", children: [
          "Tasks are drawn from scheduled dates across all active modules. Click any item to go directly to that record. Use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-3 h-3 inline" }),
          " icon to assign tasks to staff."
        ] })
      ] })
    ] })
  ] }) });
}
export {
  WeekAheadPage as default
};
