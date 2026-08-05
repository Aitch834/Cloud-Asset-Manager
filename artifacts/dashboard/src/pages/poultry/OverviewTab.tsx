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

type ComplianceStatus = "green" | "amber" | "red" | "grey";
type SummaryItem = { count: number; status: ComplianceStatus; label: string; lastDate?: string | null; activeCount?: number; activeWithdrawals?: number; highCount?: number; failCount?: number; unclearCount?: number; nonCompliantCount?: number; expiredCount?: number; expiringSoonCount?: number; maxAmm?: number | null };
type ComplianceSummary = { houses: SummaryItem; flocks: SummaryItem; mortality: SummaryItem; treatments: SummaryItem; cleanouts: SummaryItem; envLogs: SummaryItem; fci: SummaryItem; bwi: SummaryItem; thinning: SummaryItem; biosecurity: SummaryItem; schemes: SummaryItem };

function ComplianceCard({ title, icon, item, tab, onGoto }: { title: string; icon: ReactNode; item: SummaryItem; tab: string; onGoto: (t: string) => void }) {
  const borderCls = item.status === "red" ? "border-red-300 bg-red-50" : item.status === "amber" ? "border-amber-300 bg-amber-50" : item.status === "green" ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50";
  const iconCls = item.status === "red" ? "text-red-600" : item.status === "amber" ? "text-amber-600" : item.status === "green" ? "text-green-700" : "text-gray-400";
  const StatusIcon = item.status === "red" ? XCircle : item.status === "amber" ? AlertTriangle : item.status === "green" ? CheckCircle2 : Circle;
  return (
    <button onClick={() => onGoto(tab)} className={`w-full text-left rounded-lg border p-4 space-y-2 hover:shadow-sm transition-shadow ${borderCls}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={iconCls}>{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <StatusIcon className={`w-4 h-4 ${iconCls}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.label}</p>
        {item.lastDate && <p className="text-xs text-muted-foreground mt-0.5">Last record: {new Date(item.lastDate).toLocaleDateString("en-GB")}</p>}
      </div>
    </button>
  );
}

export function OverviewTab({ farmId, onGoto }: { farmId: number; onGoto: (tab: string) => void }) {
  const { data, isLoading } = useQuery<{ summary: ComplianceSummary }>({
    queryKey: ["poultry-compliance-summary", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-compliance-summary`), { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });
  const summary = data?.summary;

  const overallStatus: ComplianceStatus = !summary ? "grey" : (Object.values(summary) as SummaryItem[]).some(s => s.status === "red") ? "red" : (Object.values(summary) as SummaryItem[]).some(s => s.status === "amber") ? "amber" : "green";
  const redCount = summary ? (Object.values(summary) as SummaryItem[]).filter(s => s.status === "red").length : 0;
  const amberCount = summary ? (Object.values(summary) as SummaryItem[]).filter(s => s.status === "amber").length : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm">Red Tractor Compliance Overview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live status across all 12 poultry record categories. Click any card to go straight to that tab.</p>
        </div>
        {summary && (
          <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${overallStatus === "red" ? "bg-red-100 text-red-700" : overallStatus === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
            {overallStatus === "green" ? <CheckCircle2 className="w-3.5 h-3.5" /> : overallStatus === "amber" ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {overallStatus === "green" ? "All Clear" : overallStatus === "amber" ? `${amberCount} Attention Needed` : `${redCount} Issue${redCount > 1 ? "s" : ""} Require Action`}
          </div>
        )}
      </div>

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center"><Loader2 className="animate-spin w-4 h-4" />Loading compliance status…</div>}

      {summary && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Farm Setup</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCard title="Houses" icon={<Home className="w-4 h-4" />} item={summary.houses} tab="houses" onGoto={onGoto} />
              <ComplianceCard title="Flocks" icon={<Bird className="w-4 h-4" />} item={summary.flocks} tab="flocks" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Daily Records</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCard title="Daily Mortality" icon={<BarChart3 className="w-4 h-4" />} item={summary.mortality} tab="mortality" onGoto={onGoto} />
              <ComplianceCard title="Environmental Logs" icon={<Thermometer className="w-4 h-4" />} item={summary.envLogs} tab="envlogs" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Treatments & Welfare</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ComplianceCard title="Treatments" icon={<Pill className="w-4 h-4" />} item={summary.treatments} tab="treatments" onGoto={onGoto} />
              <ComplianceCard title="Broiler Welfare (BWI)" icon={<ShieldCheck className="w-4 h-4" />} item={summary.bwi} tab="bwi" onGoto={onGoto} />
              <ComplianceCard title="FCI Documents" icon={<FileText className="w-4 h-4" />} item={summary.fci} tab="fci" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Biosecurity & Cleanouts</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ComplianceCard title="House Cleanouts" icon={<SprayCan className="w-4 h-4" />} item={summary.cleanouts} tab="cleanouts" onGoto={onGoto} />
              <ComplianceCard title="Biosecurity Checklists" icon={<ClipboardList className="w-4 h-4" />} item={summary.biosecurity} tab="biosecurity" onGoto={onGoto} />
              <ComplianceCard title="Thinning Records" icon={<Scissors className="w-4 h-4" />} item={summary.thinning} tab="thinning" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Scheme Certification</p>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              <ComplianceCard title="Assurance Scheme Records" icon={<Star className="w-4 h-4" />} item={summary.schemes} tab="scheme-records" onGoto={onGoto} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

