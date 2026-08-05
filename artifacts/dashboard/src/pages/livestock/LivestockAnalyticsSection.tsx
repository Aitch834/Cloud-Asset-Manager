import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";

// ─── Livestock Analytics ──────────────────────────────────────────────────────
const LIVESTOCK_COLORS = ["#15803d","#a16207","#1d4ed8","#b91c1c","#7c3aed","#0e7490"];

export function LivestockAnalyticsSection({ farmId }: { farmId: number }) {
  const { data: mortalityData } = useQuery({ queryKey: ["mortality", farmId], queryFn: () => fetch(`/api/farms/${farmId}/mortality-records`).then(r => r.json()) });
  const { data: bvdData } = useQuery({ queryKey: ["bvd-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/bvd-tests`).then(r => r.json()).then(d => d.records ?? []) });
  const { data: tbData } = useQuery<{ records: Record<string, unknown>[] }>({ queryKey: ["tb-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/tb-tests`).then(r => r.json()) });
  const { data: aiData } = useQuery({ queryKey: ["ai-reproduction", farmId], queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`).then(r => r.json()).then(d => d.records ?? []) });

  const mortality: Record<string, unknown>[] = useMemo(() => mortalityData?.records ?? mortalityData ?? [], [mortalityData]);
  const bvdTests: Record<string, unknown>[] = useMemo(() => Array.isArray(bvdData) ? bvdData : [], [bvdData]);
  const tbTests: Record<string, unknown>[] = useMemo(() => tbData?.records ?? [], [tbData]);
  const aiRecords: Record<string, unknown>[] = useMemo(() => Array.isArray(aiData) ? aiData : [], [aiData]);

  const mortalityByCause = useMemo(() => {
    const map: Record<string, number> = {};
    mortality.forEach(r => { const c = String(r.causeOfDeath || r.cause || "Unknown"); map[c] = (map[c] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name, count]) => ({ name: name.length > 16 ? name.slice(0,15)+"…" : name, count }));
  }, [mortality]);

  const mortalityByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date(); const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 11);
    mortality.forEach(r => {
      const d = new Date(String(r.dateOfDeath || r.date || "")); if (isNaN(d.getTime()) || d < cutoff) return;
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort().map(([m, count]) => ({ month: m.slice(5), count }));
  }, [mortality]);

  const bvdResultCounts = useMemo(() => {
    const map: Record<string, number> = {};
    bvdTests.forEach(r => { const k = String(r.result || "Unknown"); map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bvdTests]);

  const tbPassRate = useMemo(() => {
    const passed = tbTests.filter(r => r.testResult === "clear" || r.testResult === "passed" || r.passed === true).length;
    return tbTests.length ? Math.round((passed / tbTests.length) * 100) : null;
  }, [tbTests]);

  const aiConceptionRate = useMemo(() => {
    const confirmed = aiRecords.filter(r => r.pregnancyConfirmed === true || r.status === "pregnant").length;
    return aiRecords.length ? Math.round((confirmed / aiRecords.length) * 100) : null;
  }, [aiRecords]);

  const noData = mortality.length === 0 && bvdTests.length === 0 && tbTests.length === 0;
  if (noData) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No data yet</p>
      <p className="text-xs mt-1">Add mortality, BVD, or TB records to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Mortality Records", value: mortality.length, bg: "bg-red-50 border-red-100", text: "text-red-800", sub: "text-red-700" },
          { label: "BVD Tests", value: bvdTests.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
          { label: "TB Test Pass Rate", value: tbPassRate !== null ? `${tbPassRate}%` : "—", bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "AI Conception Rate", value: aiConceptionRate !== null ? `${aiConceptionRate}%` : "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl border p-4 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className={`text-xs mt-0.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mortalityByCause.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Mortality by Cause</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mortalityByCause} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip formatter={(v) => [`${v} animals`, "Deaths"]} />
                  <Bar dataKey="count" fill="#b91c1c" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {bvdResultCounts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">BVD Test Results</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bvdResultCounts} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {bvdResultCounts.map((_, i) => <Cell key={i} fill={LIVESTOCK_COLORS[i % LIVESTOCK_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} tests`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {mortalityByMonth.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Monthly Mortality (last 12 months)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mortalityByMonth} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [`${v}`, "Deaths"]} />
                <Bar dataKey="count" fill="#b91c1c" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

