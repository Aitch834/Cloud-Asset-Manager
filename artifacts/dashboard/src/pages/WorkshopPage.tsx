import { useState, useRef, useCallback, useEffect, useMemo, Fragment } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Plus, QrCode, Printer, Wrench, AlertTriangle, Clock, CheckCircle2, XCircle, Loader2, Pencil, Trash2, ChevronDown, Package, ArrowDownToLine, ArrowUpFromLine, History, TriangleAlert, Search, X, FileText, Download, Upload, ChevronRight, Info, Eye, EyeOff, Receipt, Users, ClipboardList, Settings } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OtherSelect } from "@/components/ui/other-select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { Redirect, Link } from "wouter";
import { cn } from "@/lib/utils";
import { EQUIPMENT_TYPES } from "@/lib/equipmentTypes";
import { printProReport } from "@/lib/print-report";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ComposedChart, LabelList } from "recharts";
import { StaffSelect } from "@/components/ui/staff-select";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";

const api = (path: string) => `/api/${path}`;

function assetNumber(equip: { id: number; assetNumber?: string | null }) {
  return equip.assetNumber || `EQ-${String(equip.id).padStart(4, "0")}`;
}

// ─── Status / priority helpers ─────────────────────────────────────────────────

const JOB_STATUS: Record<string, { label: string; colour: string }> = {
  open:            { label: "Open",            colour: "bg-blue-100 text-blue-700" },
  "in-progress":   { label: "In Progress",     colour: "bg-amber-100 text-amber-700" },
  "awaiting-parts":{ label: "Awaiting Parts",  colour: "bg-purple-100 text-purple-700" },
  completed:       { label: "Completed",       colour: "bg-green-100 text-green-700" },
  cancelled:       { label: "Cancelled",       colour: "bg-gray-100 text-gray-500" },
};

