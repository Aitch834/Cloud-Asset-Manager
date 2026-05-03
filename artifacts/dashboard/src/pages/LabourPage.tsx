import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Printer, ChevronLeft, ChevronRight,
  Clock, CalendarDays, UmbrellaOff, PoundSterling, ShieldCheck,
  CheckCircle2, AlertTriangle, XCircle, Download,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TASK_TYPES = [
  "General Farm Work", "Crop Spraying", "Drilling / Planting", "Harvesting",
  "Livestock Handling", "Machinery Maintenance", "Irrigation", "Fencing / Hedging",
  "Grain Handling / Store", "Record Keeping / Admin", "Cleaning & Biosecurity",
  "Vehicle / Transport", "Travel (between sites)", "Building / Construction", "Other",
];

const SHIFT_TYPES = [
  { value: "full-day", label: "Full Day", color: "#16a34a" },
  { value: "morning", label: "Morning", color: "#2563eb" },
  { value: "afternoon", label: "Afternoon", color: "#7c3aed" },
  { value: "day-off", label: "Day Off", color: "#9ca3af" },
  { value: "holiday", label: "Holiday", color: "#f59e0b" },
  { value: "sick", label: "Sick", color: "#dc2626" },
  { value: "training", label: "Training", color: "#0891b2" },
];

