// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

const POULTRY_COLORS = ["#15803d","#a16207","#1d4ed8","#b91c1c","#7c3aed","#0e7490"];

export function PoultryAnalyticsTab({ farmId }: { farmId: number }) {
  const { data: flocksRaw } = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()) });
  const { data: treatmentsRaw } = useQuery({ queryKey: ["poultry-treatments", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-treatments`), { credentials: "include" }).then(r => r.json()) });
  const { data: feedRaw } = useQuery({ queryKey: ["poultry-feed", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-feed-deliveries`), { credentials: "include" }).then(r => r.json()).catch(() => []) });

  const flocks: Record<string, unknown>[] = useMemo(() => flocksRaw?.records ?? flocksRaw ?? [], [flocksRaw]);
  const treatments: Record<string, unknown>[] = useMemo(() => treatmentsRaw?.records ?? treatmentsRaw ?? [], [treatmentsRaw]);
  const feedDeliveries: Record<string, unknown>[] = useMemo(() => feedRaw?.records ?? feedRaw ?? [], [feedRaw]);

  const totalBirds = useMemo(() => flocks.reduce((s, r) => s + (Number(r.placedCount) || Number(r.initialPlacement) || 0), 0), [flocks]);
  const avgMortRate = useMemo(() => {
    const valid = flocks.filter(r => r.mortalityRate);
    return valid.length ? (valid.reduce((s, r) => s + Number(r.mortalityRate), 0) / valid.length).toFixed(2) : null;
  }, [flocks]);

  const treatmentsByType = useMemo(() => {
    const map: Record<string, number> = {};
    treatments.forEach(r => { const t = String(r.treatmentType || r.medicineType || r.type || "Other"); map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name: name.length > 14 ? name.slice(0,13)+"…" : name, value }));
  }, [treatments]);

  const flocksByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    flocks.forEach(r => {
      const d = String(r.placementDate || r.placedDate || ""); const k = d.slice(0,7); if (!k || k.length < 7) return;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort().slice(-12).map(([m, count]) => ({ month: m.slice(5), count }));
  }, [flocks]);

  const noData = flocks.length === 0 && treatments.length === 0;
  if (noData) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No data yet</p>
      <p className="text-xs mt-1">Add flock or treatment records to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Flocks", value: flocks.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
          { label: "Total Birds Placed", value: totalBirds.toLocaleString(), bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "Avg Mortality Rate", value: avgMortRate ? `${avgMortRate}%` : "—", bg: "bg-red-50 border-red-100", text: "text-red-800", sub: "text-red-700" },
          { label: "Treatment Events", value: treatments.length, bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl border p-4 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className={`text-xs mt-0.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {flocksByMonth.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Flock Placements by Month</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flocksByMonth} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v}`, "Flocks"]} />
                  <Bar dataKey="count" fill="#a16207" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {treatmentsByType.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Treatments by Type</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={treatmentsByType} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {treatmentsByType.map((_, i) => <Cell key={i} fill={POULTRY_COLORS[i % POULTRY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}`, "Events"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {feedDeliveries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3">Feed Deliveries Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold">{feedDeliveries.length}</p><p className="text-xs text-muted-foreground">Deliveries</p></div>
            <div><p className="text-2xl font-bold">{feedDeliveries.reduce((s, r) => s + (Number(r.quantityTonnes) || Number(r.quantityKg) || 0), 0).toFixed(1)}</p><p className="text-xs text-muted-foreground">Total Tonnes/kg</p></div>
            <div><p className="text-2xl font-bold">{[...new Set(feedDeliveries.map(r => r.feedType || r.feedName).filter(Boolean))].length}</p><p className="text-xs text-muted-foreground">Feed Types</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

