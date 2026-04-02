import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import {
  AlertTriangle, Calendar, CheckCircle2, ArrowRight, Clock, Loader2,
  Plus, Trash2, X, UserPlus, CheckCircle, LayoutList, CalendarDays,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type TaskItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  dueDate: string;
  module: string;
  href: string;
  colour: string;
  assignedToMemberId?: number;
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
  return d.toISOString().split("T")[0];
}

const COLOUR_MAP: Record<string, { badge: string; dot: string; chip: string }> = {
  red:    { badge: "bg-red-50 text-red-700 border-red-100",          dot: "bg-red-400",     chip: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200" },
  indigo: { badge: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-400",  chip: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200" },
  violet: { badge: "bg-violet-50 text-violet-700 border-violet-100", dot: "bg-violet-400",  chip: "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200" },
  amber:  { badge: "bg-amber-50 text-amber-700 border-amber-100",    dot: "bg-amber-400",   chip: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200" },
  orange: { badge: "bg-orange-50 text-orange-700 border-orange-100", dot: "bg-orange-400",  chip: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200" },
  blue:   { badge: "bg-blue-50 text-blue-700 border-blue-100",       dot: "bg-blue-400",    chip: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200" },
  green:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400", chip: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200" },
  slate:  { badge: "bg-slate-50 text-slate-600 border-slate-100",    dot: "bg-slate-400",   chip: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" },
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
        }).then(r => r.json());
      }
      return fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json());
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

/* ─────────── TaskCardExpanded — used inside calendar ─────────── */
function TaskCardExpanded({
  task, today, onDelete, staff, farmId, onAssigned, onClose,
}: {
  task: TaskItem; today: Date;
  onDelete?: (id: string) => void;
  staff: StaffMember[];
  farmId: number;
  onAssigned: () => void;
  onClose: () => void;
}) {
  const days = daysUntil(task.dueDate, today);
  const overdue = days < 0;
  const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
  const isCustom = task.type === "planner_event";
  const isAssignment = task.type === "task_assignment";
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
                      <p className="text-[10px] text-foreground/50 font-semibold pl-1">+{overflow} more</p>
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
  const [error, setError] = useState("");

  const minDate = (() => {
    const d = new Date(); d.setDate(d.getDate() - 60);
    return d.toISOString().split("T")[0];
  })();
  const maxDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  })();

  const createMut = useMutation({
    mutationFn: (body: object) =>
      fetch(`/api/farms/${farmId}/planner-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-ahead", farmId, days] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Please enter a title."); return; }
    if (!date) { setError("Please choose a date."); return; }
    setError("");
    createMut.mutate({ title: title.trim(), description: description.trim() || undefined, eventDate: date + "T12:00:00Z", colour });
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
          <label className="text-xs font-semibold text-foreground/60 block mb-1">Date *</label>
          <input
            type="date"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={e => setDate(e.target.value)}
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
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

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

  const deleteMut = useMutation({
    mutationFn: (id: string) => {
      const numId = id.replace("planner-", "");
      return fetch(`/api/farms/${farmId}/planner-events/${numId}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["week-ahead", farmId, days] }),
  });

  const tasks = data?.tasks ?? [];
  const staff = staffData?.members ?? [];
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

            {/* List / Calendar view toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setViewMode("list")}
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
                onClick={() => setViewMode("calendar")}
                title="Calendar view"
                className={cn(
                  "px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5",
                  viewMode === "calendar" ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar
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
        <div className={cn("space-y-6", viewMode === "calendar" ? "max-w-5xl" : "max-w-2xl")}>

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