const ABSENCE_TYPES = [
  "Annual Leave", "Sickness", "Compassionate Leave", "Maternity / Paternity",
  "Unpaid Leave", "Public Holiday", "Training Day", "Other",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_KEYS = ["monShift", "tueShift", "wedShift", "thuShift", "friShift", "satShift", "sunShift"] as const;

function fmtDate(d: string) {
  try { return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
}
function fmtGBP(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type TimesheetEntry = {
  id: number; farmId: number; staffName: string; date: string;
  taskType: string; hoursRegular: string; hoursOvertime: string;
  notes: string | null; approvedBy: string | null; approvedAt: string | null;
  createdAt: string;
};
type RotaEntry = {
  id: number; farmId: number; weekStartDate: string; staffName: string;
  monShift: string | null; tueShift: string | null; wedShift: string | null;
  thuShift: string | null; friShift: string | null; satShift: string | null;
  sunShift: string | null; notes: string | null;
};
type Absence = {
  id: number; farmId: number; staffName: string; absenceType: string;
  startDate: string; endDate: string; daysCount: string | null;
  notes: string | null; approvedBy: string | null; status: string;
  createdAt: string;
};
type Entitlement = {
  id: number; farmId: number; staffName: string; year: number;
  entitlementDays: string; carriedOverDays: string; wtrOptOut: boolean; notes: string | null;
};
type HourlyRate = {
  id: number; farmId: number; staffName: string; regularRatePence: number;
  overtimeRatePence: number; effectiveFrom: string; notes: string | null;
};

// ─── Tab Button ──────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active ? "border-green-700 text-green-800" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

// ─── Timesheets Tab ──────────────────────────────────────────────────────────

function TimesheetsTab({ farmId, staffNames }: { farmId: number; staffNames: string[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [filterStaff, setFilterStaff] = useState("all");
  const [filterMode, setFilterMode] = useState<"month" | "week">("month");
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterWeekStart, setFilterWeekStart] = useState(() => isoDate(getMondayOfWeek(new Date())));
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<TimesheetEntry | null>(null);

  const emptyForm = () => ({
    staffName: filterStaff !== "all" ? filterStaff : "",
    date: new Date().toISOString().slice(0, 10),
    taskType: "", hoursRegular: "", hoursOvertime: "", notes: "", approvedBy: "",
  });
  const [form, setForm] = useState(emptyForm());
  const sf = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const q = useQuery<{ entries: TimesheetEntry[] }>({
    queryKey: ["labour-timesheets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then(r => r.json()),
    enabled: !!farmId,
  });

  const addMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/labour/timesheets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Entry saved" }); qc.invalidateQueries({ queryKey: ["labour-timesheets", farmId] }); setAddOpen(false); setEditItem(null); setForm(emptyForm()); },
  });
  const editMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => fetch(`/api/farms/${farmId}/labour/timesheets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Entry updated" }); qc.invalidateQueries({ queryKey: ["labour-timesheets", farmId] }); setEditItem(null); setAddOpen(false); setForm(emptyForm()); },
  });
  const delMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/labour/timesheets/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Entry deleted" }); qc.invalidateQueries({ queryKey: ["labour-timesheets", farmId] }); },
  });

  const openEdit = (e: TimesheetEntry) => {
    setForm({ staffName: e.staffName, date: e.date, taskType: e.taskType, hoursRegular: e.hoursRegular, hoursOvertime: e.hoursOvertime ?? "", notes: e.notes ?? "", approvedBy: e.approvedBy ?? "" });
    setEditItem(e);
    setAddOpen(true);
  };
  const save = () => {
    if (editItem) editMut.mutate({ id: editItem.id, body: { ...form } });
    else addMut.mutate({ ...form });
  };

  const weekEnd = isoDate(addDays(new Date(filterWeekStart + "T00:00:00"), 6));
  const prevWeek = () => setFilterWeekStart(isoDate(addDays(new Date(filterWeekStart + "T00:00:00"), -7)));
  const nextWeek = () => setFilterWeekStart(isoDate(addDays(new Date(filterWeekStart + "T00:00:00"), 7)));

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const all = q.data?.entries ?? [];

  const filtered = useMemo(() => all.filter(e => {
    if (filterStaff !== "all" && e.staffName !== filterStaff) return false;
    if (filterMode === "month" && filterMonth && !e.date.startsWith(filterMonth)) return false;
    if (filterMode === "week" && (e.date < filterWeekStart || e.date > weekEnd)) return false;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date)), [all, filterStaff, filterMode, filterMonth, filterWeekStart, weekEnd]);

  const totalReg = filtered.reduce((s, e) => s + parseFloat(e.hoursRegular || "0"), 0);
  const totalOT = filtered.reduce((s, e) => s + parseFloat(e.hoursOvertime || "0"), 0);

  const byDate = useMemo(() => {
    if (filterStaff === "all") return null;
    const map: Record<string, TimesheetEntry[]> = {};
    filtered.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, filterStaff]);

  const byStaff = useMemo(() => {
    if (filterStaff !== "all") return {};
    return filtered.reduce<Record<string, { reg: number; ot: number }>>((acc, e) => {
      if (!acc[e.staffName]) acc[e.staffName] = { reg: 0, ot: 0 };
      acc[e.staffName].reg += parseFloat(e.hoursRegular || "0");
      acc[e.staffName].ot += parseFloat(e.hoursOvertime || "0");
      return acc;
    }, {});
  }, [filtered, filterStaff]);

  const periodLabel = filterMode === "week"
    ? `${fmtDate(filterWeekStart)} – ${fmtDate(weekEnd)}`
    : filterMonth ? new Date(filterMonth + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "All periods";

  const printTimesheets = () => {
    const rows = filtered.map(e => `<tr><td>${fmtDate(e.date)}</td><td>${e.staffName}</td><td>${e.taskType}</td><td style="text-align:right">${parseFloat(e.hoursRegular || "0").toFixed(1)}</td><td style="text-align:right">${parseFloat(e.hoursOvertime || "0") > 0 ? parseFloat(e.hoursOvertime).toFixed(1) : "—"}</td><td>${e.approvedBy || "—"}</td><td>${e.notes || ""}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Labour Timesheets</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}h1{font-size:16px;margin-bottom:4px}p{color:#666;margin-bottom:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}tr:nth-child(even){background:#fafafa}.totals{margin-top:12px;font-size:13px}</style></head><body><h1>Labour Timesheets</h1><p>${periodLabel} — All staff</p><table><thead><tr><th>Date</th><th>Staff Member</th><th>Task</th><th>Reg Hrs</th><th>OT Hrs</th><th>Approved By</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><strong>Total regular: ${totalReg.toFixed(1)} hrs</strong> &nbsp;&nbsp; <strong>Total overtime: ${totalOT.toFixed(1)} hrs</strong> &nbsp;&nbsp; <strong>Total working time: ${(totalReg + totalOT).toFixed(1)} hrs</strong></div></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const printStaffTimesheet = () => {
    if (!byDate) return;
    const name = filterStaff;
    const dayRows = byDate.map(([date, entries]) => {
      const dayReg = entries.reduce((s, e) => s + parseFloat(e.hoursRegular || "0"), 0);
      const dayOT = entries.reduce((s, e) => s + parseFloat(e.hoursOvertime || "0"), 0);
      const dayLabel = new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
      const taskRows = entries.map(e =>
        `<tr><td style="padding-left:24px;color:#555">${e.taskType}</td><td style="text-align:right">${parseFloat(e.hoursRegular || "0").toFixed(2)}</td><td style="text-align:right">${parseFloat(e.hoursOvertime || "0") > 0 ? parseFloat(e.hoursOvertime).toFixed(2) : "—"}</td><td style="color:#777;font-size:11px">${e.approvedBy || ""}</td><td style="color:#777;font-size:11px">${e.notes || ""}</td></tr>`
      ).join("");
      return `<tr style="background:#f8f8f8"><td colspan="5" style="font-weight:600;padding:7px 8px;border:1px solid #bbb">${dayLabel} &nbsp;<span style="font-weight:400;color:#555">— ${dayReg.toFixed(1)}h reg${dayOT > 0 ? ` + ${dayOT.toFixed(1)}h OT` : ""} &nbsp;(daily total: ${(dayReg + dayOT).toFixed(1)}h)</span></td></tr>${taskRows}`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Timesheet — ${name}</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:24px;color:#111}h1{font-size:18px;margin:0 0 2px}.sub{color:#666;font-size:12px;margin:0 0 14px}table{width:100%;border-collapse:collapse;margin-bottom:14px}th{background:#efefef;border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em}td{border:1px solid #ddd;padding:6px 8px}.wtr-note{background:#fff8e1;border:1px solid #e8cc50;border-radius:4px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#555}.totals{background:#f0f7f0;border:1px solid #b8d8b8;border-radius:4px;padding:10px 14px;margin-bottom:18px;font-size:13px}.signoff{border-top:2px solid #222;padding-top:14px;margin-top:20px}.sig-box{border-bottom:1px solid #222;height:36px;margin-top:4px}.signoff-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:10px}@media print{body{margin:12px}}</style></head><body><h1>Staff Timesheet — ${name}</h1><p class="sub">${periodLabel} &nbsp;·&nbsp; Printed ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p><div class="wtr-note"><strong>Working Time note:</strong> Hours recorded represent time actively working on each task. Rest breaks (including the statutory 20-minute break) are <em>not</em> working time under the Working Time Regulations 1998 and should not be included. Travel between work sites during the working day <em>is</em> working time and should be recorded as "Travel (between sites)".</div><table><thead><tr><th>Task</th><th style="text-align:right">Reg Hrs</th><th style="text-align:right">OT Hrs</th><th>Approved By</th><th>Notes</th></tr></thead><tbody>${dayRows}</tbody></table><div class="totals">Total regular hours: <strong>${totalReg.toFixed(1)} hrs</strong> &nbsp;&nbsp;&nbsp; Total overtime: <strong>${totalOT.toFixed(1)} hrs</strong> &nbsp;&nbsp;&nbsp; Total working time: <strong>${(totalReg + totalOT).toFixed(1)} hrs</strong></div><div class="signoff"><p style="margin:0 0 4px;font-size:13px;font-weight:600">Declaration</p><p style="margin:0;font-size:11px;color:#555">I confirm that the above is an accurate record of my working hours and the tasks undertaken during the period shown. Rest breaks are not included in the hours recorded.</p><div class="signoff-grid"><div><p style="margin:10px 0 2px;font-size:11px">Staff member: <strong>${name}</strong></p><div class="sig-box"></div><p style="margin:3px 0 0;font-size:10px;color:#888">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: _______________</p></div><div><p style="margin:10px 0 2px;font-size:11px">Countersigned by (supervisor / farm manager)</p><div class="sig-box"></div><p style="margin:3px 0 0;font-size:10px;color:#888">Name: _________________________ &nbsp; Date: _______________</p></div></div></div></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  return (
    <div className="space-y-5">
      {/* WTR guidance */}
      <div className="flex gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800 leading-relaxed">
        <AlertTriangle size={13} className="shrink-0 mt-0.5 text-blue-500" />
        <span>
          <strong>What counts as working time:</strong> Record each task separately with the hours spent on it.
          Travel <em>between</em> work sites during the day is working time — use the &ldquo;Travel (between sites)&rdquo; task type.
          Rest breaks (including the statutory 20-minute break, or any break where the worker is free to leave) are <em>not</em> working time under the Working Time Regulations 1998 and should not be recorded as task hours.
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterStaff} onValueChange={v => setFilterStaff(v)}>
          <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="All staff" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All staff</SelectItem>
            {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex border rounded-lg overflow-hidden h-9 shrink-0">
          <button onClick={() => setFilterMode("month")} className={`px-3 text-sm font-medium transition-colors ${filterMode === "month" ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Month</button>
          <button onClick={() => setFilterMode("week")} className={`px-3 text-sm font-medium border-l transition-colors ${filterMode === "week" ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Week</button>
        </div>

        {filterMode === "month" ? (
          <Select value={filterMonth || "all-months"} onValueChange={v => setFilterMonth(v === "all-months" ? "" : v)}>
            <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Select month" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all-months">All months</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-1 h-9">
            <button onClick={prevWeek} className="border rounded-lg p-1.5 hover:bg-gray-50 transition-colors"><ChevronLeft size={14} /></button>
            <span className="text-sm font-medium px-2 whitespace-nowrap">{fmtDate(filterWeekStart)} – {fmtDate(weekEnd)}</span>
            <button onClick={nextWeek} className="border rounded-lg p-1.5 hover:bg-gray-50 transition-colors"><ChevronRight size={14} /></button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {filterStaff !== "all" && filtered.length > 0 && (
            <Button variant="outline" size="sm" onClick={printStaffTimesheet}>
              <Printer size={14} className="mr-1" /> Print Staff Timesheet
            </Button>
          )}
          {filterStaff === "all" && filtered.length > 0 && (
            <Button variant="outline" size="sm" onClick={printTimesheets}>
              <Printer size={14} className="mr-1" /> Print
            </Button>
          )}
          <Button size="sm" onClick={() => { setForm(emptyForm()); setEditItem(null); setAddOpen(true); }}>
            <Plus size={14} className="mr-1" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Totals bar */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 rounded-lg px-4 py-2.5 border">
          <span className="text-gray-500">Regular: <strong className="text-gray-900">{totalReg.toFixed(1)} hrs</strong></span>
          <span className="text-gray-500">Overtime: <strong className="text-amber-700">{totalOT.toFixed(1)} hrs</strong></span>
          <span className="text-gray-500">Total working time: <strong className="text-gray-900">{(totalReg + totalOT).toFixed(1)} hrs</strong></span>
          <span className="text-gray-400 text-xs ml-auto">{filtered.length} {filtered.length === 1 ? "entry" : "entries"} · {periodLabel}{filterStaff !== "all" ? ` · ${filterStaff}` : ""}</span>
        </div>
      )}

      {/* All-staff summary cards — click a card to drill into that staff member */}
      {filterStaff === "all" && Object.keys(byStaff).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Object.entries(byStaff).map(([name, hrs]) => (
            <button key={name} onClick={() => setFilterStaff(name)} className="border rounded-xl p-3 bg-white text-left hover:border-green-500 hover:shadow-sm transition-all group">
              <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{hrs.reg.toFixed(1)} <span className="text-xs font-normal text-gray-400">reg hrs</span></p>
              {hrs.ot > 0 && <p className="text-xs text-amber-600 mt-0.5">+ {hrs.ot.toFixed(1)} OT hrs</p>}
              <p className="text-xs text-green-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View daily breakdown →</p>
            </button>
          ))}
        </div>
      )}

      {/* Per-staff: day-grouped view */}
      {filterStaff !== "all" && (
        <div>
          {q.isLoading ? (
            <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
          ) : !byDate || byDate.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-25" />
              <p className="text-sm">No entries for <strong>{filterStaff}</strong> in this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {byDate.map(([date, entries]) => {
                const dayReg = entries.reduce((s, e) => s + parseFloat(e.hoursRegular || "0"), 0);
                const dayOT = entries.reduce((s, e) => s + parseFloat(e.hoursOvertime || "0"), 0);
                const dayLabel = new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
                return (
                  <div key={date} className="border rounded-xl overflow-hidden bg-white">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
                      <span className="text-sm font-semibold text-gray-800">{dayLabel}</span>
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <strong className="text-gray-900">{dayReg.toFixed(1)}h</strong>
                        <span className="text-gray-300">reg</span>
                        {dayOT > 0 && <><span className="text-gray-300">+</span><strong className="text-amber-700">{dayOT.toFixed(1)}h</strong><span className="text-gray-300">OT</span></>}
                        <span className="text-gray-400 text-xs ml-1">· total {(dayReg + dayOT).toFixed(1)}h</span>
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100">
                        {entries.map(e => (
                          <tr key={e.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-2 pl-6 text-gray-700">{e.taskType}</td>
                            <td className="px-4 py-2 font-mono text-gray-900 whitespace-nowrap">{parseFloat(e.hoursRegular || "0").toFixed(1)}h</td>
                            <td className="px-4 py-2 font-mono whitespace-nowrap">
                              {parseFloat(e.hoursOvertime || "0") > 0 ? <span className="text-amber-700">+{parseFloat(e.hoursOvertime).toFixed(1)}h OT</span> : <span className="text-gray-200">—</span>}
                            </td>
                            <td className="px-4 py-2">
                              {e.approvedBy ? <Badge className="text-xs bg-green-50 text-green-700 border-green-200">{e.approvedBy}</Badge> : null}
                            </td>
                            <td className="px-4 py-2 text-gray-400 text-xs max-w-[200px] truncate">{e.notes || ""}</td>
                            <td className="px-4 py-2">
                              <div className="flex gap-1">
                                <button onClick={() => openEdit(e)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={13} /></button>
                                <button onClick={() => delMut.mutate(e.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All-staff flat table */}
      {filterStaff === "all" && (
        <>
          {q.isLoading ? (
            <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-25" />
              <p className="text-sm">{all.length === 0 ? "No timesheet entries yet — add your first entry." : "No entries match the current filters."}</p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide">
                    {["Date", "Staff Member", "Task", "Reg hrs", "OT hrs", "Approved By", "Notes", ""].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 whitespace-nowrap text-gray-700">{fmtDate(e.date)}</td>
                      <td className="px-4 py-2.5 font-medium">
                        <button onClick={() => setFilterStaff(e.staffName)} className="text-gray-900 hover:text-green-700 hover:underline">{e.staffName}</button>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">{e.taskType}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-900">{parseFloat(e.hoursRegular || "0").toFixed(1)}</td>
                      <td className="px-4 py-2.5 font-mono">{parseFloat(e.hoursOvertime || "0") > 0 ? <span className="text-amber-700">{parseFloat(e.hoursOvertime).toFixed(1)}</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-2.5">
                        {e.approvedBy ? <Badge className="text-xs bg-green-50 text-green-700 border-green-200">{e.approvedBy}</Badge> : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[180px] truncate">{e.notes || "—"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(e)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={13} /></button>
                          <button onClick={() => delMut.mutate(e.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditItem(null); setForm(emptyForm()); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Timesheet Entry" : "Add Timesheet Entry"}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">
            Each entry records <strong>one task type</strong> for one staff member on one date.
            To record multiple tasks in the same day, save this entry then click <strong>Add Entry</strong> again with the same person and date.
          </p>
          <div className="space-y-4 mt-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Staff Member *</Label>
                <Select value={form.staffName} onValueChange={v => sf("staffName", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                  <SelectContent>{staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date *</Label>
                <Input type="date" className="mt-1" value={form.date} onChange={e => sf("date", e.target.value)} />
              </div>
              <div>
                <Label>Task Type *</Label>
                <Select value={form.taskType} onValueChange={v => sf("taskType", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select task…" /></SelectTrigger>
                  <SelectContent>{TASK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Regular Hours <span className="text-muted-foreground font-normal text-xs">(for this task)</span></Label>
                <Input type="number" min="0" step="0.25" className="mt-1" value={form.hoursRegular} onChange={e => sf("hoursRegular", e.target.value)} placeholder="e.g. 4" />
              </div>
              <div>
                <Label>Overtime Hours <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                <Input type="number" min="0" step="0.25" className="mt-1" value={form.hoursOvertime} onChange={e => sf("hoursOvertime", e.target.value)} placeholder="0" />
              </div>
              <div className="col-span-2">
                <Label>Approved By <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                <Select value={form.approvedBy || "none"} onValueChange={v => sf("approvedBy", v === "none" ? "" : v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select supervisor…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Not yet approved —</SelectItem>
                    {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Notes <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                <textarea
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[72px] resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.notes}
                  onChange={e => sf("notes", e.target.value)}
                  placeholder="e.g. North block, finished at 18:00 due to weather"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); setForm(emptyForm()); }}>Cancel</Button>
              <Button onClick={save} disabled={!form.staffName || !form.date || !form.taskType || addMut.isPending || editMut.isPending}>
                {editItem ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Rota Tab ─────────────────────────────────────────────────────────────────

function RotaTab({ farmId, staffNames }: { farmId: number; staffNames: string[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState<Date>(getMondayOfWeek(new Date()));
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const q = useQuery<{ rota: RotaEntry[] }>({
    queryKey: ["labour-rota", farmId, isoDate(weekStart)],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/rota`).then(r => r.json()),
    enabled: !!farmId,
  });

  const allRota = q.data?.rota ?? [];
  const weekRota = allRota.filter(r => r.weekStartDate === isoDate(weekStart));
  const rotaMap = new Map(weekRota.map(r => [r.staffName, r]));

  const shiftColor = (val: string | null | undefined) => {
    const s = SHIFT_TYPES.find(t => t.value === val);
    return s ? s.color : "#e5e7eb";
  };
  const shiftLabel = (val: string | null | undefined) => {
    const s = SHIFT_TYPES.find(t => t.value === val);
    return s ? s.label : "—";
  };

  const setShift = async (staffName: string, dayKey: string, shiftVal: string) => {
    const key = `${staffName}-${dayKey}`;
    setSaving(p => ({ ...p, [key]: true }));
    try {
      const existing = rotaMap.get(staffName);
      if (existing) {
        await fetch(`/api/farms/${farmId}/labour/rota/${existing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...existing, [dayKey]: shiftVal === "none" ? null : shiftVal }),
        });
      } else {
        const body: Record<string, string | null> = { weekStartDate: isoDate(weekStart), staffName };
        DAY_KEYS.forEach(k => { body[k] = k === dayKey ? (shiftVal === "none" ? null : shiftVal) : null; });
        await fetch(`/api/farms/${farmId}/labour/rota`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      }
      qc.invalidateQueries({ queryKey: ["labour-rota", farmId, isoDate(weekStart)] });
      qc.invalidateQueries({ queryKey: ["labour-rota", farmId] });
    } catch { toast({ title: "Error saving shift", variant: "destructive" }); }
    finally { setSaving(p => ({ ...p, [key]: false })); }
  };

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => setWeekStart(getMondayOfWeek(new Date()));

  const printRota = () => {
    const header = `<tr><th>Staff Member</th>${DAYS.map((d, i) => `<th>${d} ${fmtDate(isoDate(addDays(weekStart, i))).slice(0, 6)}</th>`).join("")}</tr>`;
    const rows = staffNames.map(name => {
      const row = rotaMap.get(name);
      return `<tr><td><strong>${name}</strong></td>${DAY_KEYS.map(k => `<td>${row ? (shiftLabel(row[k]) ?? "—") : "—"}</td>`).join("")}</tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Weekly Rota</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}h1{font-size:16px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:center}th{background:#f5f5f5;font-weight:600}td:first-child{text-align:left}</style></head><body><h1>Weekly Rota — w/c ${fmtDate(isoDate(weekStart))}</h1><table><thead>${header}</thead><tbody>${rows}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const dayDates = DAYS.map((_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      {/* Week nav */}
      <div className="flex items-center gap-3">
        <button onClick={prevWeek} className="p-1.5 rounded hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <span className="text-sm font-medium text-gray-800 min-w-[200px] text-center">
          w/c {fmtDate(isoDate(weekStart))} – {fmtDate(isoDate(addDays(weekStart, 6)))}
        </span>
        <button onClick={nextWeek} className="p-1.5 rounded hover:bg-gray-100"><ChevronRight size={16} /></button>
        <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={printRota}><Printer size={14} className="mr-1" /> Print Rota</Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {SHIFT_TYPES.map(s => (
          <span key={s.value} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      {staffNames.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No staff found. Add staff members first.</div>
      ) : (
        <div className="border rounded-xl overflow-auto bg-white">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-2.5 font-semibold text-gray-700 min-w-[160px] sticky left-0 bg-gray-50">Staff Member</th>
                {DAYS.map((day, i) => (
                  <th key={day} className="px-2 py-2.5 text-center font-medium text-gray-600 min-w-[110px]">
                    <div>{day}</div>
                    <div className="text-xs text-gray-400 font-normal">{dayDates[i].getDate()}/{dayDates[i].getMonth() + 1}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffNames.map(name => {
                const row = rotaMap.get(name);
                return (
                  <tr key={name} className="hover:bg-gray-50/30">
                    <td className="px-4 py-2 font-medium text-gray-800 sticky left-0 bg-white">{name}</td>
                    {DAY_KEYS.map(dayKey => {
                      const val = row?.[dayKey] ?? null;
                      const key = `${name}-${dayKey}`;
                      return (
                        <td key={dayKey} className="px-2 py-1.5 text-center">
                          <Select value={val ?? "none"} onValueChange={v => setShift(name, dayKey, v)}>
                            <SelectTrigger
                              className="h-8 text-xs justify-center border-0 shadow-none focus:ring-0"
                              style={{ background: val ? shiftColor(val) + "22" : "#f9fafb", color: val ? shiftColor(val) : "#9ca3af", fontWeight: val ? 600 : 400 }}
                            >
                              <SelectValue>{saving[key] ? "…" : shiftLabel(val)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">— Clear —</SelectItem>
                              {SHIFT_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Holiday & Absence Tab ───────────────────────────────────────────────────

function AbsenceTab({ farmId, staffNames }: { farmId: number; staffNames: string[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const thisYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(thisYear));
  const [staffFilter, setStaffFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Absence | null>(null);

  const emptyForm = () => ({ staffName: "", absenceType: "Annual Leave", startDate: "", endDate: "", daysCount: "", notes: "", approvedBy: "", status: "approved" });
  const [form, setForm] = useState(emptyForm());
  const sf = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const absQ = useQuery<{ absences: Absence[] }>({
    queryKey: ["labour-absences", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/absences`).then(r => r.json()),
    enabled: !!farmId,
  });
  const entQ = useQuery<{ entitlements: Entitlement[] }>({
    queryKey: ["labour-entitlements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/entitlements`).then(r => r.json()),
    enabled: !!farmId,
  });

  const addMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/labour/absences`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Absence recorded" }); qc.invalidateQueries({ queryKey: ["labour-absences", farmId] }); setAddOpen(false); setEditItem(null); setForm(emptyForm()); },
  });
  const editMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => fetch(`/api/farms/${farmId}/labour/absences/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Absence updated" }); qc.invalidateQueries({ queryKey: ["labour-absences", farmId] }); setAddOpen(false); setEditItem(null); setForm(emptyForm()); },
  });
  const delMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/labour/absences/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Deleted" }); qc.invalidateQueries({ queryKey: ["labour-absences", farmId] }); },
  });
  const addEntMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/labour/entitlements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Entitlement set" }); qc.invalidateQueries({ queryKey: ["labour-entitlements", farmId] }); },
  });
  const editEntMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => fetch(`/api/farms/${farmId}/labour/entitlements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Entitlement updated" }); qc.invalidateQueries({ queryKey: ["labour-entitlements", farmId] }); },
  });

  const openEdit = (a: Absence) => {
    setForm({ staffName: a.staffName, absenceType: a.absenceType, startDate: a.startDate, endDate: a.endDate, daysCount: a.daysCount ?? "", notes: a.notes ?? "", approvedBy: a.approvedBy ?? "", status: a.status });
    setEditItem(a);
    setAddOpen(true);
  };

  const autoCalcDays = (start: string, end: string) => {
    if (!start || !end) return "";
    const s = new Date(start + "T00:00:00"), e = new Date(end + "T00:00:00");
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? String(diff) : "";
  };

  const save = () => {
    const body = { ...form, daysCount: form.daysCount || autoCalcDays(form.startDate, form.endDate) };
    if (editItem) editMut.mutate({ id: editItem.id, body });
    else addMut.mutate(body);
  };

  const absences = absQ.data?.absences ?? [];
  const entitlements = entQ.data?.entitlements ?? [];
  const yearInt = parseInt(yearFilter);

  const filtered = absences.filter(a => {
    if (staffFilter !== "all" && a.staffName !== staffFilter) return false;
    if (typeFilter !== "all" && a.absenceType !== typeFilter) return false;
    if (yearFilter && !a.startDate.startsWith(yearFilter)) return false;
    return true;
  });

  // Per-staff leave summary for the selected year
  const leaveSummary = useMemo(() => {
    return staffNames.map(name => {
      const ent = entitlements.find(e => e.staffName === name && e.year === yearInt);
      const taken = absences.filter(a => a.staffName === name && a.absenceType === "Annual Leave" && a.startDate.startsWith(yearFilter)).reduce((s, a) => s + parseFloat(a.daysCount ?? "0"), 0);
      const entDays = parseFloat(ent?.entitlementDays ?? "28") + parseFloat(ent?.carriedOverDays ?? "0");
      return { name, entDays, taken, remaining: entDays - taken, ent };
    });
  }, [staffNames, entitlements, absences, yearFilter, yearInt]);

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="text-xs bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    if (status === "pending") return <Badge className="text-xs bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    return <Badge className="text-xs bg-gray-100 text-gray-500">Declined</Badge>;
  };

  const years = [thisYear + 1, thisYear, thisYear - 1, thisYear - 2];

  return (
    <div className="space-y-5">
      {/* Leave entitlement summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">Annual Leave Entitlement</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {leaveSummary.map(({ name, entDays, taken, remaining, ent }) => (
            <div key={name} className="border rounded-xl p-3 bg-white space-y-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Entitlement</span><span className="font-medium text-gray-800">{entDays} days</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Taken</span><span className="font-medium text-gray-800">{taken.toFixed(1)} days</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Remaining</span>
                <span className={`font-bold ${remaining < 0 ? "text-red-600" : remaining <= 5 ? "text-amber-600" : "text-green-700"}`}>{remaining.toFixed(1)} days</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.min(100, (taken / entDays) * 100)}%`, background: taken > entDays ? "#dc2626" : "#16a34a" }} />
              </div>
              <button
                className="text-xs text-blue-600 underline mt-0.5"
                onClick={() => {
                  const newEnt = parseFloat(prompt(`Annual leave entitlement for ${name} in ${yearInt} (days):`, String(entDays)) ?? String(entDays));
                  if (!isNaN(newEnt)) {
                    if (ent) editEntMut.mutate({ id: ent.id, body: { entitlementDays: String(newEnt), carriedOverDays: ent.carriedOverDays, wtrOptOut: ent.wtrOptOut } });
                    else addEntMut.mutate({ staffName: name, year: yearInt, entitlementDays: String(newEnt), carriedOverDays: "0" });
                  }
                }}
              >Edit entitlement</button>
            </div>
          ))}
        </div>
      </div>

      {/* Absence list filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All staff" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All staff</SelectItem>
            {staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All absence types</SelectItem>
            {ABSENCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button className="ml-auto" size="sm" onClick={() => { setForm(emptyForm()); setEditItem(null); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" /> Record Absence
        </Button>
      </div>

      {/* Absence table */}
      {absQ.isLoading ? (
        <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <UmbrellaOff className="w-10 h-10 mx-auto mb-2 opacity-25" />
          <p className="text-sm">{absences.length === 0 ? "No absences recorded yet." : "No absences match the current filters."}</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide">
                {["Staff Member", "Type", "From", "To", "Days", "Approved By", "Status", "Notes", ""].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium">{a.staffName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.absenceType === "Annual Leave" ? "bg-blue-50 text-blue-700" : a.absenceType === "Sickness" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                      {a.absenceType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(a.startDate)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{fmtDate(a.endDate)}</td>
                  <td className="px-4 py-2.5 font-mono text-center">{a.daysCount ?? "—"}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{a.approvedBy || "—"}</td>
                  <td className="px-4 py-2.5">{statusBadge(a.status)}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[160px] truncate">{a.notes || "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(a)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={13} /></button>
                      <button onClick={() => delMut.mutate(a.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditItem(null); setForm(emptyForm()); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Edit Absence" : "Record Absence"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Staff Member *</Label>
                <Select value={form.staffName} onValueChange={v => sf("staffName", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Absence Type *</Label>
                <Select value={form.absenceType} onValueChange={v => sf("absenceType", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ABSENCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date *</Label>
                <Input type="date" className="mt-1" value={form.startDate} onChange={e => { sf("startDate", e.target.value); if (!form.daysCount) sf("daysCount", autoCalcDays(e.target.value, form.endDate)); }} />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input type="date" className="mt-1" value={form.endDate} onChange={e => { sf("endDate", e.target.value); sf("daysCount", autoCalcDays(form.startDate, e.target.value)); }} />
              </div>
              <div>
                <Label>Days Count</Label>
                <Input type="number" min="0.5" step="0.5" className="mt-1" value={form.daysCount} onChange={e => sf("daysCount", e.target.value)} placeholder="Auto-calculated" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => sf("status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Approved By</Label>
                <Input className="mt-1" value={form.approvedBy} onChange={e => sf("approvedBy", e.target.value)} placeholder="Supervisor name" />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <textarea className="mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-ring" value={form.notes} onChange={e => sf("notes", e.target.value)} placeholder="Optional details…" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); setForm(emptyForm()); }}>Cancel</Button>
              <Button onClick={save} disabled={!form.staffName || !form.startDate || !form.endDate || addMut.isPending || editMut.isPending}>
                {editItem ? "Update" : "Record Absence"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Pay Summary Tab ──────────────────────────────────────────────────────────

function PaySummaryTab({ farmId, staffNames }: { farmId: number; staffNames: string[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rateOpen, setRateOpen] = useState(false);
  const [editRate, setEditRate] = useState<HourlyRate | null>(null);
  const emptyRate = () => ({ staffName: "", regularRatePence: "", overtimeRatePence: "", effectiveFrom: new Date().toISOString().slice(0, 10), notes: "" });
  const [rateForm, setRateForm] = useState(emptyRate());

  const tsQ = useQuery<{ entries: TimesheetEntry[] }>({
    queryKey: ["labour-timesheets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then(r => r.json()),
    enabled: !!farmId,
  });
  const ratesQ = useQuery<{ rates: HourlyRate[] }>({
    queryKey: ["labour-rates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/rates`).then(r => r.json()),
    enabled: !!farmId,
  });

  const addRateMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/labour/rates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Rate saved" }); qc.invalidateQueries({ queryKey: ["labour-rates", farmId] }); setRateOpen(false); setEditRate(null); setRateForm(emptyRate()); },
  });
  const editRateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => fetch(`/api/farms/${farmId}/labour/rates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Rate updated" }); qc.invalidateQueries({ queryKey: ["labour-rates", farmId] }); setRateOpen(false); setEditRate(null); setRateForm(emptyRate()); },
  });
  const delRateMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/labour/rates/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Rate deleted" }); qc.invalidateQueries({ queryKey: ["labour-rates", farmId] }); },
  });

  const entries = tsQ.data?.entries ?? [];
  const rates = ratesQ.data?.rates ?? [];

  const monthEntries = entries.filter(e => !filterMonth || e.date.startsWith(filterMonth));

  const getRate = (staffName: string) => {
    return rates.filter(r => r.staffName === staffName).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  };

  const summary = useMemo(() => {
    const byStaff: Record<string, { reg: number; ot: number }> = {};
    for (const e of monthEntries) {
      if (!byStaff[e.staffName]) byStaff[e.staffName] = { reg: 0, ot: 0 };
      byStaff[e.staffName].reg += parseFloat(e.hoursRegular || "0");
      byStaff[e.staffName].ot += parseFloat(e.hoursOvertime || "0");
    }
    return Object.entries(byStaff).map(([name, hrs]) => {
      const rate = getRate(name);
      const regPay = rate ? hrs.reg * (rate.regularRatePence / 100) : null;
      const otPay = rate ? hrs.ot * (rate.overtimeRatePence / 100) : null;
      const total = regPay !== null && otPay !== null ? regPay + otPay : null;
      return { name, ...hrs, regPay, otPay, total };
    });
  }, [monthEntries, rates]);

  const grandTotal = summary.reduce((s, r) => s + (r.total ?? 0), 0);

  const exportCsv = () => {
    const rows = [["Staff Member", "Regular Hrs", "OT Hrs", "Reg Pay", "OT Pay", "Total"], ...summary.map(r => [r.name, r.reg.toFixed(1), r.ot.toFixed(1), r.regPay !== null ? fmtGBP(r.regPay * 100) : "—", r.otPay !== null ? fmtGBP((r.otPay ?? 0) * 100) : "—", r.total !== null ? fmtGBP((r.total ?? 0) * 100) : "—"])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `payroll-${filterMonth}.csv`;
    a.click();
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterMonth || "all-months"} onValueChange={v => setFilterMonth(v === "all-months" ? "" : v)}>
          <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="Select month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-months">All time</SelectItem>
            {months.map(m => <SelectItem key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditRate(null); setRateForm(emptyRate()); setRateOpen(true); }}>
            <PoundSterling size={14} className="mr-1" /> Set Pay Rate
          </Button>
          {summary.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download size={14} className="mr-1" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Pay rates list */}
      {rates.length > 0 && (
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Pay Rates</div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-gray-400"><th className="text-left px-4 py-2 font-medium">Staff Member</th><th className="text-right px-4 py-2 font-medium">Regular</th><th className="text-right px-4 py-2 font-medium">Overtime</th><th className="text-left px-4 py-2 font-medium">From</th><th className="px-4 py-2" /></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {rates.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2 font-medium">{r.staffName}</td>
                  <td className="px-4 py-2 text-right font-mono">{fmtGBP(r.regularRatePence)}/hr</td>
                  <td className="px-4 py-2 text-right font-mono">{fmtGBP(r.overtimeRatePence)}/hr</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{fmtDate(r.effectiveFrom)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => { setRateForm({ staffName: r.staffName, regularRatePence: String(r.regularRatePence / 100), overtimeRatePence: String(r.overtimeRatePence / 100), effectiveFrom: r.effectiveFrom, notes: r.notes ?? "" }); setEditRate(r); setRateOpen(true); }} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={13} /></button>
                      <button onClick={() => delRateMut.mutate(r.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly summary */}
      {summary.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <PoundSterling className="w-10 h-10 mx-auto mb-2 opacity-25" />
          <p className="text-sm">No timesheet data for this period. Add timesheet entries to see pay summaries.</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Monthly Summary — {filterMonth ? new Date(filterMonth + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "All time"}
            </span>
            {grandTotal > 0 && <span className="text-sm font-bold text-gray-900">Total: {fmtGBP(grandTotal * 100)}</span>}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-gray-500 uppercase tracking-wide"><th className="text-left px-4 py-2.5 font-semibold">Staff Member</th><th className="text-right px-4 py-2.5 font-semibold">Reg Hrs</th><th className="text-right px-4 py-2.5 font-semibold">OT Hrs</th><th className="text-right px-4 py-2.5 font-semibold">Reg Pay</th><th className="text-right px-4 py-2.5 font-semibold">OT Pay</th><th className="text-right px-4 py-2.5 font-semibold">Total</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {summary.map(r => (
                <tr key={r.name} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium">{r.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{r.reg.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{r.ot > 0 ? <span className="text-amber-700">{r.ot.toFixed(1)}</span> : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{r.regPay !== null ? fmtGBP(r.regPay * 100) : <span className="text-gray-300 text-xs">No rate set</span>}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{r.otPay !== null && r.ot > 0 ? fmtGBP((r.otPay ?? 0) * 100) : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{r.total !== null ? fmtGBP((r.total ?? 0) * 100) : <span className="text-gray-300 text-xs">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rate dialog */}
      <Dialog open={rateOpen} onOpenChange={o => { if (!o) { setRateOpen(false); setEditRate(null); setRateForm(emptyRate()); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editRate ? "Edit Pay Rate" : "Set Pay Rate"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Staff Member *</Label>
              <Select value={rateForm.staffName} onValueChange={v => setRateForm(p => ({ ...p, staffName: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{staffNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Regular Rate (£/hr)</Label>
                <Input type="number" min="0" step="0.01" className="mt-1" value={rateForm.regularRatePence} onChange={e => setRateForm(p => ({ ...p, regularRatePence: e.target.value }))} placeholder="e.g. 12.21" />
              </div>
              <div>
                <Label>Overtime Rate (£/hr)</Label>
                <Input type="number" min="0" step="0.01" className="mt-1" value={rateForm.overtimeRatePence} onChange={e => setRateForm(p => ({ ...p, overtimeRatePence: e.target.value }))} placeholder="e.g. 18.32" />
              </div>
            </div>
            <div>
              <Label>Effective From</Label>
              <Input type="date" className="mt-1" value={rateForm.effectiveFrom} onChange={e => setRateForm(p => ({ ...p, effectiveFrom: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRateOpen(false); setEditRate(null); setRateForm(emptyRate()); }}>Cancel</Button>
              <Button
                onClick={() => {
                  const body = { staffName: rateForm.staffName, regularRatePence: Math.round(parseFloat(rateForm.regularRatePence) * 100), overtimeRatePence: Math.round(parseFloat(rateForm.overtimeRatePence) * 100), effectiveFrom: rateForm.effectiveFrom, notes: rateForm.notes };
                  if (editRate) editRateMut.mutate({ id: editRate.id, body });
                  else addRateMut.mutate(body);
                }}
                disabled={!rateForm.staffName || !rateForm.regularRatePence || addRateMut.isPending || editRateMut.isPending}
              >Save Rate</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Working Time Tab ─────────────────────────────────────────────────────────

function WorkingTimeTab({ farmId, staffNames }: { farmId: number; staffNames: string[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const tsQ = useQuery<{ entries: TimesheetEntry[] }>({
    queryKey: ["labour-timesheets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then(r => r.json()),
    enabled: !!farmId,
  });
  const entQ = useQuery<{ entitlements: Entitlement[] }>({
    queryKey: ["labour-entitlements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/entitlements`).then(r => r.json()),
    enabled: !!farmId,
  });

  const entries = tsQ.data?.entries ?? [];
  const entitlements = entQ.data?.entitlements ?? [];

  const wtrStatus = useMemo(() => {
    const now = new Date();
    const sevenWeeksAgo = new Date(now.getTime() - 17 * 7 * 24 * 60 * 60 * 1000);

    return staffNames.map(name => {
      const ent = entitlements.find(e => e.staffName === name && e.year === now.getFullYear());
      const wtrOptOut = ent?.wtrOptOut ?? false;

      const relevant = entries.filter(e => e.staffName === name && new Date(e.date + "T00:00:00") >= sevenWeeksAgo);

      // Group by ISO week
      const byWeek: Record<string, number> = {};
      for (const e of relevant) {
        const d = new Date(e.date + "T00:00:00");
        const weekKey = isoDate(getMondayOfWeek(d));
        byWeek[weekKey] = (byWeek[weekKey] ?? 0) + parseFloat(e.hoursRegular || "0") + parseFloat(e.hoursOvertime || "0");
      }
      const weeks = Object.values(byWeek);
      const totalHrs = weeks.reduce((s, h) => s + h, 0);
      const weekCount = Math.max(weeks.length, 1);
      const avgHrs = totalHrs / weekCount;

      return { name, avgHrs, wtrOptOut, status: avgHrs > 48 ? "breach" as const : avgHrs > 44 ? "warning" as const : "ok" as const, weekCount };
    });
  }, [staffNames, entries, entitlements]);

  const toggleOptOut = async (name: string, current: boolean) => {
    const ent = entitlements.find(e => e.staffName === name && e.year === new Date().getFullYear());
    if (ent) {
      await fetch(`/api/farms/${farmId}/labour/entitlements/${ent.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...ent, wtrOptOut: !current }) });
    } else {
      await fetch(`/api/farms/${farmId}/labour/entitlements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ staffName: name, year: new Date().getFullYear(), entitlementDays: "28", carriedOverDays: "0", wtrOptOut: !current }) });
    }
    qc.invalidateQueries({ queryKey: ["labour-entitlements", farmId] });
    toast({ title: `WTR opt-out ${!current ? "recorded" : "removed"} for ${name}` });
  };

  if (staffNames.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">No staff found. Add staff members first.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>UK Working Time Regulations (WTR) 1998</strong> — Workers cannot be required to work more than an average of 48 hours per week over a 17-week reference period. Workers can opt out individually in writing. The 17-week rolling average is calculated from your timesheet entries.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wtrStatus.map(({ name, avgHrs, wtrOptOut, status, weekCount }) => (
          <div key={name} className={`border rounded-xl p-4 bg-white ${status === "breach" ? "border-red-300" : status === "warning" ? "border-amber-300" : "border-gray-200"}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-semibold text-gray-800">{name}</p>
              {status === "breach" ? (
                <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              ) : status === "warning" ? (
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              )}
            </div>
            <p className={`text-2xl font-bold ${status === "breach" ? "text-red-600" : status === "warning" ? "text-amber-600" : "text-green-700"}`}>
              {avgHrs.toFixed(1)} <span className="text-sm font-normal text-gray-500">avg hrs/wk</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Based on {weekCount} week{weekCount !== 1 ? "s" : ""} of data (17-week window)</p>

            <div className="mt-3 h-1.5 bg-gray-100 rounded-full">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (avgHrs / 60) * 100)}%`, background: status === "breach" ? "#dc2626" : status === "warning" ? "#f59e0b" : "#16a34a" }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>0</span><span>48 hrs</span><span>60 hrs</span></div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">WTR Opt-out</span>
              <button
                onClick={() => toggleOptOut(name, wtrOptOut)}
                className={`text-xs px-2 py-0.5 rounded-full font-medium border transition-colors ${wtrOptOut ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
              >
                {wtrOptOut ? "Opt-out recorded" : "No opt-out"}
              </button>
            </div>

            {status === "breach" && !wtrOptOut && (
              <p className="text-xs text-red-600 mt-2 font-medium">⚠ Exceeds 48-hr WTR limit — ensure opt-out is in place or reduce hours.</p>
            )}
          </div>
        ))}
      </div>

      <div className="border rounded-xl p-4 bg-gray-50 text-xs text-gray-500 space-y-1">
        <p><strong>Rest period requirements (WTR 1998):</strong></p>
        <p>• Minimum 11 consecutive hours rest between working days</p>
        <p>• Minimum 24 hours rest per week (or 48 hours per fortnight)</p>
        <p>• 20-minute rest break when working more than 6 hours in a day</p>
        <p>• Young workers (under 18): maximum 8 hours/day, 40 hours/week (no opt-out)</p>
        <p className="pt-1 text-gray-400">Agriculture has some exemptions — consult DEFRA guidance for harvest and livestock emergencies.</p>
      </div>
    </div>
  );
}

// ─── Main Labour Page ─────────────────────────────────────────────────────────

type LabourTab = "timesheets" | "rota" | "absence" | "pay" | "wtr";

export default function LabourPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<LabourTab>("timesheets");

  const staffQ = useQuery<{ members: Array<{ id: number; firstName: string | null; lastName: string | null; isActive?: boolean }> }>({
    queryKey: ["staff-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
    enabled: !!farmId,
  });

  const staffNames = useMemo(
    () => (staffQ.data?.members ?? [])
      .filter(m => m.isActive !== false)
      .map(m => `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim())
      .filter(Boolean)
      .sort(),
    [staffQ.data],
  );

  if (!farmId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Clock className="text-green-700" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Labour Management</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">Timesheets, rota, holiday & absence, pay summary, and working time compliance.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Select a farm from the top-left dropdown to load labour records.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <Clock className="text-green-700" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Labour Management</h1>
      </div>
      <p className="text-gray-500 text-sm mb-5">Timesheets, rota planning, holiday & absence, pay summaries, and Working Time Regulations compliance.</p>

      {/* Tab bar */}
      <div className="border-b flex gap-0 overflow-x-auto mb-6">
        <TabBtn active={tab === "timesheets"} onClick={() => setTab("timesheets")} icon={Clock} label="Timesheets" />
        <TabBtn active={tab === "rota"} onClick={() => setTab("rota")} icon={CalendarDays} label="Rota & Shifts" />
        <TabBtn active={tab === "absence"} onClick={() => setTab("absence")} icon={UmbrellaOff} label="Holiday & Absence" />
        <TabBtn active={tab === "pay"} onClick={() => setTab("pay")} icon={PoundSterling} label="Pay Summary" />
        <TabBtn active={tab === "wtr"} onClick={() => setTab("wtr")} icon={ShieldCheck} label="Working Time" />
      </div>

      {tab === "timesheets" && <TimesheetsTab farmId={farmId} staffNames={staffNames} />}
      {tab === "rota" && <RotaTab farmId={farmId} staffNames={staffNames} />}
      {tab === "absence" && <AbsenceTab farmId={farmId} staffNames={staffNames} />}
      {tab === "pay" && <PaySummaryTab farmId={farmId} staffNames={staffNames} />}
      {tab === "wtr" && <WorkingTimeTab farmId={farmId} staffNames={staffNames} />}
    </div>
  );
}