const PRIORITY: Record<string, { label: string; colour: string }> = {
  low:      { label: "Low",      colour: "bg-gray-100 text-gray-600" },
  medium:   { label: "Medium",   colour: "bg-amber-100 text-amber-700" },
  high:     { label: "High",     colour: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", colour: "bg-red-100 text-red-700" },
};

const EQUIP_STATUS: Record<string, { label: string; colour: string }> = {
  active:        { label: "Operational",    colour: "bg-green-100 text-green-700" },
  broken:        { label: "Broken Down",    colour: "bg-red-100 text-red-700" },
  "in-service":  { label: "In Service",     colour: "bg-amber-100 text-amber-700" },
  disposed:      { label: "Disposed",       colour: "bg-gray-100 text-gray-500" },
};

const DISPOSAL_METHOD_LABELS: Record<string, string> = {
  sold:         "Sold",
  scrapped:     "Scrapped",
  part_exchange:"Part Exchange",
  stolen:       "Stolen / Lost",
  transferred:  "Transferred",
  other:        "Disposed",
};

function EquipStatusCell({ eq }: { eq: Equipment }) {
  if (eq.status === "disposed") {
    const label = DISPOSAL_METHOD_LABELS[eq.disposalMethod ?? ""] ?? "Disposed";
    return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">{label}</span>;
  }
  return <StatusBadge value={eq.status} map={EQUIP_STATUS} />;
}

function StatusBadge({ value, map }: { value: string; map: Record<string, { label: string; colour: string }> }) {
  const s = map[value] ?? { label: value, colour: "bg-gray-100 text-gray-600" };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", s.colour)}>{s.label}</span>;
}

// ─── QR Label dialog ───────────────────────────────────────────────────────────

const LABEL_CSS = `
  @page{size:62mm 90mm;margin:0}
  body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}
  .brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em;margin-bottom:3px}
  .divider{border:none;border-top:1px solid #e5e7eb;margin:4px 0}
  .farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}
  svg{display:block;margin:0 auto}
  .code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}
  .iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}
  .desc{font-size:9px;color:#9ca3af;margin-top:2px}
  .hint{font-size:8px;color:#d1d5db;margin-top:4px}
`;

function QRDialog({ equip, farmId, farmName, onClose }: {
  equip: { id: number; assetNumber?: string | null; name: string; make?: string | null; model?: string | null };
  farmId: number;
  farmName: string;
  onClose: () => void;
}) {
  const an = assetNumber(equip);
  const qrValue = `BDE:F${farmId}:${an}`;
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win || !printRef.current) return;
    win.document.write(`<html><head><title>Asset Label — ${an}</title><style>${LABEL_CSS}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.addEventListener("afterprint", () => win.close());
    win.print();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>Asset QR Label</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-1.5 py-2 border rounded-xl bg-white px-5 shadow-sm" ref={printRef}>
          <p className="brand text-[11px] font-bold text-teal-700 tracking-widest mt-1">🌿 BDE Farm Trac</p>
          <hr className="divider w-full border-gray-200" />
          <p className="farm text-sm font-bold text-gray-900 uppercase tracking-wider">{farmName}</p>
          <QRCodeSVG value={qrValue} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
          <p className="code font-mono text-xl font-bold tracking-widest text-teal-700 mt-1">{an}</p>
          <p className="iname text-sm font-semibold text-gray-700">{equip.name}</p>
          {(equip.make || equip.model) && <p className="desc text-xs text-gray-400">{[equip.make, equip.model].filter(Boolean).join(" · ")}</p>}
          <p className="hint text-[10px] text-gray-300 mb-1">Scan to view equipment record</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-1" />Print Label</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assets tab ────────────────────────────────────────────────────────────────

interface Equipment {
  id: number;
  farmId: number;
  assetNumber: string | null;
  name: string;
  type: string;
  make: string | null;
  model: string | null;
  serialNumber: string | null;
  registrationNumber: string | null;
  yearOfManufacture: number | null;
  currentHours: number | null;
  odometerKm: number | null;
  status: string;
  location: string | null;
  isActive: boolean;
  disposalMethod: string | null;
  disposalDate: string | null;
  disposalBuyerOrContractor: string | null;
}

function AssetsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [qrEquip, setQrEquip] = useState<Equipment | null>(null);
  const [showDisposed, setShowDisposed] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: farmData } = useQuery<{ record: { name: string } }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then(r => r.json()),
  });
  const farmName = farmData?.record?.name ?? "BDE Farm";

  const { data, isLoading } = useQuery<{ records: Equipment[] }>({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then(r => r.json()),
  });

  const assignNumber = useMutation({
    mutationFn: async (equip: Equipment) => {
      const an = `EQ-${String(equip.id).padStart(4, "0")}`;
      await fetch(api(`farms/${farmId}/equipment/${equip.id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetNumber: an }),
      });
      return an;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipment", farmId] }),
  });

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  const allEquipment = data?.records ?? [];
  const disposedCount = allEquipment.filter(e => e.status === "disposed").length;
  const equipment = showDisposed ? allEquipment : allEquipment.filter(e => e.status !== "disposed");

  const wsq = search.trim().toLowerCase();
  const wsFiltered = equipment.filter(e => {
    const matchSearch = !wsq
      || (e.name ?? "").toLowerCase().includes(wsq)
      || (e.make ?? "").toLowerCase().includes(wsq)
      || (e.model ?? "").toLowerCase().includes(wsq)
      || (e.assetNumber ?? "").toLowerCase().includes(wsq);
    const matchType = !typeFilter || e.type === typeFilter;
    return matchSearch && matchType;
  });

  const wsAvailableTypes = EQUIPMENT_TYPES.filter(t => equipment.some(e => e.type === t.value));

  const wsGrouped: { label: string; value: string; items: Equipment[] }[] = [];
  for (const t of EQUIPMENT_TYPES) {
    const items = wsFiltered.filter(e => e.type === t.value);
    if (items.length) wsGrouped.push({ label: t.label, value: t.value, items });
  }
  const wsUnknownItems = wsFiltered.filter(e => !EQUIPMENT_TYPES.some(t => t.value === e.type));
  if (wsUnknownItems.length) wsGrouped.push({ label: "Other / Unclassified", value: "__unknown", items: wsUnknownItems });

  const handleAssetPrint = () => {
    const printGroups: { label: string; items: Equipment[] }[] = [];
    for (const t of EQUIPMENT_TYPES) {
      const items = allEquipment.filter(e => e.type === t.value);
      if (items.length) printGroups.push({ label: t.label, items });
    }
    const unknownPrint = allEquipment.filter(e => !EQUIPMENT_TYPES.some(t => t.value === e.type));
    if (unknownPrint.length) printGroups.push({ label: "Other / Unclassified", items: unknownPrint });

    const cols = `<th>Asset No.</th><th>Name</th><th>Type</th><th>Make / Model</th><th>Serial / Reg</th><th>Status</th><th>Hours</th><th>Location</th>`;
    const itemRow = (eq: Equipment) => `<tr>
      <td style="font-family:monospace;font-weight:600">${eq.assetNumber || `EQ-${String(eq.id).padStart(4, "0")}`}</td>
      <td><strong>${eq.name}</strong></td>
      <td>${eq.type || "—"}</td>
      <td>${[eq.make, eq.model].filter(Boolean).join(" ") || "—"}</td>
      <td style="font-family:monospace">${eq.serialNumber || eq.registrationNumber || "—"}</td>
      <td>${eq.status === "disposed" ? "Disposed" : "Active"}</td>
      <td>${eq.currentHours != null ? eq.currentHours + " hrs" : "—"}</td>
      <td>${eq.location || "—"}</td>
    </tr>`;

    const rows = printGroups.map(group => `
      <tr style="background:#1a3a1a!important">
        <td colspan="8" style="padding:5px 6px;font-size:8.5px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.07em;border:none">
          ${group.label} <span style="font-weight:400;opacity:0.7">(${group.items.length})</span>
        </td>
      </tr>
      ${group.items.map(itemRow).join("")}
    `).join("");

    printProReport({
      title: "Workshop & Asset Register",
      farmName: farmName,
      recordCount: allEquipment.length,
      recordLabel: "asset",
      tableHtml: `<table><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table>`,
      landscape: true,
      footerNote: "Asset register for workshop planning and compliance. Retain with service records for Red Tractor audit inspection.",
    });
  };

  return (
    <div>
      {qrEquip && <QRDialog equip={qrEquip} farmId={farmId} farmName={farmName} onClose={() => setQrEquip(null)} />}
      {allEquipment.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No equipment registered. Add equipment on the Equipment page first.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {disposedCount > 0 && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setShowDisposed(v => !v)}>
                  {showDisposed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showDisposed ? "Hide disposed" : `Show ${disposedCount} disposed`}
                </Button>
              )}
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleAssetPrint} disabled={allEquipment.length === 0}>
                <Printer className="h-3.5 w-3.5" />
                Print Register
              </Button>
            </div>
          </div>
          {wsAvailableTypes.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTypeFilter("")}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${!typeFilter ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-700"}`}
              >
                All ({equipment.length})
              </button>
              {wsAvailableTypes.map(t => {
                const count = equipment.filter(e => e.type === t.value).length;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(prev => prev === t.value ? "" : t.value)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${typeFilter === t.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-700"}`}
                  >
                    {t.label} ({count})
                  </button>
                );
              })}
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Asset No.</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Make / Model</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Hours</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {wsFiltered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">No assets match your search or filter.</td></tr>
                ) : wsGrouped.map(group => <Fragment key={group.value}>
                  {!typeFilter && (
                    <tr className="bg-blue-50/60 border-b border-blue-100">
                      <td colSpan={8} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                        {group.label} <span className="font-normal text-blue-400 ml-1">({group.items.length})</span>
                      </td>
                    </tr>
                  )}
                  {group.items.map(eq => (
                  <tr key={eq.id} className={cn("hover:bg-gray-50", eq.status === "disposed" && "opacity-60")}>
                    <td className="px-4 py-3">
                      {eq.assetNumber ? (
                        <span className="font-mono font-semibold text-primary">{eq.assetNumber}</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm text-gray-400 tabular-nums">{assetNumber(eq)}</span>
                          {eq.status !== "disposed" && (
                            <Button size="sm" variant="outline" className="h-5 text-[10px] px-1.5 border-dashed"
                              onClick={() => assignNumber.mutate(eq)} disabled={assignNumber.isPending}
                              title="Save this asset number permanently">
                              Save
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{eq.name}</td>
                    <td className="px-4 py-3 text-gray-500">{eq.type}</td>
                    <td className="px-4 py-3 text-gray-500">{[eq.make, eq.model].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3"><EquipStatusCell eq={eq} /></td>
                    <td className="px-4 py-3 text-gray-500">{eq.currentHours != null ? `${eq.currentHours} hrs` : "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{eq.location || "—"}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setQrEquip(eq)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                </Fragment>)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Job Cards tab ─────────────────────────────────────────────────────────────

interface LabourEntry {
  id: number; farmId: number; jobId: number;
  entryDate: string; description: string | null;
  chargeUnits: number; ratePence: number; costPence: number;
  performedBy: string | null; createdAt: string;
}

interface WorkshopJob {
  job: {
    id: number; farmId: number; equipmentId: number | null; jobNumber: string;
    jobType: string; title: string; description: string | null; priority: string; status: string;
    reportedBy: string | null; assignedTo: string | null; openedAt: string;
    estimatedCompletionDate: string | null; completedAt: string | null;
    labourHours: number | null; labourCostPence: number | null; partsCostPence: number | null;
    partsUsed: string | null; rootCause: string | null; notes: string | null;
    customerId: number | null; serviceInvoiceId: number | null;
  };
  equipmentName: string | null;
  assetNumber: string | null;
  customerName: string | null;
  invoiceNumber: string | null;
}

interface IssuedPart {
  id: number;
  stockItemId: number;
  partName: string;
  productCode: string | null;
  unit: string | null;
  unitCostPence: number | null;
  unitSellPricePence: number | null;
  quantityChange: string;
  performedBy: string | null;
  notes: string | null;
  movedAt: string;
}

const WHOLE_UNITS = ["each", "pair", "set", "box", "bag", "roll", "drum", "ibc", "sheet", "tube", "cartridge"];
function qtyStep(unit: string | null | undefined) { return unit && WHOLE_UNITS.includes(unit.toLowerCase()) ? "1" : "0.1"; }
function qtyMin(unit: string | null | undefined) { return unit && WHOLE_UNITS.includes(unit.toLowerCase()) ? "1" : "0.1"; }
function qtyPlaceholder(unit: string | null | undefined) { return unit && WHOLE_UNITS.includes(unit.toLowerCase()) ? "1" : "0.1"; }

const EMPTY_JOB = { jobType: "repair", title: "", priority: "medium", status: "open" };

function JobDocumentsSection({ farmId, jobId }: { farmId: number; jobId: number }) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedBy, setUploadedBy] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: docs = [], isLoading: docsLoading } = useQuery<PartDoc[]>({
    queryKey: ["job-docs", jobId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/documents`), { credentials: "include" }).then(r => r.json()),
  });

  const deleteDoc = useMutation({
    mutationFn: (docId: number) => fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/documents/${docId}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-docs", jobId] }),
  });

  const saveDocMeta = useMutation({
    mutationFn: (body: { filename: string; storageKey: string; mimeType: string | null; fileSizeBytes: number | null; uploadedBy: string }) =>
      fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/documents`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-docs", jobId] });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: useCallback((response: { objectPath: string; metadata: { name: string; size: number; contentType: string } }) => {
      setUploadError(null);
      saveDocMeta.mutate({
        filename: response.metadata.name,
        storageKey: response.objectPath,
        mimeType: response.metadata.contentType || null,
        fileSizeBytes: response.metadata.size || null,
        uploadedBy: uploadedBy.trim() || "",
      });
    }, [uploadedBy, saveDocMeta]),
    onError: useCallback((err: Error) => setUploadError(err.message), []),
  });

  return (
    <div className="border-t pt-4 mt-1 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-gray-500" />Job Documents & Photos
        </p>
        <p className="text-xs text-gray-400">Warranty claims, inspection photos, invoices, delivery notes</p>
      </div>

      {/* Existing docs */}
      {docsLoading ? (
        <div className="py-3 text-center"><Loader2 className="h-4 w-4 animate-spin text-gray-300 mx-auto" /></div>
      ) : docs.length === 0 ? (
        <div className="py-4 text-center border-2 border-dashed rounded-lg text-gray-400">
          <Upload className="h-6 w-6 mx-auto mb-1 text-gray-300" />
          <p className="text-xs">No documents attached yet. Add photos, invoices, or warranty docs below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg border bg-gray-50 hover:bg-white transition-colors group">
              <div className="shrink-0">{fileIcon(doc.mimeType)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{doc.filename}</p>
                <p className="text-xs text-gray-400">
                  {doc.uploadedBy ? `${doc.uploadedBy} · ` : ""}{new Date(doc.uploadedAt).toLocaleDateString("en-GB")}
                  {doc.fileSizeBytes ? ` · ${fmtFileSize(doc.fileSizeBytes)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={`/api/storage${doc.storageKey}`} target="_blank" rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Open / download">
                  <Download className="h-3.5 w-3.5" />
                </a>
                <button className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100"
                  title="Remove" onClick={() => deleteDoc.mutate(doc.id)}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload row */}
      <div className="flex items-end gap-3 bg-gray-50 rounded-lg border px-3 py-2.5">
        <div className="shrink-0">
          <Label className="text-xs">Uploaded By</Label>
          <Input className="h-7 text-xs mt-1 w-36" value={uploadedBy} onChange={e => setUploadedBy(e.target.value)} placeholder="Your name (optional)" />
        </div>
        <div className="flex-1">
          <Label className="text-xs">Attach file <span className="text-gray-400 font-normal">(photo, PDF, Word, Excel)</span></Label>
          <input
            ref={fileInputRef}
            type="file"
            className="mt-1 block w-full text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.heic,.mp4,.mov"
            disabled={isUploading || saveDocMeta.isPending}
            onChange={e => { const file = e.target.files?.[0]; if (file) { setUploadError(null); uploadFile(file); } }}
          />
        </div>
        {isUploading && (
          <div className="shrink-0 text-xs text-primary flex items-center gap-1.5 pb-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {progress > 0 ? `${Math.round(progress)}%` : "Uploading…"}
          </div>
        )}
        {saveDocMeta.isPending && (
          <div className="shrink-0 text-xs text-gray-400 flex items-center gap-1 pb-1">
            <Loader2 className="h-3 w-3 animate-spin" />Saving…
          </div>
        )}
        {uploadError && <p className="shrink-0 text-xs text-red-600 pb-1">{uploadError}</p>}
      </div>
      <p className="text-xs text-gray-400">Photos added via AirDrop to this device will appear in your Downloads — select them using the file picker above.</p>
    </div>
  );
}

function JobCardsTab({ farmId, openId, initialStatus }: { farmId: number; openId?: number | null; initialStatus?: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkshopJob["job"] | null>(null);
  const [form, setForm] = useState<Partial<WorkshopJob["job"]>>(EMPTY_JOB);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus ?? "all");
  const [raiseTaskFor, setRaiseTaskFor] = useState<any>(null);
  const [issuePartId, setIssuePartId] = useState("");
  const [issueQty, setIssueQty] = useState("");
  const [issueBy, setIssueBy] = useState("");
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m: any) => memberFullName(m));
  const [manualParts, setManualParts] = useState<{ id: string; name: string; qty: string; cost: string }[]>([]);
  const [newPart, setNewPart] = useState({ name: "", qty: "", cost: "" });
  const [hlId, setHlId] = useState<number | null>(openId ?? null);
  const [pendingLabourEntries, setPendingLabourEntries] = useState<{ id: string; date: string; description: string; chargeUnits: number; ratePence: number; costPence: number }[]>([]);
  const [newLabourEntry, setNewLabourEntry] = useState({ date: new Date().toISOString().slice(0, 10), description: "", chargeUnits: "" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ rate: "", unitMins: "15" });
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const autoOpened = useRef(false);

  // Keep a ref to the editing job ID so the sync effect doesn't need editing in its deps
  const editingIdRef = useRef<number | null>(null);
  useEffect(() => { editingIdRef.current = editing?.id ?? null; }, [editing]);

  const { data: equipData } = useQuery<{ records: Equipment[] }>({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then(r => r.json()),
  });

  const { data, isLoading } = useQuery<{ jobs: WorkshopJob[] }>({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()),
  });

  // When the jobs query refreshes (e.g. after issuing parts), sync editing + form cost fields
  useEffect(() => {
    if (!data?.jobs || editingIdRef.current === null) return;
    const fresh = data.jobs.find(j => j.job.id === editingIdRef.current);
    if (!fresh) return;
    setEditing(fresh.job);
    setForm(f => ({ ...f, partsCostPence: fresh.job.partsCostPence }));
  }, [data?.jobs]);

  const { data: workshopParts = [] } = useQuery<Part[]>({
    queryKey: ["workshop-parts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/parts`), { credentials: "include" }).then(r => r.json()),
    enabled: open && !!editing,
  });

  const { data: issuedParts = [] } = useQuery<IssuedPart[]>({
    queryKey: ["job-issued-parts", editing?.id],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs/${editing!.id}/parts`), { credentials: "include" }).then(r => r.json()),
    enabled: open && !!editing?.id,
  });

  const { data: customersData } = useQuery<{ records: { id: number; name: string; isActive: boolean }[] }>({
    queryKey: ["farm-customers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-customers`), { credentials: "include" }).then(r => r.json()),
  });
  const customers = (customersData?.records ?? []).filter(c => c.isActive);

  const { data: workshopSettings } = useQuery<{ farmId: number; labourRatePence: number; labourChargeUnitMinutes: number }>({
    queryKey: ["workshop-settings", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/settings`), { credentials: "include" }).then(r => r.json()),
  });
  const defaultRate = workshopSettings?.labourRatePence ?? 5000;
  const unitMins = workshopSettings?.labourChargeUnitMinutes ?? 15;

  const { data: labourEntries = [] } = useQuery<LabourEntry[]>({
    queryKey: ["job-labour-entries", editing?.id],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs/${editing!.id}/labour`), { credentials: "include" }).then(r => r.json()),
    enabled: open && !!editing?.id,
  });

  const raiseInvoice = useMutation({
    mutationFn: (jobId: number) =>
      fetch(api(`farms/${farmId}/workshop/jobs/${jobId}/raise-invoice`), {
        method: "POST", credentials: "include",
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      toast({ title: "Invoice raised", description: "Draft invoice created in Farm Services & Contracting." });
    },
    onError: () => toast({ title: "Failed to raise invoice", variant: "destructive" }),
  });

  // Derive step/min from the selected part's UOM — must be after workshopParts query
  const selectedIssuePart = workshopParts.find(p => String(p.id) === issuePartId) ?? null;
  const issueUnit = selectedIssuePart?.unit ?? null;
  const issueIsWhole = WHOLE_UNITS.includes((issueUnit ?? "").toLowerCase());
  const issueStep = qtyStep(issueUnit);
  const issueMin = qtyMin(issueUnit);

  const issuePartsToJob = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/workshop/parts/use`), {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockItemId: parseInt(issuePartId), quantity: parseFloat(issueQty), jobId: editing?.id, performedBy: issueBy }),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      qc.invalidateQueries({ queryKey: ["job-issued-parts", editing?.id] });
      setIssuePartId(""); setIssueQty(""); setIssueBy("");
    },
  });

  const addLabourEntry = useMutation({
    mutationFn: (entry: { entryDate: string; description: string; chargeUnits: number; ratePence: number }) =>
      fetch(api(`farms/${farmId}/workshop/jobs/${editing!.id}/labour`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-labour-entries", editing?.id] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
      setNewLabourEntry({ date: new Date().toISOString().slice(0, 10), description: "", chargeUnits: "" });
    },
  });

  const deleteLabourEntry = useMutation({
    mutationFn: (entryId: number) => fetch(api(`farms/${farmId}/workshop/jobs/${editing!.id}/labour/${entryId}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-labour-entries", editing?.id] });
      qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] });
    },
  });

  const saveWorkshopSettings = useMutation({
    mutationFn: (s: { labourRatePence: number; labourChargeUnitMinutes: number }) =>
      fetch(api(`farms/${farmId}/workshop/settings`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-settings", farmId] });
      setSettingsOpen(false);
      toast({ title: "Workshop settings saved" });
    },
  });

  const save = useMutation({
    mutationFn: async (body: Partial<WorkshopJob["job"]>) => {
      const { labourHours: _lh, labourCostPence: _lcp, ...cleanBody } = body;
      if (editing) {
        await fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanBody) });
        for (const e of pendingLabourEntries) {
          await fetch(api(`farms/${farmId}/workshop/jobs/${editing.id}/labour`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryDate: e.date, description: e.description, chargeUnits: e.chargeUnits, ratePence: e.ratePence }) });
        }
      } else {
        const res = await fetch(api(`farms/${farmId}/workshop/jobs`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanBody) });
        const newJob = await res.json();
        if (newJob?.id && pendingLabourEntries.length > 0) {
          for (const e of pendingLabourEntries) {
            await fetch(api(`farms/${farmId}/workshop/jobs/${newJob.id}/labour`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryDate: e.date, description: e.description, chargeUnits: e.chargeUnits, ratePence: e.ratePence }) });
          }
        }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }); setOpen(false); setEditing(null); setForm(EMPTY_JOB); setPendingLabourEntries([]); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/jobs/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }),
  });

  function openAdd() { setEditing(null); setForm(EMPTY_JOB); setOpen(true); setManualParts([]); setNewPart({ name: "", qty: "", cost: "" }); setPendingLabourEntries([]); setNewLabourEntry({ date: new Date().toISOString().slice(0, 10), description: "", chargeUnits: "" }); }
  function openEdit(j: WorkshopJob["job"]) {
    setEditing(j);
    setForm({ ...j, openedAt: j.openedAt?.slice(0, 10), estimatedCompletionDate: j.estimatedCompletionDate?.slice(0, 10), completedAt: j.completedAt?.slice(0, 10) });
    setOpen(true);
    setManualParts([]);
    setNewPart({ name: "", qty: "", cost: "" });
    setPendingLabourEntries([]);
    setNewLabourEntry({ date: new Date().toISOString().slice(0, 10), description: "", chargeUnits: "" });
  }

  function printBlankJobCard() {
    const win = window.open("", "_blank", "width=860,height=1100");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Job Card</title><style>
      body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:24px;color:#111;}
      h1{font-size:18px;margin:0 0 4px;}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:16px;}
      .logo{font-size:22px;font-weight:bold;color:#1a6b3a;}
      .meta{text-align:right;font-size:11px;color:#555;}
      .row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px;}
      .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:12px;}
      .field{border:1px solid #ccc;border-radius:4px;padding:6px 8px;min-height:28px;}
      label{display:block;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;color:#555;margin-bottom:3px;}
      .section{border:1px solid #ccc;border-radius:6px;padding:10px 12px;margin-bottom:14px;}
      .section-title{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.06em;color:#777;margin-bottom:8px;}
      .desc{min-height:56px;}
      .notes{min-height:48px;}
      .cost-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
      .cost-box{border:2px solid #ccc;border-radius:6px;padding:8px 10px;text-align:center;}
      .cost-box.total{border-color:#1a6b3a;background:#f0faf4;}
      .cost-label{font-size:9px;font-weight:bold;text-transform:uppercase;color:#777;margin-bottom:4px;}
      .cost-value{font-size:16px;font-weight:bold;color:#111;}
      .cost-box.total .cost-value{color:#1a6b3a;}
      .parts-table{width:100%;border-collapse:collapse;font-size:11px;}
      .parts-table th{background:#f5f5f5;font-size:10px;font-weight:bold;text-transform:uppercase;padding:5px 8px;border:1px solid #ddd;text-align:left;}
      .parts-table td{border:1px solid #ddd;padding:6px 8px;height:22px;}
      .sig-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px;}
      .sig-box{border-top:1px solid #555;padding-top:6px;font-size:10px;color:#555;}
      @media print{body{padding:12px;} button{display:none;}}
    </style></head><body>
      <div class="header">
        <div>
          <div class="logo">BDE Farm Trac</div>
          <h1 style="margin-top:8px;">Workshop Job Card</h1>
        </div>
        <div class="meta">
          <div>Job No: _______________</div>
          <div style="margin-top:4px;">Date Opened: _______________</div>
          <div style="margin-top:4px;">Priority: □ Low &nbsp; □ Medium &nbsp; □ High &nbsp; □ Critical</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Job Details</div>
        <div style="margin-bottom:10px;">
          <label>Job Title</label><div class="field">&nbsp;</div>
        </div>
        <div class="row">
          <div><label>Job Type</label><div class="field">&nbsp;</div></div>
          <div><label>Equipment / Asset</label><div class="field">&nbsp;</div></div>
        </div>
        <div style="margin-bottom:10px;">
          <label>Description of Fault / Work Required</label><div class="field desc">&nbsp;</div>
        </div>
        <div>
          <label>Root Cause</label><div class="field">&nbsp;</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Assignment &amp; Schedule</div>
        <div class="row">
          <div><label>Status</label><div class="field">&nbsp;</div></div>
          <div><label>Customer (if off-farm)</label><div class="field">&nbsp;</div></div>
        </div>
        <div class="row3">
          <div><label>Reported By</label><div class="field">&nbsp;</div></div>
          <div><label>Assigned To</label><div class="field">&nbsp;</div></div>
          <div><label>Est. Completion Date</label><div class="field">&nbsp;</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Labour</div>
        <div class="row3">
          <div><label>Hours Worked</label><div class="field">&nbsp;</div></div>
          <div><label>Labour Cost (£)</label><div class="field">&nbsp;</div></div>
          <div><label>Technician</label><div class="field">&nbsp;</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Parts Used</div>
        <table class="parts-table">
          <thead>
            <tr><th>Part Name / Description</th><th>Part No.</th><th style="width:60px;text-align:center;">Qty</th><th style="width:80px;text-align:right;">Unit Cost</th><th style="width:80px;text-align:right;">Total</th></tr>
          </thead>
          <tbody>
            ${Array(6).fill('<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>').join("")}
          </tbody>
        </table>
        <div style="margin-top:8px;"><label>Additional Parts Notes</label><div class="field notes">&nbsp;</div></div>
      </div>

      <div class="section">
        <div class="section-title">Cost Summary</div>
        <div class="cost-grid">
          <div class="cost-box"><div class="cost-label">Labour</div><div class="cost-value">£ ________</div></div>
          <div class="cost-box"><div class="cost-label">Parts (Stock)</div><div class="cost-value">£ ________</div></div>
          <div class="cost-box"><div class="cost-label">Parts (External)</div><div class="cost-value">£ ________</div></div>
          <div class="cost-box total"><div class="cost-label">Grand Total</div><div class="cost-value">£ ________</div></div>
        </div>
      </div>

      <div><label>Notes / Comments</label><div class="field notes">&nbsp;</div></div>

      <div class="sig-row">
        <div class="sig-box">Technician Signature</div>
        <div class="sig-box">Authorised By</div>
        <div class="sig-box">Date Completed</div>
      </div>

      <script>window.onload = function(){ window.print(); window.addEventListener("afterprint", function(){ window.close(); }); };<\/script>
    </body></html>`);
    win.document.close();
  }
  function set(k: keyof WorkshopJob["job"], v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const equipment = equipData?.records ?? [];
  const allJobs = data?.jobs ?? [];
  const filtered = statusFilter === "all" ? allJobs : allJobs.filter(j => j.job.status === statusFilter);

  useEffect(() => {
    if (!openId || autoOpened.current || allJobs.length === 0) return;
    if (allJobs.some(j => j.job.id === openId)) {
      autoOpened.current = true;
      const jobData = allJobs.find(j => j.job.id === openId);
      if (jobData) { setEditing(jobData.job); setForm(jobData.job); setOpen(true); }
      setTimeout(() => { cardRefs.current.get(openId)?.scrollIntoView({ behavior: "smooth", block: "center" }); const t = setTimeout(() => setHlId(null), 4000); return () => clearTimeout(t); }, 200);
    }
  }, [openId, allJobs]);

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "open", "in-progress", "awaiting-parts", "completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
              {s === "all" ? "All Jobs" : JOB_STATUS[s]?.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="px-2 text-gray-500 hover:text-gray-700" title="Workshop settings" onClick={() => { setSettingsForm({ rate: (defaultRate / 100).toFixed(2), unitMins: String(unitMins) }); setSettingsOpen(true); }}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New Job</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No job cards found. Log a repair or service with "New Job".</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ job, equipmentName, assetNumber: an, customerName, invoiceNumber }) => (
            <Card key={job.id} ref={(el) => { if (el) cardRefs.current.set(job.id, el as HTMLElement); }} className={`transition-shadow${hlId === job.id ? " ring-2 ring-amber-400 bg-amber-50 shadow-md" : " hover:shadow-md"}`}>
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-gray-400">{job.jobNumber}</p>
                    <CardTitle className="text-sm mt-0.5 leading-snug">{job.title}</CardTitle>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(job)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => del.mutate(job.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    {job.status === "awaiting-parts" && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-purple-600" onClick={() => setRaiseTaskFor(job)} title="Raise Task — awaiting parts"><ClipboardList className="h-3.5 w-3.5" /></Button>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {equipmentName && <p className="text-xs text-gray-500">{an ? `${an} — ` : ""}{equipmentName}</p>}
                {customerName && (
                  <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                    <Users className="h-3 w-3" />For: {customerName}
                  </p>
                )}
                {job.description && <p className="text-xs text-gray-600 line-clamp-2">{job.description}</p>}
                <div className="flex gap-2 flex-wrap pt-1">
                  <StatusBadge value={job.status} map={JOB_STATUS} />
                  <StatusBadge value={job.priority} map={PRIORITY} />
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 capitalize">{job.jobType}</span>
                </div>
                {job.assignedTo && <p className="text-xs text-gray-400">Assigned: {job.assignedTo}</p>}
                {job.estimatedCompletionDate && (
                  <p className="text-xs text-gray-400">Due: {new Date(job.estimatedCompletionDate).toLocaleDateString("en-GB")}</p>
                )}
                {job.labourHours != null && <p className="text-xs text-gray-400">Labour: {job.labourHours} hrs</p>}
                {job.status === "completed" && job.customerId && !job.serviceInvoiceId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-1 h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => raiseInvoice.mutate(job.id)}
                    disabled={raiseInvoice.isPending}
                  >
                    <Receipt className="h-3.5 w-3.5 mr-1" />
                    {raiseInvoice.isPending ? "Raising…" : "Raise Invoice"}
                  </Button>
                )}
                {job.serviceInvoiceId && invoiceNumber && (
                  <div className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded bg-green-50 border border-green-200">
                    <Receipt className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="text-xs text-green-700 font-medium">Invoice {invoiceNumber} raised</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Parts Chase — ${raiseTaskFor.title ?? "Workshop Job"}`}
          defaultDescription={`Job ${raiseTaskFor.jobNumber ?? ""} is awaiting parts${raiseTaskFor.equipmentName ? ` for ${raiseTaskFor.equipmentName}` : ""}. Assigned: ${raiseTaskFor.assignedTo ?? "—"}`}
          module="workshop"
        />
      )}

      {/* ── Workshop Settings Dialog ── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="h-4 w-4" />Workshop Labour Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Labour Rate (£/hr)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                <Input type="number" step="0.01" min="0" className="pl-6" value={settingsForm.rate} onChange={e => setSettingsForm(s => ({ ...s, rate: e.target.value }))} placeholder="50.00" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Hourly rate charged for workshop labour</p>
            </div>
            <div>
              <Label>Charge Unit (minutes)</Label>
              <Input type="number" step="1" min="1" max="60" className="mt-1" value={settingsForm.unitMins} onChange={e => setSettingsForm(s => ({ ...s, unitMins: e.target.value }))} placeholder="15" />
              <p className="text-xs text-gray-400 mt-1">Labour is billed in multiples of this unit (e.g. 15 = quarter-hour billing)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const ratePence = Math.round(parseFloat(settingsForm.rate) * 100);
                const mins = parseInt(settingsForm.unitMins);
                if (isNaN(ratePence) || ratePence <= 0 || isNaN(mins) || mins <= 0) return;
                saveWorkshopSettings.mutate({ labourRatePence: ratePence, labourChargeUnitMinutes: mins });
              }}
              disabled={saveWorkshopSettings.isPending}
            >
              {saveWorkshopSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "68rem" }} className="flex flex-col p-0 gap-0 max-h-[92vh]">
          {/* ── Header ── */}
          <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
            <DialogTitle className="text-base font-semibold">
              {editing ? `Edit ${editing.jobNumber}` : "New Job Card"}
            </DialogTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-gray-500 hover:text-gray-700" onClick={printBlankJobCard}>
              <Printer className="h-3.5 w-3.5" />Print Blank Card
            </Button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

            {/* ── Row 1: Job Details + Assignment ── */}
            <div className="grid grid-cols-2 gap-6 pb-4 border-b">
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Job Details</p>
                <div><Label>Job Title *</Label><Input value={form.title || ""} onChange={e => set("title", e.target.value)} placeholder="e.g. Replace front tyre — JD 6175R" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Job Type</Label>
                    <Select value={form.jobType || "repair"} onValueChange={v => set("jobType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="service">Scheduled Service</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="commissioning">Commissioning</SelectItem>
                        <SelectItem value="investigation">Investigation</SelectItem>
                        <SelectItem value="modification">Modification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority || "medium"} onValueChange={v => set("priority", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Equipment</Label>
                  <Select value={form.equipmentId ? String(form.equipmentId) : ""} onValueChange={v => set("equipmentId", v ? parseInt(v) : null)}>
                    <SelectTrigger><SelectValue placeholder="Select equipment…" /></SelectTrigger>
                    <SelectContent>
                      {equipment.map(eq => <SelectItem key={eq.id} value={String(eq.id)}>{assetNumber(eq)} — {eq.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} placeholder="Describe the fault or work required" /></div>
                <div><Label>Root Cause</Label><Input value={form.rootCause || ""} onChange={e => set("rootCause", e.target.value)} placeholder="e.g. Impact damage, normal wear, operator error" /></div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Assignment &amp; Schedule</p>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status || "open"} onValueChange={v => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(JOB_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    Customer <span className="text-xs text-gray-400 font-normal ml-1">(off-farm / external job)</span>
                  </Label>
                  <Select value={form.customerId ? String(form.customerId) : "none"} onValueChange={v => set("customerId", v !== "none" ? parseInt(v) : null)}>
                    <SelectTrigger><SelectValue placeholder="None — internal job" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None — internal job</SelectItem>
                      {customers.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.customerId && (
                    <p className="text-xs text-amber-700 mt-1.5 flex items-start gap-1">
                      <Receipt className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      When the job is marked <strong>Completed</strong>, a &ldquo;Raise Invoice&rdquo; button appears — this creates a draft invoice in Farm Services &amp; Contracting.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Reported By</Label><Input value={form.reportedBy || ""} onChange={e => set("reportedBy", e.target.value)} /></div>
                  <div><Label>Assigned To</Label><Input value={form.assignedTo || ""} onChange={e => set("assignedTo", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Opened Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.openedAt?.slice(0, 10) || ""} onChange={e => set("openedAt", e.target.value)} /></div>
                  <div><Label>Est. Completion</Label><Input type="date" value={form.estimatedCompletionDate || ""} onChange={e => set("estimatedCompletionDate", e.target.value)} /></div>
                </div>
                {(form.status === "completed" || form.status === "cancelled") && (
                  <div><Label>Completed Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.completedAt || ""} onChange={e => set("completedAt", e.target.value)} /></div>
                )}
                <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={3} /></div>
              </div>
            </div>

            {/* ── Labour box ── */}
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />Labour
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">£{(defaultRate / 100).toFixed(2)}/hr · {unitMins}-min units</span>
                  <button type="button" onClick={() => { setSettingsForm({ rate: (defaultRate / 100).toFixed(2), unitMins: String(unitMins) }); setSettingsOpen(true); }} className="text-xs text-primary hover:underline">Change</button>
                </div>
              </div>
              {(editing ? labourEntries : pendingLabourEntries).length > 0 && (
                <div className="mb-3 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 border-b border-gray-200">
                        <th className="text-left px-2 py-1.5 font-medium">Date</th>
                        <th className="text-left px-2 py-1.5 font-medium">Description</th>
                        <th className="text-right px-2 py-1.5 font-medium">Units</th>
                        <th className="text-right px-2 py-1.5 font-medium">Hours</th>
                        <th className="text-right px-2 py-1.5 font-medium">Rate</th>
                        <th className="text-right px-2 py-1.5 font-medium">Cost</th>
                        <th className="w-6" />
                      </tr>
                    </thead>
                    <tbody>
                      {editing
                        ? labourEntries.map(e => {
                            const hrs = (e.chargeUnits * unitMins / 60).toFixed(2);
                            return (
                              <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-2 py-1.5 whitespace-nowrap">{new Date(e.entryDate + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                                <td className="px-2 py-1.5 text-gray-600 max-w-[140px] truncate">{e.description || <span className="text-gray-300 italic">—</span>}</td>
                                <td className="px-2 py-1.5 text-right">{e.chargeUnits}</td>
                                <td className="px-2 py-1.5 text-right text-gray-500">{hrs}</td>
                                <td className="px-2 py-1.5 text-right text-gray-500 whitespace-nowrap">£{(e.ratePence / 100).toFixed(2)}/hr</td>
                                <td className="px-2 py-1.5 text-right font-semibold">£{(e.costPence / 100).toFixed(2)}</td>
                                <td className="px-2 py-1.5 text-center">
                                  <button type="button" onClick={() => deleteLabourEntry.mutate(e.id)} className="text-gray-300 hover:text-red-500 transition-colors" disabled={deleteLabourEntry.isPending}>
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        : pendingLabourEntries.map(e => {
                            const hrs = (e.chargeUnits * unitMins / 60).toFixed(2);
                            return (
                              <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-2 py-1.5 whitespace-nowrap">{new Date(e.date + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                                <td className="px-2 py-1.5 text-gray-600 max-w-[140px] truncate">{e.description || <span className="text-gray-300 italic">—</span>}</td>
                                <td className="px-2 py-1.5 text-right">{e.chargeUnits}</td>
                                <td className="px-2 py-1.5 text-right text-gray-500">{hrs}</td>
                                <td className="px-2 py-1.5 text-right text-gray-500 whitespace-nowrap">£{(e.ratePence / 100).toFixed(2)}/hr</td>
                                <td className="px-2 py-1.5 text-right font-semibold">£{(e.costPence / 100).toFixed(2)}</td>
                                <td className="px-2 py-1.5 text-center">
                                  <button type="button" onClick={() => setPendingLabourEntries(ps => ps.filter(x => x.id !== e.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                    {(() => {
                      const allEntries = editing ? labourEntries : pendingLabourEntries;
                      const totalUnits = allEntries.reduce((s, e) => s + e.chargeUnits, 0);
                      const totalHrs = (totalUnits * unitMins / 60).toFixed(2);
                      const totalCost = allEntries.reduce((s, e) => s + e.costPence, 0);
                      return (
                        <tfoot>
                          <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                            <td className="px-2 py-1.5 text-xs" colSpan={2}>Total</td>
                            <td className="px-2 py-1.5 text-right text-xs">{totalUnits}</td>
                            <td className="px-2 py-1.5 text-right text-xs">{totalHrs}</td>
                            <td />
                            <td className="px-2 py-1.5 text-right text-sm font-bold">£{(totalCost / 100).toFixed(2)}</td>
                            <td />
                          </tr>
                        </tfoot>
                      );
                    })()}
                  </table>
                </div>
              )}
              {editing && labourEntries.length === 0 && (form.labourCostPence ?? 0) > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-3">
                  Legacy labour cost: £{((form.labourCostPence ?? 0) / 100).toFixed(2)} — add line items below to replace.
                </p>
              )}
              {(() => {
                const units = parseInt(newLabourEntry.chargeUnits);
                const previewCost = !isNaN(units) && units > 0 ? (units * defaultRate * unitMins / 60 / 100).toFixed(2) : null;
                return (
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="w-36">
                      <label className="block text-[11px] text-gray-400 mb-1">Date</label>
                      <Input type="date" className="h-8 text-xs" value={newLabourEntry.date} onChange={e => setNewLabourEntry(x => ({ ...x, date: e.target.value }))} />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[11px] text-gray-400 mb-1">Description (optional)</label>
                      <Input className="h-8 text-xs" value={newLabourEntry.description} onChange={e => setNewLabourEntry(x => ({ ...x, description: e.target.value }))} placeholder="e.g. Diagnosis, repair" />
                    </div>
                    <div className="w-28">
                      <label className="block text-[11px] text-gray-400 mb-1">Units ×{unitMins}min</label>
                      <Input type="number" min="1" step="1" className="h-8 text-xs" value={newLabourEntry.chargeUnits} onChange={e => setNewLabourEntry(x => ({ ...x, chargeUnits: e.target.value }))} placeholder="4 = 1hr" />
                    </div>
                    <div className="flex items-end gap-2 pb-0.5">
                      {previewCost !== null && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">= £{previewCost}</span>
                      )}
                      <Button
                        type="button" size="sm" variant="outline" className="h-8 text-xs gap-1 shrink-0"
                        disabled={!newLabourEntry.chargeUnits || parseInt(newLabourEntry.chargeUnits) <= 0 || addLabourEntry.isPending}
                        onClick={() => {
                          const units = parseInt(newLabourEntry.chargeUnits);
                          if (isNaN(units) || units <= 0) return;
                          if (editing) {
                            addLabourEntry.mutate({ entryDate: newLabourEntry.date, description: newLabourEntry.description, chargeUnits: units, ratePence: defaultRate });
                          } else {
                            const cost = Math.round(units * defaultRate * unitMins / 60);
                            setPendingLabourEntries(ps => [...ps, { id: crypto.randomUUID(), date: newLabourEntry.date, description: newLabourEntry.description, chargeUnits: units, ratePence: defaultRate, costPence: cost }]);
                            setNewLabourEntry({ date: new Date().toISOString().slice(0, 10), description: "", chargeUnits: "" });
                          }
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />Add
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── Parts box ── */}
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />Parts
              </p>

              {/* Issue from Stock — edit only (needs a job ID) */}
              {editing && (
                <>
                  {workshopParts.length > 0 && (
                    <div className="rounded-md border border-blue-100 bg-blue-50/40 p-3 mb-3">
                      <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                        <ArrowUpFromLine className="h-3.5 w-3.5" />Issue from Stock
                      </p>
                      <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                        <Select value={issuePartId} onValueChange={v => { setIssuePartId(v); setIssueQty(""); }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select part…" /></SelectTrigger>
                          <SelectContent>
                            {workshopParts.map(p => (
                              <SelectItem key={p.id} value={String(p.id)}>{p.name} — {parseFloat(p.currentQuantity)} {p.unit ?? ""} in stock</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <Input className="h-8 text-xs w-24" type="number" step={issueStep} min={issueMin} value={issueQty} onChange={e => setIssueQty(e.target.value)} placeholder={issueIsWhole ? "1" : "0.1"} />
                          {issueUnit && <span className="text-xs text-muted-foreground whitespace-nowrap">{issueUnit}</span>}
                        </div>
                        <Button size="sm" className="h-8 text-xs" onClick={() => issuePartsToJob.mutate()} disabled={!issuePartId || !issueQty || issuePartsToJob.isPending}>
                          {issuePartsToJob.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><ArrowUpFromLine className="h-3.5 w-3.5 mr-1" />Issue</>}
                        </Button>
                      </div>
                      <div className="mt-2"><StaffSelect value={issueBy} onChange={setIssueBy} staffNames={staffNames} loading={membersLoading} /></div>
                    </div>
                  )}

                  {/* Issued parts table */}
                  {issuedParts.length === 0 ? (
                    <p className="text-xs text-gray-400 italic mb-3">No parts issued from stock yet.</p>
                  ) : (
                    <div className="overflow-auto rounded border border-gray-100 mb-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500">
                            <th className="text-left px-2 py-1.5 font-medium">Part</th>
                            <th className="text-right px-2 py-1.5 font-medium">Qty</th>
                            <th className="text-right px-2 py-1.5 font-medium">{form.customerId ? "Unit Price" : "Unit Cost"}</th>
                            <th className="text-right px-2 py-1.5 font-medium">Line Total</th>
                            <th className="text-left px-2 py-1.5 font-medium">Issued By</th>
                            <th className="text-left px-2 py-1.5 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {issuedParts.map(ip => {
                            const qty = Math.abs(parseFloat(ip.quantityChange));
                            const ipPrice = form.customerId ? (ip.unitSellPricePence ?? ip.unitCostPence) : ip.unitCostPence;
                            const lineTotal = ipPrice != null ? ipPrice * qty : null;
                            return (
                              <tr key={ip.id} className="hover:bg-gray-50/60">
                                <td className="px-2 py-1.5 font-medium text-gray-800">{ip.partName}{ip.productCode && <span className="ml-1 text-gray-400">({ip.productCode})</span>}</td>
                                <td className="px-2 py-1.5 text-right text-gray-700">{qty} {ip.unit ?? ""}</td>
                                <td className="px-2 py-1.5 text-right text-gray-500">{ipPrice != null ? `£${(ipPrice / 100).toFixed(2)}` : "—"}</td>
                                <td className="px-2 py-1.5 text-right font-medium text-gray-800">{lineTotal != null ? `£${(lineTotal / 100).toFixed(2)}` : "—"}</td>
                                <td className="px-2 py-1.5 text-gray-500">{ip.performedBy || "—"}</td>
                                <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{new Date(ip.movedAt).toLocaleDateString("en-GB")}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-200 bg-gray-50">
                            <td colSpan={3} className="px-2 py-1.5 text-xs font-semibold text-gray-600 text-right">Stock parts total:</td>
                            <td className="px-2 py-1.5 text-right text-xs font-bold text-gray-900">
                              £{(issuedParts.reduce((sum, ip) => { const qty = Math.abs(parseFloat(ip.quantityChange)); const p = form.customerId ? (ip.unitSellPricePence ?? ip.unitCostPence) : ip.unitCostPence; return sum + (p != null ? p * qty : 0); }, 0) / 100).toFixed(2)}
                            </td>
                            <td colSpan={2} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* External / purchased parts — available on both new and edit */}
              <div className="rounded-md border border-gray-200 bg-gray-50/40 p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {editing ? "External / Purchased Parts" : "Parts"}
                  <span className="font-normal text-gray-400 ml-1">(externally sourced — not from stock)</span>
                </p>
                {!editing && (
                  <p className="text-xs text-amber-700 mb-2 flex items-start gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    Issue from Stock is available after saving the job card. Add parts you plan to use here now.
                  </p>
                )}
                {manualParts.length > 0 && (
                  <div className="overflow-auto rounded border border-gray-100 mb-2 bg-white">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500">
                          <th className="text-left px-2 py-1.5 font-medium">Part Name</th>
                          <th className="text-right px-2 py-1.5 font-medium">Qty</th>
                          <th className="text-right px-2 py-1.5 font-medium">Unit Cost (£)</th>
                          <th className="text-right px-2 py-1.5 font-medium">Line Total</th>
                          <th className="w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {manualParts.map(p => {
                          const qty = parseFloat(p.qty) || 0;
                          const cost = parseFloat(p.cost) || 0;
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/60">
                              <td className="px-2 py-1.5">{p.name}</td>
                              <td className="px-2 py-1.5 text-right">{qty || "—"}</td>
                              <td className="px-2 py-1.5 text-right">{cost ? `£${cost.toFixed(2)}` : "—"}</td>
                              <td className="px-2 py-1.5 text-right font-medium">{qty && cost ? `£${(qty * cost).toFixed(2)}` : "—"}</td>
                              <td className="px-2 py-1.5 text-center">
                                <button type="button" onClick={() => setManualParts(ps => ps.filter(x => x.id !== p.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {manualParts.length > 1 && (
                        <tfoot>
                          <tr className="border-t-2 border-gray-200 bg-gray-50">
                            <td colSpan={3} className="px-2 py-1.5 text-xs font-semibold text-gray-600 text-right">External total:</td>
                            <td className="px-2 py-1.5 text-right text-xs font-bold">
                              £{manualParts.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.cost) || 0), 0).toFixed(2)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                  <div>
                    <Label className="text-xs text-gray-500">Part Name / Description</Label>
                    <Input className="h-8 text-xs" value={newPart.name} onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Front tyre 480/70 R30" onKeyDown={e => { if (e.key === "Enter" && newPart.name.trim()) { setManualParts(ps => [...ps, { id: crypto.randomUUID(), ...newPart }]); setNewPart({ name: "", qty: "", cost: "" }); } }} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Qty</Label>
                    <Input className="h-8 text-xs" type="number" step="1" min="0" value={newPart.qty} onChange={e => setNewPart(p => ({ ...p, qty: e.target.value }))} placeholder="1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Unit Cost (£)</Label>
                    <Input className="h-8 text-xs" type="number" step="0.01" min="0" value={newPart.cost} onChange={e => setNewPart(p => ({ ...p, cost: e.target.value }))} placeholder="0.00" />
                  </div>
                  <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={!newPart.name.trim()} onClick={() => { if (!newPart.name.trim()) return; setManualParts(ps => [...ps, { id: crypto.randomUUID(), ...newPart }]); setNewPart({ name: "", qty: "", cost: "" }); }}>
                    <Plus className="h-3.5 w-3.5" />Add
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <Label>Parts Notes <span className="text-xs text-gray-400 font-normal">(free-text — sourcing details, order refs, etc.)</span></Label>
                <Textarea value={form.partsUsed || ""} onChange={e => set("partsUsed", e.target.value)} rows={2} placeholder="e.g. Sourced from dealer, delivery 3–5 days — order ref AG2025-441" />
              </div>
            </div>

            {/* ── Cost Summary ── */}
            {(() => {
              const allLabourEntries = editing ? labourEntries : pendingLabourEntries;
              const labourPence = allLabourEntries.length > 0 ? allLabourEntries.reduce((s: number, e) => s + e.costPence, 0) : (editing ? (form.labourCostPence ?? 0) : 0);
              const stockPence = editing
                ? issuedParts.reduce((sum, ip) => { const qty = Math.abs(parseFloat(ip.quantityChange)); const p = form.customerId ? (ip.unitSellPricePence ?? ip.unitCostPence) : ip.unitCostPence; return sum + (p != null ? p * qty : 0); }, 0)
                : 0;
              const externalPence = Math.round(manualParts.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.cost) || 0) * 100, 0));
              const editExtraPence = editing ? Math.max(0, (form.partsCostPence ?? 0) - stockPence) : 0;
              const partsPence = stockPence + externalPence + editExtraPence;
              const grandPence = labourPence + partsPence;
              return (
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50/50 p-4">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Cost Summary</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg border p-3 text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Labour</p>
                      <p className="text-xl font-bold text-gray-900">£{(labourPence / 100).toFixed(2)}</p>
                      {allLabourEntries.length > 0 ? <p className="text-xs text-gray-400 mt-0.5">{(allLabourEntries.reduce((s: number, e) => s + e.chargeUnits, 0) * unitMins / 60).toFixed(1)} hrs</p> : (editing && (form.labourCostPence ?? 0) > 0 ? <p className="text-xs text-amber-500 mt-0.5">legacy</p> : null)}
                    </div>
                    <div className="bg-white rounded-lg border p-3 text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Parts (Stock)</p>
                      <p className="text-xl font-bold text-gray-900">£{(stockPence / 100).toFixed(2)}</p>
                      {!editing && <p className="text-xs text-gray-300 mt-0.5">available after saving</p>}
                    </div>
                    <div className="bg-white rounded-lg border p-3 text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Parts (External)</p>
                      <p className="text-xl font-bold text-gray-900">£{((externalPence + editExtraPence) / 100).toFixed(2)}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg border-2 border-primary/30 p-3 text-center">
                      <p className="text-[10px] font-semibold text-primary/70 uppercase mb-1.5">Grand Total</p>
                      <p className="text-2xl font-bold text-primary">£{(grandPence / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Documents — edit only */}
            {editing && <JobDocumentsSection farmId={farmId} jobId={editing.id} />}
            {!editing && (
              <p className="text-xs text-gray-400 text-center pb-1">
                Save the job card first to attach photos, documents, and issue parts from stock.
              </p>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t flex items-center shrink-0">
            {editing && editing.status === "completed" && editing.customerId && !editing.serviceInvoiceId && (
              <Button
                variant="outline"
                className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 mr-auto"
                onClick={() => { raiseInvoice.mutate(editing.id); setOpen(false); }}
                disabled={raiseInvoice.isPending}
              >
                <Receipt className="h-4 w-4" />
                {raiseInvoice.isPending ? "Raising…" : "Raise Invoice"}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const submitForm = { ...form };
                  if (manualParts.length > 0) {
                    const partsText = manualParts.map(p => `${p.name}${p.qty ? ` ×${parseFloat(p.qty)}` : ""}${p.cost ? ` @ £${parseFloat(p.cost).toFixed(2)}` : ""}`).join("\n");
                    const manualPence = Math.round(manualParts.reduce((s, p) => s + (parseFloat(p.qty) || 0) * (parseFloat(p.cost) || 0) * 100, 0));
                    submitForm.partsUsed = [partsText, form.partsUsed].filter(Boolean).join("\n");
                    submitForm.partsCostPence = (form.partsCostPence ?? 0) + manualPence;
                  }
                  save.mutate(submitForm);
                }}
                disabled={save.isPending || !form.title}
              >
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editing ? "Save Changes" : "Create Job Card"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Service Schedule tab ──────────────────────────────────────────────────────

interface ServiceEntry {
  log: {
    id: number; equipmentId: number; maintenanceType: string; description: string;
    performedBy: string | null; performedDate: string; nextDueDate: string | null;
    costPence: number | null; partsUsed: string | null; notes: string | null;
  };
  equipmentName: string;
  assetNumber: string | null;
  equipmentType: string;
}

function ServiceScheduleTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery<{ services: ServiceEntry[] }>({
    queryKey: ["workshop-schedule", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/schedule`), { credentials: "include" }).then(r => r.json()),
  });

  const [viewEntry, setViewEntry] = useState<ServiceEntry | null>(null);
  const [logEntry, setLogEntry] = useState<ServiceEntry | null>(null);
  const [logForm, setLogForm] = useState({ performedDate: new Date().toISOString().slice(0, 10), performedBy: "", nextDueDate: "", description: "", partsUsed: "", costPence: "", notes: "" });

  const logMut = useMutation({
    mutationFn: ({ equipmentId, body }: { equipmentId: number; body: Record<string, unknown> }) =>
      fetch(api(`farms/${farmId}/equipment/${equipmentId}/maintenance`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-schedule", farmId] });
      setLogEntry(null);
      toast({ title: "Service logged", description: "The schedule will update to reflect the new service date." });
    },
    onError: () => toast({ title: "Error", description: "Could not save service record.", variant: "destructive" }),
  });

  const today = new Date();
  const services = data?.services ?? [];

  function dueStatus(dateStr: string) {
    const d = new Date(dateStr);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { label: `Overdue by ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}`, colour: "bg-red-100 text-red-700", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> };
    if (diff <= 14) return { label: `Due in ${diff} day${diff !== 1 ? "s" : ""}`, colour: "bg-amber-100 text-amber-700", icon: <Clock className="h-4 w-4 text-amber-500" /> };
    return { label: `Due ${d.toLocaleDateString("en-GB")}`, colour: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> };
  }

  function openLogService(entry: ServiceEntry) {
    setLogEntry(entry);
    setLogForm({ performedDate: new Date().toISOString().slice(0, 10), performedBy: entry.log.performedBy ?? "", nextDueDate: "", description: entry.log.description ?? "", partsUsed: "", costPence: "", notes: "" });
  }

  function submitLog() {
    if (!logEntry) return;
    logMut.mutate({
      equipmentId: logEntry.log.equipmentId,
      body: {
        maintenanceType: logEntry.log.maintenanceType,
        performedDate: logForm.performedDate,
        performedBy: logForm.performedBy || null,
        nextDueDate: logForm.nextDueDate || null,
        description: logForm.description || null,
        partsUsed: logForm.partsUsed || null,
        costPence: logForm.costPence ? Math.round(parseFloat(logForm.costPence) * 100) : null,
        notes: logForm.notes || null,
      },
    });
  }

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  if (services.length === 0) {
    return <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No upcoming service dates found. Add a "Next Due Date" to maintenance records on the <Link href="/equipment" className="text-primary underline underline-offset-2 hover:opacity-75">Equipment page</Link> to populate this schedule.</CardContent></Card>;
  }

  const overdueCount = services.filter(s => new Date(s.log.nextDueDate!).getTime() < today.getTime()).length;
  const dueSoonCount = services.filter(s => { const d = new Date(s.log.nextDueDate!); const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000); return diff >= 0 && diff <= 14; }).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">One entry per service type per asset — completing a service removes the old overdue entry. Log new records on the <Link href="/equipment" className="text-primary underline underline-offset-2 hover:opacity-75">Equipment page</Link> or use <strong>Log Service Done</strong> below.</p>
        <div className="flex items-center gap-2 text-xs flex-shrink-0">
          {overdueCount > 0 && <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-red-100 text-red-700 font-medium"><AlertTriangle className="h-3 w-3" />{overdueCount} overdue</span>}
          {dueSoonCount > 0 && <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-medium"><Clock className="h-3 w-3" />{dueSoonCount} due soon</span>}
        </div>
      </div>

      {services.map((entry) => {
        const { log, equipmentName, assetNumber: an, equipmentType } = entry;
        const due = dueStatus(log.nextDueDate!);
        return (
          <Card key={log.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setViewEntry(entry)}>
            <CardContent className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="pt-0.5">{due.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{log.maintenanceType}</span>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", due.colour)}>{due.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{an ? `${an} — ` : ""}{equipmentName} <span className="text-gray-400">({equipmentType})</span></p>
                  <p className="text-xs text-gray-400 mt-1">Last done: {new Date(log.performedDate).toLocaleDateString("en-GB")}{log.performedBy ? ` by ${log.performedBy}` : ""}</p>
                  {log.description && <p className="text-xs text-gray-500 mt-1 italic">{log.description}</p>}
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0 text-xs h-7 px-2" onClick={(e) => { e.stopPropagation(); openLogService(entry); }}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />Log Service Done
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Detail view dialog */}
      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Maintenance Record Detail</DialogTitle></DialogHeader>
          {viewEntry && (
            <div className="space-y-3 text-sm py-1">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Asset</p><p className="font-medium">{viewEntry.assetNumber ? `${viewEntry.assetNumber} — ` : ""}{viewEntry.equipmentName}</p></div>
                <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Type</p><p>{viewEntry.equipmentType}</p></div>
                <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Service Type</p><p className="font-medium">{viewEntry.log.maintenanceType}</p></div>
                <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Last Performed</p><p>{new Date(viewEntry.log.performedDate).toLocaleDateString("en-GB")}</p></div>
                {viewEntry.log.performedBy && <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Performed By</p><p>{viewEntry.log.performedBy}</p></div>}
                <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Next Due</p><p className={new Date(viewEntry.log.nextDueDate!) < today ? "text-red-600 font-semibold" : ""}>{new Date(viewEntry.log.nextDueDate!).toLocaleDateString("en-GB")}</p></div>
                {viewEntry.log.costPence != null && <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Last Cost</p><p>£{(viewEntry.log.costPence / 100).toFixed(2)}</p></div>}
                {viewEntry.log.partsUsed && <div className="col-span-2"><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Parts Used</p><p>{viewEntry.log.partsUsed}</p></div>}
              </div>
              {viewEntry.log.description && <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Description</p><p className="text-gray-700">{viewEntry.log.description}</p></div>}
              {viewEntry.log.notes && <div><p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewEntry.log.notes}</p></div>}
              {!viewEntry.log.description && !viewEntry.log.notes && <p className="text-xs text-gray-400 italic">No description or notes recorded on the last service. These can be added when logging maintenance on the Equipment page.</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { if (viewEntry) openLogService(viewEntry); setViewEntry(null); }}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-600" />Log Service Done
            </Button>
            <Button variant="ghost" onClick={() => setViewEntry(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Service Done dialog */}
      <Dialog open={!!logEntry} onOpenChange={() => setLogEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Service Done</DialogTitle>
            {logEntry && <p className="text-sm text-gray-500 mt-1">{logEntry.log.maintenanceType} — {logEntry.equipmentName}{logEntry.assetNumber ? ` (${logEntry.assetNumber})` : ""}</p>}
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Date Performed <span className="text-red-500">*</span></Label>
                <Input type="date" max={new Date().toISOString().slice(0, 10)} value={logForm.performedDate} onChange={e => setLogForm(f => ({ ...f, performedDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Performed By</Label>
                <Input placeholder="Name or contractor" value={logForm.performedBy} onChange={e => setLogForm(f => ({ ...f, performedBy: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Next Due Date</Label>
                <Input type="date" min={new Date().toISOString().slice(0, 10)} value={logForm.nextDueDate} onChange={e => setLogForm(f => ({ ...f, nextDueDate: e.target.value }))} />
                <p className="text-xs text-gray-400">Set this to keep the item on the schedule going forward.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Cost (£)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00" value={logForm.costPence ? (parseFloat(logForm.costPence) / 100).toFixed(2) : ""} onChange={e => setLogForm(f => ({ ...f, costPence: e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : "" }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="Brief description of work done" value={logForm.description} onChange={e => setLogForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Parts Used</Label>
              <Input placeholder="e.g. Oil filter, 10W-40 5L" value={logForm.partsUsed} onChange={e => setLogForm(f => ({ ...f, partsUsed: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" rows={2} placeholder="Any observations, issues noted, or follow-up required…" value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogEntry(null)}>Cancel</Button>
            <Button onClick={submitLog} disabled={!logForm.performedDate || logMut.isPending}>
              {logMut.isPending ? "Saving…" : "Save Service Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Fleet Overview tab ────────────────────────────────────────────────────────

function FleetOverviewTab({ farmId, onNavigate }: { farmId: number; onNavigate: (tab: Tab, status?: string) => void }) {
  const { data: equipData } = useQuery<{ records: Equipment[] }>({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: jobData } = useQuery<{ jobs: WorkshopJob[] }>({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()),
  });

  const allEquip = equipData?.records ?? [];
  const equipment = allEquip.filter(e => e.status !== "disposed");
  const jobs = jobData?.jobs ?? [];

  const byStatus = equipment.reduce((acc, eq) => { acc[eq.status] = (acc[eq.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const byType = equipment.reduce((acc, eq) => { acc[eq.type] = (acc[eq.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  const openJobs = jobs.filter(j => j.job.status === "open").length;
  const inProgressJobs = jobs.filter(j => j.job.status === "in-progress").length;
  const awaitingParts = jobs.filter(j => j.job.status === "awaiting-parts").length;

  const totalLabourCost = jobs.reduce((sum, j) => sum + (j.job.labourCostPence || 0), 0);
  const totalPartsCost = jobs.reduce((sum, j) => sum + (j.job.partsCostPence || 0), 0);

  function StatCard({ title, value, sub, colour, onClick }: { title: string; value: number | string; sub?: string; colour: string; onClick?: () => void }) {
    const clickable = !!onClick && value !== 0;
    return (
      <Card className={clickable ? "cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40" : ""} onClick={clickable ? onClick : undefined}>
        <CardContent className="p-4">
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className={cn("text-3xl font-bold", colour)}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          {clickable && <p className="text-[10px] text-primary/70 mt-1.5">Click to view →</p>}
        </CardContent>
      </Card>
    );
  }

  // Costs grouped by year (most recent first)
  const costsByYear = jobs.reduce((acc, j) => {
    const yr = new Date(j.job.openedAt).getFullYear();
    if (!acc[yr]) acc[yr] = { labour: 0, parts: 0 };
    acc[yr].labour += j.job.labourCostPence || 0;
    acc[yr].parts += j.job.partsCostPence || 0;
    return acc;
  }, {} as Record<number, { labour: number; parts: number }>);
  const costYears = Object.keys(costsByYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Fleet Status</h3>
        <p className="text-xs text-gray-400 mb-3">Click a card to view those assets</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Assets" value={equipment.length} colour="text-gray-900" onClick={() => onNavigate("assets")} />
          <StatCard title="Operational" value={byStatus["active"] || 0} colour="text-green-600" sub={`${Math.round(((byStatus["active"] || 0) / Math.max(equipment.length, 1)) * 100)}% availability`} onClick={() => onNavigate("assets")} />
          <StatCard title="Broken Down" value={byStatus["broken"] || 0} colour="text-red-600" onClick={() => onNavigate("assets")} />
          <StatCard title="In Service" value={byStatus["in-service"] || 0} colour="text-amber-600" onClick={() => onNavigate("assets")} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Active Workshop Jobs</h3>
        <p className="text-xs text-gray-400 mb-3">Click a card to jump straight to that job list</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Open Jobs" value={openJobs} colour="text-blue-600" onClick={() => onNavigate("jobs", "open")} />
          <StatCard title="In Progress" value={inProgressJobs} colour="text-amber-600" onClick={() => onNavigate("jobs", "in-progress")} />
          <StatCard title="Awaiting Parts" value={awaitingParts} colour="text-purple-600" onClick={() => onNavigate("jobs", "awaiting-parts")} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Workshop Costs by Year</CardTitle></CardHeader>
          <CardContent>
            {costYears.length === 0 ? (
              <p className="text-sm text-gray-400">No cost data recorded yet.</p>
            ) : (
              <div className="divide-y">
                {costYears.map(yr => {
                  const { labour, parts } = costsByYear[yr];
                  const total = labour + parts;
                  return (
                    <div key={yr} className="py-2 first:pt-0 last:pb-0">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{yr}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-400">Labour</span><p className="font-medium">£{(labour / 100).toFixed(2)}</p></div>
                        <div><span className="text-gray-400">Parts</span><p className="font-medium">£{(parts / 100).toFixed(2)}</p></div>
                        <div><span className="text-gray-400">Total</span><p className="font-semibold text-gray-800">£{(total / 100).toFixed(2)}</p></div>
                      </div>
                    </div>
                  );
                })}
                {costYears.length > 1 && (
                  <div className="py-2 last:pb-0">
                    <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2 mt-0">
                      <div><span className="text-gray-400">All Labour</span><p className="font-semibold">£{(totalLabourCost / 100).toFixed(2)}</p></div>
                      <div><span className="text-gray-400">All Parts</span><p className="font-semibold">£{(totalPartsCost / 100).toFixed(2)}</p></div>
                      <div><span className="text-gray-400">All Time</span><p className="font-bold text-primary">£{((totalLabourCost + totalPartsCost) / 100).toFixed(2)}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Equipment by Type</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(byType).length === 0 ? <p className="text-sm text-gray-400">No equipment registered.</p> : (
              <div className="space-y-1.5">
                {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="flex-1 text-sm text-gray-600 capitalize">{type}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / equipment.length) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Parts Store tab ───────────────────────────────────────────────────────────

interface WorkshopShelf { id: number; bayId: number; farmId: number; name: string; qrToken: string; capacity: string | null; createdAt: string; updatedAt: string; }
interface WorkshopBay { id: number; farmId: number; rowId: number | null; name: string; description: string | null; shelfCount: number; shelves: WorkshopShelf[]; createdAt: string; updatedAt: string; }
interface WorkshopRow { id: number; farmId: number; name: string; description: string | null; bayCount: number; bays: WorkshopBay[]; createdAt: string; updatedAt: string; }

interface Part {
  id: number; name: string; category: string | null; productCode: string | null;
  unit: string | null; reorderLevel: string | null; unitCostPence: number | null; unitSellPricePence: number | null;
  storageLocation: string | null; shelfId: number | null; shelfName: string | null; bayId: number | null; bayName: string | null; rowId: number | null; rowName: string | null;
  defaultSupplierId: number | null; supplierName: string | null;
  notes: string | null; currentQuantity: string;
  supersededById: number | null; supersessionNotes: string | null; supersededAt: string | null;
  supersededByName: string | null; supersededByProductCode: string | null;
}

interface Movement {
  id: number; stockItemId: number; partName: string; unit: string | null;
  movementType: string; quantityChange: string; referenceType: string | null;
  referenceId: number | null; performedBy: string | null; notes: string | null;
  movedAt: string;
}

const PART_CATEGORIES = ["Filters", "Belts & Drives", "Bearings", "Seals & Gaskets", "Fasteners", "Electrical", "Hydraulics", "Tyres & Wheels", "Lubricants & Oils", "Welding Supplies", "Safety Equipment", "Tools", "Other"];

const RETURN_REASON_CODES: Record<string, string> = {
  "faulty": "Faulty / Defective",
  "wrong-part": "Wrong Part Supplied",
  "damaged-transit": "Damaged in Transit",
  "over-delivery": "Over-Delivery",
  "not-required": "No Longer Required",
  "other": "Other",
};

const RETURN_STATUS: Record<string, { label: string; colour: string }> = {
  "raised": { label: "Raised", colour: "bg-blue-100 text-blue-700" },
  "dispatched": { label: "Dispatched", colour: "bg-amber-100 text-amber-700" },
  "awaiting-credit": { label: "Awaiting Credit", colour: "bg-purple-100 text-purple-700" },
  "credit-received": { label: "Credit Received", colour: "bg-green-100 text-green-700" },
  "closed": { label: "Closed", colour: "bg-gray-100 text-gray-600" },
};

interface GoodsReturn {
  id: number;
  returnRef: string;
  supplierRtnNumber: string | null;
  stockItemId: number | null;
  stockItemName: string | null;
  supplierId: number | null;
  supplierName: string | null;
  quantity: string;
  unit: string | null;
  unitCostPence: number | null;
  returnReasonCode: string;
  returnReason: string | null;
  status: string;
  raisedBy: string | null;
  raisedAt: string;
  dispatchedAt: string | null;
  creditAmountPence: number | null;
  creditReceivedAt: string | null;
  originalDeliveryRef: string | null;
  notes: string | null;
}

function GoodsReturnsView({ farmId, parts }: { farmId: number; parts: Part[] }) {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [newOpen, setNewOpen] = useState(false);
  const [editReturn, setEditReturn] = useState<GoodsReturn | null>(null);

  // Create form state
  const [form, setForm] = useState({ stockItemId: "", stockItemName: "", supplierId: "", quantity: "", unit: "", unitCostPence: "", returnReasonCode: "faulty", returnReason: "", raisedBy: "", originalDeliveryRef: "", notes: "" });
  // Edit/update form state
  const [editForm, setEditForm] = useState({ supplierRtnNumber: "", status: "raised", dispatchedAt: "", creditAmountPence: "", creditReceivedAt: "", notes: "" });

  const { data: returns = [], isLoading } = useQuery<GoodsReturn[]>({
    queryKey: ["workshop-returns", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/returns`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: suppliers = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => r.json().then(d => d.records ?? [])),
  });

  const createReturn = useMutation({
    mutationFn: (body: Record<string, string>) => fetch(api(`farms/${farmId}/workshop/returns`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-returns", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
      setNewOpen(false);
      setForm({ stockItemId: "", stockItemName: "", supplierId: "", quantity: "", unit: "", unitCostPence: "", returnReasonCode: "faulty", returnReason: "", raisedBy: "", originalDeliveryRef: "", notes: "" });
    },
  });

  const updateReturn = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, string | null> }) => fetch(api(`farms/${farmId}/workshop/returns/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-returns", farmId] }); setEditReturn(null); },
  });

  const deleteReturn = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/returns/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workshop-returns", farmId] }),
  });

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function setEF(k: string, v: string) { setEditForm(f => ({ ...f, [k]: v })); }

  function openEdit(r: GoodsReturn) {
    setEditReturn(r);
    setEditForm({
      supplierRtnNumber: r.supplierRtnNumber ?? "",
      status: r.status,
      dispatchedAt: r.dispatchedAt ? r.dispatchedAt.slice(0, 10) : "",
      creditAmountPence: r.creditAmountPence ? (r.creditAmountPence / 100).toFixed(2) : "",
      creditReceivedAt: r.creditReceivedAt ? r.creditReceivedAt.slice(0, 10) : "",
      notes: r.notes ?? "",
    });
  }

  // Auto-fill unit from selected part
  function handlePartSelect(partId: string) {
    const p = parts.find(x => String(x.id) === partId);
    setForm(f => ({ ...f, stockItemId: partId, stockItemName: p?.name ?? "", unit: p?.unit ?? f.unit, supplierId: p?.defaultSupplierId ? String(p.defaultSupplierId) : f.supplierId, unitCostPence: p?.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : f.unitCostPence }));
  }

  const filtered = statusFilter === "all" ? returns : returns.filter(r => r.status === statusFilter);
  const totalCreditPending = returns.filter(r => ["raised", "dispatched", "awaiting-credit"].includes(r.status) && r.unitCostPence && r.quantity)
    .reduce((sum, r) => sum + Math.round((r.unitCostPence! / 100) * parseFloat(r.quantity)), 0);

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(["all", ...Object.keys(RETURN_STATUS)] as string[]).map(s => {
            const badge = RETURN_STATUS[s];
            const count = s === "all" ? returns.length : returns.filter(r => r.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", statusFilter === s ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
                {badge?.label ?? "All Returns"} {count > 0 && <span className={cn("ml-1 rounded-full px-1.5 py-0.5 text-xs", statusFilter === s ? "bg-white/20" : "bg-gray-100")}>{count}</span>}
              </button>
            );
          })}
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-1" />New Return</Button>
      </div>

      {/* Credit pending banner */}
      {totalCreditPending > 0 && (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 text-sm text-purple-800">
          <Info className="h-4 w-4 text-purple-500 shrink-0" />
          <span>Outstanding credit due from suppliers: <strong>~£{totalCreditPending.toFixed(2)}</strong></span>
        </div>
      )}

      {/* Register table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ArrowUpFromLine className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500 mb-1">{statusFilter === "all" ? "No goods returns logged yet" : `No returns with status "${RETURN_STATUS[statusFilter]?.label}"`}</p>
          <p className="text-sm">Use "New Return" to log a return to a supplier and track the credit.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["RTN Ref", "Date", "Part / Item", "Qty", "Supplier", "Reason", "Status", "Supplier RTN", "Credit Due", ""].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => {
                const st = RETURN_STATUS[r.status] ?? { label: r.status, colour: "bg-gray-100 text-gray-600" };
                const creditDue = r.unitCostPence && r.quantity ? `£${((r.unitCostPence / 100) * parseFloat(r.quantity)).toFixed(2)}` : "—";
                return (
                  <tr key={r.id} className="hover:bg-gray-50/80 cursor-pointer" onClick={() => openEdit(r)}>
                    <td className="px-3 py-3"><span className="font-mono text-xs font-semibold text-primary">{r.returnRef}</span></td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(r.raisedAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900 text-xs">{r.stockItemName || "—"}</p>
                      {r.originalDeliveryRef && <p className="text-xs text-gray-400 font-mono">{r.originalDeliveryRef}</p>}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{r.quantity}{r.unit ? ` ${r.unit}` : ""}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{r.supplierName || "—"}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{RETURN_REASON_CODES[r.returnReasonCode] ?? r.returnReasonCode}</td>
                    <td className="px-3 py-3"><span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", st.colour)}>{st.label}</span></td>
                    <td className="px-3 py-3 text-gray-500 text-xs font-mono">{r.supplierRtnNumber || <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{r.creditAmountPence ? `£${(r.creditAmountPence / 100).toFixed(2)}` : creditDue}</td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => deleteReturn.mutate(r.id)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── New Return dialog ── */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent style={{ maxWidth: "48rem" }}>
          <DialogHeader><DialogTitle>Raise Goods Return</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Part from Store</Label>
              <Select value={form.stockItemId || "__none__"} onValueChange={v => v === "__none__" ? setF("stockItemId", "") : handlePartSelect(v)}>
                <SelectTrigger><SelectValue placeholder="Select part…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select a part —</SelectItem>
                  {parts.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}{p.productCode ? ` (${p.productCode})` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {!form.stockItemId && (
              <div className="col-span-2">
                <Label>Part / Item Description <span className="text-gray-400 font-normal">(if not in parts store)</span></Label>
                <Input value={form.stockItemName} onChange={e => setF("stockItemName", e.target.value)} placeholder="e.g. Hydraulic hose assembly" />
              </div>
            )}
            <div>
              <Label>Quantity to Return *</Label>
              <Input type="number" step="0.01" min="0.01" value={form.quantity} onChange={e => setF("quantity", e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit} onChange={e => setF("unit", e.target.value)} placeholder="e.g. each, kg, m" />
            </div>
            <div>
              <Label>Unit Cost (£)</Label>
              <Input type="number" step="0.01" value={form.unitCostPence} onChange={e => setF("unitCostPence", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Supplier</Label>
              <Select value={form.supplierId || "__none__"} onValueChange={v => setF("supplierId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Return Reason *</Label>
              <Select value={form.returnReasonCode} onValueChange={v => setF("returnReasonCode", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(RETURN_REASON_CODES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Original Delivery Ref <span className="text-gray-400 font-normal">(GRN number)</span></Label>
              <Input value={form.originalDeliveryRef} onChange={e => setF("originalDeliveryRef", e.target.value)} placeholder="e.g. GRN-WS-202603-001" />
            </div>
            <div className="col-span-2">
              <Label>Reason Details</Label>
              <Textarea value={form.returnReason} onChange={e => setF("returnReason", e.target.value)} rows={2} placeholder="Describe the specific issue, e.g. bearing seized on first use" />
            </div>
            <div>
              <Label>Raised By</Label>
              <Input value={form.raisedBy} onChange={e => setF("raisedBy", e.target.value)} />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={e => setF("notes", e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Stock level will be automatically decremented when the return is raised.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={() => createReturn.mutate({ ...form, unitCostPence: form.unitCostPence ? String(Math.round(parseFloat(form.unitCostPence) * 100)) : "" })}
              disabled={createReturn.isPending || !form.quantity || !form.returnReasonCode || (!form.stockItemId && !form.stockItemName)}>
              {createReturn.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Raise Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Update Return dialog ── */}
      <Dialog open={!!editReturn} onOpenChange={open => { if (!open) setEditReturn(null); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Update Return
              {editReturn && <span className="font-mono text-primary text-base">{editReturn.returnRef}</span>}
            </DialogTitle>
          </DialogHeader>
          {editReturn && (
            <>
              {/* Read-only summary */}
              <div className="rounded-lg bg-gray-50 border px-4 py-3 text-sm space-y-1">
                <div className="flex gap-4 flex-wrap text-xs text-gray-500">
                  <span><strong className="text-gray-700">Part:</strong> {editReturn.stockItemName || "—"}</span>
                  <span><strong className="text-gray-700">Qty:</strong> {editReturn.quantity}{editReturn.unit ? ` ${editReturn.unit}` : ""}</span>
                  <span><strong className="text-gray-700">Reason:</strong> {RETURN_REASON_CODES[editReturn.returnReasonCode] ?? editReturn.returnReasonCode}</span>
                  {editReturn.supplierName && <span><strong className="text-gray-700">Supplier:</strong> {editReturn.supplierName}</span>}
                </div>
                {editReturn.returnReason && <p className="text-xs text-gray-500 italic">{editReturn.returnReason}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="col-span-2">
                  <Label>Supplier RTN Number</Label>
                  <Input value={editForm.supplierRtnNumber} onChange={e => setEF("supplierRtnNumber", e.target.value)} placeholder="Supplier's own return reference" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={v => setEF("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(RETURN_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dispatched Date</Label>
                  <Input type="date" max={new Date().toISOString().slice(0, 10)} value={editForm.dispatchedAt} onChange={e => setEF("dispatchedAt", e.target.value)} />
                </div>
                <div>
                  <Label>Credit Amount Received (£)</Label>
                  <Input type="number" step="0.01" value={editForm.creditAmountPence} onChange={e => setEF("creditAmountPence", e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Credit Received Date</Label>
                  <Input type="date" max={new Date().toISOString().slice(0, 10)} value={editForm.creditReceivedAt} onChange={e => setEF("creditReceivedAt", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea value={editForm.notes} onChange={e => setEF("notes", e.target.value)} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditReturn(null)}>Cancel</Button>
                <Button onClick={() => updateReturn.mutate({ id: editReturn.id, body: {
                  supplierRtnNumber: editForm.supplierRtnNumber || null,
                  status: editForm.status,
                  dispatchedAt: editForm.dispatchedAt || null,
                  creditAmountPence: editForm.creditAmountPence ? String(Math.round(parseFloat(editForm.creditAmountPence) * 100)) : null,
                  creditReceivedAt: editForm.creditReceivedAt || null,
                  notes: editForm.notes || null,
                }})} disabled={updateReturn.isPending}>
                  {updateReturn.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function printQRLabel(qrValue: string, title: string, subtitle: string = "") {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>QR Label — ${title}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
  .label{width:200px;border:1.5px solid #333;border-radius:6px;padding:12px;text-align:center;page-break-inside:avoid}
  .label h2{font-size:13px;margin:10px 0 4px;word-break:break-word}
  .label p{font-size:10px;color:#555;margin:2px 0}
  .label .url{font-size:8px;color:#999;margin-top:6px;word-break:break-all}
  button{display:block;margin:20px auto;padding:8px 20px;background:#16a34a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px}
  @media print{button{display:none}body{min-height:auto}}
</style></head><body>
<div>
  <div class="label">
    <div id="qr"></div>
    <h2>${title}</h2>
    ${subtitle ? `<p>${subtitle}</p>` : ""}
    <p class="url">${qrValue}</p>
  </div>
  <button onclick="window.print()">🖨 Print</button>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script>new QRCode(document.getElementById('qr'),{text:"${qrValue.replace(/"/g, '\\"')}",width:160,height:160,correctLevel:QRCode.CorrectLevel.M})<\/script>
</body></html>`);
  w.document.close();
}

function fmtStocktakeQty(qty: string | null, unit: string | null): string {
  if (qty === null || qty === undefined) return "—";
  const n = parseFloat(qty);
  if (isNaN(n)) return "—";
  return WHOLE_UNITS.includes((unit ?? "").toLowerCase()) ? String(Math.round(n)) : n.toFixed(2);
}

function printBlankStocktakeSheet(items: { partName: string; partNumber: string | null; unit: string | null; location: string | null; expectedQty: string }[], date: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  const rows = items.map((item, i) => `<tr>
    <td>${i + 1}</td>
    <td><strong>${item.partName}</strong></td>
    <td class="mono">${item.partNumber || ""}</td>
    <td>${item.location || ""}</td>
    <td>${item.unit || ""}</td>
    <td class="right">${fmtStocktakeQty(item.expectedQty, item.unit)}</td>
    <td class="count-col"></td>
    <td class="notes-col"></td>
  </tr>`).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>Blank Stocktake — ${date}</title>
<style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;font-size:10px;color:#000}h1{font-size:15px;margin:0 0 3px}.meta{font-size:10px;color:#555;margin-bottom:10px}table{width:100%;border-collapse:collapse}th{background:#f0f0f0;border:1px solid #ccc;padding:4px 6px;text-align:left;font-size:9px;text-transform:uppercase}td{border:1px solid #ddd;padding:5px 6px}.right{text-align:right}.mono{font-family:monospace}.count-col{width:80px;background:#f8fff8}.notes-col{width:120px}button{display:block;margin:14px auto;padding:8px 24px;background:#16a34a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px}@media print{button{display:none}}</style></head><body>
<h1>Parts Store Stocktake — Blank Count Sheet</h1>
<p class="meta">Stocktake Date: ${date} &nbsp;|&nbsp; Printed: ${new Date().toLocaleDateString("en-GB")} &nbsp;|&nbsp; Counter:_______________ &nbsp;|&nbsp; Signed:_______________</p>
<table><thead><tr><th style="width:24px">#</th><th>Part Name</th><th>Part No.</th><th>Location</th><th>Unit</th><th class="right">System Qty</th><th class="count-col">Count</th><th class="notes-col">Notes</th></tr></thead><tbody>${rows}</tbody></table>
<button onclick="window.print()">🖨 Print</button></body></html>`);
  w.document.close();
}

function printStocktakeReport(session: { stocktakeDate: string; notes?: string | null; items?: { partName: string; partNumber: string | null; unit: string | null; location: string | null; expectedQty: string; countedQty: string | null; variance: string | null; varianceValue: string | null; unitCostPence: number | null }[] }) {
  const items = session.items ?? [];
  const w = window.open("", "_blank");
  if (!w) return;
  const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
  const shortfalls = items.filter(i => i.variance !== null && parseFloat(i.variance) < 0).length;
  const surplus = items.filter(i => i.variance !== null && parseFloat(i.variance) > 0).length;
  const rows = items.map((item, idx) => {
    const varNum = item.variance !== null ? parseFloat(item.variance) : null;
    const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue!) : null;
    const rowColor = varNum === null ? "" : varNum < 0 ? "background:#fff0f0" : varNum > 0 ? "background:#fffbe8" : "";
    const varClass = varNum === null ? "grey" : varNum < 0 ? "red" : varNum > 0 ? "amber" : "grn";
    const varValClass = varVal === null ? "grey" : varVal < 0 ? "red" : "";
    return `<tr style="${rowColor}"><td>${idx + 1}</td><td><strong>${item.partName}</strong></td><td class="mono">${item.partNumber || ""}</td><td>${item.location || ""}</td><td>${item.unit || ""}</td><td class="right">${fmtStocktakeQty(item.expectedQty, item.unit)}</td><td class="right ${item.countedQty !== null ? "" : "grey"}">${fmtStocktakeQty(item.countedQty, item.unit)}</td><td class="right ${varClass}">${varNum === null ? "—" : (varNum >= 0 ? "+" : "") + fmtStocktakeQty(String(varNum), item.unit)}</td><td class="right ${varValClass}">${varVal === null ? "—" : (varVal >= 0 ? "+" : "") + "£" + Math.abs(varVal).toFixed(2)}</td></tr>`;
  }).join("");
  w.document.write(`<!DOCTYPE html><html><head><title>Stocktake Report — ${session.stocktakeDate}</title>
<style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;font-size:9px;color:#000}h1{font-size:14px;margin:0 0 3px}.meta{font-size:9px;color:#555;margin-bottom:8px}.summary{display:flex;gap:20px;margin-bottom:10px;padding:6px 12px;background:#f5f5f5;border-radius:4px}.summary div{text-align:center}.lbl{font-size:8px;color:#888;text-transform:uppercase}.val{font-size:13px;font-weight:bold}table{width:100%;border-collapse:collapse}th{background:#e8e8e8;border:1px solid #bbb;padding:3px 5px;text-align:left;font-size:8px;text-transform:uppercase}td{border:1px solid #ddd;padding:3px 5px}.right{text-align:right}.mono{font-family:monospace}.red{color:#b91c1c;font-weight:bold}.amber{color:#b45309;font-weight:bold}.grn{color:#15803d}.grey{color:#aaa}button{display:block;margin:12px auto;padding:8px 24px;background:#16a34a;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px}@media print{button{display:none}}</style></head><body>
<h1>Parts Store Stocktake Report</h1>
<p class="meta">Date: ${session.stocktakeDate} &nbsp;|&nbsp; Status: Completed &nbsp;|&nbsp; Printed: ${new Date().toLocaleDateString("en-GB")}${session.notes ? " &nbsp;|&nbsp; " + session.notes : ""}</p>
<div class="summary"><div><div class="lbl">Total Parts</div><div class="val">${items.length}</div></div><div><div class="lbl">Shortfalls</div><div class="val" style="color:#b91c1c">${shortfalls}</div></div><div><div class="lbl">Surplus</div><div class="val" style="color:#b45309">${surplus}</div></div><div><div class="lbl">Total Variance</div><div class="val" style="color:${totalVar < 0 ? "#b91c1c" : totalVar > 0 ? "#b45309" : "#15803d"}">${totalVar >= 0 ? "+" : ""}£${Math.abs(totalVar).toFixed(2)}</div></div></div>
<table><thead><tr><th style="width:22px">#</th><th>Part Name</th><th>Part No.</th><th>Location</th><th>Unit</th><th class="right">System</th><th class="right">Counted</th><th class="right">Variance</th><th class="right">Variance £</th></tr></thead><tbody>${rows}</tbody></table>
<button onclick="window.print()">🖨 Print</button></body></html>`);
  w.document.close();
}

function LocationManager({ farmId, onClose }: { farmId: number; onClose: () => void }) {
  const qc = useQueryClient();
  const inv = () => { qc.invalidateQueries({ queryKey: ["workshop-rows-lm", farmId] }); qc.invalidateQueries({ queryKey: ["workshop-rows", farmId] }); };

  const [rowForm, setRowForm] = useState({ name: "", description: "" });
  const [editingRow, setEditingRow] = useState<WorkshopRow | null>(null);
  const [bayFormByRow, setBayFormByRow] = useState<Record<string, { name: string; description: string }>>({});
  const [editingBay, setEditingBay] = useState<WorkshopBay | null>(null);
  const [shelfFormByBay, setShelfFormByBay] = useState<Record<number, { name: string; capacity: string }>>({});
  const [editingShelf, setEditingShelf] = useState<{ id: number; name: string; capacity: string } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedBays, setExpandedBays] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery<{ rows: WorkshopRow[]; unassignedBays: WorkshopBay[] }>({
    queryKey: ["workshop-rows-lm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/rows`), { credentials: "include" }).then(r => r.json()),
  });
  const lmRows = data?.rows ?? [];
  const unassignedBays = data?.unassignedBays ?? [];

  const createRow = useMutation({ mutationFn: (b: { name: string; description: string }) => fetch(api(`farms/${farmId}/workshop/rows`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { inv(); setRowForm({ name: "", description: "" }); } });
  const updateRow = useMutation({ mutationFn: ({ id, ...b }: { id: number; name: string; description: string }) => fetch(api(`farms/${farmId}/workshop/rows/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { inv(); setEditingRow(null); } });
  const deleteRow = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/rows/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()), onSuccess: inv });

  const createBay = useMutation({ mutationFn: (b: { name: string; description: string; rowId?: number }) => fetch(api(`farms/${farmId}/workshop/bays`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: (_d: unknown, vars: { name: string; description: string; rowId?: number }) => { inv(); const k = vars.rowId ? `r-${vars.rowId}` : "unassigned"; setBayFormByRow(f => ({ ...f, [k]: { name: "", description: "" } })); } });
  const updateBay = useMutation({ mutationFn: ({ id, ...b }: { id: number; name: string; description: string; rowId?: number }) => fetch(api(`farms/${farmId}/workshop/bays/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { inv(); setEditingBay(null); } });
  const deleteBay = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/bays/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()), onSuccess: inv });

  const createShelf = useMutation({ mutationFn: ({ bayId, name, capacity }: { bayId: number; name: string; capacity: string }) => fetch(api(`farms/${farmId}/workshop/bays/${bayId}/shelves`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, capacity: capacity || null }) }).then(r => r.json()), onSuccess: (_d: unknown, vars: { bayId: number; name: string; capacity: string }) => { inv(); setShelfFormByBay(f => ({ ...f, [vars.bayId]: { name: "", capacity: "" } })); } });
  const updateShelf = useMutation({ mutationFn: ({ id, ...b }: { id: number; name: string; capacity: string }) => fetch(api(`farms/${farmId}/workshop/shelves/${id}`), { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { inv(); setEditingShelf(null); } });
  const deleteShelf = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/shelves/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()), onSuccess: inv });

  function toggleRow(key: string) { setExpandedRows(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; }); }
  function toggleBay(id: number) { setExpandedBays(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  function renderShelves(bay: WorkshopBay, rowLabel: string) {
    const sf = shelfFormByBay[bay.id] ?? { name: "", capacity: "" };
    return (
      <div className="pl-6 pr-3 py-3 space-y-2 bg-white border-t border-gray-100">
        {bay.shelves.length === 0 && <p className="text-xs text-gray-400 italic">No shelves in this bay yet.</p>}
        {bay.shelves.map(shelf => (
          <div key={shelf.id} className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
            <div className="flex-1 min-w-0">
              {editingShelf?.id === shelf.id ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Input className="h-7 text-xs flex-1 min-w-[120px]" value={editingShelf.name} onChange={e => setEditingShelf(s => s ? { ...s, name: e.target.value } : s)} autoFocus placeholder="Shelf name" />
                  <Input className="h-7 text-xs w-28" value={editingShelf.capacity} onChange={e => setEditingShelf(s => s ? { ...s, capacity: e.target.value } : s)} placeholder="Capacity (optional)" />
                  <Button size="sm" className="h-7 text-xs" onClick={() => updateShelf.mutate({ id: shelf.id, name: editingShelf.name, capacity: editingShelf.capacity })} disabled={updateShelf.isPending}>Save</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingShelf(null)}>Cancel</Button>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium text-gray-900">{shelf.name}</span>
                  {shelf.capacity && <span className="ml-2 text-xs text-gray-400">Cap: {shelf.capacity}</span>}
                  <p className="text-xs text-gray-400 mt-0.5">{rowLabel} / {bay.name} / {shelf.name}</p>
                </div>
              )}
            </div>
            {editingShelf?.id !== shelf.id && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => printQRLabel(`${window.location.origin}/dashboard/workshop?shelf=${shelf.qrToken}`, `${bay.name} / ${shelf.name}`, rowLabel)} className="p-1.5 text-gray-400 hover:text-primary rounded" title="Print QR label"><Printer className="h-3.5 w-3.5" /></button>
                <button onClick={() => setEditingShelf({ id: shelf.id, name: shelf.name, capacity: shelf.capacity ?? "" })} className="p-1.5 text-gray-400 hover:text-gray-700 rounded"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => deleteShelf.mutate(shelf.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="h-3 w-3" /></button>
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <Input className="h-7 text-xs flex-1" placeholder="New shelf name, e.g. Shelf A1…" value={sf.name} onChange={e => setShelfFormByBay(f => ({ ...f, [bay.id]: { ...sf, name: e.target.value } }))} onKeyDown={e => { if (e.key === "Enter" && sf.name.trim()) createShelf.mutate({ bayId: bay.id, name: sf.name, capacity: sf.capacity }); }} />
          <Input className="h-7 text-xs w-24" placeholder="Capacity" value={sf.capacity} onChange={e => setShelfFormByBay(f => ({ ...f, [bay.id]: { ...sf, capacity: e.target.value } }))} />
          <Button size="sm" className="h-7 text-xs shrink-0" disabled={!sf.name.trim() || createShelf.isPending} onClick={() => createShelf.mutate({ bayId: bay.id, name: sf.name, capacity: sf.capacity })}>
            {createShelf.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3 mr-1" />Add Shelf</>}
          </Button>
        </div>
      </div>
    );
  }

  function renderBays(bayList: WorkshopBay[], rowKey: string, rowLabel: string, rowId?: number) {
    const bf = bayFormByRow[rowKey] ?? { name: "", description: "" };
    return (
      <div className="pl-4 space-y-2 py-3 bg-gray-50/60">
        {bayList.length === 0 && <p className="text-xs text-gray-400 italic pl-2">No bays in this row yet.</p>}
        {bayList.map(bay => (
          <div key={bay.id} className="rounded-md border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80">
              <button onClick={() => toggleBay(bay.id)} className="shrink-0 text-gray-400 hover:text-gray-600">
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expandedBays.has(bay.id) ? "rotate-180" : "")} />
              </button>
              {editingBay?.id === bay.id ? (
                <div className="flex flex-1 items-center gap-2 flex-wrap">
                  <Input className="h-7 text-xs flex-1 min-w-[100px]" value={editingBay.name} onChange={e => setEditingBay(b => b ? { ...b, name: e.target.value } : b)} autoFocus />
                  <Input className="h-7 text-xs w-36" value={editingBay.description ?? ""} onChange={e => setEditingBay(b => b ? { ...b, description: e.target.value } : b)} placeholder="Description" />
                  <Button size="sm" className="h-7 text-xs" onClick={() => updateBay.mutate({ id: bay.id, name: editingBay.name, description: editingBay.description ?? "", rowId })} disabled={updateBay.isPending}>Save</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingBay(null)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800">{bay.name}</span>
                  {bay.description && <span className="text-xs text-gray-400">{bay.description}</span>}
                  <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-1.5 py-0.5">{bay.shelves.length} shelf{bay.shelves.length !== 1 ? "ves" : ""}</span>
                </div>
              )}
              {editingBay?.id !== bay.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditingBay(bay); setExpandedBays(s => new Set([...s, bay.id])); }} className="p-1 text-gray-400 hover:text-gray-700 rounded"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => deleteBay.mutate(bay.id)} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="h-3 w-3" /></button>
                </div>
              )}
            </div>
            {expandedBays.has(bay.id) && renderShelves(bay, rowLabel)}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <Input className="h-7 text-xs flex-1" placeholder="New bay name, e.g. Bay 1…" value={bf.name} onChange={e => setBayFormByRow(f => ({ ...f, [rowKey]: { ...bf, name: e.target.value } }))} onKeyDown={e => { if (e.key === "Enter" && bf.name.trim()) createBay.mutate({ name: bf.name, description: bf.description, rowId }); }} />
          <Input className="h-7 text-xs w-36" placeholder="Description (opt.)" value={bf.description} onChange={e => setBayFormByRow(f => ({ ...f, [rowKey]: { ...bf, description: e.target.value } }))} />
          <Button size="sm" className="h-7 text-xs shrink-0" disabled={!bf.name.trim() || createBay.isPending} onClick={() => createBay.mutate({ name: bf.name, description: bf.description, rowId })}>
            {createBay.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3 mr-1" />Add Bay</>}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" />Parts Store Location Manager</DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">Organise storage into Rows → Bays → Shelves. Each shelf gets a unique QR code for rapid scanning during stocktakes and parts issuance.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Add Row form */}
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add New Row</p>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Row Name *</Label>
                <Input className="h-8 text-sm mt-1" placeholder="e.g. Row A, North Aisle" value={rowForm.name} onChange={e => setRowForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => { if (e.key === "Enter" && rowForm.name.trim()) createRow.mutate(rowForm); }} />
              </div>
              <div className="flex-1 min-w-[140px]">
                <Label className="text-xs">Description (optional)</Label>
                <Input className="h-8 text-sm mt-1" placeholder="e.g. Main racking aisle" value={rowForm.description} onChange={e => setRowForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button size="sm" className="h-8 shrink-0" disabled={!rowForm.name.trim() || createRow.isPending} onClick={() => createRow.mutate(rowForm)}>
                {createRow.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5 mr-1" />Add Row</>}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-gray-300 mx-auto" /></div>
          ) : lmRows.length === 0 && unassignedBays.length === 0 ? (
            <div className="py-10 text-center">
              <QrCode className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No storage locations set up yet</p>
              <p className="text-xs text-gray-400 mt-1">Add your first Row above, then create Bays within it, and Shelves within each Bay</p>
            </div>
          ) : (
            <>
              {lmRows.map(row => (
                <div key={row.id} className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
                    <button onClick={() => toggleRow(`r-${row.id}`)} className="shrink-0 text-gray-400 hover:text-gray-600">
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRows.has(`r-${row.id}`) ? "rotate-180" : "")} />
                    </button>
                    {editingRow?.id === row.id ? (
                      <div className="flex flex-1 items-center gap-2 flex-wrap">
                        <Input className="h-8 text-sm flex-1 min-w-[100px]" value={editingRow.name} onChange={e => setEditingRow(r => r ? { ...r, name: e.target.value } : r)} autoFocus />
                        <Input className="h-8 text-sm flex-1 min-w-[100px]" value={editingRow.description ?? ""} onChange={e => setEditingRow(r => r ? { ...r, description: e.target.value } : r)} placeholder="Description" />
                        <Button size="sm" className="h-8 text-xs" onClick={() => updateRow.mutate({ id: row.id, name: editingRow.name, description: editingRow.description ?? "" })} disabled={updateRow.isPending}>Save</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditingRow(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">{row.name}</span>
                        {row.description && <span className="text-xs text-gray-400">{row.description}</span>}
                        <span className="text-xs text-primary/70 bg-primary/10 rounded-full px-2 py-0.5">{row.bays.length} bay{row.bays.length !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {editingRow?.id !== row.id && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => { setEditingRow(row); setExpandedRows(s => new Set([...s, `r-${row.id}`])); }} className="p-1 text-gray-400 hover:text-gray-700 rounded"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteRow.mutate(row.id)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Delete row (bays become unassigned)"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                  {expandedRows.has(`r-${row.id}`) && renderBays(row.bays, `r-${row.id}`, row.name, row.id)}
                </div>
              ))}
              {unassignedBays.length > 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50">
                    <button onClick={() => toggleRow("unassigned")} className="shrink-0 text-gray-400 hover:text-gray-600">
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expandedRows.has("unassigned") ? "rotate-180" : "")} />
                    </button>
                    <span className="flex-1 text-sm font-medium text-gray-500">Unassigned Bays</span>
                    <span className="text-xs text-gray-400">{unassignedBays.length} bay{unassignedBays.length !== 1 ? "s" : ""} — not in any row</span>
                  </div>
                  {expandedRows.has("unassigned") && renderBays(unassignedBays, "unassigned", "Unassigned")}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const EMPTY_PART = { name: "", category: "", productCode: "", unit: "", reorderLevel: "", unitCostPence: "", unitSellPricePence: "", shelfId: "", defaultSupplierId: "", notes: "", supersededById: "", supersessionNotes: "", supersededAt: "", supersedesId: "" };

interface PartDoc {
  id: number;
  stockItemId: number;
  filename: string;
  storageKey: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  uploadedBy: string | null;
  uploadedAt: string;
}

function fileIcon(mimeType: string | null) {
  if (!mimeType) return <FileText className="h-4 w-4 text-gray-400" />;
  if (mimeType.startsWith("image/")) return <FileText className="h-4 w-4 text-blue-400" />;
  if (mimeType === "application/pdf") return <FileText className="h-4 w-4 text-red-400" />;
  return <FileText className="h-4 w-4 text-gray-400" />;
}

function fmtFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PartPanel({ farmId, part, onClose, onEdit }: {
  farmId: number;
  part: Part;
  onClose: () => void;
  onEdit: (p: Part) => void;
}) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedBy, setUploadedBy] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data: docs = [], isLoading: docsLoading } = useQuery<PartDoc[]>({
    queryKey: ["part-docs", part.id],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/parts/${part.id}/documents`), { credentials: "include" }).then(r => r.json()),
  });

  const deleteDoc = useMutation({
    mutationFn: (docId: number) => fetch(api(`farms/${farmId}/workshop/parts/${part.id}/documents/${docId}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["part-docs", part.id] }),
  });

  const saveDocMeta = useMutation({
    mutationFn: (body: { filename: string; storageKey: string; mimeType: string | null; fileSizeBytes: number | null; uploadedBy: string }) =>
      fetch(api(`farms/${farmId}/workshop/parts/${part.id}/documents`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["part-docs", part.id] });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: useCallback((response: { objectPath: string; metadata: { name: string; size: number; contentType: string } }) => {
      setUploadError(null);
      saveDocMeta.mutate({
        filename: response.metadata.name,
        storageKey: response.objectPath,
        mimeType: response.metadata.contentType || null,
        fileSizeBytes: response.metadata.size || null,
        uploadedBy: uploadedBy.trim() || "",
      });
    }, [uploadedBy, saveDocMeta]),
    onError: useCallback((err: Error) => setUploadError(err.message), []),
  });

  const qty = parseFloat(part.currentQuantity);
  const reorder = part.reorderLevel ? parseFloat(part.reorderLevel) : null;
  const isLow = reorder !== null && qty <= reorder;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b bg-gray-50 shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="font-semibold text-gray-900 leading-snug truncate">{part.name}</h2>
            {part.productCode && <p className="text-xs font-mono text-gray-400 mt-0.5">{part.productCode}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onEdit(part)} title="Edit part"><Pencil className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose} title="Close panel" aria-label="Close panel"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Stock level */}
          <div className={cn("mx-5 mt-4 rounded-lg px-4 py-3 flex items-center justify-between", isLow ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200")}>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Stock</p>
              <p className={cn("text-2xl font-bold mt-0.5", isLow ? "text-amber-700" : "text-green-700")}>
                {isNaN(qty) ? "—" : qty}{part.unit ? ` ${part.unit}` : ""}
              </p>
            </div>
            {isLow && (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-1">
                  <TriangleAlert className="h-3 w-3" />Low Stock
                </span>
                {reorder && <p className="text-xs text-amber-600 mt-1">Reorder at {reorder}{part.unit ? ` ${part.unit}` : ""}</p>}
              </div>
            )}
          </div>

          {/* Part details */}
          <div className="px-5 mt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Details</p>
            {[
              { label: "Category", value: part.category },
              { label: "Unit Cost", value: part.unitCostPence ? `£${(part.unitCostPence / 100).toFixed(2)} per ${part.unit ?? "unit"}` : null },
              { label: "Sell Price", value: part.unitSellPricePence ? `£${(part.unitSellPricePence / 100).toFixed(2)} per ${part.unit ?? "unit"}` : null },
              { label: "Default Supplier", value: part.supplierName },
              { label: "Reorder Level", value: reorder ? `${reorder}${part.unit ? ` ${part.unit}` : ""}` : null },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between text-sm">
                <span className="text-gray-500 shrink-0 w-32">{label}</span>
                <span className="text-gray-900 text-right">{value}</span>
              </div>
            ))}
            {(part.bayName || part.storageLocation) && (
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-500 shrink-0 w-32">Location</span>
                <span className="text-gray-900 text-right">
                  {part.bayName ? <>{part.rowName && <span className="text-gray-400">{part.rowName} / </span>}{part.bayName}{part.shelfName && <> / {part.shelfName}</>}</> : part.storageLocation}
                </span>
              </div>
            )}
            {part.notes && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 leading-relaxed">{part.notes}</div>
            )}
            {part.supersededById && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">This part has been superseded</p>
                    {part.supersededByName && (
                      <p className="text-xs text-amber-700 mt-0.5">
                        Replaced by: <span className="font-medium">{part.supersededByName}{part.supersededByProductCode && <span className="ml-1 font-mono font-normal text-amber-600">{part.supersededByProductCode}</span>}</span>
                      </p>
                    )}
                    {part.supersededAt && <p className="text-xs text-amber-600 mt-0.5">Effective: {new Date(part.supersededAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
                    {part.supersessionNotes && <p className="text-xs text-amber-700 mt-1 italic">{part.supersessionNotes}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Part QR Code */}
          <div className="px-5 mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Part QR Code</p>
              <button
                className="text-xs text-primary underline underline-offset-2 hover:no-underline flex items-center gap-1"
                onClick={() => {
                  const qrValue = `${window.location.origin}/dashboard/workshop?part=${part.id}`;
                  const w = window.open("", "_blank");
                  if (!w) return;
                  w.document.write(`<!DOCTYPE html><html><head><title>QR — ${part.name}</title><style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff}canvas,svg{width:180px!important;height:180px!important}h2{font-size:16px;margin-top:12px;text-align:center}p{font-size:11px;color:#666;margin:4px 0;text-align:center}@media print{button{display:none}}</style></head><body><div id="qr"></div><h2>${part.name}</h2>${part.productCode ? `<p>Code: ${part.productCode}</p>` : ""}<p style="font-size:9px;color:#999;margin-top:8px">${qrValue}</p><br><button onclick="window.print()">🖨 Print</button><script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script><script>new QRCode(document.getElementById('qr'),{text:"${qrValue}",width:180,height:180})<\/script></body></html>`);
                  w.document.close();
                }}
              >
                <Printer className="h-3.5 w-3.5" />Print Label
              </button>
            </div>
            <div className="flex items-center justify-center bg-white border rounded-lg p-4">
              <QRCodeSVG value={`${window.location.origin}/dashboard/workshop?part=${part.id}`} size={120} level="M" />
            </div>
            <p className="text-xs text-gray-400 text-center mt-1.5">Scan to open this part record</p>
          </div>

          {/* Documents */}
          <div className="px-5 mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Parts Documents</p>
              <span className="text-xs text-gray-400">Spec sheets, data sheets, fitting guides</span>
            </div>

            {docsLoading ? (
              <div className="py-4 text-center text-gray-300"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
            ) : docs.length === 0 ? (
              <div className="py-6 text-center text-gray-400 border-2 border-dashed rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No documents attached</p>
                <p className="text-xs mt-1">Upload spec sheets, fitting guides, or data sheets below</p>
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-gray-50 hover:bg-white transition-colors group">
                    <div className="shrink-0">{fileIcon(doc.mimeType)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                      <p className="text-xs text-gray-400">
                        {doc.uploadedBy ? `Uploaded by ${doc.uploadedBy} · ` : ""}
                        {new Date(doc.uploadedAt).toLocaleDateString("en-GB")}
                        {doc.fileSizeBytes ? ` · ${fmtFileSize(doc.fileSizeBytes)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`/api/storage${doc.storageKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        title="Open / download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove document"
                        onClick={() => deleteDoc.mutate(doc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            <div className="mt-4 rounded-lg border bg-gray-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Upload className="h-3.5 w-3.5" />Upload Document</p>
              <div>
                <Label className="text-xs">Uploaded By <span className="text-gray-400">(optional)</span></Label>
                <Input className="h-7 text-xs mt-1" value={uploadedBy} onChange={e => setUploadedBy(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <Label className="text-xs">File</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="mt-1 block w-full text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt"
                  disabled={isUploading || saveDocMeta.isPending}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { setUploadError(null); uploadFile(file); }
                  }}
                />
              </div>
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />Uploading… {progress > 0 ? `${Math.round(progress)}%` : ""}
                  </div>
                  {progress > 0 && (
                    <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
              )}
              {saveDocMeta.isPending && <p className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving…</p>}
              {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
              <p className="text-xs text-gray-400">PDF, Word, Excel, images accepted</p>
            </div>
          </div>

          <div className="h-8" />
        </div>
      </div>
    </>
  );
}

function PartsStoreTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();

  const [view, setView] = useState<"catalogue" | "history" | "returns" | "stocktake">("catalogue");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showSuperseded, setShowSuperseded] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [form, setForm] = useState<Record<string, string>>(EMPTY_PART);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receivePart, setReceivePart] = useState<Part | null>(null);
  const [receiveForm, setReceiveForm] = useState({ qty: "", unitCostPence: "", supplierId: "", invoiceRef: "", date: new Date().toISOString().slice(0, 10), notes: "", performedBy: "" });
  const [useOpen, setUseOpen] = useState(false);
  const [usePart, setUsePart] = useState<Part | null>(null);
  const [useForm, setUseForm] = useState({ qty: "", jobId: "", performedBy: "", notes: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [locationManagerOpen, setLocationManagerOpen] = useState(false);
  const [formBayId, setFormBayId] = useState<string>("");
  const [formRowId, setFormRowId] = useState<string>("");

  const { data: parts = [], isLoading } = useQuery<Part[]>({ queryKey: ["workshop-parts", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts`), { credentials: "include" }).then(r => r.json()) });
  const { data: bays = [] } = useQuery<WorkshopBay[]>({ queryKey: ["workshop-bays", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/bays`), { credentials: "include" }).then(r => r.json()) });
  const { data: rowsData } = useQuery<{ rows: WorkshopRow[]; unassignedBays: WorkshopBay[] }>({ queryKey: ["workshop-rows", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/rows`), { credentials: "include" }).then(r => r.json()) });
  const rows = rowsData?.rows ?? [];
  const hasUnassignedBays = (rowsData?.unassignedBays ?? []).length > 0;
  const { data: movements = [] } = useQuery<Movement[]>({ queryKey: ["workshop-parts-movements", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts/movements`), { credentials: "include" }).then(r => r.json()), enabled: view === "history" });
  const { data: jobsData } = useQuery<{ jobs: { job: { id: number; jobNumber: string; title: string; status: string } }[] }>({ queryKey: ["workshop-jobs", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()) });
  const { data: suppliersData } = useQuery<any[]>({ queryKey: ["suppliers-list", farmId], queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => { if (!r.ok) return []; return r.json().then(d => Array.isArray(d) ? d : []); }) });

  const openJobs = (jobsData?.jobs ?? []).filter(j => !["completed", "cancelled"].includes(j.job.status));
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const savePart = useMutation({
    mutationFn: async (body: Record<string, string>) => {
      const supplierId = body.defaultSupplierId && body.defaultSupplierId !== "__none__" ? body.defaultSupplierId : null;
      const payload = { ...body, unitCostPence: body.unitCostPence ? Math.round(parseFloat(body.unitCostPence) * 100) : null, unitSellPricePence: body.unitSellPricePence ? Math.round(parseFloat(body.unitSellPricePence) * 100) : null, reorderLevel: body.reorderLevel || null, shelfId: body.shelfId || null, defaultSupplierId: supplierId };
      const url = editing ? api(`farms/${farmId}/workshop/parts/${editing.id}`) : api(`farms/${farmId}/workshop/parts`);
      return fetch(url, { method: editing ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); setAddOpen(false); setEditing(null); setForm(EMPTY_PART); setFormBayId(""); },
  });

  const deletePart = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/parts/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); setDeleteId(null); },
  });

  const receive = useMutation({
    mutationFn: (body: Record<string, string>) => fetch(api(`farms/${farmId}/workshop/parts/receive`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockItemId: receivePart?.id, quantity: body.qty, supplierId: body.supplierId || null, unitCostPence: body.unitCostPence || null, invoiceReference: body.invoiceRef, deliveryDate: body.date, notes: body.notes, performedBy: body.performedBy }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); qc.invalidateQueries({ queryKey: ["workshop-parts-movements", farmId] }); setReceiveOpen(false); setReceiveForm({ qty: "", unitCostPence: "", supplierId: "", invoiceRef: "", date: new Date().toISOString().slice(0, 10), notes: "", performedBy: "" }); },
  });

  const useParts = useMutation({
    mutationFn: (body: Record<string, string>) => fetch(api(`farms/${farmId}/workshop/parts/use`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockItemId: usePart?.id, quantity: body.qty, jobId: body.jobId || null, performedBy: body.performedBy, notes: body.notes }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); qc.invalidateQueries({ queryKey: ["workshop-parts-movements", farmId] }); qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }); setUseOpen(false); setUseForm({ qty: "", jobId: "", performedBy: "", notes: "" }); },
  });

  const lowStock = parts.filter(p => p.reorderLevel && parseFloat(p.currentQuantity) <= parseFloat(p.reorderLevel));

  const supersededCount = parts.filter(p => p.supersededById).length;
  const filteredParts = parts.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.productCode ?? "").toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q) || (p.storageLocation ?? "").toLowerCase().includes(q) || (p.shelfName ?? "").toLowerCase().includes(q) || (p.bayName ?? "").toLowerCase().includes(q) || (p.rowName ?? "").toLowerCase().includes(q);
    const matchesCat = catFilter === "all" || p.category === catFilter;
    const matchesSuperseded = showSuperseded || !p.supersededById;
    return matchesSearch && matchesCat && matchesSuperseded;
  });

  function openAdd() { setEditing(null); setForm(EMPTY_PART); setFormBayId(""); setFormRowId(""); setAddOpen(true); }
  function openEdit(p: Part) { setEditing(p); setForm({ name: p.name, category: p.category ?? "", productCode: p.productCode ?? "", unit: p.unit ?? "", reorderLevel: p.reorderLevel ?? "", unitCostPence: p.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : "", unitSellPricePence: p.unitSellPricePence ? (p.unitSellPricePence / 100).toFixed(2) : "", shelfId: p.shelfId ? String(p.shelfId) : "", defaultSupplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", notes: p.notes ?? "", supersededById: p.supersededById ? String(p.supersededById) : "", supersessionNotes: p.supersessionNotes ?? "", supersededAt: p.supersededAt ?? "", supersedesId: "" }); setFormRowId(p.rowId ? String(p.rowId) : ""); setFormBayId(p.bayId ? String(p.bayId) : ""); setAddOpen(true); setSelectedPart(null); }
  function openReceive(p: Part) { setReceivePart(p); setReceiveForm({ qty: "", unitCostPence: p.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : "", supplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", invoiceRef: "", date: new Date().toISOString().slice(0, 10), notes: "", performedBy: "" }); setReceiveOpen(true); }
  function openUse(p: Part) { setUsePart(p); setUseForm({ qty: "", jobId: "", performedBy: "", notes: "" }); setUseOpen(true); }

  function fmtQty(qty: string, unit: string | null) { const n = parseFloat(qty); return `${isNaN(n) ? 0 : n}${unit ? ` ${unit}` : ""}`; }
  function fmtCost(pence: number | null) { return pence ? `£${(pence / 100).toFixed(2)}` : "—"; }
  function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

  if (isLoading) return <div className="py-12 text-center text-gray-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {/* Sub-nav + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setView("catalogue")} className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "catalogue" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
            <Package className="h-3 w-3 inline-block mr-1" />Parts Catalogue
          </button>
          <button onClick={() => setView("history")} className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "history" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
            <History className="h-3 w-3 inline-block mr-1" />Movement History
          </button>
          <button onClick={() => setView("returns")} className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "returns" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
            <ArrowUpFromLine className="h-3 w-3 inline-block mr-1" />Goods Returns
          </button>
          <button onClick={() => setView("stocktake")} className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", view === "stocktake" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
            <Package className="h-3 w-3 inline-block mr-1" />Stocktake
          </button>
        </div>
        {view === "catalogue" && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setLocationManagerOpen(true)}>
              <QrCode className="h-4 w-4 mr-1" />Manage Locations
            </Button>
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Part</Button>
          </div>
        )}
      </div>

      {/* Low-stock alert banner */}
      {view === "catalogue" && lowStock.length > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
          <TriangleAlert className="h-4 w-4 text-amber-500 shrink-0" />
          <span><strong>{lowStock.length} part{lowStock.length > 1 ? "s" : ""}</strong> at or below reorder level: {lowStock.map(p => p.name).join(", ")}</span>
        </div>
      )}

      {/* Search + filter bar */}
      {view === "catalogue" && parts.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Search parts by name, code, category or location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <select
            className="h-8 text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {PART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {supersededCount > 0 && (
            <button
              onClick={() => setShowSuperseded(v => !v)}
              className={cn("h-8 text-xs px-2.5 rounded-md border flex items-center gap-1.5 whitespace-nowrap", showSuperseded ? "bg-amber-50 border-amber-200 text-amber-700" : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300")}
            >
              <History className="h-3.5 w-3.5" />
              {showSuperseded ? "Hiding superseded" : `${supersededCount} superseded`}
            </button>
          )}
          {(search || catFilter !== "all" || showSuperseded) && (
            <span className="text-xs text-gray-400">{filteredParts.length} of {parts.length} part{parts.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {/* Parts Catalogue */}
      {view === "catalogue" && (
        parts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500 mb-1">No parts registered yet</p>
            <p className="text-sm">Add parts to track stock levels, receive deliveries, and log usage against job cards.</p>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="font-medium text-gray-500">No parts match your search</p>
            <p className="text-sm mt-1">Try adjusting the search term or category filter</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-1">
              <Info className="h-3 w-3" />Click a row to view details and manage documents
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Part / Part No.", "Category", "Location", "In Stock", "Reorder At", "Cost Price", "Sell Price", "Supplier", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParts.map(p => {
                  const qty = parseFloat(p.currentQuantity);
                  const reorder = p.reorderLevel ? parseFloat(p.reorderLevel) : null;
                  const isLow = reorder !== null && qty <= reorder;
                  const isSelected = selectedPart?.id === p.id;
                  const isSuperseded = !!p.supersededById;
                  return (
                    <tr
                      key={p.id}
                      className={cn("cursor-pointer transition-colors", isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : isSuperseded ? "bg-gray-50/60 hover:bg-gray-100/60 opacity-75" : "hover:bg-gray-50/80")}
                      onClick={() => setSelectedPart(isSelected ? null : p)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className={cn("font-medium", isSuperseded ? "text-gray-500 line-through decoration-gray-400" : "text-gray-900")}>{p.name}</p>
                              {isSuperseded && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">Superseded</span>}
                            </div>
                            {p.productCode && <p className="text-xs text-gray-400 font-mono">{p.productCode}</p>}
                            {isSuperseded && p.supersededByName && (
                              <p className="text-xs text-primary mt-0.5">→ {p.supersededByName}{p.supersededByProductCode && <span className="text-gray-400 ml-1 font-mono">{p.supersededByProductCode}</span>}</p>
                            )}
                          </div>
                          {isSelected && <ChevronRight className="h-3.5 w-3.5 text-primary ml-1 shrink-0" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category || "—"}</td>
                      <td className="px-4 py-3">
                        {p.bayName ? (
                          <div className="text-xs">
                            {p.rowName && <p className="text-gray-400">{p.rowName}</p>}
                            <p className="text-gray-700 font-medium">{p.bayName}</p>
                            {p.shelfName && <p className="text-gray-400">{p.shelfName}</p>}
                          </div>
                        ) : p.storageLocation ? (
                          <span className="text-gray-600 text-xs">{p.storageLocation}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("font-semibold", isLow ? "text-amber-600" : "text-gray-900")}>
                          {fmtQty(p.currentQuantity, p.unit)}
                        </span>
                        {isLow && <span className="ml-1.5 text-xs text-amber-500 font-medium">Low</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.reorderLevel ? fmtQty(p.reorderLevel, p.unit) : "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtCost(p.unitCostPence)}</td>
                      <td className="px-4 py-3 text-gray-500">{p.unitSellPricePence ? fmtCost(p.unitSellPricePence) : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{p.supplierName || "—"}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => openReceive(p)} title="Receive stock">
                            <ArrowDownToLine className="h-3 w-3" />In
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => openUse(p)} title="Use / issue">
                            <ArrowUpFromLine className="h-3 w-3" />Use
                          </Button>
                          <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-gray-700 rounded" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Part detail panel */}
      {selectedPart && (
        <PartPanel
          farmId={farmId}
          part={selectedPart}
          onClose={() => setSelectedPart(null)}
          onEdit={openEdit}
        />
      )}

      {/* Movement History */}
      {view === "history" && (
        movements.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <History className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No movements recorded yet</p>
            <p className="text-sm">Stock receipts and usage will appear here.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Date", "Part", "Type", "Qty Change", "Reference", "Performed By", "Notes"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map(m => {
                  const qty = parseFloat(m.quantityChange);
                  const isIn = qty > 0;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(m.movedAt)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{m.partName}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5", isIn ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>
                          {isIn ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
                          {isIn ? "Received" : "Issued"}
                        </span>
                      </td>
                      <td className={cn("px-4 py-3 font-semibold tabular-nums", isIn ? "text-green-700" : "text-blue-700")}>
                        {isIn ? "+" : ""}{qty}{m.unit ? ` ${m.unit}` : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {m.referenceType === "workshop_job" && m.referenceId ? `Job #${m.referenceId}` : m.referenceType === "workshop_delivery" ? "Delivery" : m.referenceType || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.performedBy || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{m.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Goods Returns View */}
      {view === "returns" && <GoodsReturnsView farmId={farmId} parts={parts} />}

      {/* Workshop Parts Stocktake View */}
      {view === "stocktake" && <WorkshopStocktakeView farmId={farmId} />}

      {/* Add / Edit Part Dialog */}
      {addOpen && (
        <Dialog open onOpenChange={() => { setAddOpen(false); setEditing(null); setForm(EMPTY_PART); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Part" : "Add New Part"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="col-span-2"><Label>Part Name *</Label><Input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. Oil Filter — Massey 5710" /></div>
              <div>
                <Label>Category</Label>
                <OtherSelect
                  options={PART_CATEGORIES}
                  value={form.category}
                  onValueChange={v => setF("category", v)}
                  placeholder="Select category…"
                  specifyPlaceholder="Please specify category…"
                />
              </div>
              <div><Label>Part / Product Code</Label><Input value={form.productCode} onChange={e => setF("productCode", e.target.value)} placeholder="e.g. OFS-1234" /></div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setF("unit", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectGroup>
                      <SelectLabel>Countable</SelectLabel>
                      {["each", "pair", "set", "box", "bag", "roll", "drum", "sheet", "tube", "cartridge"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Liquid volume</SelectLabel>
                      {["ml", "litre", "gallon"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Weight</SelectLabel>
                      {["g", "kg", "tonne"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Length</SelectLabel>
                      {["mm", "metre"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Cost Price (£)</Label><Input type="number" step="0.01" min="0" value={form.unitCostPence} onChange={e => setF("unitCostPence", e.target.value)} placeholder="0.00" /></div>
              <div><Label>Sell Price (£) <span className="text-xs text-muted-foreground font-normal">— external customers</span></Label><Input type="number" step="0.01" min="0" value={form.unitSellPricePence} onChange={e => setF("unitSellPricePence", e.target.value)} placeholder="0.00" /></div>
              <div><Label>Reorder Level{form.unit ? ` (${form.unit})` : ""}</Label><Input type="number" step={qtyStep(form.unit)} min="0" value={form.reorderLevel} onChange={e => setF("reorderLevel", e.target.value)} placeholder={WHOLE_UNITS.includes((form.unit ?? "").toLowerCase()) ? "e.g. 2" : "e.g. 5.0"} /></div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <Label>Storage Location <span className="text-xs text-muted-foreground font-normal">— Row, Bay &amp; Shelf</span></Label>
                  <button type="button" className="text-xs text-primary underline underline-offset-2 hover:no-underline" onClick={() => setLocationManagerOpen(true)}>Manage Locations</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={formRowId} onValueChange={v => { setFormRowId(v); setFormBayId(""); setF("shelfId", ""); }}>
                    <SelectTrigger><SelectValue placeholder="Row…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No row</SelectItem>
                      {rows.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                      {hasUnassignedBays && <SelectItem value="__unassigned__">Unassigned</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Select value={formBayId} onValueChange={v => { setFormBayId(v); setF("shelfId", ""); }}>
                    <SelectTrigger><SelectValue placeholder="Bay…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No bay</SelectItem>
                      {bays
                        .filter(b => !formRowId || formRowId === "__none__" ? !b.rowId : formRowId === "__unassigned__" ? !b.rowId : String(b.rowId) === formRowId)
                        .map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.shelfId} onValueChange={v => setF("shelfId", v)} disabled={!formBayId || formBayId === "__none__"}>
                    <SelectTrigger><SelectValue placeholder="Shelf…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No shelf</SelectItem>
                      {(bays.find(b => String(b.id) === formBayId)?.shelves ?? []).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {bays.length === 0 && rows.length === 0 && <p className="text-xs text-gray-400 mt-1">No locations set up yet — click <em>Manage Locations</em> to create Rows, Bays and Shelves.</p>}
              </div>
              <div className="col-span-2">
                <Label>Default Supplier</Label>
                <Select value={form.defaultSupplierId || "__none__"} onValueChange={v => setF("defaultSupplierId", v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={2} /></div>
              {/* Supersession */}
              <div className="col-span-2 border-t border-gray-100 pt-3 mt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Supersession</p>
                {editing ? (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Superseded by <span className="text-muted-foreground font-normal">(mark this part as replaced by another)</span></Label>
                      <Select value={form.supersededById || "__none__"} onValueChange={v => setF("supersededById", v === "__none__" ? "" : v)}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Not superseded" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not superseded</SelectItem>
                          {parts.filter(x => x.id !== editing.id && !x.supersededById).map(x => (
                            <SelectItem key={x.id} value={String(x.id)}>{x.name}{x.productCode && ` (${x.productCode})`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {form.supersededById && form.supersededById !== "__none__" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Effective Date</Label>
                          <Input type="date" className="mt-1 h-8 text-sm" value={form.supersededAt} onChange={e => setF("supersededAt", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Reason / Notes</Label>
                          <Input className="mt-1 h-8 text-sm" placeholder="e.g. Updated design, Rev 2" value={form.supersessionNotes} onChange={e => setF("supersessionNotes", e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">This part replaces (optional) <span className="text-muted-foreground font-normal">— marks the old part as superseded</span></Label>
                    <Select value={form.supersedesId || "__none__"} onValueChange={v => setF("supersedesId", v === "__none__" ? "" : v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Does not replace any part" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Does not replace any part</SelectItem>
                        {parts.filter(x => !x.supersededById).map(x => (
                          <SelectItem key={x.id} value={String(x.id)}>{x.name}{x.productCode && ` (${x.productCode})`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => savePart.mutate(form)} disabled={!form.name || savePart.isPending}>{savePart.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Add Part"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Receive Stock Dialog */}
      {receiveOpen && receivePart && (
        <Dialog open onOpenChange={() => setReceiveOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Receive Stock — {receivePart.name}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><Label>Quantity Received *{receivePart.unit ? ` (${receivePart.unit})` : ""}</Label><Input type="number" step={qtyStep(receivePart.unit)} min={qtyMin(receivePart.unit)} value={receiveForm.qty} onChange={e => setReceiveForm(f => ({ ...f, qty: e.target.value }))} placeholder={qtyPlaceholder(receivePart.unit)} /></div>
              <div><Label>Unit Cost (£ per {receivePart.unit ?? "unit"})</Label><Input type="number" step="0.01" min="0" value={receiveForm.unitCostPence} onChange={e => setReceiveForm(f => ({ ...f, unitCostPence: e.target.value }))} placeholder="0.00" /></div>
              <div><Label>Delivery Date</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={receiveForm.date} onChange={e => setReceiveForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div>
                <Label>Supplier</Label>
                <Select value={receiveForm.supplierId || "__none__"} onValueChange={v => setReceiveForm(f => ({ ...f, supplierId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Invoice / Order Reference</Label><Input value={receiveForm.invoiceRef} onChange={e => setReceiveForm(f => ({ ...f, invoiceRef: e.target.value }))} placeholder="e.g. INV-2025-001" /></div>
              <div className="col-span-2"><Label>Received By</Label><Input value={receiveForm.performedBy} onChange={e => setReceiveForm(f => ({ ...f, performedBy: e.target.value }))} placeholder="Name of person" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={receiveForm.notes} onChange={e => setReceiveForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceiveOpen(false)}>Cancel</Button>
              <Button onClick={() => receive.mutate(receiveForm)} disabled={!receiveForm.qty || receive.isPending}>{receive.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowDownToLine className="h-4 w-4 mr-1" />Receive Stock</>}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Use / Issue Parts Dialog */}
      {useOpen && usePart && (
        <Dialog open onOpenChange={() => setUseOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Issue Parts — {usePart.name}</DialogTitle></DialogHeader>
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <Package className="h-4 w-4 text-gray-400" />
              Current stock: <span className="font-semibold text-gray-900">{fmtQty(usePart.currentQuantity, usePart.unit)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><Label>Quantity Used *{usePart.unit ? ` (${usePart.unit})` : ""}</Label><Input type="number" step={qtyStep(usePart.unit)} min={qtyMin(usePart.unit)} value={useForm.qty} onChange={e => setUseForm(f => ({ ...f, qty: e.target.value }))} placeholder={qtyPlaceholder(usePart.unit)} /></div>
              <div>
                <Label>Link to Job Card</Label>
                <Select value={useForm.jobId || "__none__"} onValueChange={v => setUseForm(f => ({ ...f, jobId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No job</SelectItem>
                    {openJobs.map(j => <SelectItem key={j.job.id} value={String(j.job.id)}>{j.job.jobNumber} — {j.job.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Issued By</Label><Input value={useForm.performedBy} onChange={e => setUseForm(f => ({ ...f, performedBy: e.target.value }))} placeholder="Name of person" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={useForm.notes} onChange={e => setUseForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUseOpen(false)}>Cancel</Button>
              <Button onClick={() => useParts.mutate(useForm)} disabled={!useForm.qty || useParts.isPending}>{useParts.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowUpFromLine className="h-4 w-4 mr-1" />Issue Parts</>}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <Dialog open onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Remove Part</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">This will remove the part from the catalogue. Stock movement history is retained.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deletePart.mutate(deleteId!)} disabled={deletePart.isPending}>{deletePart.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Location Manager */}
      {locationManagerOpen && (
        <LocationManager farmId={farmId} onClose={() => { setLocationManagerOpen(false); qc.invalidateQueries({ queryKey: ["workshop-bays", farmId] }); }} />
      )}
    </div>
  );
}

const WS_PIE_COLOURS = ["#f59e0b","#16a34a","#ef4444","#8b5cf6","#3b82f6","#14b8a6"];

function WorkshopAnalyticsTab({ farmId }: { farmId: number }) {
  const { data: farmData } = useQuery<{ record: { name: string } }>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmName = farmData?.record?.name ?? "BDE Farm";

  const jobsQ = useQuery({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => (d.jobs ?? []).map((j: any) => ({ ...j.job, equipmentName: j.equipmentName, assetNumber: j.assetNumber, customerName: j.customerName })),
  });

  const allJobs: any[] = jobsQ.data ?? [];

  type Period = "week" | "month" | "last-month" | "quarter" | "year" | "all";
  const PERIODS: { key: Period; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "last-month", label: "Last Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" },
  ];
  const [period, setPeriod] = useState<Period>("month");

  const jobs: any[] = useMemo(() => {
    if (period === "all") return allJobs;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start: Date;
    let end: Date = now;
    if (period === "week") {
      const dow = today.getDay();
      start = new Date(today);
      start.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    } else if (period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "last-month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return allJobs.filter((j: any) => {
      const ds = j.startedAt ?? j.scheduledAt ?? j.completedAt ?? j.createdAt;
      if (!ds) return false;
      const d = new Date(ds);
      return d >= start && d <= end;
    });
  }, [allJobs, period]);

  const wipValue = useMemo(() => allJobs.filter((j: any) => ["open", "in-progress"].includes(j.status)).reduce((s: number, j: any) => s + (j.labourCostPence ?? 0) + (j.partsCostPence ?? 0), 0) / 100, [allJobs]);
  const awaitingPartsCount = useMemo(() => allJobs.filter((j: any) => j.status === "awaiting-parts").length, [allJobs]);

  const totalLabour = useMemo(() => jobs.reduce((s: number, j: any) => s + (j.labourCostPence ?? 0), 0) / 100, [jobs]);
  const totalParts = useMemo(() => jobs.reduce((s: number, j: any) => s + (j.partsCostPence ?? 0), 0) / 100, [jobs]);
  const totalCost = totalLabour + totalParts;
  const totalHours = useMemo(() => jobs.reduce((s: number, j: any) => s + (j.labourHours ?? 0), 0), [jobs]);
  const completedCount = useMemo(() => jobs.filter((j: any) => j.status === "completed").length, [jobs]);

  const chargeableJobs = useMemo(() => jobs.filter((j: any) => j.customerId), [jobs]);
  const ownHoldingJobs = useMemo(() => jobs.filter((j: any) => !j.customerId), [jobs]);
  const chargeableCost = chargeableJobs.reduce((s: number, j: any) => s + (j.labourCostPence ?? 0) + (j.partsCostPence ?? 0), 0) / 100;
  const ownHoldingCost = ownHoldingJobs.reduce((s: number, j: any) => s + (j.labourCostPence ?? 0) + (j.partsCostPence ?? 0), 0) / 100;
  const chargeableHours = chargeableJobs.reduce((s: number, j: any) => s + (j.labourHours ?? 0), 0);
  const ownHoldingHours = ownHoldingJobs.reduce((s: number, j: any) => s + (j.labourHours ?? 0), 0);

  const staffData = useMemo(() => {
    const m = new Map<string, { hours: number; jobs: number; cost: number }>();
    jobs.forEach((j: any) => {
      const name = j.assignedTo?.trim() || "Unassigned";
      if (!m.has(name)) m.set(name, { hours: 0, jobs: 0, cost: 0 });
      const b = m.get(name)!;
      b.hours += j.labourHours ?? 0;
      b.jobs++;
      b.cost += (j.labourCostPence ?? 0) / 100;
    });
    return [...m.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.hours - a.hours);
  }, [jobs]);

  const costByEquip = useMemo(() => {
    const m = new Map<string, { name: string; labour: number; parts: number }>();
    jobs.forEach((j: any) => {
      const name = j.equipmentName ?? (j.assetNumber ? `Asset ${j.assetNumber}` : j.equipmentId ? `Asset #${j.equipmentId}` : "No Asset");
      const key = String(j.equipmentId ?? name);
      if (!m.has(key)) m.set(key, { name, labour: 0, parts: 0 });
      const b = m.get(key)!;
      b.labour += (j.labourCostPence ?? 0) / 100;
      b.parts += (j.partsCostPence ?? 0) / 100;
    });
    return [...m.values()].map(e => ({ ...e, total: e.labour + e.parts, labour: parseFloat(e.labour.toFixed(2)), parts: parseFloat(e.parts.toFixed(2)) })).sort((a, b) => b.total - a.total).slice(0, 12);
  }, [jobs]);

  const monthlyData = useMemo(() => {
    const m = new Map<string, { label: string; spend: number; count: number; hours: number }>();
    allJobs.forEach((j: any) => {
      const ds = j.startedAt ?? j.scheduledAt ?? j.completedAt ?? j.createdAt;
      if (!ds) return;
      const d = new Date(ds);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!m.has(key)) m.set(key, { label, spend: 0, count: 0, hours: 0 });
      const b = m.get(key)!;
      b.spend += ((j.labourCostPence ?? 0) + (j.partsCostPence ?? 0)) / 100;
      b.count++;
      b.hours += j.labourHours ?? 0;
    });
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-18).map(([, v]) => ({ ...v, spend: parseFloat(v.spend.toFixed(2)) }));
  }, [allJobs]);

  const statusData = useMemo(() => {
    const m = new Map<string, number>();
    jobs.forEach((j: any) => { const s = j.status ?? "unknown"; m.set(s, (m.get(s) ?? 0) + 1); });
    return [...m.entries()].map(([name, value]) => ({ name: JOB_STATUS[name]?.label ?? name, value }));
  }, [jobs]);

  const splitData = [{ name: "Labour", value: parseFloat(totalLabour.toFixed(2)) }, { name: "Parts", value: parseFloat(totalParts.toFixed(2)) }];
  const fmt = (v: number) => `\u00a3${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? "";

  function printReport() {
    const completed = jobs.filter((j: any) => j.status === "completed");
    const ra = "text-align:right";

    const summaryHtml = `
<div class="section-head">Summary — ${periodLabel}</div>
<table><thead><tr>
  <th>Metric</th><th>Value</th><th>Detail</th>
</tr></thead><tbody>
  <tr><td>Jobs in Period</td><td style="${ra}">${jobs.length}</td><td>${completedCount} completed · ${awaitingPartsCount} awaiting parts · ${jobs.length - completedCount - awaitingPartsCount} other</td></tr>
  <tr><td>Labour Hours</td><td style="${ra}">${totalHours} hrs</td><td>${chargeableHours} chargeable · ${ownHoldingHours} own holding</td></tr>
  <tr><td>Total Spend</td><td style="${ra}">${fmt(totalCost)}</td><td>Labour ${fmt(totalLabour)} · Parts ${fmt(totalParts)}</td></tr>
  <tr><td>Chargeable Revenue</td><td style="${ra}">${fmt(chargeableCost)}</td><td>${chargeableJobs.length} jobs · ${chargeableHours} hrs</td></tr>
  <tr><td>Own Holding Cost</td><td style="${ra}">${fmt(ownHoldingCost)}</td><td>${ownHoldingJobs.length} jobs · ${ownHoldingHours} hrs</td></tr>
  <tr><td>WIP Value (Live)</td><td style="${ra}">${fmt(wipValue)}</td><td>Open &amp; in-progress jobs</td></tr>
</tbody></table>`;

    const staffHtml = staffData.length > 0 ? `
<div class="section-head">Hours by Staff Member</div>
<table><thead><tr><th>Staff Member</th><th style="${ra}">Hours</th><th style="${ra}">Jobs</th><th style="${ra}">Labour Cost</th></tr></thead><tbody>
${staffData.map(s => `<tr><td>${s.name}</td><td style="${ra}">${s.hours}</td><td style="${ra}">${s.jobs}</td><td style="${ra}">${fmt(s.cost)}</td></tr>`).join("")}
</tbody></table>` : "";

    const assetHtml = costByEquip.length > 0 ? `
<div class="section-head">Cost by Asset / Machine</div>
<table><thead><tr><th>Asset</th><th style="${ra}">Labour</th><th style="${ra}">Parts</th><th style="${ra}">Total</th></tr></thead><tbody>
${costByEquip.map(e => `<tr><td>${e.name}</td><td style="${ra}">${fmt(e.labour)}</td><td style="${ra}">${fmt(e.parts)}</td><td style="${ra}">${fmt(e.labour + e.parts)}</td></tr>`).join("")}
</tbody></table>` : "";

    const jobHtml = completed.length > 0 ? `
<div class="section-head">Completed Jobs (${completed.length})</div>
<table><thead><tr><th>Job No.</th><th>Description</th><th>Asset</th><th>Customer / Type</th><th style="${ra}">Hours</th><th style="${ra}">Labour</th><th style="${ra}">Parts</th><th style="${ra}">Total</th></tr></thead><tbody>
${completed.map((j: any) => `<tr><td>${j.jobNumber ?? "—"}</td><td>${j.description ?? "—"}</td><td>${j.equipmentName ?? "—"}</td><td>${j.customerName ?? "Own Holding"}</td><td style="${ra}">${j.labourHours ?? 0}</td><td style="${ra}">${fmt((j.labourCostPence ?? 0) / 100)}</td><td style="${ra}">${fmt((j.partsCostPence ?? 0) / 100)}</td><td style="${ra}">${fmt(((j.labourCostPence ?? 0) + (j.partsCostPence ?? 0)) / 100)}</td></tr>`).join("")}
</tbody></table>` : "";

    printProReport({
      title: "Workshop Management Report",
      farmName,
      subtitle: periodLabel,
      tableHtml: summaryHtml + staffHtml + assetHtml + jobHtml,
      footerNote: "Workshop records — retain for a minimum of 3 years.",
      landscape: true,
    });
  }

  if (jobsQ.isLoading) return <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Loading workshop data\u2026</div>;

  if (allJobs.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <Wrench className="w-10 h-10 mx-auto mb-3 text-gray-300" />
      <p className="font-medium text-gray-600">No job cards yet</p>
      <p className="text-sm text-gray-400">Create job cards to see analytics here.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Period</span>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={cn("px-3 py-1 rounded-full text-xs font-semibold border transition-colors", period === p.key ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={printReport} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 hover:border-gray-300 transition-colors">
          <Printer className="h-3.5 w-3.5" />Management Report
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Job Cost</p>
          <p className="text-2xl font-bold text-amber-700">{fmt(totalCost)}</p>
          <p className="text-xs text-gray-500 mt-1">Labour {fmt(totalLabour)} \u00b7 Parts {fmt(totalParts)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Labour Hours</p>
          <p className="text-2xl font-bold text-blue-700">{totalHours} <span className="text-sm font-normal text-blue-400">hrs</span></p>
          <p className="text-xs text-gray-500 mt-1">{chargeableHours} chargeable \u00b7 {ownHoldingHours} own</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Jobs Completed</p>
          <p className="text-2xl font-bold text-green-700">{completedCount}</p>
          <p className="text-xs text-gray-500 mt-1">of {jobs.length} in period</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">WIP / Open Value</p>
          <p className="text-2xl font-bold text-purple-700">{fmt(wipValue)}</p>
          {awaitingPartsCount > 0 && <p className="text-xs text-orange-500 font-medium mt-1">{awaitingPartsCount} awaiting parts</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Chargeable vs Own Holding</p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-2.5">By Cost</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-xs text-orange-600 font-semibold">Chargeable</p>
                <p className="text-lg font-bold text-orange-700 mt-1">{fmt(chargeableCost)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{chargeableJobs.length} job{chargeableJobs.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600 font-semibold">Own Holding</p>
                <p className="text-lg font-bold text-gray-700 mt-1">{fmt(ownHoldingCost)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ownHoldingJobs.length} job{ownHoldingJobs.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-2.5">By Hours</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-xs text-orange-600 font-semibold">Chargeable</p>
                <p className="text-lg font-bold text-orange-700 mt-1">{chargeableHours} <span className="text-sm font-normal">hrs</span></p>
                <p className="text-xs text-gray-400 mt-0.5">{totalHours > 0 ? Math.round(chargeableHours / totalHours * 100) : 0}% of total</p>
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600 font-semibold">Own Holding</p>
                <p className="text-lg font-bold text-gray-700 mt-1">{ownHoldingHours} <span className="text-sm font-normal">hrs</span></p>
                <p className="text-xs text-gray-400 mt-0.5">{totalHours > 0 ? Math.round(ownHoldingHours / totalHours * 100) : 0}% of total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {staffData.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Hours by Staff Member</p>
            {staffData.every(s => s.hours === 0) ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hours recorded for this period</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(140, staffData.length * 38)}>
                <BarChart data={staffData} layout="vertical" margin={{ top: 2, right: 48, left: 0, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}h`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip formatter={(v: number) => [`${v} hrs`, "Hours"]} />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[0, 3, 3, 0]}>
                    <LabelList dataKey="hours" position="right" style={{ fontSize: 11, fill: "#374151" }} formatter={(v: number) => v > 0 ? `${v}h` : ""} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-center">
            <p className="text-sm text-gray-400">No staff assigned to jobs in this period</p>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Jobs by Status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={85} label={false}>
                {statusData.map((_: any, i: number) => <Cell key={i} fill={WS_PIE_COLOURS[i % WS_PIE_COLOURS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(n: string) => <span style={{ fontSize: 12 }}>{n}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {costByEquip.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Cost by Asset / Machine (\u00a3)</p>
          <ResponsiveContainer width="100%" height={Math.max(200, costByEquip.length * 36)}>
            <BarChart data={costByEquip} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `\u00a3${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
              <Tooltip formatter={(v: number) => [`\u00a3${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""]} />
              <Legend />
              <Bar dataKey="labour" stackId="a" fill="#3b82f6" name="Labour" />
              <Bar dataKey="parts" stackId="a" fill="#8b5cf6" name="Parts" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-1">Monthly Trend</p>
          <p className="text-xs text-gray-400 mb-4">Spend (bars) \u00b7 Jobs (green line) \u00b7 Hours (blue dashed)</p>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={monthlyData} margin={{ top: 4, right: 36, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tickFormatter={(v: number) => `\u00a3${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number, n: string) => [n === "spend" ? `\u00a3${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : n === "hours" ? `${v} hrs` : String(v), n === "spend" ? "Spend" : n === "count" ? "Jobs" : "Hours"]} />
              <Legend />
              <Bar yAxisId="left" dataKey="spend" fill="#f59e0b" name="Spend" radius={[2, 2, 0, 0]} opacity={0.85} />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: "#16a34a" }} name="Jobs" />
              <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3, fill: "#3b82f6" }} name="Hours" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {totalCost > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:max-w-xs">
          <p className="text-sm font-semibold text-gray-700 mb-4">Labour vs Parts Split</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={splitData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={80} label={false}>
                <Cell fill="#3b82f6" />
                <Cell fill="#8b5cf6" />
              </Pie>
              <Tooltip formatter={(v: number) => [`\u00a3${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""]} />
              <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(n: string) => <span style={{ fontSize: 12 }}>{n}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Customers tab ───────────────────────────────────────────────────────────

const EMPTY_CUSTOMER = { name: "", contactName: "", contactPhone: "", contactEmail: "", address: "", holdingNumber: "", vatNumber: "", notes: "" };

function CustomersTab({ farmId, onViewJobs }: { farmId: number; onViewJobs: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showInactive, setShowInactive] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deactivateId, setDeactivateId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_CUSTOMER);

  const q = useQuery({
    queryKey: ["farm-customers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-customers`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const records: any[] = q.data?.records ?? [];

  const jobsQ = useQuery({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => (d.jobs ?? []).map((j: any) => ({ ...j.job, customerName: j.customerName })),
  });
  const jobs: any[] = jobsQ.data ?? [];

  const jobCountByCustomer = useMemo(() => {
    const map: Record<number, number> = {};
    for (const j of jobs) {
      if (j.customerId) map[j.customerId] = (map[j.customerId] ?? 0) + 1;
    }
    return map;
  }, [jobs]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["farm-customers", farmId] });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      if (editRecord) {
        return fetch(api(`farms/${farmId}/farm-customers/${editRecord.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
      }
      return fetch(api(`farms/${farmId}/farm-customers`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: () => { toast({ title: editRecord ? "Customer updated" : "Customer added" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(EMPTY_CUSTOMER); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/farm-customers/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Customer deactivated" }); invalidate(); setDeactivateId(null); },
    onError: () => toast({ title: "Failed to deactivate", variant: "destructive" }),
  });

  const reactivateMut = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/farm-customers/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ isActive: true }) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Customer reactivated" }); invalidate(); },
    onError: () => toast({ title: "Failed to reactivate", variant: "destructive" }),
  });

  function openAdd() { setEditRecord(null); setForm(EMPTY_CUSTOMER); setAddOpen(true); }
  function openEdit(r: any) {
    setEditRecord(r);
    setForm({ name: r.name ?? "", contactName: r.contactName ?? "", contactPhone: r.contactPhone ?? "", contactEmail: r.contactEmail ?? "", address: r.address ?? "", holdingNumber: r.holdingNumber ?? "", vatNumber: r.vatNumber ?? "", notes: r.notes ?? "" });
    setAddOpen(true);
  }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const visible = records.filter(r => showInactive || r.isActive);
  const inactiveCount = records.filter(r => !r.isActive).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Workshop Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Neighbouring farms and third parties for whom you carry out workshop jobs or machinery hire.</p>
        </div>
        <div className="flex items-center gap-2">
          {inactiveCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowInactive(s => !s)}>
              {showInactive ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
              {showInactive ? "Hide inactive" : `Show ${inactiveCount} inactive`}
            </Button>
          )}
          <Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add Customer</Button>
        </div>
      </div>

      {q.isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No customers yet</p>
          <p className="text-gray-400 text-sm mt-1">Add a neighbouring farm or contractor to assign workshop jobs and raise invoices for them.</p>
          <Button size="sm" className="mt-4" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" />Add first customer</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map(r => {
            const jobCount = jobCountByCustomer[r.id] ?? 0;
            return (
              <div key={r.id} className={cn("border rounded-xl p-4 bg-white flex items-start gap-4", !r.isActive && "opacity-55 bg-gray-50")}>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{r.name}</span>
                    {!r.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">Inactive</span>
                    )}
                    {r.holdingNumber && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">CPH: {r.holdingNumber}</span>
                    )}
                    {jobCount > 0 && (
                      <button
                        onClick={onViewJobs}
                        className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                        title="Click to view job cards"
                      >
                        {jobCount} job{jobCount !== 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-0.5 text-sm text-gray-500">
                    {r.contactName && <span className="font-medium text-gray-600">{r.contactName}</span>}
                    {r.contactPhone && <span>{r.contactPhone}</span>}
                    {r.contactEmail && (
                      <a href={`mailto:${r.contactEmail}`} className="text-blue-600 hover:underline">{r.contactEmail}</a>
                    )}
                    {r.vatNumber && <span className="text-xs text-gray-400">VAT: {r.vatNumber}</span>}
                  </div>
                  {r.address && <p className="text-xs text-gray-400 mt-1">{r.address}</p>}
                  {r.notes && <p className="text-xs text-gray-400 mt-1 italic">"{r.notes}"</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {r.isActive ? (
                    <>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" title="Deactivate" onClick={() => setDeactivateId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => reactivateMut.mutate(r.id)} disabled={reactivateMut.isPending}>
                      {reactivateMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Reactivate"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit dialog ── */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(EMPTY_CUSTOMER); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Customer" : "Add Customer"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Business / Farm Name <span className="text-red-500">*</span></Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Greenfields Farm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="e.g. John Smith" /></div>
              <div><Label>CPH / Holding Number</Label><Input value={form.holdingNumber} onChange={e => set("holdingNumber", e.target.value)} placeholder="e.g. 12/345/6789" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="01234 567890" /></div>
              <div><Label>Email</Label><Input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="john@farm.co.uk" /></div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea rows={2} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Farm address…" />
            </div>
            <div>
              <Label>VAT Number</Label>
              <Input value={form.vatNumber} onChange={e => set("vatNumber", e.target.value)} placeholder="GB 123456789" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any notes about this customer…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(EMPTY_CUSTOMER); }}>Cancel</Button>
            <Button
              onClick={() => { if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; } saveMut.mutate(form); }}
              disabled={saveMut.isPending}
            >
              {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editRecord ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate confirm ── */}
      <Dialog open={deactivateId !== null} onOpenChange={o => { if (!o) setDeactivateId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Deactivate Customer</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This customer will be hidden from job card dropdowns but their history is fully preserved. You can reactivate them at any time.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deactivateId !== null && deactivateMut.mutate(deactivateId)} disabled={deactivateMut.isPending}>
              {deactivateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Tab = "assets" | "jobs" | "schedule" | "overview" | "parts" | "analytics" | "customers";

export default function WorkshopPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["assets","jobs","schedule","overview","parts","analytics","customers"]; return t && valid.includes(t) ? t : "assets"; });
  const openId = (() => { const n = Number(new URLSearchParams(window.location.search).get("open")); return n > 0 ? n : null; })();
  const [jobNavStatus, setJobNavStatus] = useState<string>("all");
  const [jobNavKey, setJobNavKey] = useState(0);

  function navigateTo(dest: Tab, status?: string) {
    if (dest === "jobs") {
      setJobNavStatus(status ?? "all");
      setJobNavKey(k => k + 1);
    }
    setTab(dest);
  }

  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Workshop & Assets">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Workshop & Asset Management</h1>
          <p className="text-gray-500 text-sm mt-1">Asset numbers, QR labels, job cards, service schedules, parts store, and fleet overview.</p>
        </div>

        <TabBar>
          <TabButton active={tab === "assets"} onClick={() => setTab("assets")}><Wrench className="h-3.5 w-3.5 mr-1 inline-block" />Assets & QR Codes</TabButton>
          <TabButton active={tab === "jobs"} onClick={() => { setJobNavStatus("all"); setTab("jobs"); }}>Job Cards</TabButton>
          <TabButton active={tab === "schedule"} onClick={() => setTab("schedule")}>Service Schedule</TabButton>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Fleet Overview</TabButton>
          <TabButton active={tab === "parts"} onClick={() => setTab("parts")}><Package className="h-3.5 w-3.5 mr-1 inline-block" />Parts Store</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>Analytics</TabButton>
          <TabButton active={tab === "customers"} onClick={() => setTab("customers")}><Users className="h-3.5 w-3.5 mr-1 inline-block" />Customers</TabButton>
        </TabBar>

        <div className="mt-6">
          {tab === "assets" && <AssetsTab farmId={farmId} />}
          {tab === "jobs" && <JobCardsTab key={jobNavKey} farmId={farmId} openId={openId} initialStatus={jobNavStatus} />}
          {tab === "schedule" && <ServiceScheduleTab farmId={farmId} />}
          {tab === "overview" && <FleetOverviewTab farmId={farmId} onNavigate={navigateTo} />}
          {tab === "parts" && <PartsStoreTab farmId={farmId} />}
          {tab === "analytics" && <WorkshopAnalyticsTab farmId={farmId} />}
          {tab === "customers" && <CustomersTab farmId={farmId} onViewJobs={() => navigateTo("jobs")} />}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Workshop Parts Stocktake ────────────────────────────────────────────────

function ConfirmDialogWorkshop({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
  confirmLabel?: string; confirmVariant?: "default" | "destructive";
}) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={() => { onConfirm(); onCancel(); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WorkshopStocktakeView({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [localCounts, setLocalCounts] = useState<Record<number, string>>({});
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({ stocktakeDate: new Date().toISOString().slice(0, 10), notes: "" });

  type ConfirmState = { open: boolean; title: string; message: string; onConfirm: () => void; confirmLabel?: string; variant?: "default" | "destructive" };
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, title: "", message: "", onConfirm: () => {} });
  const showConfirm = (title: string, message: string, onConfirm: () => void, opts?: { confirmLabel?: string; variant?: "default" | "destructive" }) =>
    setConfirmState({ open: true, title, message, onConfirm, ...opts });

  type StocktakeItem = { id: number; stockItemId: number | null; partName: string; partNumber: string | null; unit: string | null; location: string | null; expectedQty: string; countedQty: string | null; variance: string | null; varianceValue: string | null; notes: string | null; unitCostPence: number | null };
  type StocktakeSession = { id: number; stocktakeDate: string; status: string; itemCount: number; countedCount: number; totalVarianceValue: string | null; notes?: string; completedAt?: string; items?: StocktakeItem[] };

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<StocktakeSession[]>({
    queryKey: ["workshop-stocktakes", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/stocktakes`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: activeSession } = useQuery<StocktakeSession>({
    queryKey: ["workshop-stocktake-detail", farmId, activeId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/stocktakes/${activeId}`), { credentials: "include" }).then(r => r.json()),
    enabled: activeId !== null,
  });

  const createMut = useMutation({
    mutationFn: (body: { stocktakeDate: string; notes?: string }) =>
      fetch(api(`farms/${farmId}/workshop/stocktakes`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: (data: StocktakeSession) => {
      qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] });
      setNewOpen(false);
      setLocalCounts({});
      setActiveId(data.id);
    },
  });

  const updateItemMut = useMutation({
    mutationFn: ({ sessionId, itemId, countedQty }: { sessionId: number; itemId: number; countedQty: string | null }) =>
      fetch(api(`farms/${farmId}/workshop/stocktakes/${sessionId}/items/${itemId}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ countedQty }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-stocktake-detail", farmId, activeId] }); },
  });

  const completeMut = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/stocktakes/${id}/complete`), { method: "POST", credentials: "include" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] });
      qc.invalidateQueries({ queryKey: ["workshop-stocktake-detail", farmId, activeId] });
      qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/stocktakes/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] }); setActiveId(null); },
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const canComplete = (activeSession?.countedCount ?? 0) >= (activeSession?.itemCount ?? 0);

  return (
    <div className="space-y-4">
      <ConfirmDialogWorkshop
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(s => ({ ...s, open: false }))}
        confirmLabel={confirmState.confirmLabel}
        confirmVariant={confirmState.variant}
      />

      {activeId === null ? (
        /* ── List view ──────────────────────────────────────────────────── */
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-sm">Parts Store Stocktake</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Count physical workshop parts and compare against system stock quantities to detect discrepancies.</p>
            </div>
            <Button size="sm" onClick={() => { setNewForm({ stocktakeDate: new Date().toISOString().slice(0, 10), notes: "" }); setNewOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />New Stocktake
            </Button>
          </div>

          {sessionsLoading ? <Loader2 className="animate-spin w-5 h-5" /> : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No stocktakes recorded yet. Click "New Stocktake" to begin your first count.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Date", "Status", "Progress", "Variance £", "Notes", ""].map(h => (
                    <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sessions.map(s => {
                    const varVal = s.totalVarianceValue ? parseFloat(s.totalVarianceValue) : null;
                    const isDraft = s.status === "draft";
                    return (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => { setLocalCounts({}); setActiveId(s.id); }}>
                        <td className="py-2 pr-3 whitespace-nowrap font-medium">{fmtDate(s.stocktakeDate)}</td>
                        <td className="py-2 pr-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDraft ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                            {isDraft ? "In Progress" : "Completed"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{s.countedCount ?? 0} / {s.itemCount ?? 0} counted</td>
                        <td className="py-2 pr-3">
                          {varVal === null ? <span className="text-muted-foreground">—</span> : (
                            <span className={varVal < 0 ? "text-red-600 font-medium" : varVal > 0 ? "text-amber-600 font-medium" : "text-green-600"}>
                              {varVal >= 0 ? "+" : ""}£{Math.abs(varVal).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground text-xs max-w-[180px] truncate">{s.notes || "—"}</td>
                        <td className="py-2" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setLocalCounts({}); setActiveId(s.id); }}>
                              {isDraft ? "Continue" : "View"}
                            </Button>
                            {isDraft && (
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => showConfirm("Delete Stocktake", "Delete this draft? All counts entered so far will be lost.", () => deleteMut.mutate(s.id), { confirmLabel: "Delete", variant: "destructive" })}>
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* ── Detail view ────────────────────────────────────────────────── */
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => { setActiveId(null); qc.invalidateQueries({ queryKey: ["workshop-stocktakes", farmId] }); }}>← Back</Button>
            {activeSession && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">Stocktake — {fmtDate(activeSession.stocktakeDate)}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activeSession.status === "draft" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                      {activeSession.status === "draft" ? "In Progress" : "Completed"}
                    </span>
                    <span className="text-xs text-muted-foreground">{activeSession.countedCount ?? 0} / {activeSession.itemCount ?? 0} parts counted</span>
                  </div>
                  {activeSession.notes && <p className="text-xs text-muted-foreground mt-0.5">{activeSession.notes}</p>}
                </div>
                {activeSession.status === "draft" && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => printBlankStocktakeSheet(activeSession.items ?? [], activeSession.stocktakeDate)}>
                      <Printer className="h-3.5 w-3.5" />Print Blank Sheet
                    </Button>
                    <Button size="sm" disabled={!canComplete || completeMut.isPending}
                      onClick={() => showConfirm("Complete Stocktake", "Workshop part stock levels will be updated to match your physical counts. This cannot be undone.", () => completeMut.mutate(activeSession.id), { confirmLabel: "Complete Stocktake" })}>
                      {completeMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                      Complete Stocktake
                    </Button>
                  </>
                )}
                {activeSession.status === "completed" && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => printStocktakeReport(activeSession)}>
                    <Printer className="h-3.5 w-3.5" />Print Report
                  </Button>
                )}
              </>
            )}
          </div>

          {!activeSession ? <Loader2 className="animate-spin w-5 h-5" /> : (activeSession.items ?? []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No workshop parts found. Add parts to the catalogue first, then start a new stocktake.</div>
          ) : (
            <>
              {(() => {
                const items = activeSession.items ?? [];
                const totalVar = items.reduce((s, i) => s + (i.varianceValue ? parseFloat(i.varianceValue) : 0), 0);
                const negCount = items.filter(i => i.variance !== null && parseFloat(i.variance) < 0).length;
                const uncounted = items.filter(i => i.countedQty === null).length;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Uncounted", value: String(uncounted), sub: "parts remaining", color: uncounted > 0 ? "text-amber-600" : "text-green-600" },
                      { label: "Total Variance", value: `${totalVar >= 0 ? "+" : ""}£${Math.abs(totalVar).toFixed(2)}`, sub: "cost value difference", color: totalVar < 0 ? "text-red-600" : totalVar > 0 ? "text-amber-600" : "text-green-600" },
                      { label: "Shortfalls", value: String(negCount), sub: "parts below system qty", color: negCount > 0 ? "text-red-600" : "text-green-600" },
                    ].map(card => (
                      <div key={card.label} className="bg-muted/40 rounded-lg p-3 text-center border">
                        <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                        <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-xs text-muted-foreground">{card.sub}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    {["Part Name", "Part No.", "Location", "Unit", "System Qty", "Counted", "Variance", "Variance £"].map(h => (
                      <th key={h} className="text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {(activeSession.items ?? []).map(item => {
                      const varNum = item.variance !== null ? parseFloat(item.variance) : null;
                      const varVal = item.varianceValue !== null ? parseFloat(item.varianceValue!) : null;
                      const varColor = varNum === null ? "" : varNum < 0 ? "text-red-600 font-semibold" : varNum === 0 ? "text-green-600" : "text-amber-600 font-semibold";
                      const rowBg = varNum === null ? "" : varNum < 0 ? "bg-red-50/40" : varNum > 0 ? "bg-amber-50/30" : "";
                      const isCompleted = activeSession.status === "completed";
                      const localVal = localCounts[item.id] !== undefined ? localCounts[item.id] : (item.countedQty ?? "");
                      return (
                        <tr key={item.id} className={`border-b last:border-0 ${rowBg}`}>
                          <td className="py-2 pr-3 font-medium whitespace-nowrap">{item.partName}</td>
                          <td className="py-2 pr-3 text-muted-foreground text-xs">{item.partNumber || "—"}</td>
                          <td className="py-2 pr-3 text-muted-foreground text-xs">{item.location || "—"}</td>
                          <td className="py-2 pr-3 text-muted-foreground text-xs">{item.unit || "—"}</td>
                          <td className="py-2 pr-3">{fmtStocktakeQty(item.expectedQty, item.unit)}</td>
                          <td className="py-2 pr-3">
                            {isCompleted ? (
                              <span>{item.countedQty ?? "—"}</span>
                            ) : (
                              <Input type="number" min="0" step={qtyStep(item.unit)} className="h-7 w-24 text-sm" placeholder={qtyStep(item.unit) === "1" ? "0" : "0.00"}
                                value={localVal}
                                onChange={e => setLocalCounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                                onBlur={() => {
                                  const raw = localCounts[item.id];
                                  if (raw === undefined) return;
                                  const val = raw.trim() === "" ? null : raw;
                                  updateItemMut.mutate({ sessionId: activeSession.id, itemId: item.id, countedQty: val });
                                }}
                              />
                            )}
                          </td>
                          <td className={`py-2 pr-3 ${varColor}`}>
                            {varNum === null ? <span className="text-muted-foreground text-xs">—</span> : `${varNum >= 0 ? "+" : ""}${varNum.toFixed(2)}`}
                          </td>
                          <td className={`py-2 ${varColor}`}>
                            {varVal === null ? <span className="text-muted-foreground text-xs">—</span> : `${varVal >= 0 ? "+" : ""}£${Math.abs(varVal).toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {(activeSession.items ?? []).some(i => i.unitCostPence === null) && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  * Variance £ shows <span className="font-medium">—</span> for parts without a unit cost. Add unit costs in the Parts Catalogue to see cost-value variance.
                </p>
              )}
              {activeSession.status === "draft" && !canComplete && (
                <p className="text-xs text-muted-foreground text-center border-t pt-3">
                  Count all {(activeSession.itemCount ?? 0) - (activeSession.countedCount ?? 0)} remaining parts before completing.
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* New Stocktake dialog */}
      <Dialog open={newOpen} onOpenChange={o => { if (!o) setNewOpen(false); }}>
        <DialogContent style={{ maxWidth: "22rem" }}>
          <DialogHeader><DialogTitle>New Parts Stocktake</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">Snaps the current system stock for all active workshop parts. You'll then count and enter physical quantities.</p>
          <div className="space-y-3">
            <div><Label>Stocktake Date *</Label><Input type="date" max={new Date().toISOString().slice(0, 10)} value={newForm.stocktakeDate} onChange={e => setNewForm(f => ({ ...f, stocktakeDate: e.target.value }))} /></div>
            <div><Label>Notes</Label><Input value={newForm.notes} placeholder="e.g. Monthly audit" onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button disabled={!newForm.stocktakeDate || createMut.isPending}
              onClick={() => createMut.mutate({ stocktakeDate: newForm.stocktakeDate, notes: newForm.notes || undefined })}>
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Stocktake"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
