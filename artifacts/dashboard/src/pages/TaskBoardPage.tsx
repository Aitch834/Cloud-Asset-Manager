import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, useSearch } from "wouter";
import {
  ClipboardList, CheckCircle2, Clock, XCircle, Loader2, Trash2, ChevronDown,
  UserCheck, AlertTriangle, MessageSquare, Send, History, ArrowRight, Search,
} from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
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

type StaffMember = { id: number; firstName: string; lastName: string; isActive: boolean };

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

export default function TaskBoardPage() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect href="/select" />;

  const search = useSearch();
  const targetId = (() => {
    const params = new URLSearchParams(search);
    const v = params.get("id");
    return v ? parseInt(v, 10) : null;
  })();

  const [statusFilter, setStatusFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");

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

  // Records filtered by member only — used for stat card counts so they
  // always reflect the selected staff member (or all staff when "all").
  const memberFiltered = memberFilter === "all"
    ? records
    : records.filter(r => r.staffName === memberFilter);

  const filtered = memberFiltered.filter(r => {
    return statusFilter === "all" || r.status === statusFilter;
  });

  const pending = filtered.filter(r => r.status === "pending" || r.status === "in_progress");
  const completed = filtered.filter(r => r.status === "completed" || r.status === "cancelled");

  const staffNames = Array.from(new Set(records.map(r => r.staffName))).sort();
  const totalPending = records.filter(r => r.status === "pending" || r.status === "in_progress").length;

  return (
    <AppLayout title="Task Board">
      <div className="max-w-3xl space-y-6">

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

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All staff</option>
            {staffNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {(statusFilter !== "all" || memberFilter !== "all") && (
            <button
              onClick={() => { setStatusFilter("all"); setMemberFilter("all"); }}
              className="text-xs text-foreground/50 hover:text-foreground underline underline-offset-2"
            >
              Clear filters
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
        {completed.length > 0 && (
          <div>
            <h2 className="font-bold text-sm text-foreground/70 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Completed & Cancelled ({completed.length})
            </h2>
            <div className="space-y-2">
              {completed.map(a => (
                <AssignmentCard key={a.id} a={a} farmId={farmId} autoExpand={targetId === a.id} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && totalPending === 0 && records.length > 0 && (
          <p className="text-xs text-foreground/35 text-center pb-2">
            All assigned tasks are complete. Great work.
          </p>
        )}

      </div>
    </AppLayout>
  );
}
