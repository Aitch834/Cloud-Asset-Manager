import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import {
  AlertTriangle, Calendar, CheckCircle2, ArrowRight, Clock, Loader2,
  Plus, Trash2, X, UserPlus, CheckCircle, LayoutList, CalendarDays, Baby, GanttChart,
  Tractor, Wrench, Truck, Droplets, User, Boxes, AlertCircle, Package, ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";

type ResourceAllocation = {
  id: number;
  resourceId: number;
  resourceName: string;
  resourceType: string;
  resourceColour: string;
  allocatedDate: string;
  notes: string | null;
};

type FarmResource = {
  id: number;
  name: string;
  type: string;
  description: string | null;
  colour: string;
  isActive: boolean;
};

type TaskItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  dueDate: string;
  endDate?: string | null;
  module: string;
  href: string;
  colour: string;
  assignedToMemberId?: number;
  allocations?: ResourceAllocation[];
  reqTractors?: number;
  reqImplements?: number;
  reqVehicles?: number;
  reqSprayers?: number;
  reqTrailers?: number;
  reqStaff?: number;
  reqOther?: number;
  estimatedHours?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  staffName?: string | null;
};

type StaffMember = {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  phone: string | null;
  isActive: boolean;
};

function dayLabel(dateStr: string, today: Date): string {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
}

