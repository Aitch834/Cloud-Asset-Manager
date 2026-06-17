import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, useSearch } from "wouter";
import {
  ClipboardList, CheckCircle2, Clock, XCircle, Loader2, Trash2, ChevronDown,
  UserCheck, AlertTriangle, MessageSquare, Send, History, ArrowRight, Search,
  BarChart3, Printer, ChevronRight, Building2, Users, ChevronUp, Plus,
} from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "@/hooks/use-toast";

type Assignment = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  module: string | null;
  staffName: string;
  assignmentNote: string | null;
  status: string;
  smsSent: boolean;
  completedAt: string | null;
  completionNote: string | null;
  createdAt: string;
  taskType: string;
};

type HistoryEntry = {
  id: number;
  assignmentId: number;
  previousAssigneeName: string | null;
  newAssigneeName: string | null;
  reassignmentNote: string | null;
  reassignedAt: string;
};

type StaffMember = { id: number; firstName: string; lastName: string; isActive: boolean; departmentName?: string | null; departmentColour?: string | null; };

const STATUS_CONFIG: Record<string, { label: string; colour: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:     { label: "Pending",     colour: "bg-amber-50 text-amber-700 border-amber-200",   icon: Clock },
  in_progress: { label: "In Progress", colour: "bg-blue-50 text-blue-700 border-blue-200",     icon: ClipboardList },
  completed:   { label: "Completed",   colour: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled:   { label: "Cancelled",   colour: "bg-slate-50 text-slate-500 border-slate-200",  icon: XCircle },
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDateTime(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function AssignmentCard({ a, farmId, autoExpand }: { a: Assignment; farmId: number; autoExpand?: boolean }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(autoExpand ?? false);
  const [newStatus, setNewStatus] = useState(a.status);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoExpand && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [autoExpand]);

  const { data: historyData, isFetching: historyLoading } = useQuery<{ history: HistoryEntry[] }>({
    queryKey: ["assignment-history", a.id],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments/${a.id}/history`).then(r => r.json()),
    enabled: expanded,
  });
  const history = historyData?.history ?? [];

  const cfg = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const dueDate = a.dueDate ? new Date(a.dueDate) : null;
  const isOverdue = dueDate && a.status !== "completed" && a.status !== "cancelled"
    ? dueDate < new Date() : false;

  const patchMut = useMutation({
    mutationFn: (body: object) =>
      fetch(`/api/farms/${farmId}/task-assignments/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-assignments", farmId] });
      toast({ title: "Assignment updated" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () =>
      fetch(`/api/farms/${farmId}/task-assignments/${a.id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-assignments", farmId] });
      toast({ title: "Assignment removed" });
    },
  });

  return (
    <div
      ref={cardRef}
      className={cn(
        "rounded-xl border bg-white transition-all",
        autoExpand && "ring-2 ring-primary ring-offset-1",
        isOverdue && a.status === "pending" ? "border-red-200" : "border-border"
      )}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(p => !p)}
      >
        <StatusIcon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", {
          "text-amber-500": a.status === "pending",
          "text-blue-500": a.status === "in_progress",
          "text-emerald-500": a.status === "completed",
          "text-slate-400": a.status === "cancelled",
        })} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("font-semibold text-sm leading-snug", a.status === "completed" ? "text-foreground/50 line-through" : "text-foreground")}>
              {a.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {a.module && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground/60 border border-border">
                  {a.module}
                </span>
              )}
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", cfg.colour)}>
                {cfg.label}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-foreground/30 transition-transform", expanded && "rotate-180")} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-foreground/60 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />{a.staffName}
            </span>
            {a.dueDate && (
              <span className={cn("text-xs flex items-center gap-1", isOverdue ? "text-red-600 font-semibold" : "text-foreground/50")}>
                {isOverdue && <AlertTriangle className="w-3 h-3" />}
                Due {fmtDate(a.dueDate)}
              </span>
            )}
            {a.taskType === "field-inspection" && (
              <Link href="/field-inspections">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 flex items-center gap-1 w-fit">
                  <Search className="w-2.5 h-2.5" />From Field Inspection
                </span>
              </Link>
            )}
            {a.smsSent && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Send className="w-3 h-3" />SMS sent
              </span>
            )}
            {history.length > 0 && (
              <span className="text-xs text-indigo-600 flex items-center gap-1">
                <History className="w-3 h-3" />{history.length} reassignment{history.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-3 mt-0">
          {a.description && (
            <p className="text-xs text-foreground/60 leading-relaxed pt-3">{a.description}</p>
          )}
          {a.assignmentNote && (
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-indigo-700 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />Manager's note
              </p>
              <p className="text-xs text-indigo-700">{a.assignmentNote}</p>
            </div>
          )}
          {a.completionNote && (
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />Completion note
              </p>
              <p className="text-xs text-emerald-700">{a.completionNote}</p>
            </div>
          )}
          {a.completedAt && (
            <p className="text-xs text-foreground/40">Completed {fmtDate(a.completedAt)}</p>
          )}

          {/* Reassignment history */}
          {historyLoading && (
            <div className="flex items-center gap-2 py-2 text-foreground/40">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">Loading history…</span>
            </div>
          )}
          {!historyLoading && history.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border">
                <History className="w-3.5 h-3.5 text-foreground/50" />
                <span className="text-xs font-semibold text-foreground/70">Reassignment history</span>
              </div>
              <div className="divide-y divide-border">
                {history.map((h, i) => (
                  <div key={h.id} className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                        <span className="text-[9px] font-bold text-indigo-600">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-foreground/60">{h.previousAssigneeName ?? "—"}</span>
                          <ArrowRight className="w-3 h-3 text-foreground/30 flex-shrink-0" />
                          <span className="text-xs font-semibold text-foreground">{h.newAssigneeName ?? "—"}</span>
                        </div>
                        {h.reassignmentNote && (
                          <p className="text-xs text-foreground/50 mt-0.5 italic">"{h.reassignmentNote}"</p>
                        )}
                        <p className="text-[10px] text-foreground/35 mt-0.5">{fmtDateTime(h.reassignedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="flex-1 text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              disabled={newStatus === a.status || patchMut.isPending}
              onClick={() => patchMut.mutate({ status: newStatus })}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              {patchMut.isPending ? "…" : "Update"}
            </button>
            <button
              onClick={() => deleteMut.mutate()}
              disabled={deleteMut.isPending}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-foreground/30 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
              title="Delete assignment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports View ─────────────────────────────────────────────────────────────

type ReportTask = {
  id: number;
  title: string;
  status: string;
  module: string | null;
  taskType: string;
  staffName: string;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
  assignedToMemberId: number | null;
  departmentId: number | null;
  departmentName: string | null;
  departmentColour: string | null;
};

const PERIOD_OPTIONS = [
  { value: "this-week",    label: "This Week" },
  { value: "last-week",    label: "Last Week" },
  { value: "this-month",   label: "This Month" },
  { value: "last-month",   label: "Last Month" },
  { value: "last-3-months",label: "Last 3 Months" },
];

function fmtPeriodLabel(period: string, start: string, end: string) {
  const s = new Date(start).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const e = new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${s} – ${e}`;
}

function StatusPill({ status, count }: { status: string; count: number }) {
  if (count === 0) return null;
  const cfg: Record<string, string> = {
    completed:   "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    pending:     "bg-amber-100 text-amber-700",
    cancelled:   "bg-slate-100 text-slate-500",
  };
  const labels: Record<string, string> = {
    completed: "Done", in_progress: "In Progress", pending: "Pending", cancelled: "Cancelled",
  };
  return (
    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${cfg[status] ?? "bg-slate-100 text-slate-600"}`}>
      {count} {labels[status] ?? status}
    </span>
  );
}

function TaskRow({ task }: { task: ReportTask }) {
  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3 py-2 px-3 text-sm border-b border-border/20 last:border-0">
      <Icon className={`w-3.5 h-3.5 shrink-0 ${
        task.status === "completed" ? "text-emerald-500" :
        task.status === "in_progress" ? "text-blue-500" :
        task.status === "cancelled" ? "text-slate-400" : "text-amber-500"
      }`} />
      <span className="flex-1 font-medium truncate">{task.title}</span>
      <span className="text-xs text-foreground/50 shrink-0">{task.staffName}</span>
      {task.completedAt
        ? <span className="text-xs text-foreground/40 shrink-0">{fmtDate(task.completedAt)}</span>
        : task.dueDate
          ? <span className="text-xs text-foreground/40 shrink-0">Due {fmtDate(task.dueDate)}</span>
          : null}
    </div>
  );
}

function StaffGroup({ staffName, tasks }: { staffName: string; tasks: ReportTask[] }) {
  const [open, setOpen] = useState(false);
  const completed   = tasks.filter(t => t.status === "completed").length;
  const inProgress  = tasks.filter(t => t.status === "in_progress").length;
  const pending     = tasks.filter(t => t.status === "pending").length;
  const cancelled   = tasks.filter(t => t.status === "cancelled").length;
  return (
    <div className="border border-border/40 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-black/[0.02] transition-colors text-left"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <ChevronUp className="w-3.5 h-3.5 text-foreground/40 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-foreground/40 shrink-0" />}
        <Users className="w-3.5 h-3.5 text-foreground/50 shrink-0" />
        <span className="text-sm font-medium flex-1">{staffName}</span>
        <div className="flex gap-1.5 flex-wrap justify-end">
          <StatusPill status="completed" count={completed} />
          <StatusPill status="in_progress" count={inProgress} />
          <StatusPill status="pending" count={pending} />
          <StatusPill status="cancelled" count={cancelled} />
        </div>
      </button>
      {open && (
        <div className="bg-slate-50 border-t border-border/30">
          {tasks.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}

function DeptGroup({ deptName, deptColour, tasks }: { deptName: string; deptColour: string | null; tasks: ReportTask[] }) {
  const [open, setOpen] = useState(true);
  const byStaff = tasks.reduce<Record<string, ReportTask[]>>((acc, t) => {
    const key = t.staffName || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const cancelled = tasks.filter(t => t.status === "cancelled").length;
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <ChevronUp className="w-4 h-4 text-foreground/40 shrink-0" /> : <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0" />}
        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: deptColour ?? "#374151" }} />
        <Building2 className="w-4 h-4 text-foreground/50 shrink-0" />
        <span className="font-semibold text-sm flex-1">{deptName}</span>
        <span className="text-xs text-foreground/50">{total} task{total !== 1 ? "s" : ""}</span>
        <div className="flex gap-1.5 flex-wrap justify-end ml-2">
          <StatusPill status="completed" count={completed} />
          <StatusPill status="in_progress" count={inProgress} />
          <StatusPill status="pending" count={pending} />
          <StatusPill status="cancelled" count={cancelled} />
        </div>
      </button>
      {open && (
        <div className="divide-y divide-border/20 px-3 py-2 space-y-2">
          {Object.entries(byStaff).sort(([a],[b]) => a.localeCompare(b)).map(([name, staffTasks]) => (
            <StaffGroup key={name} staffName={name} tasks={staffTasks} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleGroup({ moduleName, tasks }: { moduleName: string; tasks: ReportTask[] }) {
  const [open, setOpen] = useState(true);
  const byDept = tasks.reduce<Record<string, ReportTask[]>>((acc, t) => {
    const key = t.departmentName ?? "__none__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const cancelled = tasks.filter(t => t.status === "cancelled").length;
  return (
    <div className="border-2 border-border rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-black/[0.01] transition-colors text-left"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <ChevronUp className="w-4 h-4 text-foreground/40 shrink-0" /> : <ChevronRight className="w-4 h-4 text-foreground/40 shrink-0" />}
        <ClipboardList className="w-4 h-4 text-primary shrink-0" />
        <span className="font-bold text-sm flex-1">{moduleName}</span>
        <span className="text-xs text-foreground/50">{total} task{total !== 1 ? "s" : ""}</span>
        <div className="flex gap-1.5 flex-wrap justify-end ml-3">
          <StatusPill status="completed" count={completed} />
          <StatusPill status="in_progress" count={inProgress} />
          <StatusPill status="pending" count={pending} />
          <StatusPill status="cancelled" count={cancelled} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 bg-slate-50/50 border-t border-border">
          {Object.entries(byDept)
            .sort(([a],[b]) => (a === "__none__" ? 1 : b === "__none__" ? -1 : a.localeCompare(b)))
            .map(([deptKey, deptTasks]) => {
              const firstTask = deptTasks[0];
              return (
                <DeptGroup
                  key={deptKey}
                  deptName={deptKey === "__none__" ? "No Department" : deptKey}
                  deptColour={deptKey === "__none__" ? "#94a3b8" : firstTask.departmentColour}
                  tasks={deptTasks}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}

function ReportsView({ farmId }: { farmId: number }) {
  const [period, setPeriod] = useState("this-month");

  const { data, isLoading } = useQuery<{ tasks: ReportTask[]; period: string; startDate: string; endDate: string }>({
    queryKey: ["task-report", farmId, period],
    queryFn: () => fetch(`/api/farms/${farmId}/task-report?period=${period}`).then(r => r.json()),
  });

  const tasks = data?.tasks ?? [];

  const byModule = tasks.reduce<Record<string, ReportTask[]>>((acc, t) => {
    const key = t.module || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const totalCompleted  = tasks.filter(t => t.status === "completed").length;
  const totalInProgress = tasks.filter(t => t.status === "in_progress").length;
  const totalPending    = tasks.filter(t => t.status === "pending").length;
  const totalCancelled  = tasks.filter(t => t.status === "cancelled").length;

  return (
    <div className="space-y-5 print:space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {PERIOD_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {data && (
          <span className="text-xs text-foreground/50">
            {fmtPeriodLabel(period, data.startDate, data.endDate)}
          </span>
        )}
        <button
          onClick={() => window.print()}
          className="ml-auto flex items-center gap-1.5 text-sm border border-border rounded-lg px-3 py-1.5 bg-white hover:bg-black/[0.03] transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Export
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold">Task Board Report</h1>
        {data && (
          <p className="text-sm text-slate-600 mt-1">
            Period: {PERIOD_OPTIONS.find(o => o.value === period)?.label} —{" "}
            {fmtPeriodLabel(period, data.startDate, data.endDate)}
          </p>
        )}
      </div>

      {/* Summary pills */}
      {tasks.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-bold">{totalCompleted}</span>
            <span className="text-foreground/50">Completed</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            <span className="font-bold">{totalInProgress}</span>
            <span className="text-foreground/50">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-bold">{totalPending}</span>
            <span className="text-foreground/50">Pending</span>
          </div>
          {totalCancelled > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-border text-sm">
              <XCircle className="w-4 h-4 text-slate-400" />
              <span className="font-bold">{totalCancelled}</span>
              <span className="text-foreground/50">Cancelled</span>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-foreground/40">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Loading report…</span>
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <BarChart3 className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No tasks in this period</h3>
          <p className="text-sm text-foreground/50">Try a different time period or assign some tasks on the board.</p>
        </Card>
      )}

      {/* Module groups */}
      {!isLoading && Object.entries(byModule).sort(([a],[b]) => a.localeCompare(b)).map(([mod, modTasks]) => (
        <ModuleGroup key={mod} moduleName={mod} tasks={modTasks} />
      ))}
    </div>
  );
}

export default function TaskBoardPage() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect href="/select" />;

  const search = useSearch();
  const targetId = (() => {
    const params = new URLSearchParams(search);
    const v = params.get("id");
    return v ? parseInt(v, 10) : null;
  })();

  const [view, setView] = useState<"board" | "reports">("board");
  const [showNewTask, setShowNewTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [completedWindow, setCompletedWindow] = useState("90d");

  const WINDOW_OPTIONS: { value: string; label: string }[] = [
    { value: "30d",  label: "Last 30 days" },
    { value: "90d",  label: "Last 90 days" },
    { value: "12m",  label: "Last 12 months" },
    { value: "all",  label: "All time" },
  ];

  function applyCompletedWindow(items: Assignment[]): Assignment[] {
    if (completedWindow === "all") return items;
    if (completedWindow.startsWith("year:")) {
      const yr = parseInt(completedWindow.slice(5), 10);
      return items.filter(r => {
        const d = r.completedAt ?? r.createdAt;
        return d ? new Date(d).getFullYear() === yr : false;
      });
    }
    const now = new Date();
    const cutoff = new Date(now);
    if (completedWindow === "30d") cutoff.setDate(now.getDate() - 30);
    else if (completedWindow === "90d") cutoff.setDate(now.getDate() - 90);
    else if (completedWindow === "12m") cutoff.setFullYear(now.getFullYear() - 1);
    return items.filter(r => {
      const d = r.completedAt ?? r.createdAt;
      return d ? new Date(d) >= cutoff : true;
    });
  }

  const { data, isLoading } = useQuery<{ records: Assignment[] }>({
    queryKey: ["task-assignments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments`).then(r => r.json()),
  });

  const { data: staffData } = useQuery<{ members: StaffMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
  });

  const records = data?.records ?? [];
  const staff = staffData?.members ?? [];

  const completedYears = useMemo(() => {
    const years = new Set<string>();
    records.forEach(r => {
      if (r.status === "completed" || r.status === "cancelled") {
        const d = r.completedAt ?? r.createdAt;
        if (d) years.add(new Date(d).getFullYear().toString());
      }
    });
    return Array.from(years).sort().reverse();
  }, [records]);

  // Unique departments from staff list
  const departments: { name: string; colour: string | null }[] = (() => {
    const seen = new Map<string, string | null>();
    staff.forEach(s => { if (s.departmentName) seen.set(s.departmentName, s.departmentColour ?? null); });
    return Array.from(seen.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([name, colour]) => ({ name, colour }));
  })();

  // Names of staff members in the selected department (null = show all)
  const deptMemberNames: Set<string> | null = deptFilter === "all"
    ? null
    : new Set(staff.filter(s => s.departmentName === deptFilter).map(s => `${s.firstName} ${s.lastName}`.trim()));

  // Records filtered by department then member — used for stat card counts so they
  // always reflect the selected department/staff member (or all when "all").
  const memberFiltered = (() => {
    let result = records;
    if (deptMemberNames) result = result.filter(r => deptMemberNames.has(r.staffName));
    if (memberFilter !== "all") result = result.filter(r => r.staffName === memberFilter);
    return result;
  })();

  const moduleNames: string[] = Array.from(new Set(records.map(r => r.module ?? "General"))).sort();

  const filtered = memberFiltered.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (moduleFilter !== "all" && (r.module ?? "General") !== moduleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !(r.staffName ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const pending = filtered.filter(r => r.status === "pending" || r.status === "in_progress");
  const completedAll = filtered.filter(r => r.status === "completed" || r.status === "cancelled");
  const completed = applyCompletedWindow(completedAll);

  // Staff names for the member filter dropdown — scoped to selected department
  const staffNames = deptMemberNames
    ? Array.from(new Set(records.filter(r => deptMemberNames.has(r.staffName)).map(r => r.staffName))).sort()
    : Array.from(new Set(records.map(r => r.staffName))).sort();
  const totalPending = records.filter(r => r.status === "pending" || r.status === "in_progress").length;

  return (
    <AppLayout title="Task Board">
      <div className="max-w-3xl space-y-6">

        {/* View toggle + New Task button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setView("board")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all",
                view === "board" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground"
              )}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              onClick={() => setView("reports")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all",
                view === "reports" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reports
            </button>
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        </div>

        {/* Reports view */}
        {view === "reports" && <ReportsView farmId={farmId} />}

        {/* Board view */}
        {view === "board" && <>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["pending", "in_progress", "completed", "cancelled"].map(s => {
            const count = memberFiltered.filter(r => r.status === s).length;
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all hover:shadow-sm",
                  statusFilter === s ? "ring-2 ring-primary ring-offset-1" : "bg-white border-border"
                )}
              >
                <Icon className={cn("w-4 h-4 mb-1.5", {
                  "text-amber-500": s === "pending",
                  "text-blue-500": s === "in_progress",
                  "text-emerald-500": s === "completed",
                  "text-slate-400": s === "cancelled",
                })} />
                <p className="text-xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-foreground/50">{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/35 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks or staff…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-foreground/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {departments.length > 0 && (
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setMemberFilter("all"); }}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All departments</option>
              {departments.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          )}
          <select
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All staff</option>
            {staffNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {moduleNames.length > 1 && (
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All modules</option>
              {moduleNames.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          {(searchQuery || statusFilter !== "all" || deptFilter !== "all" || memberFilter !== "all" || moduleFilter !== "all") && (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); setDeptFilter("all"); setMemberFilter("all"); setModuleFilter("all"); }}
              className="text-xs text-foreground/50 hover:text-foreground underline underline-offset-2"
            >
              Clear all
            </button>
          )}
          <span className="text-xs text-foreground/40 ml-auto">
            {filtered.length} assignment{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-foreground/40">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading task board…</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && records.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <ClipboardList className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No tasks assigned yet</h3>
            <p className="text-sm text-foreground/50">
              Go to the Week Ahead planner and click the <UserCheck className="w-3.5 h-3.5 inline" /> icon on any task to assign it to a staff member.
            </p>
          </Card>
        )}

        {/* Open tasks */}
        {pending.length > 0 && (
          <div>
            <h2 className="font-bold text-sm text-foreground/70 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Open ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map(a => (
                <AssignmentCard key={a.id} a={a} farmId={farmId} autoExpand={targetId === a.id} />
              ))}
            </div>
          </div>
        )}

        {/* Completed / cancelled */}
        {completedAll.length > 0 && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h2 className="font-bold text-sm text-foreground/70 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed & Cancelled ({completed.length}{completedAll.length !== completed.length ? ` of ${completedAll.length}` : ""})
              </h2>
              <select
                value={completedWindow}
                onChange={e => setCompletedWindow(e.target.value)}
                className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground/70"
              >
                <optgroup label="Rolling window">
                  {WINDOW_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </optgroup>
                {completedYears.length > 0 && (
                  <optgroup label="By year">
                    {completedYears.map(y => (
                      <option key={y} value={`year:${y}`}>{y}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            {completed.length === 0 ? (
              <p className="text-xs text-foreground/40 text-center py-6">
                No completed tasks in this period. Choose "All time" to see everything.
              </p>
            ) : (
              <div className="space-y-2">
                {completed.map(a => (
                  <AssignmentCard key={a.id} a={a} farmId={farmId} autoExpand={targetId === a.id} />
                ))}
              </div>
            )}
          </div>
        )}

        {!isLoading && totalPending === 0 && records.length > 0 && (
          <p className="text-xs text-foreground/35 text-center pb-2">
            All assigned tasks are complete. Great work.
          </p>
        )}

        </>}

      </div>

      <RaiseTaskDialog
        farmId={farmId}
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        allowEditTitle
      />
    </AppLayout>
  );
}
