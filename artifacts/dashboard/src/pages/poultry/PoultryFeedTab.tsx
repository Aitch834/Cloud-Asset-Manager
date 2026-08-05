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

export function PoultryFeedTab({ farmId }: { farmId: number }) {
  const [subTab, setSubTab] = useState<"deliveries" | "consumption">("deliveries");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["poultry-deliveries-view", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/feed-deliveries`), { credentials: "include" }).then(r => r.json()),
    enabled: subTab === "deliveries",
  });
  const all: Record<string, unknown>[] = Array.isArray(raw) ? raw : (raw?.records ?? []);
  const poultryDeliveries = all.filter(d => {
    const sp = String(d.speciesIntended ?? "").toLowerCase();
    return sp === "poultry" || sp === "mixed";
  }).sort((a, b) => String(b.deliveryDate ?? "").localeCompare(String(a.deliveryDate ?? "")));
  const [yearFilterFeed, setYearFilterFeed] = useState("all");
  const deliveryYears = [...new Set(poultryDeliveries.map(d => String(d.deliveryDate ?? "").slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const filteredDeliveries = yearFilterFeed === "all" ? poultryDeliveries : poultryDeliveries.filter(d => String(d.deliveryDate ?? "").startsWith(yearFilterFeed));

  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b">
        {(["deliveries", "consumption"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === t ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "deliveries" ? "Feed Deliveries" : "Flock Consumption Records"}
          </button>
        ))}
      </div>
      {subTab === "deliveries" ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2">
            <Truck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              Showing all feed deliveries from <strong>Feed Management</strong> where species is set to <em>Poultry</em> or <em>Mixed</em>. To add a delivery, go to Feed Management → Delivery Records.
            </p>
          </div>
          {deliveryYears.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Select value={yearFilterFeed} onValueChange={setYearFilterFeed}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {deliveryYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : filteredDeliveries.length === 0 ? (
            <Empty msg={poultryDeliveries.length === 0 ? 'No poultry or mixed-species feed deliveries on record. Log a delivery in Feed Management with species set to "Poultry" or "Mixed".' : "No deliveries match the selected year."} />
          ) : (
            <div className="space-y-2">
              {filteredDeliveries.map((r, i) => (
                <div key={i} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{fmt(r.supplierName)}</span>
                        {String(r.speciesIntended ?? "").toLowerCase() === "mixed" && (
                          <Badge className="text-xs" style={{ background: "#fef9c3", color: "#854d0e", border: "none" }}>Mixed species</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.deliveryDate)}</span>
                        <span><span className="font-medium text-foreground/70">Type:</span> {fmt(r.feedType)}</span>
                        <span><span className="font-medium text-foreground/70">Qty:</span> {fmt(r.quantityKg)} kg</span>
                        {!!r.productName && <span><span className="font-medium text-foreground/70">Product:</span> {fmt(r.productName)}</span>}
                        {!!r.batchNumber && <span><span className="font-medium text-foreground/70">Batch:</span> {fmt(r.batchNumber)}</span>}
                        {!!r.deliveryNoteNumber && <span><span className="font-medium text-foreground/70">Note No.:</span> {fmt(r.deliveryNoteNumber)}</span>}
                        {!!r.ufasNumberOnNote && <span><span className="font-medium text-foreground/70">UFAS No.:</span> {fmt(r.ufasNumberOnNote)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-amber-100 bg-amber-50 flex items-start gap-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Flock-level consumption records (daily feed quantities per house/flock) are recorded via the Livestock section's Feed tab, linked to your poultry herds. This ensures one unified consumption record across all livestock species.
            </p>
          </div>
          <Empty msg="Go to Livestock → Feed tab to record daily flock feed consumption linked to your poultry herds." />
        </div>
      )}
    </div>
  );
}