function daysUntil(dateStr: string, today: Date): number {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const COLOUR_MAP: Record<string, { badge: string; dot: string; chip: string; bar: string }> = {
  red:     { badge: "bg-red-50 text-red-700 border-red-100",             dot: "bg-red-400",      chip: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",         bar: "bg-red-400" },
  indigo:  { badge: "bg-indigo-50 text-indigo-700 border-indigo-100",    dot: "bg-indigo-400",   chip: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200", bar: "bg-indigo-500" },
  violet:  { badge: "bg-violet-50 text-violet-700 border-violet-100",    dot: "bg-violet-400",   chip: "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200", bar: "bg-violet-500" },
  amber:   { badge: "bg-amber-50 text-amber-700 border-amber-100",       dot: "bg-amber-400",    chip: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",   bar: "bg-amber-400" },
  orange:  { badge: "bg-orange-50 text-orange-700 border-orange-100",    dot: "bg-orange-400",   chip: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200", bar: "bg-orange-400" },
  blue:    { badge: "bg-blue-50 text-blue-700 border-blue-100",          dot: "bg-blue-400",     chip: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",       bar: "bg-blue-500" },
  green:   { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400",  chip: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200", bar: "bg-emerald-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400",  chip: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200", bar: "bg-emerald-500" },
  purple:  { badge: "bg-purple-50 text-purple-700 border-purple-100",    dot: "bg-purple-400",   chip: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200", bar: "bg-purple-500" },
  slate:   { badge: "bg-slate-50 text-slate-600 border-slate-100",       dot: "bg-slate-400",    chip: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",   bar: "bg-slate-500" },
};

const COLOUR_OPTIONS = [
  { value: "slate",  label: "Default",  swatch: "bg-slate-400" },
  { value: "blue",   label: "Blue",     swatch: "bg-blue-400" },
  { value: "green",  label: "Green",    swatch: "bg-emerald-400" },
  { value: "amber",  label: "Amber",    swatch: "bg-amber-400" },
  { value: "orange", label: "Orange",   swatch: "bg-orange-400" },
  { value: "red",    label: "Red",      swatch: "bg-red-400" },
  { value: "violet", label: "Violet",   swatch: "bg-violet-400" },
  { value: "indigo", label: "Indigo",   swatch: "bg-indigo-400" },
];

/* ─────────── AssignDialog ─────────── */
function AssignDialog({
  task, farmId, staff, onClose, onAssigned, isReassignment, assignmentDbId,
}: {
  task: TaskItem; farmId: number; staff: StaffMember[];
  onClose: () => void; onAssigned: () => void;
  isReassignment?: boolean; assignmentDbId?: number;
}) {
  const [memberId, setMemberId] = useState("");
  const [note, setNote] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [error, setError] = useState("");

  const assignMut = useMutation({
    mutationFn: (body: object) => {
      if (isReassignment && assignmentDbId) {
        return fetch(`/api/farms/${farmId}/task-assignments/${assignmentDbId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
      }
      return fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
    },
    onSuccess: (data) => {
      const member = staff.find(s => s.id === Number(memberId));
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
    onError: () => { setError("Failed to assign task. Please try again."); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) { setError("Please select a staff member."); return; }
    setError("");
    if (isReassignment && assignmentDbId) {
      assignMut.mutate({
        assignedToMemberId: Number(memberId),
        assignmentNote: note.trim() || undefined,
        reassignmentNote: reassignReason.trim() || undefined,
      });
    } else {
      const dueIso = task.dueDate ? task.dueDate.split("T")[0] : undefined;
      assignMut.mutate({
        assignedToMemberId: Number(memberId),
        title: task.title,
        description: task.description,
        dueDate: dueIso,
        module: task.module,
        href: task.href,
        taskType: task.type,
        taskSourceId: task.id,
        assignmentNote: note.trim() || undefined,
      });
    }
  };

  const activeStaff = staff.filter(s => s.isActive);

  return (
    <div className="mt-2 p-4 rounded-lg bg-indigo-50 border border-indigo-100 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          {isReassignment ? "Re-assign to a different staff member" : "Assign to staff member"}
        </p>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded-full text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          className="w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">Select staff member…</option>
          {activeStaff.map(s => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName}{s.jobTitle ? ` — ${s.jobTitle}` : ""}{s.phone ? "" : " (no phone)"}
            </option>
          ))}
        </select>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={isReassignment ? "Updated note for the new staff member (optional)…" : "Optional note for the staff member…"}
          rows={2}
          className="w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
        {isReassignment && (
          <textarea
            value={reassignReason}
            onChange={e => setReassignReason(e.target.value)}
            placeholder="Reason for re-assigning (optional — logged in assignment history)…"
            rows={2}
            className="w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={assignMut.isPending || !memberId}
            className="flex-1 bg-indigo-600 text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {assignMut.isPending ? (isReassignment ? "Re-assigning…" : "Assigning…") : (isReassignment ? "Re-assign & notify" : "Assign & notify")}
          </button>
          <button type="button" onClick={onClose} className="text-xs font-semibold py-2 px-3 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────── TaskCard (list view) ─────────── */
function TaskCard({
  task, today, onDelete, staff, farmId, onAssigned,
}: {
  task: TaskItem; today: Date;
  onDelete?: (id: string) => void;
  staff: StaffMember[];
  farmId: number;
  onAssigned: () => void;
}) {
  const days = daysUntil(task.dueDate, today);
  const overdue = days < 0;
  const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
  const isCustom = task.type === "planner_event";
  const isAssignment = task.type === "task_assignment";
  const isBirthWatch = ["expected_calving", "expected_lambing", "expected_farrowing"].includes(task.type);
  const [showAssign, setShowAssign] = useState(false);

  const inner = (
    <div className={cn(
      "flex items-start gap-4 px-5 py-4 rounded-xl border bg-white hover:shadow-sm transition-all group",
      overdue ? "border-red-200 bg-red-50/30" : "border-border",
      isCustom ? "cursor-default" : "cursor-pointer"
    )}>
      <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", colours.dot)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={cn("font-semibold text-sm leading-snug", overdue ? "text-red-800" : "text-foreground")}>
            {task.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border", colours.badge)}>
              {task.module}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAssign(p => !p); }}
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                showAssign ? "bg-indigo-100 text-indigo-600" : "text-foreground/30 hover:text-indigo-600 hover:bg-indigo-50"
              )}
              title="Assign to staff member"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
            {isCustom && onDelete && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(task.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove reminder"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{task.description}</p>
        {overdue && (
          <p className="text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {Math.abs(days)} day{Math.abs(days) !== 1 ? "s" : ""} overdue
          </p>
        )}
        {days === 0 && (
          <p className="text-xs font-semibold text-amber-600 mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />Due today
          </p>
        )}
        {isBirthWatch && !showAssign && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAssign(true); }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Baby className="w-3.5 h-3.5" />
            Raise birth-watch task
          </button>
        )}
        {showAssign && (
          <AssignDialog task={task} farmId={farmId} staff={staff} onClose={() => setShowAssign(false)} onAssigned={onAssigned} />
        )}
      </div>
      {!isCustom && !showAssign && <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 flex-shrink-0 mt-1 transition-colors" />}
    </div>
  );

  if (isCustom || showAssign) return <div>{inner}</div>;
  if (isAssignment) return <Link href={`/task-board?id=${task.id.replace("assign-", "")}`}>{inner}</Link>;
  return <Link href={task.href}>{inner}</Link>;
}

/* ─────────── ResourceAssignSection ─────────── */
function ResourceAssignSection({
  task, farmId, resources, onRefresh,
}: {
  task: TaskItem;
  farmId: number;
  resources: FarmResource[];
  onRefresh: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const createAllocMut = useMutation({
    mutationFn: (body: { resourceId: number; taskRef: string; taskTitle: string; allocatedDate: string }) =>
      fetch(`/api/farms/${farmId}/task-resource-allocations`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { onRefresh(); setShowPicker(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const removeAllocMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/task-resource-allocations/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => onRefresh(),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const allocations = task.allocations ?? [];
  const assignedIds = new Set(allocations.map(a => a.resourceId));
  const available = resources.filter(r => !assignedIds.has(r.id));

  if (resources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-xs font-semibold text-foreground/60">Resources</p>
        {available.length > 0 && (
          <button
            onClick={() => setShowPicker(p => !p)}
            className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {showPicker ? "Cancel" : "+ Assign"}
          </button>
        )}
      </div>
      {allocations.length === 0 && !showPicker && (
        <p className="text-xs text-foreground/35 italic">No resources assigned</p>
      )}
      {allocations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {allocations.map(alloc => (
            <span key={alloc.id} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60">
              <div className={cn("w-1.5 h-1.5 rounded-full", RESOURCE_DOT_COLOURS[alloc.resourceColour] ?? "bg-slate-400")} />
              <ResourceTypeIcon type={alloc.resourceType} className="text-foreground/50" />
              {alloc.resourceName}
              <button
                onClick={() => removeAllocMut.mutate(alloc.id)}
                disabled={removeAllocMut.isPending}
                className="ml-0.5 text-foreground/30 hover:text-red-500 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {showPicker && (
        <div className="rounded-lg border border-border bg-muted/20 p-1.5 space-y-0.5">
          {available.map(r => (
            <button
              key={r.id}
              onClick={() => createAllocMut.mutate({ resourceId: r.id, taskRef: task.id, taskTitle: task.title, allocatedDate: task.dueDate.slice(0, 10) })}
              disabled={createAllocMut.isPending}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-border/50 transition-all text-left"
            >
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", RESOURCE_DOT_COLOURS[r.colour] ?? "bg-slate-400")} />
              <ResourceTypeIcon type={r.type} className="text-foreground/40 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight">{r.name}</p>
                <p className="text-[10px] text-foreground/40">{RESOURCE_TYPE_LABELS[r.type] ?? r.type}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── TaskCardExpanded — used inside calendar ─────────── */
function TaskCardExpanded({
  task, today, onDelete, staff, farmId, onAssigned, onClose, resources,
}: {
  task: TaskItem; today: Date;
  onDelete?: (id: string) => void;
  staff: StaffMember[];
  farmId: number;
  onAssigned: () => void;
  onClose: () => void;
  resources?: FarmResource[];
}) {
  const days = daysUntil(task.dueDate, today);
  const overdue = days < 0;
  const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
  const isCustom = task.type === "planner_event";
  const isAssignment = task.type === "task_assignment";
  const isBirthWatch = ["expected_calving", "expected_lambing", "expected_farrowing"].includes(task.type);
  const [showAssign, setShowAssign] = useState(false);

  const dueLabel = new Date(task.dueDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className={cn(
      "rounded-xl border bg-white shadow-md p-4",
      overdue ? "border-red-200" : "border-indigo-200"
    )}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5", colours.dot)} />
          <p className={cn("font-semibold text-sm leading-snug", overdue ? "text-red-800" : "text-foreground")}>
            {task.title}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full text-foreground/30 hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className={cn("inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border", colours.badge)}>
          {task.module}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-foreground/50">
          <Calendar className="w-3 h-3" />
          {dueLabel}
        </span>
        {overdue && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
            <AlertTriangle className="w-3 h-3" />
            {Math.abs(days)}d overdue
          </span>
        )}
        {days === 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
            <Clock className="w-3 h-3" />Due today
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-foreground/60 leading-relaxed mb-3">{task.description}</p>

      {/* Resource requirements */}
      {((task.reqTractors ?? 0) + (task.reqImplements ?? 0) + (task.reqVehicles ?? 0) + (task.reqSprayers ?? 0) + (task.reqTrailers ?? 0) + (task.reqStaff ?? 0) + (task.reqOther ?? 0)) > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {([ { label: "Tractor", count: task.reqTractors, icon: Tractor }, { label: "Implement", count: task.reqImplements, icon: Wrench }, { label: "Vehicle", count: task.reqVehicles, icon: Truck }, { label: "Sprayer", count: task.reqSprayers, icon: Droplets }, { label: "Trailer", count: task.reqTrailers, icon: Boxes }, { label: "Staff", count: task.reqStaff, icon: User }, { label: "Other", count: task.reqOther, icon: Package } ] as const).filter(r => (r.count ?? 0) > 0).map(({ label, count, icon: Icon }) => (
            <span key={label} className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Icon className="w-2.5 h-2.5" />{count}× {label}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {(() => {
        const assignmentDbId = isAssignment ? parseInt(task.id.replace("assign-", ""), 10) : undefined;
        return (
          <>
            <div className="flex items-center gap-2">
              {isAssignment && (
                <Link
                  href={`/task-board?id=${assignmentDbId}`}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  View assignment <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              {!isCustom && !isAssignment && (
                <Link
                  href={task.href}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Open record <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              {isBirthWatch && !showAssign && (
                <button
                  onClick={() => setShowAssign(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Baby className="w-3.5 h-3.5" />
                  Raise birth-watch task
                </button>
              )}
              <button
                onClick={() => setShowAssign(p => !p)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
                  showAssign ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "border-border hover:bg-muted"
                )}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isAssignment ? "Re-assign" : "Assign"}
              </button>
              {isCustom && onDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>

            {showAssign && (
              <AssignDialog
                task={task}
                farmId={farmId}
                staff={staff}
                onClose={() => setShowAssign(false)}
                onAssigned={onAssigned}
                isReassignment={isAssignment}
                assignmentDbId={assignmentDbId}
              />
            )}
          </>
        );
      })()}
      <ResourceAssignSection task={task} farmId={farmId} resources={resources ?? []} onRefresh={onAssigned} />
    </div>
  );
}

/* ─────────── CalendarView ─────────── */
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCalendarWeeks(today: Date, days: number): Date[][] {
  // Find the Monday on or before today
  const start = new Date(today);
  const dow = (start.getDay() + 6) % 7; // 0=Mon, 6=Sun
  start.setDate(start.getDate() - dow);

  // End: today + days, rounded up to end of that week (Sunday)
  const end = new Date(today);
  end.setDate(end.getDate() + days);
  const endDow = (end.getDay() + 6) % 7;
  if (endDow < 6) end.setDate(end.getDate() + (6 - endDow));

  const weeks: Date[][] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function CalendarView({
  tasks, today, days, onDelete, staff, farmId, onAssigned,
}: {
  tasks: TaskItem[];
  today: Date;
  days: number;
  onDelete?: (id: string) => void;
  staff: StaffMember[];
  farmId: number;
  onAssigned: () => void;
}) {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const overdue = tasks.filter(t => daysUntil(t.dueDate, today) < 0);
  const upcoming = tasks.filter(t => daysUntil(t.dueDate, today) >= 0);

  // Build a map from ISO date string → tasks
  const byDate = new Map<string, TaskItem[]>();
  for (const t of upcoming) {
    const key = isoDate(new Date(t.dueDate));
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(t);
  }

  const weeks = getCalendarWeeks(today, days);
  const todayStr = isoDate(today);

  const rangeStart = isoDate(today);
  const rangeEndDate = new Date(today);
  rangeEndDate.setDate(rangeEndDate.getDate() + days);
  const rangeEnd = isoDate(rangeEndDate);

  return (
    <div className="space-y-4">
      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm text-red-700">Overdue</h3>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{overdue.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {overdue.map(t => {
              const colours = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
              const isSelected = selectedTask?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTask(isSelected ? null : t)}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all",
                    isSelected
                      ? "ring-2 ring-red-400 bg-white border-red-300"
                      : "bg-white border-red-200 hover:border-red-400 hover:shadow-sm"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", colours.dot)} />
                  <span className="truncate text-red-800">{t.title}</span>
                  <span className={cn("ml-auto text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0", colours.badge)}>{t.module}</span>
                </button>
              );
            })}
          </div>
          {selectedTask && overdue.some(t => t.id === selectedTask.id) && (
            <div className="mt-3">
              <TaskCardExpanded
                task={selectedTask}
                today={today}
                onDelete={onDelete}
                staff={staff}
                farmId={farmId}
                onAssigned={onAssigned}
                onClose={() => setSelectedTask(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DOW_LABELS.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-bold text-foreground/50 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div key={wi} className={cn("grid grid-cols-7", wi < weeks.length - 1 && "border-b border-border")}>
            {week.map((day, di) => {
              const dayStr = isoDate(day);
              const isToday = dayStr === todayStr;
              const inRange = dayStr >= rangeStart && dayStr <= rangeEnd;
              const dayTasks = byDate.get(dayStr) ?? [];
              const maxVisible = days <= 7 ? 6 : 3;
              const overflow = dayTasks.length > maxVisible ? dayTasks.length - maxVisible : 0;

              return (
                <div
                  key={di}
                  className={cn(
                    "min-h-[90px] p-1.5 relative",
                    di < 6 && "border-r border-border",
                    !inRange && "bg-muted/30",
                    isToday && "bg-primary/5"
                  )}
                >
                  {/* Day number */}
                  <div className="mb-1 flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : inRange ? "text-foreground" : "text-foreground/30"
                    )}>
                      {day.getDate()}
                    </span>
                    {/* Month label on 1st of month */}
                    {day.getDate() === 1 && (
                      <span className="text-[9px] font-semibold text-foreground/40 uppercase">
                        {day.toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                    )}
                  </div>

                  {/* Task chips */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, maxVisible).map(t => {
                      const colours = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
                      const isSelected = selectedTask?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTask(isSelected ? null : t)}
                          className={cn(
                            "w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate transition-all leading-tight",
                            colours.chip,
                            isSelected && "ring-2 ring-offset-0 ring-indigo-400"
                          )}
                          title={t.title}
                        >
                          {t.title}
                        </button>
                      );
                    })}
                    {overflow > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-[10px] text-primary font-semibold pl-1 hover:underline w-full text-left">
                            +{overflow} more
                          </button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="start" className="w-64 p-2 space-y-1">
                          <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide px-1 pb-1">
                            {day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })} — all tasks
                          </p>
                          {dayTasks.map(t => {
                            const colours = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
                            const isSelected = selectedTask?.id === t.id;
                            return (
                              <button
                                key={t.id}
                                onClick={() => setSelectedTask(isSelected ? null : t)}
                                className={cn(
                                  "w-full text-left text-[10px] font-semibold px-1.5 py-1 rounded border truncate transition-all leading-tight",
                                  colours.chip,
                                  isSelected && "ring-2 ring-offset-0 ring-indigo-400"
                                )}
                                title={t.title}
                              >
                                {t.title}
                              </button>
                            );
                          })}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected task detail panel (for upcoming tasks) */}
      {selectedTask && !overdue.some(t => t.id === selectedTask.id) && (
        <TaskCardExpanded
          task={selectedTask}
          today={today}
          onDelete={onDelete}
          staff={staff}
          farmId={farmId}
          onAssigned={onAssigned}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Legend hint */}
      {tasks.length > 0 && (
        <p className="text-xs text-foreground/35 text-center">
          Click any task chip to see full details, assign to staff, or open the record.
        </p>
      )}
    </div>
  );
}

const RESOURCE_DOT_COLOURS: Record<string, string> = {
  slate: "bg-slate-400", indigo: "bg-indigo-500", blue: "bg-blue-500",
  green: "bg-green-500", emerald: "bg-emerald-500", amber: "bg-amber-400",
  orange: "bg-orange-500", red: "bg-red-500", purple: "bg-purple-500",
};
const RESOURCE_TYPE_LABELS: Record<string, string> = {
  tractor: "Tractor", implement: "Implement", vehicle: "Vehicle",
  sprayer: "Sprayer", trailer: "Trailer", staff: "Staff / Contractor", other: "Other",
};
function ResourceTypeIcon({ type, className }: { type: string; className?: string }) {
  const icons: Record<string, React.ElementType> = {
    tractor: Tractor, implement: Wrench, vehicle: Truck,
    sprayer: Droplets, trailer: Package, staff: User, other: Boxes,
  };
  const Icon = icons[type] ?? Boxes;
  return <Icon className={cn("w-3 h-3", className)} />;
}

/* ─────────── GanttView ─────────── */
function GanttView({
  tasks, today, days, onDelete, staff, farmId, onAssigned, resources,
}: {
  tasks: TaskItem[];
  today: Date;
  days: number;
  onDelete?: (id: string) => void;
  staff: StaffMember[];
  farmId: number;
  onAssigned: () => void;
  resources: FarmResource[];
}) {
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [showResourceSidebar, setShowResourceSidebar] = useState(false);
  const [draggingResourceId, setDraggingResourceId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const createAllocMut = useMutation({
    mutationFn: (body: { resourceId: number; taskRef: string; taskTitle: string; allocatedDate: string }) =>
      fetch(`/api/farms/${farmId}/task-resource-allocations`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => onAssigned(),
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const conflictedTaskIds = useMemo(() => {
    const byKey = new Map<string, string[]>();
    for (const task of tasks) {
      for (const alloc of task.allocations ?? []) {
        const key = `${alloc.allocatedDate}-${alloc.resourceId}`;
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key)!.push(task.id);
      }
    }
    const conflicted = new Set<string>();
    for (const [, ids] of byKey) { if (ids.length > 1) ids.forEach(id => conflicted.add(id)); }
    return conflicted;
  }, [tasks]);

  const overdue  = tasks.filter(t => daysUntil(t.dueDate, today) < 0);
  const upcoming = tasks.filter(t => daysUntil(t.dueDate, today) >= 0);
  const sorted   = [...upcoming].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const dayHeaders: Date[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() + i); return d;
  });
  const todayStr     = isoDate(today);
  const ganttStart = new Date(today); ganttStart.setHours(0, 0, 0, 0);
  const ganttStartMs = ganttStart.getTime();
  const totalMs      = days * 86400000;

  const getBarProps = (task: TaskItem) => {
    const startD = new Date(task.dueDate); startD.setHours(0, 0, 0, 0);
    const endD   = task.endDate
      ? (() => { const d = new Date(task.endDate!); d.setHours(0, 0, 0, 0); return d; })()
      : startD;
    const clampedStart = Math.max(ganttStartMs, startD.getTime());
    const clampedEnd   = Math.min(ganttStartMs + totalMs, endD.getTime() + 86400000);
    const leftPct  = ((clampedStart - ganttStartMs) / totalMs) * 100;
    const widthPct = Math.max((1 / days) * 100, (clampedEnd - clampedStart) / totalMs * 100);
    return {
      leftPct, widthPct,
      hasDuration:        endD.getTime() > startD.getTime(),
      startsBeforeWindow: startD.getTime() < ganttStartMs,
      endsAfterWindow:    endD.getTime() + 86400000 > ganttStartMs + totalMs,
    };
  };

  const colGrid = { gridTemplateColumns: `repeat(${days}, 1fr)` };

  return (
    <div className="space-y-4">
      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm text-red-700">Overdue</h3>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{overdue.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {overdue.map(t => {
              const colours  = COLOUR_MAP[t.colour] ?? COLOUR_MAP.slate;
              const isSel    = selectedTask?.id === t.id;
              return (
                <button key={t.id} onClick={() => setSelectedTask(isSel ? null : t)}
                  className={cn("text-left px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all",
                    isSel ? "ring-2 ring-red-400 bg-white border-red-300" : "bg-white border-red-200 hover:border-red-400 hover:shadow-sm"
                  )}>
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", colours.dot)} />
                  <span className="truncate text-red-800">{t.title}</span>
                  <span className={cn("ml-auto text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0", colours.badge)}>{t.module}</span>
                </button>
              );
            })}
          </div>
          {selectedTask && overdue.some(t => t.id === selectedTask.id) && (
            <div className="mt-3">
              <TaskCardExpanded task={selectedTask} today={today} onDelete={onDelete} staff={staff} farmId={farmId} onAssigned={onAssigned} onClose={() => setSelectedTask(null)} resources={resources} />
            </div>
          )}
        </div>
      )}

      {resources.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowResourceSidebar(p => !p)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors",
              showResourceSidebar ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "border-border text-foreground/60 hover:bg-muted"
            )}
          >
            <Boxes className="w-3.5 h-3.5" />
            {showResourceSidebar ? "Hide resources" : "Show resources"}
          </button>
        </div>
      )}
      <div className="flex gap-4 items-start">
      <div className="flex-1 min-w-0">
      {/* Gantt chart */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {/* Header row */}
        <div className="flex border-b border-border bg-muted/20">
          <div className="w-56 flex-shrink-0 border-r border-border px-3 py-2">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wide">Task</span>
          </div>
          <div className="flex-1 grid" style={colGrid}>
            {dayHeaders.map((d, i) => {
              const ds      = isoDate(d);
              const isToday = ds === todayStr;
              return (
                <div key={i} className={cn("py-2 text-center border-r last:border-r-0 border-border/40", isToday && "bg-primary/10")}>
                  {days <= 7 ? (
                    <>
                      <p className={cn("text-[10px] font-bold leading-none", isToday ? "text-primary" : "text-foreground/50")}>
                        {d.toLocaleDateString("en-GB", { weekday: "short" })}
                      </p>
                      <p className={cn("text-[12px] font-bold mt-0.5", isToday ? "text-primary" : "text-foreground/70")}>
                        {d.getDate()}
                      </p>
                    </>
                  ) : (
                    <p className={cn("text-[10px] font-bold", isToday ? "text-primary" : "text-foreground/40")}>
                      {d.getDate() === 1
                        ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : d.getDate() % (days <= 14 ? 2 : 5) === 0 ? String(d.getDate()) : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {sorted.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-foreground/40">No upcoming tasks in this window.</div>
        )}

        {sorted.map(task => {
          const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
          const isSel   = selectedTask?.id === task.id;
          const { leftPct, widthPct, hasDuration, startsBeforeWindow, endsAfterWindow } = getBarProps(task);

          return (
            <div key={task.id} className={cn("flex border-b last:border-b-0 transition-colors", isSel ? "bg-indigo-50/40" : "hover:bg-muted/20")}>
              {/* Label */}
              <div className="w-56 flex-shrink-0 border-r border-border px-3 py-2 flex items-start gap-2 min-w-0">
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", colours.dot)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">{task.title}</p>
                    {conflictedTaskIds.has(task.id) && (
                      <AlertCircle className="w-3 h-3 flex-shrink-0 text-amber-500" aria-label="Resource conflict" />
                    )}
                  </div>
                  <span className={cn("inline-flex text-[10px] font-semibold px-1.5 rounded-full border mt-0.5", colours.badge)}>
                    {task.module}
                  </span>
                  {(task.allocations ?? []).length > 0 && (
                    <div className="flex items-center gap-0.5 mt-1 flex-wrap">
                      {task.allocations!.map(alloc => (
                        <div key={alloc.id} className={cn("w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm", RESOURCE_DOT_COLOURS[alloc.resourceColour] ?? "bg-slate-400")} title={alloc.resourceName} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 relative" style={{ minHeight: 50 }}>
                {/* Column backgrounds */}
                <div className="absolute inset-0 grid pointer-events-none" style={colGrid}>
                  {dayHeaders.map((d, i) => (
                    <div key={i} className={cn("border-r last:border-r-0 border-border/25 h-full", isoDate(d) === todayStr && "bg-primary/5")} />
                  ))}
                </div>

                {/* Bar */}
                <button
                  onClick={() => setSelectedTask(isSel ? null : task)}
                  onDragOver={(e) => { e.preventDefault(); setDropTargetId(task.id); }}
                  onDragLeave={() => setDropTargetId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDropTargetId(null);
                    if (draggingResourceId !== null) {
                      createAllocMut.mutate({ resourceId: draggingResourceId, taskRef: task.id, taskTitle: task.title, allocatedDate: task.dueDate.slice(0, 10) });
                      setDraggingResourceId(null);
                    }
                  }}
                  title={task.title}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-7 flex items-center px-2 text-white text-[10px] font-semibold transition-all hover:brightness-90 focus:outline-none",
                    colours.bar,
                    hasDuration ? "rounded-md" : "rounded-full",
                    startsBeforeWindow && "rounded-l-none",
                    endsAfterWindow    && "rounded-r-none",
                    isSel && "ring-2 ring-offset-1 ring-indigo-400 brightness-90",
                    dropTargetId === task.id && "ring-2 ring-offset-1 ring-white scale-y-110 brightness-110",
                  )}
                  style={{ left: `${Math.max(0, leftPct)}%`, width: `${widthPct}%` }}
                >
                  {hasDuration && widthPct > 12 && (
                    <span className="truncate">{task.title}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      {showResourceSidebar && resources.length > 0 && (
        <div className="w-52 flex-shrink-0 rounded-xl border border-border bg-white overflow-hidden self-stretch">
          <div className="px-3 py-2.5 border-b border-border bg-muted/20">
            <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-wide">Resources</p>
            <p className="text-[10px] text-foreground/35 mt-0.5">Drag onto a task bar to assign</p>
          </div>
          <div className="p-2 space-y-1 max-h-[480px] overflow-y-auto">
            {resources.map(r => (
              <div
                key={r.id}
                draggable
                onDragStart={() => setDraggingResourceId(r.id)}
                onDragEnd={() => setDraggingResourceId(null)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing border select-none transition-all",
                  draggingResourceId === r.id
                    ? "opacity-40 border-border/50 bg-muted/30"
                    : "border-transparent hover:border-border/60 hover:bg-muted/30"
                )}
              >
                <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", RESOURCE_DOT_COLOURS[r.colour] ?? "bg-slate-400")} />
                <ResourceTypeIcon type={r.type} className="text-foreground/40 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate leading-tight">{r.name}</p>
                  <p className="text-[10px] text-foreground/40">{RESOURCE_TYPE_LABELS[r.type] ?? r.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Detail panel */}
      {selectedTask && !overdue.some(t => t.id === selectedTask.id) && (
        <TaskCardExpanded task={selectedTask} today={today} onDelete={onDelete} staff={staff} farmId={farmId} onAssigned={onAssigned} onClose={() => setSelectedTask(null)} resources={resources} />
      )}

      {(sorted.length > 0 || overdue.length > 0) && (
        <p className="text-xs text-foreground/35 text-center">
          Click any bar to view details. {resources.length > 0 ? "Show the resource panel and drag a resource onto a bar to assign it." : "Visit Resource Planner to add your tractors, implements and staff."}
        </p>
      )}
    </div>
  );
}

/* ─────────── DaySection (list view) ─────────── */
function DaySection({ label, tasks, today, isOverdue, onDelete, staff, farmId, onAssigned }: {
  label: string; tasks: TaskItem[]; today: Date; isOverdue?: boolean;
  onDelete?: (id: string) => void;
  staff: StaffMember[];
  farmId: number;
  onAssigned: () => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {isOverdue ? (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        ) : (
          <Calendar className="w-4 h-4 text-foreground/40" />
        )}
        <h3 className={cn("font-bold text-sm", isOverdue ? "text-red-600" : "text-foreground/70")}>
          {label}
        </h3>
        <span className={cn(
          "text-xs font-semibold px-2 py-0.5 rounded-full",
          isOverdue ? "bg-red-100 text-red-700" : "bg-muted text-foreground/60"
        )}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} today={today} onDelete={onDelete} staff={staff} farmId={farmId} onAssigned={onAssigned} />
        ))}
      </div>
    </div>
  );
}

/* ─────────── AddReminderPanel ─────────── */
function AddReminderPanel({ farmId, days, onClose }: { farmId: number; days: 7 | 30; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [colour, setColour] = useState("slate");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [showReqs, setShowReqs] = useState(false);
  const [reqTractors, setReqTractors] = useState(0);
  const [reqImplements, setReqImplements] = useState(0);
  const [reqVehicles, setReqVehicles] = useState(0);
  const [reqSprayers, setReqSprayers] = useState(0);
  const [reqTrailers, setReqTrailers] = useState(0);
  const [reqStaff, setReqStaff] = useState(0);
  const [reqOther, setReqOther] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const minDate = (() => {
    const d = new Date(); d.setDate(d.getDate() - 60);
    return d.toISOString().split("T")[0];
  })();
  const maxDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  })();
  const maxEndDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 365);
    return d.toISOString().split("T")[0];
  })();

  const createMut = useMutation({
    mutationFn: (body: object) =>
      fetch(`/api/farms/${farmId}/planner-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-ahead", farmId, days] });
      onClose();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Please enter a title."); return; }
    if (!date) { setError("Please choose a date."); return; }
    setError("");
    createMut.mutate({ title: title.trim(), description: description.trim() || undefined, eventDate: date + "T12:00:00Z", endDate: endDate ? endDate + "T12:00:00Z" : undefined, colour, estimatedDurationHours: estimatedHours ? Number(estimatedHours) : undefined, startTime: startTime || undefined, endTime: endTime || undefined, reqTractors, reqImplements, reqVehicles, reqSprayers, reqTrailers, reqStaff, reqOther });
  };

  return (
    <Card className="p-5 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-foreground">Add a reminder</h3>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full text-foreground/40 hover:text-foreground hover:bg-muted transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-foreground/60 block mb-1">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Merchant rep visit, Drainage contractor"
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground/60 block mb-1">Start Date *</label>
          <input
            type="date"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={e => { setDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(""); }}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground/60 block mb-1">
            End Date <span className="font-normal text-foreground/40">(optional — for multi-day tasks)</span>
          </label>
          <input
            type="date"
            value={endDate}
            min={date || minDate}
            max={maxEndDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground/60 block mb-1">Note (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Any extra details…"
            rows={2}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground/60 block mb-2">Colour</label>
          <div className="flex gap-2 flex-wrap">
            {COLOUR_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColour(opt.value)}
                title={opt.label}
                className={cn(
                  "w-6 h-6 rounded-full transition-all",
                  opt.swatch,
                  colour === opt.value ? "ring-2 ring-offset-2 ring-foreground/40 scale-110" : "opacity-60 hover:opacity-100"
                )}
              />
            ))}
          </div>
        </div>
        {/* Resource requirements (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowReqs(p => !p)}
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", showReqs && "rotate-180")} />
            Resource requirements <span className="font-normal text-foreground/30">(optional)</span>
          </button>
          {showReqs && (
            <div className="mt-3 space-y-3 border border-border/60 rounded-lg p-3 bg-white/60">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-foreground/50 block mb-1">Start time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-foreground/50 block mb-1">End time</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-foreground/50 block mb-1">Estimated hours</label>
                <input type="number" min="0" step="0.5" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} placeholder="e.g. 4" className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { label: "Tractors", val: reqTractors, set: setReqTractors },
                  { label: "Implements", val: reqImplements, set: setReqImplements },
                  { label: "Vehicles", val: reqVehicles, set: setReqVehicles },
                  { label: "Sprayers", val: reqSprayers, set: setReqSprayers },
                  { label: "Trailers", val: reqTrailers, set: setReqTrailers },
                  { label: "Staff", val: reqStaff, set: setReqStaff },
                  { label: "Other", val: reqOther, set: setReqOther },
                ] as const).map(({ label, val, set }) => (
                  <div key={label} className="flex items-center justify-between gap-2 bg-muted/40 rounded-md px-2 py-1.5">
                    <span className="text-[10px] font-semibold text-foreground/60">{label}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => set(Math.max(0, val - 1))} className="w-5 h-5 rounded text-foreground/50 hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center text-sm font-bold">−</button>
                      <span className="text-xs font-semibold w-4 text-center">{val}</span>
                      <button type="button" onClick={() => set(val + 1)} className="w-5 h-5 rounded text-foreground/50 hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center text-sm font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={createMut.isPending}
            className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createMut.isPending ? "Saving…" : "Add reminder"}
          </button>
          <button type="button" onClick={onClose} className="text-sm font-semibold py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

/* ─────────── Page ─────────── */
export default function WeekAheadPage() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect href="/select" />;

  const queryClient = useQueryClient();
  const [days, setDays] = useState<7 | 30>(7);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "gantt">(() => {
    try { return (localStorage.getItem("weekAheadViewMode") as "list" | "calendar" | "gantt") || "list"; } catch { return "list"; }
  });
  const setView = (mode: "list" | "calendar" | "gantt") => {
    setViewMode(mode);
    try { localStorage.setItem("weekAheadViewMode", mode); } catch {}
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + days);

  const { data, isLoading } = useQuery<{ tasks: TaskItem[] }>({
    queryKey: ["week-ahead", farmId, days],
    queryFn: () => fetch(`/api/farms/${farmId}/week-ahead?days=${days}`).then(r => r.json()),
  });

  const { data: staffData } = useQuery<{ members: StaffMember[] }>({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
  });

  const { data: resourcesData } = useQuery<{ resources: FarmResource[] }>({
    queryKey: ["resources", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/resources`).then(r => r.json()),
  });

  const { data: organicCertData } = useQuery<any[]>({
    queryKey: ["oa-cert", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/organic-arable/certification`, { credentials: "include" });
      if (!r.ok) return [];
      const d = await r.json();
      return (d.records ?? []).filter((c: any) => !["suspended", "withdrawn"].includes(c.status));
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => {
      const numId = id.replace("planner-", "");
      return fetch(`/api/farms/${farmId}/planner-events/${numId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["week-ahead", farmId, days] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Synthesise TaskItems from organic cert key dates
  const certTasks: TaskItem[] = [];
  for (const cert of (organicCertData ?? [])) {
    const certifier: string = cert.certifier ?? "Organic cert";
    const makeTask = (dateStr: string | null | undefined, id: string, title: string, colour: string): TaskItem | null => {
      if (!dateStr) return null;
      const d = daysUntil(dateStr, today);
      if (d > days && d >= 0) return null; // beyond current window (keep overdue)
      return { id, type: "organic-cert", title, description: `${certifier}${cert.certificateNumber ? ` — ${cert.certificateNumber}` : ""}`, dueDate: dateStr, module: "Organic Arable", href: "/organic-arable", colour };
    };
    const r = makeTask(cert.renewalDate,         `oa-cert-renewal-${cert.id}`,    `Cert renewal — ${certifier}`,    "green");
    const i = makeTask(cert.nextInspectionDue,   `oa-cert-inspect-${cert.id}`,   `Organic inspection — ${certifier}`, "amber");
    const a = makeTask(cert.annualInspectionDate, `oa-cert-annual-${cert.id}`,    `Annual inspection — ${certifier}`,  "amber");
    if (r) certTasks.push(r);
    if (i) certTasks.push(i);
    if (a) certTasks.push(a);
  }

  const apiTasks = data?.tasks ?? [];
  const tasks = [...apiTasks, ...certTasks];
  const staff = staffData?.members ?? [];
  const resources = resourcesData?.resources ?? [];
  const overdue = tasks.filter(t => daysUntil(t.dueDate, today) < 0);
  const upcoming = tasks.filter(t => daysUntil(t.dueDate, today) >= 0);

  const grouped = new Map<string, TaskItem[]>();
  for (const t of upcoming) {
    const lbl = dayLabel(t.dueDate, today);
    if (!grouped.has(lbl)) grouped.set(lbl, []);
    grouped.get(lbl)!.push(t);
  }

  const dateRange = `${today.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${rangeEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  const label = days === 7 ? "Week Ahead" : "Month Ahead";

  const handleDelete = (id: string) => deleteMut.mutate(id);
  const handleAssigned = () => {};

  return (
    <AppLayout title={label}>
      <div className="space-y-6">

        {/* Header — stable, never shifts when view mode changes */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-foreground/50 mt-0.5">{dateRange}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {/* 7 / 30 toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setDays(7)}
                className={cn("px-3 py-1.5 rounded-md transition-all", days === 7 ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70")}
              >
                7 days
              </button>
              <button
                onClick={() => setDays(30)}
                className={cn("px-3 py-1.5 rounded-md transition-all", days === 30 ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70")}
              >
                30 days
              </button>
            </div>

            {/* List / Calendar / Gantt toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setView("list")}
                title="List view"
                className={cn(
                  "px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                  viewMode === "list" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
                )}
              >
                <LayoutList className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                title="Calendar view"
                className={cn(
                  "px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                  viewMode === "calendar" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setView("gantt")}
                title="Gantt view"
                className={cn(
                  "px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                  viewMode === "gantt" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
                )}
              >
                <GanttChart className="w-3.5 h-3.5" />
                Gantt
              </button>
            </div>

            {!isLoading && tasks.length > 0 && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </span>
            )}
            <Link href="/task-board" className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-muted transition-all">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Task Board
            </Link>
            <button
              onClick={() => setShowAddPanel(p => !p)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
                showAddPanel ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border hover:bg-muted"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Add reminder
            </button>
          </div>
        </div>

        {/* Content area — max-width expands for calendar view only */}
        <div className={cn("space-y-6", viewMode === "list" ? "max-w-2xl" : "max-w-5xl")}>

        {/* Add reminder panel */}
        {showAddPanel && (
          <AddReminderPanel farmId={farmId} days={days} onClose={() => setShowAddPanel(false)} />
        )}

        {/* Assign hint (list view only) */}
        {viewMode === "list" && staff.length > 0 && !isLoading && tasks.length > 0 && (
          <p className="text-xs text-foreground/40 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Click the <UserPlus className="w-3 h-3 inline" /> icon on any task to assign it to a staff member.
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-foreground/40">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading your {label.toLowerCase()}…</span>
          </div>
        )}

        {/* Empty */}
        {!isLoading && tasks.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">All clear</h3>
            <p className="text-sm text-foreground/50">
              No scheduled tasks, due dates, or overdue items found across your active modules
              {days === 7 ? " for the next 7 days" : " for the next 30 days"}.
            </p>
            <p className="text-xs text-foreground/35 mt-2">Use "Add reminder" above to note any events not captured automatically.</p>
          </Card>
        )}

        {/* ── Calendar view ── */}
        {!isLoading && tasks.length > 0 && viewMode === "calendar" && (
          <CalendarView
            tasks={tasks}
            today={today}
            days={days}
            onDelete={handleDelete}
            staff={staff}
            farmId={farmId}
            onAssigned={handleAssigned}
          />
        )}

        {/* ── Gantt view ── */}
        {!isLoading && tasks.length > 0 && viewMode === "gantt" && (
          <GanttView
            tasks={tasks}
            today={today}
            days={days}
            onDelete={handleDelete}
            staff={staff}
            farmId={farmId}
            onAssigned={handleAssigned}
            resources={resources}
          />
        )}

        {/* ── List view ── */}
        {!isLoading && viewMode === "list" && (
          <>
            {overdue.length > 0 && (
              <DaySection label="Overdue" tasks={overdue} today={today} isOverdue onDelete={handleDelete} staff={staff} farmId={farmId} onAssigned={handleAssigned} />
            )}
            {[...grouped.entries()].map(([lbl, items]) => (
              <DaySection key={lbl} label={lbl} tasks={items} today={today} onDelete={handleDelete} staff={staff} farmId={farmId} onAssigned={handleAssigned} />
            ))}
            {tasks.length > 0 && (
              <p className="text-xs text-foreground/35 text-center pb-2">
                Tasks are drawn from scheduled dates across all active modules. Click any item to go directly to that record. Use the <UserPlus className="w-3 h-3 inline" /> icon to assign tasks to staff.
              </p>
            )}
          </>
        )}

        </div>{/* end content max-w wrapper */}
      </div>
    </AppLayout>
  );
}
