import { useState, useRef, useCallback, useEffect, useMemo, Fragment } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Plus, QrCode, Printer, Wrench, AlertTriangle, Clock, CheckCircle2, XCircle, Loader2, Pencil, Trash2, ChevronDown, Package, ArrowDownToLine, ArrowUpFromLine, History, TriangleAlert, Search, X, FileText, Download, Upload, ChevronRight, Info, Eye, EyeOff, Receipt, Users } from "lucide-react";
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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

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
  const [issuePartId, setIssuePartId] = useState("");
  const [issueQty, setIssueQty] = useState("");
  const [issueBy, setIssueBy] = useState("");
  const [hlId, setHlId] = useState<number | null>(openId ?? null);
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

  const save = useMutation({
    mutationFn: async (body: Partial<WorkshopJob["job"]>) => {
      const url = editing
        ? api(`farms/${farmId}/workshop/jobs/${editing.id}`)
        : api(`farms/${farmId}/workshop/jobs`);
      const method = editing ? "PUT" : "POST";
      await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }); setOpen(false); setEditing(null); setForm(EMPTY_JOB); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/workshop/jobs/${id}`), { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workshop-jobs", farmId] }),
  });

  function openAdd() { setEditing(null); setForm(EMPTY_JOB); setOpen(true); }
  function openEdit(j: WorkshopJob["job"]) {
    setEditing(j);
    setForm({ ...j, openedAt: j.openedAt?.slice(0, 10), estimatedCompletionDate: j.estimatedCompletionDate?.slice(0, 10), completedAt: j.completedAt?.slice(0, 10) });
    setOpen(true);
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
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New Job</Button>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "58rem" }}>
          <DialogHeader><DialogTitle>{editing ? `Edit ${editing.jobNumber}` : "New Job Card"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">
            {/* ── Left ── */}
            <div className="flex-1 flex flex-col gap-3">
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
                  <SelectTrigger><SelectValue placeholder="Select equipment..." /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(eq => <SelectItem key={eq.id} value={String(eq.id)}>{assetNumber(eq)} — {eq.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={3} placeholder="Describe the fault or work required" /></div>
              <div><Label>Root Cause</Label><Input value={form.rootCause || ""} onChange={e => set("rootCause", e.target.value)} placeholder="e.g. Impact damage, normal wear, operator error" /></div>
            </div>

            {/* ── Divider ── */}
            <div className="w-px bg-gray-200 self-stretch" />

            {/* ── Right ── */}
            <div className="flex-1 flex flex-col gap-3">
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
                  Customer <span className="text-xs text-gray-400 font-normal ml-1">(for work done for another farm)</span>
                </Label>
                <Select value={form.customerId ? String(form.customerId) : "none"} onValueChange={v => set("customerId", v !== "none" ? parseInt(v) : null)}>
                  <SelectTrigger><SelectValue placeholder="None — internal job" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None — internal job</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Reported By</Label><Input value={form.reportedBy || ""} onChange={e => set("reportedBy", e.target.value)} /></div>
                <div><Label>Assigned To</Label><Input value={form.assignedTo || ""} onChange={e => set("assignedTo", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Opened Date</Label><Input type="date" value={form.openedAt?.slice(0, 10) || ""} onChange={e => set("openedAt", e.target.value)} /></div>
                <div><Label>Est. Completion</Label><Input type="date" value={form.estimatedCompletionDate || ""} onChange={e => set("estimatedCompletionDate", e.target.value)} /></div>
              </div>
              {(form.status === "completed" || form.status === "cancelled") && (
                <div><Label>Completed Date</Label><Input type="date" value={form.completedAt || ""} onChange={e => set("completedAt", e.target.value)} /></div>
              )}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Labour Hours</Label><Input type="number" step="0.5" value={form.labourHours ?? ""} onChange={e => set("labourHours", e.target.value ? parseFloat(e.target.value) : null)} /></div>
                  <div><Label>Labour Cost (£)</Label><Input type="number" step="0.01" value={form.labourCostPence != null ? form.labourCostPence / 100 : ""} onChange={e => set("labourCostPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
                  <div className="col-span-2"><Label>Parts Cost (£)</Label><Input type="number" step="0.01" value={form.partsCostPence != null ? form.partsCostPence / 100 : ""} onChange={e => set("partsCostPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></div>
                </div>
              </div>
              {editing && workshopParts.length > 0 && (
                <div className="rounded-md border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1"><Package className="h-3.5 w-3.5" />Issue Parts from Store</p>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                    <div>
                      <Select value={issuePartId} onValueChange={v => { setIssuePartId(v); setIssueQty(""); }}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select part…" /></SelectTrigger>
                        <SelectContent>
                          {workshopParts.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} — {parseFloat(p.currentQuantity)} {p.unit ?? ""} in stock
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input
                        className="h-8 text-xs w-24"
                        type="number"
                        step={issueStep}
                        min={issueMin}
                        value={issueQty}
                        onChange={e => setIssueQty(e.target.value)}
                        placeholder={issueIsWhole ? "1" : "0.1"}
                      />
                      {issueUnit && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{issueUnit}</span>
                      )}
                    </div>
                    <Button size="sm" className="h-8 text-xs" onClick={() => issuePartsToJob.mutate()} disabled={!issuePartId || !issueQty || issuePartsToJob.isPending}>
                      {issuePartsToJob.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><ArrowUpFromLine className="h-3.5 w-3.5 mr-1" />Issue</>}
                    </Button>
                  </div>
                  <Input className="h-7 text-xs" value={issueBy} onChange={e => setIssueBy(e.target.value)} placeholder="Issued by (optional)" />
                </div>
              )}

              {/* Parts issued to this job */}
              {editing && (
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-gray-400" />Parts Issued to This Job
                  </p>
                  {issuedParts.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No parts issued from store yet.</p>
                  ) : (
                    <>
                      <div className="overflow-auto rounded border border-gray-100">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500">
                              <th className="text-left px-2 py-1.5 font-medium">Part</th>
                              <th className="text-right px-2 py-1.5 font-medium">Qty</th>
                              <th className="text-right px-2 py-1.5 font-medium">Unit Cost</th>
                              <th className="text-right px-2 py-1.5 font-medium">Line Total</th>
                              <th className="text-left px-2 py-1.5 font-medium">Issued By</th>
                              <th className="text-left px-2 py-1.5 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {issuedParts.map(ip => {
                              const qty = Math.abs(parseFloat(ip.quantityChange));
                              const lineTotal = ip.unitCostPence != null ? ip.unitCostPence * qty : null;
                              return (
                                <tr key={ip.id} className="hover:bg-gray-50/60">
                                  <td className="px-2 py-1.5 font-medium text-gray-800">
                                    {ip.partName}
                                    {ip.productCode && <span className="ml-1 text-gray-400">({ip.productCode})</span>}
                                  </td>
                                  <td className="px-2 py-1.5 text-right text-gray-700">{qty} {ip.unit ?? ""}</td>
                                  <td className="px-2 py-1.5 text-right text-gray-500">
                                    {ip.unitCostPence != null ? `£${(ip.unitCostPence / 100).toFixed(2)}` : "—"}
                                  </td>
                                  <td className="px-2 py-1.5 text-right font-medium text-gray-800">
                                    {lineTotal != null ? `£${(lineTotal / 100).toFixed(2)}` : "—"}
                                  </td>
                                  <td className="px-2 py-1.5 text-gray-500">{ip.performedBy || "—"}</td>
                                  <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{new Date(ip.movedAt).toLocaleDateString("en-GB")}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-gray-200 bg-gray-50">
                              <td colSpan={3} className="px-2 py-1.5 text-xs font-semibold text-gray-600 text-right">Total Parts Cost (from store):</td>
                              <td className="px-2 py-1.5 text-right text-xs font-bold text-gray-900">
                                £{(issuedParts.reduce((sum, ip) => {
                                  const qty = Math.abs(parseFloat(ip.quantityChange));
                                  return sum + (ip.unitCostPence != null ? ip.unitCostPence * qty : 0);
                                }, 0) / 100).toFixed(2)}
                              </td>
                              <td colSpan={2} />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div><Label>Additional Parts Notes</Label><Textarea value={form.partsUsed || ""} onChange={e => set("partsUsed", e.target.value)} rows={2} placeholder="e.g. Sourced externally — front tyre 480/70 R30 x1" /></div>
              <div><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} /></div>
            </div>
          </div>
          {/* Documents section — only for existing jobs */}
          {editing && (
            <JobDocumentsSection farmId={farmId} jobId={editing.id} />
          )}
          {!editing && (
            <p className="text-xs text-gray-400 text-center py-1 border-t">
              Save the job card first to attach photos and documents.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.title}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editing ? "Save Changes" : "Create Job Card"}
            </Button>
          </DialogFooter>
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
                <Input type="date" value={logForm.performedDate} onChange={e => setLogForm(f => ({ ...f, performedDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Performed By</Label>
                <Input placeholder="Name or contractor" value={logForm.performedBy} onChange={e => setLogForm(f => ({ ...f, performedBy: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Next Due Date</Label>
                <Input type="date" value={logForm.nextDueDate} onChange={e => setLogForm(f => ({ ...f, nextDueDate: e.target.value }))} />
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

interface Part {
  id: number; name: string; category: string | null; productCode: string | null;
  unit: string | null; reorderLevel: string | null; unitCostPence: number | null;
  storageLocation: string | null; defaultSupplierId: number | null; supplierName: string | null;
  notes: string | null; currentQuantity: string;
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
                  <Input type="date" value={editForm.dispatchedAt} onChange={e => setEF("dispatchedAt", e.target.value)} />
                </div>
                <div>
                  <Label>Credit Amount Received (£)</Label>
                  <Input type="number" step="0.01" value={editForm.creditAmountPence} onChange={e => setEF("creditAmountPence", e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Credit Received Date</Label>
                  <Input type="date" value={editForm.creditReceivedAt} onChange={e => setEF("creditReceivedAt", e.target.value)} />
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

const EMPTY_PART = { name: "", category: "", productCode: "", unit: "", reorderLevel: "", unitCostPence: "", storageLocation: "", defaultSupplierId: "", notes: "" };

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
              { label: "Location", value: part.storageLocation },
              { label: "Unit Cost", value: part.unitCostPence ? `£${(part.unitCostPence / 100).toFixed(2)} per ${part.unit ?? "unit"}` : null },
              { label: "Default Supplier", value: part.supplierName },
              { label: "Reorder Level", value: reorder ? `${reorder}${part.unit ? ` ${part.unit}` : ""}` : null },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between text-sm">
                <span className="text-gray-500 shrink-0 w-32">{label}</span>
                <span className="text-gray-900 text-right">{value}</span>
              </div>
            ))}
            {part.notes && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 leading-relaxed">{part.notes}</div>
            )}
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

  const { data: parts = [], isLoading } = useQuery<Part[]>({ queryKey: ["workshop-parts", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts`), { credentials: "include" }).then(r => r.json()) });
  const { data: movements = [] } = useQuery<Movement[]>({ queryKey: ["workshop-parts-movements", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/parts/movements`), { credentials: "include" }).then(r => r.json()), enabled: view === "history" });
  const { data: jobsData } = useQuery<{ jobs: { job: { id: number; jobNumber: string; title: string; status: string } }[] }>({ queryKey: ["workshop-jobs", farmId], queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()) });
  const { data: suppliersData } = useQuery<any[]>({ queryKey: ["suppliers-list", farmId], queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => { if (!r.ok) return []; return r.json().then(d => Array.isArray(d) ? d : []); }) });

  const openJobs = (jobsData?.jobs ?? []).filter(j => !["completed", "cancelled"].includes(j.job.status));
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  function setF(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const savePart = useMutation({
    mutationFn: async (body: Record<string, string>) => {
      const supplierId = body.defaultSupplierId && body.defaultSupplierId !== "__none__" ? body.defaultSupplierId : null;
      const payload = { ...body, unitCostPence: body.unitCostPence ? Math.round(parseFloat(body.unitCostPence) * 100) : null, reorderLevel: body.reorderLevel || null, defaultSupplierId: supplierId };
      const url = editing ? api(`farms/${farmId}/workshop/parts/${editing.id}`) : api(`farms/${farmId}/workshop/parts`);
      return fetch(url, { method: editing ? "PUT" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workshop-parts", farmId] }); setAddOpen(false); setEditing(null); setForm(EMPTY_PART); },
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

  const filteredParts = parts.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.productCode ?? "").toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q) || (p.storageLocation ?? "").toLowerCase().includes(q);
    const matchesCat = catFilter === "all" || p.category === catFilter;
    return matchesSearch && matchesCat;
  });

  function openAdd() { setEditing(null); setForm(EMPTY_PART); setAddOpen(true); }
  function openEdit(p: Part) { setEditing(p); setForm({ name: p.name, category: p.category ?? "", productCode: p.productCode ?? "", unit: p.unit ?? "", reorderLevel: p.reorderLevel ?? "", unitCostPence: p.unitCostPence ? (p.unitCostPence / 100).toFixed(2) : "", storageLocation: p.storageLocation ?? "", defaultSupplierId: p.defaultSupplierId ? String(p.defaultSupplierId) : "", notes: p.notes ?? "" }); setAddOpen(true); setSelectedPart(null); }
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
        {view === "catalogue" && <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Part</Button>}
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
          {(search || catFilter !== "all") && (
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
                  {["Part / Part No.", "Category", "Location", "In Stock", "Reorder At", "Unit Cost", "Supplier", "Actions"].map(h => (
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
                  return (
                    <tr
                      key={p.id}
                      className={cn("cursor-pointer transition-colors", isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : "hover:bg-gray-50/80")}
                      onClick={() => setSelectedPart(isSelected ? null : p)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div>
                            <p className="font-medium text-gray-900">{p.name}</p>
                            {p.productCode && <p className="text-xs text-gray-400 font-mono">{p.productCode}</p>}
                          </div>
                          {isSelected && <ChevronRight className="h-3.5 w-3.5 text-primary ml-1 shrink-0" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{p.storageLocation || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("font-semibold", isLow ? "text-amber-600" : "text-gray-900")}>
                          {fmtQty(p.currentQuantity, p.unit)}
                        </span>
                        {isLow && <span className="ml-1.5 text-xs text-amber-500 font-medium">Low</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.reorderLevel ? fmtQty(p.reorderLevel, p.unit) : "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtCost(p.unitCostPence)}</td>
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
              <div><Label>Unit Cost (£)</Label><Input type="number" step="0.01" min="0" value={form.unitCostPence} onChange={e => setF("unitCostPence", e.target.value)} placeholder="0.00" /></div>
              <div><Label>Reorder Level{form.unit ? ` (${form.unit})` : ""}</Label><Input type="number" step={qtyStep(form.unit)} min="0" value={form.reorderLevel} onChange={e => setF("reorderLevel", e.target.value)} placeholder={WHOLE_UNITS.includes((form.unit ?? "").toLowerCase()) ? "e.g. 2" : "e.g. 5.0"} /></div>
              <div><Label>Storage Location</Label><Input value={form.storageLocation} onChange={e => setF("storageLocation", e.target.value)} placeholder="e.g. Shelf A3, Drawer 2" /></div>
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
              <div><Label>Delivery Date</Label><Input type="date" value={receiveForm.date} onChange={e => setReceiveForm(f => ({ ...f, date: e.target.value }))} /></div>
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
    </div>
  );
}

const WS_PIE_COLOURS = ["#f59e0b","#16a34a","#ef4444","#8b5cf6","#3b82f6","#14b8a6"];

function WorkshopAnalyticsTab({ farmId }: { farmId: number }) {
  const jobsQ = useQuery({
    queryKey: ["workshop-jobs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/workshop/jobs`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.records ?? [],
  });
  const equipQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/equipment`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.records ?? [],
  });
  const jobs: any[] = jobsQ.data ?? [];
  const equipment: any[] = equipQ.data ?? [];
  const equipMap = useMemo(() => new Map(equipment.map((e: any) => [e.id, e.name ?? assetNumber(e)])), [equipment]);

  const equipCostMap = useMemo(() => {
    const m = new Map<number, { name: string; labour: number; parts: number }>();
    jobs.forEach((j: any) => {
      if (!j.equipmentId) return;
      const name = equipMap.get(j.equipmentId) ?? `Asset #${j.equipmentId}`;
      if (!m.has(j.equipmentId)) m.set(j.equipmentId, { name, labour: 0, parts: 0 });
      const b = m.get(j.equipmentId)!;
      b.labour += (j.labourCostPence ?? 0) / 100;
      b.parts += (j.partsCostPence ?? 0) / 100;
    });
    return m;
  }, [jobs, equipMap]);

  const costByEquip = [...equipCostMap.values()].map(e => ({ ...e, total: e.labour + e.parts, labour: parseFloat(e.labour.toFixed(2)), parts: parseFloat(e.parts.toFixed(2)) })).sort((a, b) => b.total - a.total).slice(0, 12);

  const monthMap = useMemo(() => {
    const m = new Map<string, { label: string; total: number; count: number }>();
    jobs.forEach((j: any) => {
      const ds = j.startedAt ?? j.scheduledAt ?? j.completedAt;
      if (!ds) return;
      const d = new Date(ds);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!m.has(key)) m.set(key, { label, total: 0, count: 0 });
      const b = m.get(key)!;
      b.total += ((j.labourCostPence ?? 0) + (j.partsCostPence ?? 0)) / 100;
      b.count++;
    });
    return m;
  }, [jobs]);
  const monthData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, total: parseFloat(v.total.toFixed(2)) }));

  const statusMap = useMemo(() => {
    const m = new Map<string, number>();
    jobs.forEach((j: any) => { const s = j.status ?? "unknown"; m.set(s, (m.get(s) ?? 0) + 1); });
    return m;
  }, [jobs]);
  const statusData = [...statusMap.entries()].map(([name, value]) => ({ name: JOB_STATUS[name]?.label ?? name, value }));

  const totalLabour = jobs.reduce((s: number, j: any) => s + (j.labourCostPence ?? 0), 0) / 100;
  const totalParts = jobs.reduce((s: number, j: any) => s + (j.partsCostPence ?? 0), 0) / 100;
  const totalCost = totalLabour + totalParts;
  const splitData = [{ name: "Labour", value: parseFloat(totalLabour.toFixed(2)) }, { name: "Parts", value: parseFloat(totalParts.toFixed(2)) }];

  if (jobsQ.isLoading) return <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Loading workshop data…</div>;

  if (jobs.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
      <Wrench className="w-10 h-10 mx-auto mb-3 text-gray-300" />
      <p className="font-medium text-gray-600">No job cards yet</p>
      <p className="text-sm text-gray-400">Create job cards to see analytics here.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Job Cost</p>
          <p className="text-2xl font-bold text-amber-700">£{totalCost.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Labour Cost</p>
          <p className="text-2xl font-bold text-blue-700">£{totalLabour.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Parts Cost</p>
          <p className="text-2xl font-bold text-purple-700">£{totalParts.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {costByEquip.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Cost by Asset / Machine (£)</p>
          <ResponsiveContainer width="100%" height={Math.max(200, costByEquip.length * 36)}>
            <BarChart data={costByEquip} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `£${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toFixed(0)}`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
              <Tooltip formatter={(v: number) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""]} />
              <Legend />
              <Bar dataKey="labour" stackId="a" fill="#3b82f6" name="Labour" />
              <Bar dataKey="parts" stackId="a" fill="#8b5cf6" name="Parts" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Labour vs Parts Split</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={splitData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={85} label={false}>
                <Cell fill="#3b82f6" />
                <Cell fill="#8b5cf6" />
              </Pie>
              <Tooltip formatter={(v: number) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""]} />
              <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(n: string) => <span style={{ fontSize: 12 }}>{n}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

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

      {monthData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Monthly Job Spend (£)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `£${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
              <Tooltip formatter={(v: number) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Cost"]} />
              <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

type Tab = "assets" | "jobs" | "schedule" | "overview" | "parts" | "analytics";

export default function WorkshopPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["assets","jobs","schedule","overview","parts","analytics"]; return t && valid.includes(t) ? t : "assets"; });
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
        </TabBar>

        <div className="mt-6">
          {tab === "assets" && <AssetsTab farmId={farmId} />}
          {tab === "jobs" && <JobCardsTab key={jobNavKey} farmId={farmId} openId={openId} initialStatus={jobNavStatus} />}
          {tab === "schedule" && <ServiceScheduleTab farmId={farmId} />}
          {tab === "overview" && <FleetOverviewTab farmId={farmId} onNavigate={navigateTo} />}
          {tab === "parts" && <PartsStoreTab farmId={farmId} />}
          {tab === "analytics" && <WorkshopAnalyticsTab farmId={farmId} />}
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
                  <Button size="sm" disabled={!canComplete || completeMut.isPending}
                    onClick={() => showConfirm("Complete Stocktake", "Workshop part stock levels will be updated to match your physical counts. This cannot be undone.", () => completeMut.mutate(activeSession.id), { confirmLabel: "Complete Stocktake" })}>
                    {completeMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Complete Stocktake
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
                          <td className="py-2 pr-3">{parseFloat(item.expectedQty).toFixed(2)}</td>
                          <td className="py-2 pr-3">
                            {isCompleted ? (
                              <span>{item.countedQty ?? "—"}</span>
                            ) : (
                              <Input type="number" min="0" step="0.01" className="h-7 w-24 text-sm" placeholder="0"
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
            <div><Label>Stocktake Date *</Label><Input type="date" value={newForm.stocktakeDate} onChange={e => setNewForm(f => ({ ...f, stocktakeDate: e.target.value }))} /></div>
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
