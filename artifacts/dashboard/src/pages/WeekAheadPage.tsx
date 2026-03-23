import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import { AlertTriangle, Calendar, CheckCircle2, ArrowRight, Clock, Loader2, Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

type TaskItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  dueDate: string;
  module: string;
  href: string;
  colour: string;
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

const COLOUR_MAP: Record<string, { badge: string; dot: string }> = {
  red:    { badge: "bg-red-50 text-red-700 border-red-100",          dot: "bg-red-400" },
  indigo: { badge: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-400" },
  violet: { badge: "bg-violet-50 text-violet-700 border-violet-100", dot: "bg-violet-400" },
  amber:  { badge: "bg-amber-50 text-amber-700 border-amber-100",    dot: "bg-amber-400" },
  orange: { badge: "bg-orange-50 text-orange-700 border-orange-100", dot: "bg-orange-400" },
  blue:   { badge: "bg-blue-50 text-blue-700 border-blue-100",       dot: "bg-blue-400" },
  green:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400" },
  slate:  { badge: "bg-slate-50 text-slate-600 border-slate-100",    dot: "bg-slate-400" },
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

function TaskCard({ task, today, onDelete }: { task: TaskItem; today: Date; onDelete?: (id: string) => void }) {
  const days = daysUntil(task.dueDate, today);
  const overdue = days < 0;
  const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.slate;
  const isCustom = task.type === "planner_event";

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
      </div>
      {!isCustom && <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 flex-shrink-0 mt-1 transition-colors" />}
    </div>
  );

  if (isCustom) return <div>{inner}</div>;
  return <Link href={task.href}>{inner}</Link>;
}

function DaySection({ label, tasks, today, isOverdue, onDelete }: {
  label: string; tasks: TaskItem[]; today: Date; isOverdue?: boolean;
  onDelete?: (id: string) => void;
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
        {tasks.map(t => <TaskCard key={t.id} task={t} today={today} onDelete={onDelete} />)}
      </div>
    </div>
  );
}

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
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold py-2 px-4 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function WeekAheadPage() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect href="/select" />;

  const queryClient = useQueryClient();
  const [days, setDays] = useState<7 | 30>(7);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + days);

  const { data, isLoading } = useQuery<{ tasks: TaskItem[] }>({
    queryKey: ["week-ahead", farmId, days],
    queryFn: () => fetch(`/api/farms/${farmId}/week-ahead?days=${days}`).then(r => r.json()),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => {
      const numId = id.replace("planner-", "");
      return fetch(`/api/farms/${farmId}/planner-events/${numId}`, { method: "DELETE" }).then(r => r.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["week-ahead", farmId, days] }),
  });

  const tasks = data?.tasks ?? [];
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

  return (
    <AppLayout title={label}>
      <div className="max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-foreground/50 mt-0.5">{dateRange}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setDays(7)}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all",
                  days === 7 ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
                )}
              >
                7 days
              </button>
              <button
                onClick={() => setDays(30)}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all",
                  days === 30 ? "bg-white shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"
                )}
              >
                30 days
              </button>
            </div>
            {!isLoading && tasks.length > 0 && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => setShowAddPanel(p => !p)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
                showAddPanel
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white border-border hover:bg-muted"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Add reminder
            </button>
          </div>
        </div>

        {/* Add reminder panel */}
        {showAddPanel && (
          <AddReminderPanel farmId={farmId} days={days} onClose={() => setShowAddPanel(false)} />
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

        {/* Overdue */}
        {overdue.length > 0 && (
          <DaySection label="Overdue" tasks={overdue} today={today} isOverdue onDelete={handleDelete} />
        )}

        {/* Upcoming days */}
        {[...grouped.entries()].map(([lbl, items]) => (
          <DaySection key={lbl} label={lbl} tasks={items} today={today} onDelete={handleDelete} />
        ))}

        {/* Footer note */}
        {!isLoading && tasks.length > 0 && (
          <p className="text-xs text-foreground/35 text-center pb-2">
            Tasks are drawn from scheduled dates across all active modules. Click any item to go directly to that record. Custom reminders can be removed with the trash icon.
          </p>
        )}

      </div>
    </AppLayout>
  );
}
