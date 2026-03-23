import { AppLayout } from "@/components/layout/AppLayout";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import { AlertTriangle, Calendar, CheckCircle2, ArrowRight, Clock, Loader2 } from "lucide-react";
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
  red:    { badge: "bg-red-50 text-red-700 border-red-100",       dot: "bg-red-400" },
  indigo: { badge: "bg-indigo-50 text-indigo-700 border-indigo-100", dot: "bg-indigo-400" },
  violet: { badge: "bg-violet-50 text-violet-700 border-violet-100", dot: "bg-violet-400" },
  amber:  { badge: "bg-amber-50 text-amber-700 border-amber-100",    dot: "bg-amber-400" },
  orange: { badge: "bg-orange-50 text-orange-700 border-orange-100", dot: "bg-orange-400" },
  blue:   { badge: "bg-blue-50 text-blue-700 border-blue-100",       dot: "bg-blue-400" },
  green:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-400" },
};

function TaskCard({ task, today }: { task: TaskItem; today: Date }) {
  const days = daysUntil(task.dueDate, today);
  const overdue = days < 0;
  const colours = COLOUR_MAP[task.colour] ?? COLOUR_MAP.blue;

  return (
    <Link href={task.href}>
      <div className={cn(
        "flex items-start gap-4 px-5 py-4 rounded-xl border bg-white hover:shadow-sm transition-all cursor-pointer group",
        overdue ? "border-red-200 bg-red-50/30" : "border-border"
      )}>
        <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", colours.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className={cn("font-semibold text-sm leading-snug", overdue ? "text-red-800" : "text-foreground")}>
              {task.title}
            </p>
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0", colours.badge)}>
              {task.module}
            </span>
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
        <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </Link>
  );
}

function DaySection({ label, tasks, today, isOverdue }: { label: string; tasks: TaskItem[]; today: Date; isOverdue?: boolean }) {
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
        {tasks.map(t => <TaskCard key={t.id} task={t} today={today} />)}
      </div>
    </div>
  );
}

export default function WeekAheadPage() {
  const { farmId } = useAppStore();
  if (!farmId) return <Redirect href="/select" />;

  const [days, setDays] = useState<7 | 30>(7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + days);

  const { data, isLoading } = useQuery<{ tasks: TaskItem[] }>({
    queryKey: ["week-ahead", farmId, days],
    queryFn: () => fetch(`/api/farms/${farmId}/week-ahead?days=${days}`).then(r => r.json()),
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

  return (
    <AppLayout title={label}>
      <div className="max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-foreground/50 mt-0.5">{dateRange}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 7 / 30 day toggle */}
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
          </div>
        </div>

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
          </Card>
        )}

        {/* Overdue */}
        {overdue.length > 0 && (
          <DaySection label="Overdue" tasks={overdue} today={today} isOverdue />
        )}

        {/* Upcoming days */}
        {[...grouped.entries()].map(([label, items]) => (
          <DaySection key={label} label={label} tasks={items} today={today} />
        ))}

        {/* Footer note */}
        {!isLoading && tasks.length > 0 && (
          <p className="text-xs text-foreground/35 text-center pb-2">
            Tasks are drawn from scheduled dates across all active modules. Click any item to go directly to that record.
          </p>
        )}

      </div>
    </AppLayout>
  );
}
